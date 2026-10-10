const state = {
  phase: 'loading',
  runtimeConfig: null,
  health: null,
  auth: {
    status: 'unknown',
    session: null,
    detail: '',
    bootstrapError: ''
  },
  inventory: [],
  loans: [],
  inventoryDataState: 'idle',
  selectedInventoryId: '',
  detailItem: null,
  auditEvents: [],
  inventoryError: '',
  importResult: null,
  detailError: '',
  detailPublicLinkStatus: null,
  detailPublicLinkFeedback: { type: '', message: '' },
  writeError: '',
  writeSuccess: '',
  search: '',
  sort: 'navn-asc',
  filters: {
    status: '',
    plassering: '',
    arrangement: ''
  },
  route: 'liste',
  initError: '',
  detailRequestSequence: 0,
  detailLoading: {
    base: false,
    documents: false,
    audit: false,
    lister: false
  },
  formState: {
    edited: false,
    sourceId: '',
    mode: 'create',
    activeItemId: '',
    attributeRows: [],
    subunitRows: []
  },
  attachmentForm: {
    pendingUploads: [],
    existingAttachments: [],
    removedAttachmentIds: {},
    updatedAttachmentIds: {}
  },
  loanForm: {
    itemId: '',
    borrowerId: '',
    laaner: '',
    forfallDato: '',
    notat: ''
  },
  loanFlow: {
    selectedItemIds: [],
    originRoute: ''
  },
  borrowerRegistry: {
    items: [],
    loading: false,
    selectedBorrowerId: '',
    activeFilter: 'active',
    detail: null,
    detailLoading: false,
    returnContext: null,
    form: {
      mode: 'create',
      id: '',
      type: 'person',
      navn: '',
      tlf: '',
      epost: '',
      status: 'aktiv',
      organisasjonNavn: '',
      kontaktpersonNavn: '',
      kontaktpersonTlf: '',
      kontaktpersonEpost: '',
      notat: ''
    }
  },
  loanCaseRegistry: {
    items: [],
    loading: false,
    statusFilter: '',
    selectedLoanCaseId: '',
    detail: null,
    detailLoading: false,
    history: [],
    historyLoading: false,
    createForm: {
      borrowerId: '',
      sourceType: 'item',
      itemId: '',
      listId: '',
      notat: ''
    }
  },
  masterdata: {
    status: [],
    tilstand: [],
    kategori: [],
    plassering: [],
    arrangement: [],
    ansvarlig: [],
    attributttype: []
  },
  admin: {
    activeType: 'status',
    openType: '',
    addValue: '',
    addColorToken: '',
    addSortOrder: '99',
    addIsActive: true,
    editingEntryId: '',
    editValues: {},
    editColorTokens: {},
    editSortOrders: {},
    editIsActive: {}
  },
  userAdmin: {
    users: [],
    loading: false,
    form: { displayName: '', username: '', role: 'viewer', active: true },
    edit: {},
    pendingStatusUsername: '',
    resetDrafts: {}
  },
  importPreviewRows: [],
  importPreviewSummary: null,
  importPreviewToken: '',
  pendingImport: null,
  bulkAction: '',
  bulkStatusValue: '',
  selectedInventoryIds: {},
  menuOpen: false,
  headerAuthMenuOpen: false,
  traceabilityAccordionOpen: false,
  lister: [],
  detailLister: [],
  detailListerFeil: '',
  detailListerLaster: false,
  detailListSelectedId: '',
  detailListCreateOpen: false,
  aktivListeId: '',
  aktivListeDetalj: null,
  listeDelingslenkeFeedback: { type: '', message: '' },
  listeFeil: '',
  listeLaster: false,
  offentligVisning: {
    aktiv: false,
    shareCode: '',
    liste: null,
    feil: '',
    laster: false
  },
  offentligVareVisning: {
    aktiv: false,
    shareCode: '',
    listShareCode: '',
    vare: null,
    feil: '',
    laster: false,
    accordionSection: 'media'
  },
  mediaOverlay: {
    open: false,
    loading: false,
    error: '',
    document: null,
    triggerElement: null
  },
  addToListOverlay: {
    open: false,
    loading: false,
    selectedListId: '',
    selectedItemIds: [],
    error: '',
    createName: '',
    createLoading: false,
    createFeedbackType: '',
    createFeedbackMessage: '',
    triggerElement: null
  },
  bestillingVariantOverlay: {
    open: false,
    loading: false,
    itemId: '',
    itemName: '',
    variants: [],
    selectedVariantIds: [],
    selectedVariantQuantities: {},
    error: '',
    triggerElement: null
  },
  loadingState: {
    globalActiveKeys: {},
    globalMessage: '',
    pendingActions: {}
  },
  bestilling: {
    draftId: '',
    orderNumber: '',
    comment: '',
    selectedItemId: '',
    selectedLineType: 'MAIN_WITH_EQUIPMENT',
    selectedQuantity: 1,
    lines: [],
    statusMessage: '',
    errorMessage: ''
  },
  lagerko: {
    orders: [],
    selectedOrderId: '',
    selectedOrder: null,
    loadingOrders: false,
    loadingDetail: false,
    selectedBorrowerId: '',
    selectedBorrowerName: '',
    forfallDato: '',
    overgangNotat: '',
    statusMessage: '',
    errorMessage: ''
  },
  detailAccordionOpenSection: '',
  inventoryFormAccordionOpenSection: 'media'
};

const DOCUMENT_UPLOAD_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const BESTILLING_LINE_TYPE = {
  MAIN_WITH_EQUIPMENT: 'MAIN_WITH_EQUIPMENT',
  SINGLE_VARIANT: 'SINGLE_VARIANT',
  ALL_VARIANTS: 'ALL_VARIANTS'
};
const BESTILLING_LINE_TYPE_OPTIONS = [
  { value: BESTILLING_LINE_TYPE.MAIN_WITH_EQUIPMENT, label: 'Produkt' },
  { value: BESTILLING_LINE_TYPE.ALL_VARIANTS, label: 'Variant' },
  { value: BESTILLING_LINE_TYPE.MAIN_WITH_EQUIPMENT, label: 'Medfølgende' }
];
const BESTILLING_LINJE_AVVIKSARSAK_OPTIONS = [
  { value: 'mangler_på_lager', label: 'Mangler på lager' },
  { value: 'skadet_vare', label: 'Skadet vare' },
  { value: 'feilplassering', label: 'Feilplassering' },
  { value: 'annet', label: 'Annet' }
];
const BESTILLING_STATUS_LABELS = {
  DRAFT: 'Utkast',
  SUBMITTED: 'Innsendt',
  PICKING: 'Under plukking',
  READY_FOR_PICKUP: 'Klar for henting',
  COMPLETED: 'Fullført',
  DEVIATION: 'Avvik'
};
const BESTILLING_LINE_STATUS_LABELS = {
  NOT_STARTED: 'Ikke startet',
  IN_PROGRESS: 'Pågår',
  PICKED: 'Plukket',
  PACKED: 'Pakket',
  DEVIATION: 'Avvik',
  CANCELLED: 'Kansellert'
};
const SETTINGS_SUBPAGE_BUTTON_ACTIVE_CLASSES = 'min-h-11 rounded-lg border border-hulBlue bg-hulBlueSoft px-3 py-2 text-sm font-medium text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark';
const SETTINGS_SUBPAGE_BUTTON_INACTIVE_CLASSES = 'min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark';
const SUBUNIT_ALLOWED_TYPES = ['variant', 'medfolgende'];
const DOCUMENT_UPLOAD_IMAGE_COMPRESSION_MAX_DIMENSION = 2200;
const DOCUMENT_UPLOAD_IMAGE_COMPRESSION_QUALITY = 0.82;
const DOCUMENT_UPLOAD_COMPRESSIBLE_IMAGE_MIME_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
  'image/heic': true,
  'image/heif': true
};
const DOCUMENT_UPLOAD_COMPRESSIBLE_IMAGE_EXTENSIONS = {
  '.jpg': true,
  '.jpeg': true,
  '.png': true,
  '.webp': true,
  '.heic': true,
  '.heif': true
};
const DOCUMENT_UPLOAD_CANVAS_OUTPUT_MIME_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true
};
const DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'image/webp': true,
  'image/heic': true,
  'image/heif': true,
  'image/svg+xml': true,
  'image/bmp': true,
  'image/tiff': true,
  'application/pdf': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
  'application/msword': true,
  'application/vnd.ms-excel': true,
  'application/vnd.ms-powerpoint': true
};
const DOCUMENT_UPLOAD_ALLOWED_EXTENSIONS = {
  '.pdf': true,
  '.docx': true,
  '.doc': true,
  '.xlsx': true,
  '.xls': true,
  '.pptx': true,
  '.ppt': true,
  '.png': true,
  '.jpg': true,
  '.jpeg': true,
  '.gif': true,
  '.webp': true,
  '.heic': true,
  '.heif': true,
  '.svg': true,
  '.bmp': true,
  '.tif': true,
  '.tiff': true
};
let searchInputDebounceTimer = 0;
const DETAIL_CACHE_MAX_ITEMS = 8;
const DETAIL_CACHE_TTL_MS = 2 * 60 * 1000;
const detailCacheById = {};
const detailCacheOrder = [];
const attachmentMediaCache = {};
let dynamicApiRoutingMode = '';
const CLIENT_STATE_PREFIXES = ['hul:', 'hul_'];
const CLIENT_STATE_BUILD_KEY = 'hul:client:build_id';
const CLIENT_STATE_RELOAD_GUARD_KEY = 'hul:client:reload_guard_build_id';
const CLIENT_STATE_CACHE_PREFIX = 'hul-';
const CLIENT_STATE_LOCALSTORAGE_WHITELIST = [];
const NAV_QUERY_WORKSPACE_KEY = 'ws';
const NAV_QUERY_ITEM_KEY = 'item';
const NAV_QUERY_SECTION_KEY = 'section';
const CLIENT_VIEW_STATE_KEY = 'hul:client:view_state_v1';
const NAV_RESTORE_SCROLL_RETRIES = 8;
const NAV_RESTORE_SCROLL_DELAY_MS = 80;
const GLOBAL_LOADING_TIMEOUT_MS = 30000;
const API_REQUEST_TIMEOUT_MS = 12000;
const BOOTSTRAP_PHASE_TIMEOUT_MS = 10000;
const BOOTSTRAP_SESSION_TIMEOUT_MS = 12000;

function isClientStateNamespaceKey(key) {
  var keyString = String(key || '');
  for (var i = 0; i < CLIENT_STATE_PREFIXES.length; i += 1) {
    if (keyString.indexOf(CLIENT_STATE_PREFIXES[i]) === 0) {
      return true;
    }
  }
  return false;
}

function readStorageValueSafe(storage, key) {
  if (!storage) {
    return '';
  }
  try {
    return storage.getItem(key) || '';
  } catch (_error) {
    return '';
  }
}

function writeStorageValueSafe(storage, key, value) {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(key, value);
  } catch (_error) {
    // Ignorerer storage-feil for å unngå blokkering i bootstrap.
  }
}

function removeStorageValueSafe(storage, key) {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(key);
  } catch (_error) {
    // Ignorerer storage-feil for å unngå blokkering i bootstrap.
  }
}

function cleanupScopedStorage(storage, whitelist) {
  if (!storage) {
    return;
  }
  var kept = {};
  var i = 0;
  for (i = 0; i < storage.length; i += 1) {
    var existingKey = storage.key(i);
    if (!existingKey || !isClientStateNamespaceKey(existingKey)) {
      continue;
    }
    if (whitelist[existingKey]) {
      kept[existingKey] = readStorageValueSafe(storage, existingKey);
    }
  }

  var removeKeys = [];
  for (i = 0; i < storage.length; i += 1) {
    var key = storage.key(i);
    if (!key || !isClientStateNamespaceKey(key) || whitelist[key]) {
      continue;
    }
    removeKeys.push(key);
  }

  for (i = 0; i < removeKeys.length; i += 1) {
    removeStorageValueSafe(storage, removeKeys[i]);
  }

  Object.keys(kept).forEach(function (keepKey) {
    writeStorageValueSafe(storage, keepKey, kept[keepKey]);
  });
}

function shouldForceClientStateResetByQueryParam() {
  var params = new URLSearchParams(window.location.search || '');
  return params.get('reset_client_state') === '1';
}

function removeResetQueryParamFromUrl() {
  var url = new URL(window.location.href);
  if (!url.searchParams.has('reset_client_state')) {
    return;
  }
  url.searchParams.delete('reset_client_state');
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
}

async function cleanupScopedCaches(cachePrefix) {
  if (!window.caches || typeof window.caches.keys !== 'function') {
    return;
  }
  var cacheNames = await window.caches.keys();
  await Promise.all(cacheNames.map(function (cacheName) {
    if (String(cacheName).indexOf(cachePrefix) === 0) {
      return window.caches.delete(cacheName);
    }
    return Promise.resolve(false);
  }));
}

async function ensureClientStateMatchesBuildId() {
  var runtimeConfig = window.__HUL_RUNTIME_CONFIG || window.__RUNTIME_CONFIG__ || {};
  var currentBuildId = String(runtimeConfig.appBuildId || '').trim() || 'dev-local';
  var forceReset = shouldForceClientStateResetByQueryParam();
  var localStorageRef = null;
  var sessionStorageRef = null;
  try {
    localStorageRef = window.localStorage;
  } catch (_error) {
    localStorageRef = null;
  }
  try {
    sessionStorageRef = window.sessionStorage;
  } catch (_error) {
    sessionStorageRef = null;
  }
  var buildStorageRef = localStorageRef || sessionStorageRef;
  if (!buildStorageRef) {
    removeResetQueryParamFromUrl();
    return true;
  }
  var previousBuildId = readStorageValueSafe(buildStorageRef, CLIENT_STATE_BUILD_KEY);
  var hasBuildMismatch = !previousBuildId || previousBuildId !== currentBuildId;
  var shouldResetClientState = forceReset || hasBuildMismatch;
  if (!shouldResetClientState) {
    return true;
  }

  var whitelistMap = {};
  CLIENT_STATE_LOCALSTORAGE_WHITELIST.forEach(function (key) {
    if (isClientStateNamespaceKey(key)) {
      whitelistMap[key] = true;
    }
  });

  cleanupScopedStorage(localStorageRef, whitelistMap);
  cleanupScopedStorage(sessionStorageRef, {});
  await cleanupScopedCaches(CLIENT_STATE_CACHE_PREFIX);

  var previousReloadGuardBuildId = readStorageValueSafe(sessionStorageRef, CLIENT_STATE_RELOAD_GUARD_KEY);
  writeStorageValueSafe(buildStorageRef, CLIENT_STATE_BUILD_KEY, currentBuildId);
  writeStorageValueSafe(sessionStorageRef, CLIENT_STATE_RELOAD_GUARD_KEY, currentBuildId);
  removeResetQueryParamFromUrl();

  if (previousReloadGuardBuildId === currentBuildId) {
    return true;
  }

  window.location.reload();
  return false;
}

function clonePlainData(value) {
  if (value == null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function readDetailCache(inventoryId) {
  const entry = detailCacheById[inventoryId];
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.timestamp > DETAIL_CACHE_TTL_MS) {
    delete detailCacheById[inventoryId];
    const expiredIndex = detailCacheOrder.indexOf(inventoryId);
    if (expiredIndex !== -1) {
      detailCacheOrder.splice(expiredIndex, 1);
    }
    return null;
  }
  return clonePlainData(entry.payload);
}

function writeDetailCache(inventoryId, payload) {
  if (!inventoryId || !payload) {
    return;
  }
  detailCacheById[inventoryId] = {
    timestamp: Date.now(),
    payload: clonePlainData(payload)
  };
  const existingIndex = detailCacheOrder.indexOf(inventoryId);
  if (existingIndex !== -1) {
    detailCacheOrder.splice(existingIndex, 1);
  }
  detailCacheOrder.unshift(inventoryId);
  while (detailCacheOrder.length > DETAIL_CACHE_MAX_ITEMS) {
    const removedId = detailCacheOrder.pop();
    if (removedId) {
      delete detailCacheById[removedId];
    }
  }
}

function buildDetailCachePayload(overrides) {
  var extra = overrides && typeof overrides === 'object' ? overrides : {};
  return Object.assign({
    detailItem: state.detailItem,
    auditEvents: state.auditEvents,
    detailLister: state.detailLister,
    detailListerFeil: state.detailListerFeil,
    documentsLoaded: !state.detailLoading.documents,
    auditLoaded: !state.detailLoading.audit,
    listerLoaded: !state.detailLoading.lister
  }, extra);
}

function readRuntimeConfig() {
  const config = window.__HUL_RUNTIME_CONFIG || window.__RUNTIME_CONFIG__;

  if (!config || typeof config !== 'object') {
    return {
      ok: false,
      message:
        'Mangler runtime-konfigurasjon. Sett window.__HUL_RUNTIME_CONFIG (eller window.__RUNTIME_CONFIG__) med backendBaseUrl, healthPath, sessionPath, authLoginPath, authLogoutPath, inventoryListPath, inventoryDetailPathTemplate, inventoryDocumentsPathTemplate, documentDeletePathTemplate, loanListPath, loanDetailPathTemplate, loanReturnPathTemplate, loanOverduePathTemplate, loanDeviationPathTemplate, inventoryAvailabilityPath, inventoryHistoryPath, adminInventoryAdjustPath, borrowerListPath, borrowerDetailPathTemplate, loanCaseListPath, loanCaseDetailPathTemplate, loanCaseHistoryPathTemplate, auditLogPathTemplate, masterdataPath, masterdataTypePathTemplate og masterdataTypeIdPathTemplate, listsPath, listDetailPathTemplate, listItemsPathTemplate, ordersDraftPath, orderDetailPathTemplate, orderLinesPathTemplate, orderSubmitPathTemplate, orderToLoanPathTemplate, publicListPathTemplate, publicItemPathTemplate og inventoryPublicLinkPathTemplate.'
    };
  }
  if (!window.__HUL_RUNTIME_CONFIG) {
    window.__HUL_RUNTIME_CONFIG = config;
  }

  const authMode = String(config.authMode || '');
  const backendBaseUrl = String(config.backendBaseUrl || '').trim();
  const loweredBackendBaseUrl = backendBaseUrl.toLowerCase();

  if (
    !backendBaseUrl ||
    !config.healthPath ||
    !config.sessionPath ||
    !config.inventoryListPath ||
    !config.inventoryDetailPathTemplate ||
    !config.inventoryDocumentsPathTemplate ||
    !config.documentDeletePathTemplate ||
    !config.loanListPath ||
    !config.loanDetailPathTemplate ||
    !config.loanReturnPathTemplate ||
    !config.loanOverduePathTemplate ||
    !config.loanDeviationPathTemplate ||
    !config.inventoryAvailabilityPath ||
    !config.inventoryHistoryPath ||
    !config.adminInventoryAdjustPath ||
    !config.borrowerListPath ||
    !config.borrowerDetailPathTemplate ||
    !config.loanCaseListPath ||
    !config.loanCaseDetailPathTemplate ||
    !config.loanCaseHistoryPathTemplate ||
    !config.auditLogPathTemplate ||
    !config.exportInventoryPath ||
    !config.importInventoryPath ||
    !config.bulkStatusUpdatePath ||
    !config.masterdataPath ||
    !config.masterdataTypePathTemplate ||
    !config.masterdataTypeIdPathTemplate ||
    !config.listsPath ||
    !config.listDetailPathTemplate ||
    !config.listItemsPathTemplate ||
    !config.ordersDraftPath ||
    !config.orderDetailPathTemplate ||
    !config.orderLinesPathTemplate ||
    !config.orderSubmitPathTemplate ||
    !config.orderToLoanPathTemplate ||
    !config.publicListPathTemplate ||
    !config.publicItemPathTemplate ||
    !config.inventoryPublicLinkPathTemplate ||
    !authMode
  ) {
    return {
      ok: false,
      message:
        'Runtime-konfigurasjon mangler nødvendige felter (backendBaseUrl, healthPath, sessionPath, inventoryListPath, inventoryDetailPathTemplate, inventoryDocumentsPathTemplate, documentDeletePathTemplate, loanListPath, loanDetailPathTemplate, loanReturnPathTemplate, loanOverduePathTemplate, loanDeviationPathTemplate, inventoryAvailabilityPath, inventoryHistoryPath, adminInventoryAdjustPath, borrowerListPath, borrowerDetailPathTemplate, loanCaseListPath, loanCaseDetailPathTemplate, loanCaseHistoryPathTemplate, auditLogPathTemplate, exportInventoryPath, importInventoryPath, bulkStatusUpdatePath, masterdataPath, masterdataTypePathTemplate, masterdataTypeIdPathTemplate, listsPath, listDetailPathTemplate, listItemsPathTemplate, ordersDraftPath, orderDetailPathTemplate, orderLinesPathTemplate, orderSubmitPathTemplate, orderToLoanPathTemplate, publicListPathTemplate, publicItemPathTemplate, inventoryPublicLinkPathTemplate, authMode). Dette tyder ofte på deploy/cache-mismatch mellom app.js og runtime-config.js.'
    };
  }

  var appScriptEl = document.querySelector('script[src*="app.js"]');
  var runtimeScriptEl = document.querySelector('script[src*="runtime-config.js"]');
  var appScriptVersion = '';
  var runtimeScriptVersion = '';
  if (appScriptEl && appScriptEl.getAttribute) {
    var appSrc = String(appScriptEl.getAttribute('src') || '');
    appScriptVersion = ((appSrc.match(/[?&]v=([^&]+)/) || [])[1] || '').trim();
  }
  if (runtimeScriptEl && runtimeScriptEl.getAttribute) {
    var runtimeSrc = String(runtimeScriptEl.getAttribute('src') || '');
    runtimeScriptVersion = ((runtimeSrc.match(/[?&]v=([^&]+)/) || [])[1] || '').trim();
  }
  if (appScriptVersion && runtimeScriptVersion && appScriptVersion !== runtimeScriptVersion) {
    return {
      ok: false,
      message: 'Frontend-assetene er ute av synk: app.js og runtime-config.js har ulik versjon i index.html. Tøm cache og deploy begge filer samtidig.'
    };
  }
  if (appScriptVersion && String(config.appBuildId || '').trim() && String(config.appBuildId).indexOf(appScriptVersion) !== 0) {
    return {
      ok: false,
      message: 'runtime-config appBuildId samsvarer ikke med app.js-versjon. Dette tyder på stale cache eller delvis deploy.'
    };
  }

  if (
    loweredBackendBaseUrl.indexOf('__set_') !== -1 ||
    loweredBackendBaseUrl.indexOf('example.com') !== -1 ||
    loweredBackendBaseUrl.indexOf('placeholder') !== -1
  ) {
    return {
      ok: false,
      message:
        'backendBaseUrl i runtime-konfig ser ut som en placeholder. Verifiser at deploy injiserer aktiv backend-URL.'
    };
  }

  if (authMode !== 'auth0' && authMode !== 'none' && authMode !== 'credentials') {
    return {
      ok: false,
      message: "authMode må være enten 'auth0', 'credentials' eller 'none'."
    };
  }

  if (authMode === 'auth0' && (!config.auth0Domain || !config.auth0ClientId || !config.auth0Audience)) {
    return {
      ok: false,
      message:
        'Når authMode er auth0 må auth0Domain, auth0ClientId og auth0Audience være satt.'
    };
  }

  if (authMode === 'credentials' && (!config.authLoginPath || !config.authLogoutPath)) {
    return {
      ok: false,
      message: 'Når authMode er credentials må authLoginPath og authLogoutPath være satt.'
    };
  }

  if (String(config.inventoryDetailPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'inventoryDetailPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.loanDetailPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'loanDetailPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.loanReturnPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'loanReturnPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.listDetailPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'listDetailPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.listItemsPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'listItemsPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.orderDetailPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'orderDetailPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.orderLinesPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'orderLinesPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.orderSubmitPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'orderSubmitPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.orderToLoanPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'orderToLoanPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.publicListPathTemplate).indexOf(':shareCode') === -1) {
    return {
      ok: false,
      message: 'publicListPathTemplate må inneholde :shareCode-plassholder.'
    };
  }
  if (String(config.publicItemPathTemplate).indexOf(':shareCode') === -1) {
    return {
      ok: false,
      message: 'publicItemPathTemplate må inneholde :shareCode-plassholder.'
    };
  }
  if (String(config.inventoryPublicLinkPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'inventoryPublicLinkPathTemplate må inneholde :id-plassholder.'
    };
  }

  if (String(config.loanOverduePathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'loanOverduePathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.loanDeviationPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'loanDeviationPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.borrowerDetailPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'borrowerDetailPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.loanCaseDetailPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'loanCaseDetailPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.loanCaseHistoryPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'loanCaseHistoryPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (
    String(config.auditLogPathTemplate).indexOf(':objektType') === -1 ||
    String(config.auditLogPathTemplate).indexOf(':objektId') === -1
  ) {
    return {
      ok: false,
      message: 'auditLogPathTemplate må inneholde både :objektType og :objektId.'
    };
  }
  if (String(config.inventoryDocumentsPathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'inventoryDocumentsPathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.documentDeletePathTemplate).indexOf(':id') === -1) {
    return {
      ok: false,
      message: 'documentDeletePathTemplate må inneholde :id-plassholder.'
    };
  }
  if (String(config.masterdataTypePathTemplate).indexOf(':type') === -1) {
    return {
      ok: false,
      message: 'masterdataTypePathTemplate må inneholde :type-plassholder.'
    };
  }
  if (
    String(config.masterdataTypeIdPathTemplate).indexOf(':type') === -1 ||
    String(config.masterdataTypeIdPathTemplate).indexOf(':id') === -1
  ) {
    return {
      ok: false,
      message: 'masterdataTypeIdPathTemplate må inneholde både :type og :id.'
    };
  }

  return {
    ok: true,
    value: config
  };
}

function buildEndpointUrl(baseUrl, path) {
  const normalizedBase = String(baseUrl).replace(/\/$/, '');
  const normalizedPath = String(path).replace(/^\//, '');
  return normalizedBase + '/' + normalizedPath;
}

function buildGasActionUrl(baseUrl, action, params) {
  const normalizedBase = String(baseUrl).replace(/\/$/, '');
  const searchParams = new URLSearchParams();
  searchParams.set('action', String(action || '').trim());

  if (params && typeof params === 'object') {
    Object.keys(params).forEach(function (key) {
      const value = params[key];
      if (value === undefined || value === null || value === '') {
        return;
      }
      searchParams.set(key, String(value));
    });
  }

  return normalizedBase + '?' + searchParams.toString();
}

function isRouteMismatchResponse(result) {
  if (!result || result.ok) {
    return false;
  }
  if (result.status === 404 || result.status === 405) {
    return true;
  }
  if (result.status >= 500) {
    return false;
  }

  const payloadErrorCode = result.payload && result.payload.error ? String(result.payload.error.code || '') : '';
  return payloadErrorCode === 'NOT_FOUND';
}

async function fetchJsonWithRoutingFallback(primaryUrl, token, fallbackUrl) {
  // Når apiRoutingMode er 'action', prøves action-URL (fallbackUrl) som primær
  // for å unngå CORS-feil fra GAS path-routing (302-redirect uten CORS-headere).
  const configuredRoutingMode = state.runtimeConfig && state.runtimeConfig.apiRoutingMode;
  const routingMode = configuredRoutingMode || dynamicApiRoutingMode;
  const useActionFirst = routingMode === 'action' && !!fallbackUrl;
  const effectivePrimary = useActionFirst ? fallbackUrl : primaryUrl;
  const effectiveFallback = useActionFirst ? primaryUrl : fallbackUrl;

  let firstResult;
  try {
    firstResult = await fetchJson(effectivePrimary, token);
  } catch (_primaryError) {
    // Primær-URL kastet (f.eks. CORS-feil fordi GAS serverte HTML i stedet for JSON).
    // Prøv fallback-URL direkte dersom den er oppgitt.
    if (!effectiveFallback) {
      throw _primaryError;
    }
    var fallbackResultAfterError = await fetchJson(effectiveFallback, token);
    if (!configuredRoutingMode && fallbackResultAfterError && fallbackResultAfterError.ok) {
      dynamicApiRoutingMode = useActionFirst ? 'path' : 'action';
    }
    return fallbackResultAfterError;
  }
  if (!effectiveFallback || !isRouteMismatchResponse(firstResult)) {
    return firstResult;
  }
  var fallbackResult = await fetchJson(effectiveFallback, token);
  if (!configuredRoutingMode && fallbackResult && fallbackResult.ok) {
    dynamicApiRoutingMode = useActionFirst ? 'path' : 'action';
  }
  return fallbackResult;
}

/**
 * POST-versjon av fetchJsonWithRoutingFallback.
 * Prøver primaryUrl (action-basert) først; ved routing-mismatch (404/NOT_FOUND)
 * prøves fallbackUrl (path-basert). Action-URL er primær for POST fordi
 * e.pathInfo kan være upålitelig i GAS-webapp.
 *
 * @param {string} primaryUrl   – Action-URL, f.eks. ?action=create-inventory
 * @param {string} fallbackUrl  – Path-URL, f.eks. /api/v1/inventory
 * @param {string} method       – HTTP-metode (normalt 'POST')
 * @param {string} token        – Session- eller auth0-token
 * @param {Object} payload      – Request-body-objekt
 * @return {Promise<{ok: boolean, status: number, payload: Object|null}>}
 */
async function sendJsonWithRoutingFallback(primaryUrl, fallbackUrl, method, token, payload) {
  const firstResult = await sendJson(primaryUrl, method, token, payload);
  if (!fallbackUrl || !isRouteMismatchResponse(firstResult)) {
    return firstResult;
  }
  return sendJson(fallbackUrl, method, token, payload);
}

function buildInventoryDetailPath(pathTemplate, inventoryId) {
  return String(pathTemplate).replace(':id', encodeURIComponent(inventoryId));
}

function buildPathFromTemplate(pathTemplate, id) {
  return String(pathTemplate).replace(':id', encodeURIComponent(id));
}

function buildMasterdataTypePath(pathTemplate, type) {
  return String(pathTemplate).replace(':type', encodeURIComponent(type));
}

function buildMasterdataTypeIdPath(pathTemplate, type, id) {
  return String(pathTemplate)
    .replace(':type', encodeURIComponent(type))
    .replace(':id', encodeURIComponent(id));
}

function buildAuditLogPath(pathTemplate, objektType, objektId) {
  return String(pathTemplate)
    .replace(':objektType', encodeURIComponent(objektType))
    .replace(':objektId', encodeURIComponent(objektId));
}

function buildPublicListPath(pathTemplate, shareCode) {
  return String(pathTemplate).replace(':shareCode', encodeURIComponent(shareCode));
}

function buildPublicListShareUrl(shareCode) {
  var url = new URL(window.location.href);
  url.searchParams.delete(NAV_QUERY_WORKSPACE_KEY);
  url.searchParams.delete(NAV_QUERY_ITEM_KEY);
  url.searchParams.delete(NAV_QUERY_SECTION_KEY);
  url.searchParams.set('shareCode', shareCode);
  url.searchParams.delete('listShareCode');
  url.searchParams.delete('itemShareCode');
  url.hash = '';
  return url.toString();
}

function buildPublicItemPath(pathTemplate, shareCode) {
  return String(pathTemplate).replace(':shareCode', encodeURIComponent(shareCode));
}

function buildInventoryPublicLinkPath(pathTemplate, itemId) {
  return String(pathTemplate).replace(':id', encodeURIComponent(itemId));
}

function resolveListeId(liste) {
  if (!liste || typeof liste !== 'object') {
    return '';
  }
  return String(
    liste.id ||
    liste.listId ||
    liste.sharedListId ||
    (liste.list && (liste.list.id || liste.list.listId || liste.list.sharedListId)) ||
    ''
  ).trim();
}

function buildPublicItemShareUrl(shareCode, listShareCode) {
  var url = new URL(window.location.href);
  url.searchParams.delete(NAV_QUERY_WORKSPACE_KEY);
  url.searchParams.delete(NAV_QUERY_ITEM_KEY);
  url.searchParams.delete(NAV_QUERY_SECTION_KEY);
  url.searchParams.delete('shareCode');
  if (listShareCode) {
    url.searchParams.set('listShareCode', listShareCode);
  } else {
    url.searchParams.delete('listShareCode');
  }
  url.searchParams.set('itemShareCode', shareCode);
  url.hash = '';
  return url.toString();
}

function getPublicShareCodeFromUrl() {
  var params = new URLSearchParams(window.location.search || '');
  return String(params.get('shareCode') || params.get('code') || '').trim();
}

function getPublicItemShareCodeFromUrl() {
  var params = new URLSearchParams(window.location.search || '');
  var directItemShareCode = String(params.get('itemShareCode') || params.get('itemCode') || params.get('publicToken') || params.get('token') || '').trim();
  if (directItemShareCode) {
    return directItemShareCode;
  }
  var workspaceRoute = String(params.get(NAV_QUERY_WORKSPACE_KEY) || '').trim();
  if (workspaceRoute === 'offentligVare') {
    return String(params.get('shareCode') || params.get('code') || '').trim();
  }
  var genericShareCode = String(params.get('shareCode') || params.get('code') || '').trim();
  if (/^VARE-\d+$/i.test(genericShareCode)) {
    return genericShareCode;
  }
  return '';
}

function getPublicItemListShareCodeFromUrl() {
  var params = new URLSearchParams(window.location.search || '');
  var explicitListShareCode = String(params.get('listShareCode') || params.get('listCode') || '').trim();
  if (explicitListShareCode) {
    return explicitListShareCode;
  }
  var workspaceRoute = String(params.get(NAV_QUERY_WORKSPACE_KEY) || '').trim();
  if (workspaceRoute === 'offentligVare') {
    return String(params.get('shareCode') || params.get('code') || '').trim();
  }
  return '';
}

function normalizeWorkspaceRoute(routeName) {
  var route = String(routeName || '').trim();
  // Bakoverkompatibilitet: tidligere eksport-rute peker nå til den samlede Import og eksport-undersiden.
  if (route === 'eksport') {
    return 'import';
  }
  var allowed = {
    liste: true,
    lager: true,
    bestilling: true,
    detalj: true,
    rediger: true,
    utlan: true,
    lantakere: true,
    lantakerNy: true,
    import: true,
    admin: true,
    brukeradministrasjon: true,
    lister: true,
    offentligListe: true,
    offentligVare: true
  };
  if (!allowed[route]) {
    return 'liste';
  }
  return route;
}

function parseNavigationStateFromUrl() {
  var params = new URLSearchParams(window.location.search || '');
  var route = normalizeWorkspaceRoute(params.get(NAV_QUERY_WORKSPACE_KEY) || 'liste');
  var inventoryId = String(params.get(NAV_QUERY_ITEM_KEY) || '').trim();
  var section = String(params.get(NAV_QUERY_SECTION_KEY) || '').trim();
  return {
    route: route,
    inventoryId: inventoryId,
    section: section
  };
}

function getNavigationContextKey() {
  var selectedInventoryId = String(state.selectedInventoryId || '').trim();
  return String(state.route || 'liste') + '::' + selectedInventoryId;
}

function readClientViewStateMap() {
  try {
    var raw = window.sessionStorage.getItem(CLIENT_VIEW_STATE_KEY) || '';
    if (!raw) {
      return {};
    }
    var parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function writeClientViewStateMap(viewStateMap) {
  try {
    window.sessionStorage.setItem(CLIENT_VIEW_STATE_KEY, JSON.stringify(viewStateMap || {}));
  } catch (_error) {
    // Ignorerer storage-feil slik at refresh-gjenoppretting aldri blokkerer appen.
  }
}

function persistCurrentViewState() {
  var viewStateMap = readClientViewStateMap();
  var contextKey = getNavigationContextKey();
  viewStateMap[contextKey] = {
    accordionSection: String(state.detailAccordionOpenSection || '').trim(),
    scrollTop: Math.max(0, Math.floor(window.scrollY || 0))
  };
  writeClientViewStateMap(viewStateMap);
}

function readViewStateForCurrentContext() {
  var viewStateMap = readClientViewStateMap();
  var contextKey = getNavigationContextKey();
  if (!Object.prototype.hasOwnProperty.call(viewStateMap, contextKey)) {
    return null;
  }
  return viewStateMap[contextKey];
}

function restoreScrollPositionAfterRender(scrollTop) {
  var targetScrollTop = Number(scrollTop);
  if (isNaN(targetScrollTop) || targetScrollTop <= 0) {
    return;
  }
  var attempts = 0;
  function tryRestore() {
    attempts += 1;
    window.scrollTo(0, targetScrollTop);
    var currentScrollTop = Math.floor(window.scrollY || 0);
    if (currentScrollTop >= targetScrollTop || attempts >= NAV_RESTORE_SCROLL_RETRIES) {
      return;
    }
    window.setTimeout(tryRestore, NAV_RESTORE_SCROLL_DELAY_MS);
  }
  window.setTimeout(tryRestore, NAV_RESTORE_SCROLL_DELAY_MS);
}

function restoreNonCriticalViewStateForCurrentContext() {
  var viewState = readViewStateForCurrentContext();
  if (!viewState || typeof viewState !== 'object') {
    return;
  }
  var section = String(viewState.accordionSection || '').trim();
  if (section) {
    state.detailAccordionOpenSection = section;
    ensureDetailAccordionSection();
  }
  restoreScrollPositionAfterRender(viewState.scrollTop);
}

function syncNavigationUrl(historyMode) {
  if (state.route === 'offentligListe' || state.route === 'offentligVare') {
    return;
  }
  var mode = historyMode === 'push' ? 'push' : 'replace';
  var url = new URL(window.location.href);
  var params = new URLSearchParams(url.search || '');
  params.set(NAV_QUERY_WORKSPACE_KEY, normalizeWorkspaceRoute(state.route));
  if (state.selectedInventoryId && (state.route === 'detalj' || state.route === 'utlan' || state.route === 'rediger')) {
    params.set(NAV_QUERY_ITEM_KEY, String(state.selectedInventoryId));
  } else {
    params.delete(NAV_QUERY_ITEM_KEY);
  }
  if (state.route === 'detalj') {
    var section = String(state.detailAccordionOpenSection || '').trim();
    if (section) {
      params.set(NAV_QUERY_SECTION_KEY, section);
    } else {
      params.delete(NAV_QUERY_SECTION_KEY);
    }
  } else {
    params.delete(NAV_QUERY_SECTION_KEY);
  }
  url.search = params.toString();
  var nextRelativeUrl = url.pathname + url.search + url.hash;
  var currentRelativeUrl = window.location.pathname + window.location.search + window.location.hash;
  if (nextRelativeUrl === currentRelativeUrl) {
    return;
  }
  if (mode === 'push') {
    window.history.pushState({}, document.title, nextRelativeUrl);
  } else {
    window.history.replaceState({}, document.title, nextRelativeUrl);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

var numericInputObserver = null;
var numericInputEnhancementTimer = null;
var numericInputGeneratedIdCounter = 0;

function toFiniteNumberOrNull(rawValue) {
  if (rawValue == null || rawValue === '') {
    return null;
  }
  var parsedValue = Number(rawValue);
  return isFinite(parsedValue) ? parsedValue : null;
}

function readNumericStep(inputEl) {
  var rawStep = String(inputEl && inputEl.getAttribute('step') || '').trim().toLowerCase();
  if (!rawStep || rawStep === 'any') {
    return null;
  }
  var parsedStep = Number(rawStep);
  if (!isFinite(parsedStep) || parsedStep <= 0) {
    return 1;
  }
  return parsedStep;
}

function readNumericConstraints(inputEl) {
  return {
    min: toFiniteNumberOrNull(inputEl && inputEl.getAttribute('min')),
    max: toFiniteNumberOrNull(inputEl && inputEl.getAttribute('max')),
    step: readNumericStep(inputEl)
  };
}

function countStepDecimals(stepValue) {
  if (!isFinite(stepValue) || stepValue <= 0) {
    return 0;
  }
  var stepText = String(stepValue);
  if (stepText.indexOf('e-') !== -1) {
    var exponent = parseInt(stepText.split('e-')[1], 10);
    return isNaN(exponent) ? 0 : exponent;
  }
  var decimalPart = stepText.split('.')[1] || '';
  return decimalPart.length;
}

function snapNumberToStep(value, minValue, stepValue) {
  if (!isFinite(value) || !isFinite(stepValue) || stepValue <= 0) {
    return value;
  }
  var baseValue = minValue != null ? minValue : 0;
  var steppedValue = baseValue + (Math.round((value - baseValue) / stepValue) * stepValue);
  var decimals = countStepDecimals(stepValue);
  return Number(steppedValue.toFixed(decimals + 2));
}

function clampNumberToRange(value, minValue, maxValue) {
  var clampedValue = value;
  if (minValue != null && clampedValue < minValue) {
    clampedValue = minValue;
  }
  if (maxValue != null && clampedValue > maxValue) {
    clampedValue = maxValue;
  }
  return clampedValue;
}

function formatNumberForInput(value, stepValue) {
  if (!isFinite(value)) {
    return '';
  }
  if (!stepValue) {
    return String(value);
  }
  var decimals = countStepDecimals(stepValue);
  return Number(value).toFixed(decimals);
}

function setNumericInputFeedback(inputEl, feedbackText) {
  var message = String(feedbackText || '').trim();
  var feedbackEl = inputEl ? document.getElementById(String(inputEl.id || '') + '-feedback') : null;
  if (!inputEl || !feedbackEl) {
    return;
  }
  if (!message) {
    inputEl.setCustomValidity('');
    inputEl.classList.remove('border-rose-400', 'bg-rose-50');
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
    return;
  }
  inputEl.setCustomValidity(message);
  inputEl.classList.add('border-rose-400', 'bg-rose-50');
  feedbackEl.classList.remove('hidden');
  feedbackEl.textContent = message;
}

function validateNumericInputValue(inputEl, options) {
  if (!inputEl) {
    return true;
  }
  var settings = options || {};
  var rawValue = String(inputEl.value || '').trim();
  if (!rawValue) {
    if (inputEl.required) {
      setNumericInputFeedback(inputEl, 'Verdi må fylles ut.');
      return false;
    }
    setNumericInputFeedback(inputEl, '');
    return true;
  }

  var numericValue = Number(rawValue);
  if (!isFinite(numericValue)) {
    setNumericInputFeedback(inputEl, 'Ugyldig tallverdi.');
    return false;
  }

  var constraints = readNumericConstraints(inputEl);
  if (constraints.min != null && numericValue < constraints.min) {
    setNumericInputFeedback(inputEl, 'Verdi må være minst ' + constraints.min + '.');
    return false;
  }
  if (constraints.max != null && numericValue > constraints.max) {
    setNumericInputFeedback(inputEl, 'Verdi må være maks ' + constraints.max + '.');
    return false;
  }
  if (constraints.step != null) {
    var baseValue = constraints.min != null ? constraints.min : 0;
    var stepRatio = (numericValue - baseValue) / constraints.step;
    var roundedRatio = Math.round(stepRatio);
    if (Math.abs(stepRatio - roundedRatio) > 1e-9) {
      setNumericInputFeedback(inputEl, 'Verdi må følge steg på ' + constraints.step + '.');
      return false;
    }
  }

  if (settings.normalize === true) {
    var normalizedValue = numericValue;
    if (constraints.step != null) {
      normalizedValue = snapNumberToStep(normalizedValue, constraints.min, constraints.step);
    }
    normalizedValue = clampNumberToRange(normalizedValue, constraints.min, constraints.max);
    inputEl.value = formatNumberForInput(normalizedValue, constraints.step);
  }
  setNumericInputFeedback(inputEl, '');
  return true;
}

function dispatchNumericInputEvents(inputEl) {
  if (!inputEl) {
    return;
  }
  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
}

function adjustNumericInputValue(inputEl, direction) {
  if (!inputEl || inputEl.disabled) {
    return;
  }
  var constraints = readNumericConstraints(inputEl);
  var stepValue = constraints.step != null ? constraints.step : 1;
  var rawCurrentValue = String(inputEl.value || '').trim();
  var currentValue = Number(rawCurrentValue);
  if (!isFinite(currentValue)) {
    currentValue = constraints.min != null ? constraints.min : 0;
  }
  var nextValue = currentValue + (direction * stepValue);
  if (constraints.step != null) {
    nextValue = snapNumberToStep(nextValue, constraints.min, constraints.step);
  }
  nextValue = clampNumberToRange(nextValue, constraints.min, constraints.max);
  inputEl.value = formatNumberForInput(nextValue, constraints.step);
  validateNumericInputValue(inputEl, { normalize: true });
  dispatchNumericInputEvents(inputEl);
}

function ensureNumericInputId(inputEl) {
  if (inputEl.id) {
    return inputEl.id;
  }
  numericInputGeneratedIdCounter += 1;
  var generatedId = 'numeric-input-' + numericInputGeneratedIdCounter;
  inputEl.id = generatedId;
  return generatedId;
}

function enhanceSingleNumericInput(inputEl) {
  if (!inputEl || inputEl.dataset.numericEnhanced === 'true' || inputEl.closest('[data-numeric-input-control]')) {
    return;
  }
  var shouldSkipEnhancement = String(inputEl.getAttribute('data-numeric-enhance') || '').trim().toLowerCase() === 'false';
  if (shouldSkipEnhancement) {
    return;
  }
  var inputId = ensureNumericInputId(inputEl);
  var parentEl = inputEl.parentNode;
  if (!parentEl) {
    return;
  }

  inputEl.classList.add('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-hulBlueDark');
  inputEl.classList.add('text-center');

  var controlEl = document.createElement('div');
  controlEl.className = 'mt-1 flex min-h-11 items-stretch gap-1';
  controlEl.setAttribute('data-numeric-input-control', 'true');

  var decrementButton = document.createElement('button');
  decrementButton.type = 'button';
  decrementButton.className = 'min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 text-lg font-semibold leading-none text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark';
  decrementButton.setAttribute('aria-label', 'Reduser verdi');
  decrementButton.textContent = '−';

  var incrementButton = document.createElement('button');
  incrementButton.type = 'button';
  incrementButton.className = 'min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 text-lg font-semibold leading-none text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark';
  incrementButton.setAttribute('aria-label', 'Øk verdi');
  incrementButton.textContent = '+';

  var inputWrapEl = document.createElement('div');
  inputWrapEl.className = 'min-w-0 flex-1';

  parentEl.insertBefore(controlEl, inputEl);
  inputWrapEl.appendChild(inputEl);
  controlEl.appendChild(decrementButton);
  controlEl.appendChild(inputWrapEl);
  controlEl.appendChild(incrementButton);

  var feedbackId = inputId + '-feedback';
  var existingFeedbackEl = document.getElementById(feedbackId);
  if (!existingFeedbackEl) {
    var feedbackEl = document.createElement('p');
    feedbackEl.id = feedbackId;
    feedbackEl.className = 'mt-1 hidden text-xs font-medium text-rose-800';
    feedbackEl.setAttribute('role', 'status');
    feedbackEl.setAttribute('aria-live', 'polite');
    controlEl.insertAdjacentElement('afterend', feedbackEl);
  }
  var describedBy = String(inputEl.getAttribute('aria-describedby') || '').trim();
  if (!describedBy) {
    inputEl.setAttribute('aria-describedby', feedbackId);
  } else if (describedBy.indexOf(feedbackId) === -1) {
    inputEl.setAttribute('aria-describedby', describedBy + ' ' + feedbackId);
  }

  decrementButton.addEventListener('click', function () {
    adjustNumericInputValue(inputEl, -1);
  });
  incrementButton.addEventListener('click', function () {
    adjustNumericInputValue(inputEl, 1);
  });
  inputEl.addEventListener('input', function () {
    validateNumericInputValue(inputEl, { normalize: false });
  });
  inputEl.addEventListener('blur', function () {
    validateNumericInputValue(inputEl, { normalize: false });
  });
  inputEl.addEventListener('change', function () {
    validateNumericInputValue(inputEl, { normalize: true });
  });

  inputEl.dataset.numericEnhanced = 'true';
  validateNumericInputValue(inputEl, { normalize: false });
}

function enhanceNumericInputs(rootEl) {
  var rootNode = rootEl || document;
  if (!rootNode || !rootNode.querySelectorAll) {
    return;
  }
  var numericInputs = rootNode.querySelectorAll('input[type="number"]');
  for (var i = 0; i < numericInputs.length; i += 1) {
    enhanceSingleNumericInput(numericInputs[i]);
  }
}

function scheduleNumericInputEnhancement() {
  if (numericInputEnhancementTimer != null) {
    return;
  }
  numericInputEnhancementTimer = window.setTimeout(function () {
    numericInputEnhancementTimer = null;
    enhanceNumericInputs(document);
  }, 0);
}

function startNumericInputEnhancer() {
  scheduleNumericInputEnhancement();
  if (numericInputObserver || typeof MutationObserver !== 'function') {
    return;
  }
  var observerRoot = document.getElementById('app-root') || document.body;
  if (!observerRoot) {
    return;
  }
  numericInputObserver = new MutationObserver(function () {
    scheduleNumericInputEnhancement();
  });
  numericInputObserver.observe(observerRoot, {
    childList: true,
    subtree: true
  });
}

const INLINE_LOADER_HTML = [
  '<span aria-hidden="true" class="inline-flex h-4 min-w-4 items-end justify-center gap-0.5 mr-1.5">',
  '  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.3s]"></span>',
  '  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.15s]"></span>',
  '  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>',
  '</span>'
].join('');

function setButtonBusy(buttonEl, busy) {
  if (!buttonEl) return;
  if (busy) {
    buttonEl.dataset.wasDisabled = buttonEl.disabled ? '1' : '0';
    buttonEl.disabled = true;
    buttonEl.setAttribute('aria-disabled', 'true');
    buttonEl.setAttribute('aria-busy', 'true');
    buttonEl.dataset.origText = buttonEl.textContent.trim();
    buttonEl.innerHTML = INLINE_LOADER_HTML + '<span>' + escapeHtml(buttonEl.dataset.origText) + '</span>';
  } else {
    var wasDisabled = buttonEl.dataset.wasDisabled === '1';
    buttonEl.disabled = wasDisabled;
    buttonEl.setAttribute('aria-disabled', wasDisabled ? 'true' : 'false');
    buttonEl.removeAttribute('aria-busy');
    delete buttonEl.dataset.wasDisabled;
    const orig = buttonEl.dataset.origText;
    if (orig !== undefined) {
      buttonEl.textContent = orig;
      delete buttonEl.dataset.origText;
    }
  }
}

function setGlobalLoadingState(active, message) {
  if (active) {
    state.loadingState.globalMessage = String(message || 'Behandler forespørsel…').trim() || 'Behandler forespørsel…';
  } else {
    state.loadingState.globalMessage = '';
  }
}

function startGlobalLoading(key, message, options) {
  var activeKey = String(key || '').trim();
  if (!activeKey) {
    return null;
  }
  var loadingOptions = options && typeof options === 'object' ? options : {};
  var blocking = loadingOptions.blocking !== false;
  state.loadingState.globalActiveKeys[activeKey] = {
    startedAt: Date.now(),
    blocking: blocking
  };
  setGlobalLoadingState(true, message);
  renderState();
  return window.setTimeout(function () {
    if (!state.loadingState.globalActiveKeys[activeKey]) {
      return;
    }
    delete state.loadingState.globalActiveKeys[activeKey];
    if (!Object.keys(state.loadingState.globalActiveKeys).length) {
      setGlobalLoadingState(false, '');
    }
    if (!state.writeError) {
      state.writeError = 'Operasjonen brukte for lang tid. Prøv igjen.';
    }
    renderState();
  }, GLOBAL_LOADING_TIMEOUT_MS);
}

function stopGlobalLoading(key, timeoutId) {
  var activeKey = String(key || '').trim();
  if (!activeKey) {
    return;
  }
  if (timeoutId) {
    window.clearTimeout(timeoutId);
  }
  delete state.loadingState.globalActiveKeys[activeKey];
  var remainingKeys = Object.keys(state.loadingState.globalActiveKeys);
  if (!remainingKeys.length) {
    setGlobalLoadingState(false, '');
  }
  renderState();
}

async function withPendingAction(actionKey, buttonEl, asyncRunner) {
  var key = String(actionKey || '').trim();
  if (!key) {
    return asyncRunner();
  }
  if (state.loadingState.pendingActions[key]) {
    return null;
  }
  state.loadingState.pendingActions[key] = true;
  setButtonBusy(buttonEl, true);
  try {
    return await asyncRunner();
  } finally {
    delete state.loadingState.pendingActions[key];
    setButtonBusy(buttonEl, false);
  }
}

function getAccessToken() {
  try {
    return window.sessionStorage.getItem('hul_access_token') || '';
  } catch (_error) {
    return '';
  }
}

function setAccessToken(token) {
  try {
    if (!token) {
      window.sessionStorage.removeItem('hul_access_token');
      return;
    }

    window.sessionStorage.setItem('hul_access_token', token);
  } catch (_error) {
    // Ignorerer storage-feil; auth-state håndteres kontrollert i UI.
  }
}

function clearAuthState() {
  setAccessToken('');
  state.auth = {
    status: 'unauthenticated',
    session: null,
    detail: 'Du er logget ut.',
    bootstrapError: ''
  };
  state.inventory = [];
  state.loans = [];
  state.detailItem = null;
  state.auditEvents = [];
  state.selectedInventoryId = '';
  state.inventoryError = '';
  state.detailError = '';
}

function getAuthRedirectUri() {
  const runtimeConfig = state.runtimeConfig;
  if (!runtimeConfig) {
    return window.location.origin + window.location.pathname;
  }

  if (runtimeConfig.auth0RedirectUri) {
    return runtimeConfig.auth0RedirectUri;
  }

  return window.location.origin + window.location.pathname;
}

function startLoginRedirect() {
  const runtimeConfig = state.runtimeConfig;
  if (!runtimeConfig) {
    return;
  }

  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  try {
    window.sessionStorage.setItem('hul_auth_state_nonce', nonce);
  } catch (_error) {
    // Nonce-validering deaktiveres kontrollert dersom storage ikke er tilgjengelig.
  }

  const params = new URLSearchParams();
  params.set('response_type', 'token');
  params.set('client_id', runtimeConfig.auth0ClientId);
  params.set('redirect_uri', getAuthRedirectUri());
  params.set('audience', runtimeConfig.auth0Audience);
  params.set('scope', runtimeConfig.auth0Scope || 'openid profile email');
  params.set('state', nonce);

  const auth0Domain = String(runtimeConfig.auth0Domain).replace(/\/$/, '');
  window.location.assign(auth0Domain + '/authorize?' + params.toString());
}

function handleAuthErrorStatus(statusCode) {
  if (statusCode === 401) {
    clearAuthState();
    state.auth.detail = 'Session er utløpt eller ugyldig. Logg inn på nytt.';
    return true;
  }

  if (statusCode === 403) {
    state.auth.status = 'forbidden';
    state.auth.detail = 'Du mangler rolle/tilgang for denne ressursen.';
    return true;
  }

  return false;
}

function hasUnauthorizedPayload(result) {
  return !!(result && result.payload && result.payload.error && result.payload.error.code === 'UNAUTHORIZED');
}

/**
 * Håndterer UNAUTHORIZED-feil i payload fra datahentings-endepunkter.
 * Setter auth til 'unauthenticated' og viser innloggingsskjema.
 * Dersom authMode er 'none' men backend krever credentials, byttes effektiv
 * authMode til 'credentials' slik at innloggingsskjemaet vises i stedet for en knapp.
 */
function _handleDataUnauthorized() {
  clearAuthState();
  state.auth.detail = 'Ugyldig eller utløpt session. Logg inn på nytt.';
  if (state.runtimeConfig && state.runtimeConfig.authMode === 'none') {
    state.runtimeConfig = Object.assign({}, state.runtimeConfig, { authMode: 'credentials' });
  }
}

function canWrite() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';
  return !!(state.runtimeConfig && (
    state.runtimeConfig.authMode === 'none'
      ? true
      : (role === 'admin' || role === 'editor' || role === 'superadmin')
  ));
}

function canAccessAdminWorkspace() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';
  return !!(state.runtimeConfig && (
    state.runtimeConfig.authMode === 'none'
      ? true
      : (role === 'admin' || role === 'superadmin')
  ));
}

function canAccessLagerWorkspace() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';
  return !!(state.runtimeConfig && (
    state.runtimeConfig.authMode === 'none'
      ? true
      : (role === 'editor' || role === 'admin' || role === 'superadmin')
  ));
}

function setWorkspace(routeName, options) {
  var workspaceOptions = options || {};
  if (routeName === 'eksport') {
    routeName = 'import';
  }
  var allowed = {
    liste: true,
    lager: true,
    bestilling: true,
    detalj: true,
    rediger: true,
    utlan: true,
    lantakere: true,
    lantakerNy: true,
    import: true,
    admin: true,
    brukeradministrasjon: true,
    lister: true,
    offentligListe: true
  };
  if (!allowed[routeName]) {
    state.route = 'liste';
    syncNavigationUrl('replace');
    return;
  }

  if (routeName === 'admin' && !canAccessAdminWorkspace()) {
    state.route = 'liste';
    syncNavigationUrl('replace');
    return;
  }

  if (routeName === 'lager' && !canAccessLagerWorkspace()) {
    state.route = 'liste';
    syncNavigationUrl('replace');
    return;
  }

  if (routeName === 'detalj' && !state.selectedInventoryId) {
    state.route = 'liste';
    syncNavigationUrl('replace');
    return;
  }

  state.route = routeName;
  syncNavigationUrl(workspaceOptions.historyMode === 'push' ? 'push' : 'replace');
}

function generateNextInventoryId() {
  var prefix = 'HUL-';
  var max = 0;
  (state.inventory || []).forEach(function (item) {
    var id = String(item.id || '');
    if (id.toUpperCase().indexOf(prefix) === 0) {
      var n = parseInt(id.slice(prefix.length), 10);
      if (!isNaN(n) && n > max) {
        max = n;
      }
    }
  });
  var next = max + 1;
  return prefix + String(next).padStart(4, '0');
}

function handleAuthCallbackIfPresent() {
  const hash = window.location.hash || '';
  if (!hash || hash.indexOf('access_token=') === -1) {
    return { handled: false, errorMessage: '' };
  }

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const accessToken = params.get('access_token') || '';
  const returnedState = params.get('state') || '';
  const authError = params.get('error') || '';
  const authErrorDescription = params.get('error_description') || '';

  let expectedState = '';
  try {
    expectedState = window.sessionStorage.getItem('hul_auth_state_nonce') || '';
    window.sessionStorage.removeItem('hul_auth_state_nonce');
  } catch (_error) {
    expectedState = '';
  }

  if (authError) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    return {
      handled: true,
      errorMessage: authErrorDescription || ('Innlogging feilet: ' + authError)
    };
  }

  if (!accessToken) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    return {
      handled: true,
      errorMessage: 'Callback mangler access token.'
    };
  }

  if (expectedState && returnedState !== expectedState) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    return {
      handled: true,
      errorMessage: 'Innlogging feilet på grunn av ugyldig callback-state.'
    };
  }

  setAccessToken(accessToken);
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return {
    handled: true,
    errorMessage: ''
  };
}

async function fetchJson(url, token, options) {
  var requestOptions = options || {};
  let requestUrl = String(url || '');
  const runtimeConfig = state.runtimeConfig;
  if (runtimeConfig && runtimeConfig.authMode === 'credentials' && token) {
    const hasQuery = requestUrl.indexOf('?') !== -1;
    requestUrl += (hasQuery ? '&' : '?') + 'sessionToken=' + encodeURIComponent(token);
  }

  const headers = {
    Accept: 'application/json'
  };

  if (token && runtimeConfig && runtimeConfig.authMode === 'auth0') {
    headers.Authorization = 'Bearer ' + token;
  }

  var abortController = typeof AbortController === 'function' ? new AbortController() : null;
  var timeoutMs = Number(requestOptions.timeoutMs || API_REQUEST_TIMEOUT_MS);
  var timeoutHandle = 0;
  if (abortController && timeoutMs > 0) {
    timeoutHandle = window.setTimeout(function () {
      abortController.abort();
    }, timeoutMs);
  }

  var response = null;
  try {
    response = await fetch(requestUrl, {
      method: 'GET',
      headers,
      cache: requestOptions.cacheMode || 'no-cache',
      signal: abortController ? abortController.signal : undefined
    });
  } catch (error) {
    if (timeoutHandle) {
      window.clearTimeout(timeoutHandle);
    }
    if (error && error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        payload: null,
        fetchError: 'timeout',
        errorMessage: 'Kall tidsavbrutt etter ' + timeoutMs + ' ms.'
      };
    }
    return {
      ok: false,
      status: 0,
      payload: null,
      fetchError: 'network',
      errorMessage: 'Nettverksfeil eller CORS-blokkering ved kall.'
    };
  }
  if (timeoutHandle) {
    window.clearTimeout(timeoutHandle);
  }

  var rawBody = '';
  try {
    rawBody = await response.text();
  } catch (_error) {
    rawBody = '';
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const trimmedBody = String(rawBody || '').trim();
  const bodyLooksLikeJson =
    contentType.indexOf('application/json') !== -1 ||
    (!contentType && (trimmedBody.indexOf('{') === 0 || trimmedBody.indexOf('[') === 0));
  const bodyLooksLikeHtml =
    contentType.indexOf('text/html') !== -1 ||
    trimmedBody.toLowerCase().indexOf('<!doctype html') === 0 ||
    trimmedBody.toLowerCase().indexOf('<html') === 0;

  let payload = null;
  if (bodyLooksLikeJson) {
    try {
      payload = trimmedBody ? JSON.parse(trimmedBody) : null;
    } catch (_error) {
      payload = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
    contentType: contentType,
    rawBody: trimmedBody,
    responseFormat: bodyLooksLikeHtml ? 'html' : (bodyLooksLikeJson ? 'json' : 'unknown')
  };
}

async function sendJson(url, method, token, payload) {
  const runtimeConfig = state.runtimeConfig;
  // GAS web app does not handle OPTIONS preflight for cross-origin POST.
  // Sending body as text/plain avoids the preflight (simple request).
  // GAS reads e.postData.contents regardless of Content-Type.
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'text/plain'
  };

  if (token && runtimeConfig && runtimeConfig.authMode === 'auth0') {
    headers.Authorization = 'Bearer ' + token;
  }

  const requestPayload = Object.assign({}, payload || {});
  if (runtimeConfig && runtimeConfig.authMode === 'credentials' && token) {
    requestPayload.sessionToken = token;
  }

  var abortController = typeof AbortController === 'function' ? new AbortController() : null;
  var timeoutHandle = 0;
  if (abortController && API_REQUEST_TIMEOUT_MS > 0) {
    timeoutHandle = window.setTimeout(function () {
      abortController.abort();
    }, API_REQUEST_TIMEOUT_MS);
  }

  var response = null;
  try {
    response = await fetch(url, {
      method,
      headers,
      cache: 'no-store',
      body: JSON.stringify(requestPayload),
      signal: abortController ? abortController.signal : undefined
    });
  } catch (error) {
    if (timeoutHandle) {
      window.clearTimeout(timeoutHandle);
    }
    if (error && error.name === 'AbortError') {
      return {
        ok: false,
        status: 0,
        payload: null,
        fetchError: 'timeout',
        errorMessage: 'Kall tidsavbrutt etter ' + API_REQUEST_TIMEOUT_MS + ' ms.'
      };
    }
    return {
      ok: false,
      status: 0,
      payload: null,
      fetchError: 'network',
      errorMessage: 'Nettverksfeil eller CORS-blokkering ved kall.'
    };
  }
  if (timeoutHandle) {
    window.clearTimeout(timeoutHandle);
  }

  var rawBody = '';
  try {
    rawBody = await response.text();
  } catch (_error) {
    rawBody = '';
  }
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const trimmedBody = String(rawBody || '').trim();
  const bodyLooksLikeJson =
    contentType.indexOf('application/json') !== -1 ||
    (!contentType && (trimmedBody.indexOf('{') === 0 || trimmedBody.indexOf('[') === 0));
  const bodyLooksLikeHtml =
    contentType.indexOf('text/html') !== -1 ||
    trimmedBody.toLowerCase().indexOf('<!doctype html') === 0 ||
    trimmedBody.toLowerCase().indexOf('<html') === 0;

  let responsePayload = null;
  if (bodyLooksLikeJson) {
    try {
      responsePayload = trimmedBody ? JSON.parse(trimmedBody) : null;
    } catch (_error) {
      responsePayload = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    payload: responsePayload,
    contentType: contentType,
    rawBody: trimmedBody,
    responseFormat: bodyLooksLikeHtml ? 'html' : (bodyLooksLikeJson ? 'json' : 'unknown')
  };
}

function applyShellMarkup() {
  const root = document.getElementById('app-root');

  root.innerHTML = [
    '<div class="min-h-screen bg-slate-100">',
    '  <header id="app-shell-header" class="border-b border-hulBlueSoft bg-white">',
    '    <div class="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">',
    '      <div>',
    '        <p class="text-sm font-medium uppercase tracking-wide text-hulBlueDark">Hell Ultra Lagerstyring</p>',
    '        <h1 class="text-lg font-semibold text-slate-900">Lagerstyring</h1>',
    '      </div>',
    '      <div class="flex items-center gap-2">',
    '        <button id="mobile-back-button" type="button" class="hidden min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Til liste</button>',
    '        <button id="order-cart-button" type="button" aria-label="Åpne bestilling" class="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-hulBlueSoft bg-white px-3 py-2 text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h2l2.2 10.2c.2.9.9 1.5 1.8 1.5h8.6c.9 0 1.6-.6 1.8-1.4L22 7H7.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="19" r="1.7" fill="currentColor"/><circle cx="18" cy="19" r="1.7" fill="currentColor"/></svg>',
    '          <span id="order-cart-badge" class="pointer-events-none absolute -right-1 -top-1 hidden min-h-6 min-w-6 items-center justify-center rounded-full border border-hulBlueDark bg-hulBlue px-1 text-xs font-semibold leading-none text-white"></span>',
    '        </button>',
    '        <div id="header-auth-wrapper" class="relative hidden">',
    '          <button id="header-auth-button" type="button" aria-expanded="false" aria-controls="header-auth-dropdown" class="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-lg border border-hulBlueSoft bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M5 19.5c.6-3.2 3.4-5.5 7-5.5s6.4 2.3 7 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    '            <span id="header-auth-role" class="max-w-[9rem] truncate">Innlogget</span>',
    '          </button>',
    '          <section id="header-auth-dropdown" class="hidden absolute right-0 top-full z-50 mt-1 w-64 max-w-[calc(100vw-1rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-lg" role="dialog" aria-label="Innloggingsdetaljer">',
    '            <h2 class="text-sm font-semibold text-slate-900">Innloggingsstatus</h2>',
    '            <dl class="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 text-sm text-slate-700">',
    '              <dt class="font-medium text-slate-900">Status</dt><dd id="header-auth-detail-status" class="min-w-0 break-words">Innlogget</dd>',
    '              <dt class="font-medium text-slate-900">Rolle</dt><dd id="header-auth-detail-role" class="min-w-0 break-words">–</dd>',
    '              <dt class="font-medium text-slate-900">Økt</dt><dd id="header-auth-detail-session" class="min-w-0 break-words">Aktiv</dd>',
    '            </dl>',
    '          </section>',
    '        </div>',
    '        <div class="relative">',
    '          <button id="hamburger-button" type="button" aria-label="Meny" aria-expanded="false" aria-controls="hamburger-menu" class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><rect y="4" width="22" height="2.2" rx="1.1" fill="currentColor"/><rect y="10" width="22" height="2.2" rx="1.1" fill="currentColor"/><rect y="16" width="22" height="2.2" rx="1.1" fill="currentColor"/></svg>',
    '          </button>',
    '          <nav id="hamburger-menu" class="hidden absolute right-0 top-full z-50 mt-1 w-72 max-w-[calc(100vw-1rem)] overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-lg" aria-label="Hovedmeny">',
    '            <ul class="py-1" role="list">',
    '              <li><button id="menu-lagerliste" type="button" class="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Lagerliste</button></li>',
    '              <li><button id="menu-bestilling" type="button" class="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Bestilling</button></li>',
    '              <li><button id="menu-lager" type="button" class="hidden w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Lagerkø</button></li>',
    '              <li><button id="menu-lister" type="button" class="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Lister</button></li>',
    '              <li><button id="menu-ny-vare" type="button" class="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Ny lagervare</button></li>',
    '              <li><button id="menu-utlan" type="button" class="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Utlån</button></li>',
    '              <li role="separator"><hr class="my-1 border-slate-100" /></li>',
    '              <li><button id="admin-toggle-button" type="button" class="hidden w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Innstillinger</button></li>',
    '              <li role="separator" id="menu-admin-sep" class="hidden"><hr class="my-1 border-slate-100" /></li>',
    '              <li><button id="login-button" type="button" class="w-full px-4 py-2.5 text-left text-sm font-medium text-hulBlueDark hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Logg inn</button></li>',
    '              <li><button id="logout-button" type="button" class="hidden w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50">Logg ut</button></li>',
    '            </ul>',
    '          </nav>',
    '        </div>',
    '      </div>',
    '    </div>',
    '  </header>',
    '  <div id="global-loading-overlay" class="fixed inset-0 z-[90] hidden" role="status" aria-live="assertive" aria-atomic="true" aria-hidden="true">',
    '    <div class="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"></div>',
    '    <div class="relative z-[1] flex min-h-screen items-center justify-center px-4">',
    '      <div class="w-full max-w-sm rounded-2xl border border-hulBlueSoft bg-white p-5 text-center shadow-xl">',
    '        <div class="mx-auto inline-flex h-12 min-w-12 items-end justify-center gap-1 rounded-xl bg-hulBlueLight px-3 text-hulBlueDark">',
    '          <span aria-hidden="true" class="h-2.5 w-2.5 animate-pulse rounded-full bg-current [animation-delay:-0.3s]"></span>',
    '          <span aria-hidden="true" class="h-2.5 w-2.5 animate-pulse rounded-full bg-current [animation-delay:-0.15s]"></span>',
    '          <span aria-hidden="true" class="h-2.5 w-2.5 animate-pulse rounded-full bg-current"></span>',
    '        </div>',
    '        <p class="mt-4 text-sm font-semibold text-slate-900">Vent litt…</p>',
    '        <p id="global-loading-overlay-text" class="mt-1 text-sm text-slate-700">Behandler forespørsel…</p>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <main id="app-shell-main" class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12">',
    '    <section id="auth-panel" class="lg:col-span-12 rounded-xl border border-slate-200 bg-white p-4" role="status">',
    '      <h2 class="text-sm font-semibold text-slate-900">Innlogging</h2>',
    '      <p class="mt-1 text-sm text-slate-700">Logg inn for å laste beskyttet lagerdata.</p>',
    '      <form id="credentials-login-form" class="mt-3 hidden grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" aria-label="Innlogging med brukernavn og passord">',
    '        <div class="grid gap-1">',
    '          <label for="credentials-username" class="text-sm font-medium text-slate-700">Brukernavn</label>',
    '          <input id="credentials-username" name="username" type="text" autocomplete="username" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required />',
    '        </div>',
    '        <div class="grid gap-1">',
    '          <label for="credentials-password" class="text-sm font-medium text-slate-700">Passord</label>',
    '          <input id="credentials-password" name="password" type="password" autocomplete="current-password" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required />',
    '        </div>',
    '        <button id="credentials-login-submit" type="submit" class="min-h-11 min-w-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Logg inn</button>',
    '      </form>',
    '      <p id="credentials-login-error" class="mt-2 hidden text-sm text-rose-800" role="alert"></p>',
    '    </section>',
    '    <section id="init-error-panel" class="hidden lg:col-span-12 rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '      <h2 class="text-sm font-semibold text-rose-800">Konfigurasjonsfeil – appen kan ikke starte</h2>',
    '      <p id="init-error-text" class="mt-1 text-sm text-rose-900"></p>',
    '    </section>',
    '    <section id="liste-workspace" data-smoke-workspace="liste" class="min-w-0 space-y-4 lg:col-span-12" aria-label="Lageroversikt">',
    '      <article class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <div class="grid gap-3 md:grid-cols-2">',
    '          <label for="search-input" class="text-sm font-medium text-slate-700">Søk</label>',
    '          <label for="sort-select" class="text-sm font-medium text-slate-700 md:text-right">Sortering</label>',
    '        </div>',
    '        <div class="mt-2 grid gap-3 md:grid-cols-2">',
    '          <input id="search-input" type="search" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" placeholder="Søk etter inventar" />',
    '          <select id="sort-select" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '            <option value="navn-asc">Navn (A–Å)</option>',
    '            <option value="navn-desc">Navn (Å–A)</option>',
    '            <option value="beholdning-desc">Beholdning (høy-lav)</option>',
    '            <option value="beholdning-asc">Beholdning (lav-høy)</option>',
    '          </select>',
    '        </div>',
    '        <div class="mt-4">',
    '          <details class="group overflow-hidden rounded-lg border border-slate-200 bg-slate-50">',
    '            <summary class="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '              <span>Filtre</span>',
    '              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5 text-slate-500 transition-transform duration-200 group-open:rotate-180"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
    '            </summary>',
    '            <div class="grid gap-3 border-t border-slate-200 px-3 py-3 md:grid-cols-3">',
    '              <label class="grid gap-1 text-sm font-medium text-slate-700" for="status-filter">Status',
    '                <select id="status-filter" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '              </label>',
    '              <label class="grid gap-1 text-sm font-medium text-slate-700" for="plassering-filter">Plassering',
    '                <select id="plassering-filter" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '              </label>',
    '              <label class="grid gap-1 text-sm font-medium text-slate-700" for="arrangement-filter">Arrangement',
    '                <select id="arrangement-filter" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '              </label>',
    '            </div>',
    '          </details>',
    '        </div>',
    '      </article>',
    '      <section id="inventory-error-panel" class="hidden rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '        <h2 class="text-sm font-semibold text-rose-800">Feil ved lasting av liste</h2>',
    '        <p id="inventory-error-text" class="mt-1 text-sm text-rose-900"></p>',
    '      </section>',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <p id="results-count" class="text-sm text-slate-600">0 treff</p>',
    '        <div id="ny-vare-row" class="mt-3 flex justify-end">',
    '          <button id="ny-vare-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">+ Ny vare</button>',
    '        </div>',
    '        <div id="bulk-panel" class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">',
    '          <details id="bulk-actions-accordion" class="group rounded-lg border border-slate-200 bg-white">',
    '            <summary class="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '              <span>Masseendringer</span>',
    '              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" class="h-5 w-5 text-slate-500 transition-transform duration-200 group-open:rotate-180"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
    '            </summary>',
    '            <div class="border-t border-slate-200 px-3 py-3">',
    '              <p id="bulk-selection-count" class="text-xs text-slate-700">0 varer valgt.</p>',
    '              <p class="mt-1 text-xs text-slate-600">Velg handling for markerte varer.</p>',
    '              <div class="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">',
    '                <label for="bulk-actions-select" class="grid gap-1 text-sm font-medium text-slate-700">Handling for valgte varer',
    '                  <select id="bulk-actions-select" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '                    <option value="">Velg handling</option>',
    '                    <option value="update-status">Oppdater status</option>',
    '                    <option value="add-to-list">Legg til i liste</option>',
    '                    <option value="add-to-order">Legg til i bestilling</option>',
    '                  </select>',
    '                </label>',
    '                <button id="bulk-actions-run-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Oppdater</button>',
    '              </div>',
    '              <div id="bulk-status-row" class="mt-3 hidden flex-wrap items-center gap-2">',
    '                <label for="bulk-status-select" class="text-sm font-medium text-slate-700">Ny status</label>',
    '                <select id="bulk-status-select" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '                  <option value="">Velg status</option>',
    '                </select>',
    '              </div>',
    '            </div>',
    '          </details>',
    '        </div>',
    '        <ul id="inventory-list" class="mt-3 space-y-3"></ul>',
    '      </section>',
    '    </section>',
    '    <section id="bestilling-workspace" data-smoke-workspace="bestilling" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Bestillerflate">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Handlevogn</h2>',
    '        <p class="mt-1 text-sm text-slate-700">Se og rediger varer som allerede er lagt i bestilling fra andre flater før innsending.</p>',
    '        <div id="order-cart-indicator" class="mt-3 rounded-lg border border-hulBlueSoft bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800" role="status" aria-live="polite"></div>',
    '      </section>',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h3 class="text-sm font-semibold text-slate-900">Kurvlinjer</h3>',
    '        <p class="mt-1 text-sm text-slate-700">Reduser antall eller fjern linjer før bestillingen sendes inn.</p>',
    '        <div class="mt-3">',
    '          <button id="order-submit-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark">Send inn bestilling</button>',
    '        </div>',
    '        <p id="order-feedback" class="mt-3 hidden rounded-lg border px-3 py-2 text-sm" role="status" aria-live="polite"></p>',
    '        <ul id="order-lines-list" class="mt-3 space-y-2"></ul>',
    '      </section>',
    '    </section>',
    '    <section id="lager-workspace" data-smoke-workspace="lager" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Lagerkø for bestillinger">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Lagerkø</h2>',
    '        <p class="mt-1 text-sm text-slate-700">Viser innsendte bestillinger som skal håndteres av lager.</p>',
    '        <p id="lager-order-summary" class="mt-3 rounded-lg border border-hulBlueSoft bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800" role="status" aria-live="polite"></p>',
    '      </section>',
    '      <section id="lager-order-error-panel" class="hidden rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '        <h3 class="text-sm font-semibold text-rose-800">Kunne ikke hente lagerkø</h3>',
    '        <p id="lager-order-error-text" class="mt-1 text-sm text-rose-900"></p>',
    '      </section>',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h3 class="text-sm font-semibold text-slate-900">Ordrekø</h3>',
    '        <ul id="lager-order-list" class="mt-3 space-y-2"></ul>',
    '      </section>',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h3 class="text-sm font-semibold text-slate-900">Valgt bestilling</h3>',
    '        <div id="lager-order-detail" class="mt-3"></div>',
    '      </section>',
    '    </section>',
    '    <section id="lister-workspace" data-smoke-workspace="lister" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Listearbeidsflate">',
    '      <section id="lister-feil-panel" class="hidden rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '        <h2 class="text-sm font-semibold text-rose-800">Feil i listehåndtering</h2>',
    '        <p id="lister-feil-tekst" class="mt-1 text-sm text-rose-900"></p>',
    '      </section>',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Lister</h2>',
    '        <p class="mt-1 text-sm text-slate-700">Opprett, rediger, slett og del lister for skrivebeskyttet visning.</p>',
    '        <div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">',
    '          <input id="list-name-input" type="text" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" placeholder="Navn på ny liste" />',
    '          <button id="list-create-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett liste</button>',
    '        </div>',
    '        <ul id="list-summary-list" class="mt-3 space-y-2"></ul>',
    '      </section>',
    '      <section id="list-detail-panel" class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 id="list-detail-title" class="text-lg font-semibold text-slate-900">Velg liste</h2>',
    '        <p id="list-detail-meta" class="mt-1 text-sm text-slate-700"></p>',
    '        <div id="list-owner-controls" class="mt-3 hidden space-y-3">',
    '          <div class="grid gap-3 sm:grid-cols-2">',
    '            <div>',
    '              <label for="list-edit-name" class="text-sm font-medium text-slate-700">Navn</label>',
    '              <input id="list-edit-name" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
    '            </div>',
    '            <div>',
    '              <label for="list-edit-description" class="text-sm font-medium text-slate-700">Beskrivelse</label>',
    '              <input id="list-edit-description" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
    '            </div>',
    '          </div>',
    '          <div class="flex flex-wrap gap-2">',
    '            <button id="list-update-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lagre liste</button>',
    '            <button id="list-delete-button" type="button" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Slett liste</button>',
    '          </div>',
    '          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">',
    '            <p class="text-sm font-medium text-slate-900">Delingslenke</p>',
    '            <p id="list-share-link" class="mt-1 break-all text-xs text-slate-700"></p>',
    '            <div class="mt-2 flex flex-wrap items-center gap-2">',
    '              <button id="list-share-copy-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Kopier delingslenke</button>',
    '            </div>',
    '            <p id="list-share-copy-feedback" class="mt-2 hidden rounded-md border px-3 py-2 text-sm" role="status" aria-live="polite"></p>',
    '          </div>',
    '          <div class="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">',
    '            <div>',
    '              <label for="list-item-select" class="text-sm font-medium text-slate-700">Legg til lagervare</label>',
    '              <select id="list-item-select" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '            </div>',
    '            <button id="list-item-add-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til</button>',
    '            <button id="list-reload-button" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Oppdater</button>',
    '          </div>',
    '        </div>',
    '        <p id="list-items-count" class="mt-3 text-sm text-slate-600">0 treff</p>',
    '        <ul id="list-item-list" class="mt-3 space-y-3"></ul>',
    '      </section>',
    '    </section>',
    '    <section id="public-list-workspace" data-smoke-workspace="public-list" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Offentlig listevisning">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 id="public-list-title" class="text-lg font-semibold text-slate-900">Offentlig liste</h2>',
    '        <p id="public-list-meta" class="mt-1 text-sm text-slate-700"></p>',
    '      </section>',
    '      <section id="public-list-error-panel" class="hidden rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '        <h2 class="text-sm font-semibold text-rose-800">Kunne ikke åpne delt liste</h2>',
    '        <p id="public-list-error-text" class="mt-1 text-sm text-rose-900"></p>',
    '      </section>',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <p class="text-sm text-slate-700">Denne visningen er skrivebeskyttet.</p>',
    '        <p id="public-list-items-count" class="mt-3 text-sm text-slate-600">0 treff</p>',
    '        <ul id="public-list-items" class="mt-3 space-y-3"></ul>',
    '      </section>',
    '    </section>',
    '    <section id="public-item-workspace" data-smoke-workspace="public-item" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Offentlig varevisning">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 id="public-item-title" class="text-lg font-semibold text-slate-900">Offentlig vare</h2>',
    '        <p id="public-item-meta" class="mt-1 text-sm text-slate-700"></p>',
    '      </section>',
    '      <section id="public-item-error-panel" class="hidden rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '        <h2 class="text-sm font-semibold text-rose-800">Kunne ikke åpne varelenken</h2>',
    '        <p id="public-item-error-text" class="mt-1 text-sm text-rose-900"></p>',
    '      </section>',
    '      <section id="public-item-content" class="rounded-xl border border-slate-200 bg-white p-4"></section>',
    '    </section>',
    '    <section id="borrower-workspace" data-smoke-workspace="lantakere" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Låntakerregister">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <div>',
    '          <h2 class="text-lg font-semibold text-slate-900">Låntakere</h2>',
    '          <p class="mt-1 text-sm text-slate-700">Forvalt låntakerregisteret i en egen arbeidsflate.</p>',
    '        </div>',
    '        <div class="mt-3 flex flex-wrap gap-2" aria-label="Undernavigasjon innstillinger">',
    '          <button type="button" data-settings-subpage-target="admin" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Masterdata</button>',
    '          <button type="button" data-settings-subpage-target="brukeradministrasjon" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Brukeradministrasjon</button>',
    '          <button type="button" data-settings-subpage-target="lantakere" class="min-h-11 rounded-lg border border-hulBlue bg-hulBlueSoft px-3 py-2 text-sm font-medium text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lånetakere</button>',
    '          <button type="button" data-settings-subpage-target="import" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Import og eksport</button>',
    '        </div>',
    '        <div class="mt-3 flex flex-wrap items-center gap-2">',
    '          <label class="text-sm font-medium text-slate-700">Filter<select id="borrower-status-filter" class="ml-2 min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="active">Aktive</option><option value="all">Alle</option></select></label>',
    '          <button id="borrower-open-create-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny lånetaker</button>',
    '          <button id="borrower-return-button" type="button" class="hidden min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Tilbake til utlån</button>',
    '        </div>',
    '        <p class="mt-3 text-sm text-slate-700">Velg eksisterende lånetaker i registeret.</p>',
    '        <ul id="borrower-list" class="mt-3 space-y-2"></ul>',
    '      </section>',
    '    </section>',
    '    <section id="borrower-create-workspace" data-smoke-workspace="lantaker-ny" class="hidden min-w-0 space-y-4 lg:col-span-12" aria-label="Opprett ny lånetaker">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <div class="flex flex-wrap items-center justify-between gap-2">',
    '          <h3 class="text-base font-semibold text-slate-900">Opprett ny lånetaker</h3>',
    '          <button id="borrower-cancel-button" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Avbryt</button>',
    '        </div>',
    '        <form id="borrower-form" class="mt-4 grid gap-3 sm:grid-cols-2">',
    '          <input id="borrower-id" type="hidden" />',
    '          <label class="text-sm font-medium text-slate-700">Type<select id="borrower-type" class="mt-1 min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="person">Person</option><option value="organisasjon">Organisasjon</option></select></label>',
    '          <label class="text-sm font-medium text-slate-700">Status<select id="borrower-status" class="mt-1 min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="aktiv">Aktiv</option><option value="inaktiv">Inaktiv</option></select></label>',
    '          <label class="text-sm font-medium text-slate-700 sm:col-span-2">Navn<input id="borrower-name" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required /></label>',
    '          <label class="text-sm font-medium text-slate-700">Telefon<input id="borrower-phone" type="tel" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required /></label>',
    '          <label class="text-sm font-medium text-slate-700">E-post<input id="borrower-email" type="email" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required /></label>',
    '          <label class="text-sm font-medium text-slate-700 sm:col-span-2">Organisasjonsnavn<input id="borrower-org-name" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /></label>',
    '          <label class="text-sm font-medium text-slate-700">Kontaktperson navn<input id="borrower-contact-name" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /></label>',
    '          <label class="text-sm font-medium text-slate-700">Kontaktperson telefon<input id="borrower-contact-phone" type="tel" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /></label>',
    '          <label class="text-sm font-medium text-slate-700 sm:col-span-2">Kontaktperson e-post<input id="borrower-contact-email" type="email" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /></label>',
    '          <label class="text-sm font-medium text-slate-700 sm:col-span-2">Notat<textarea id="borrower-note" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></textarea></label>',
    '          <div class="sm:col-span-2 flex flex-wrap gap-2">',
    '            <button id="borrower-save-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lagre låntaker</button>',
    '            <button id="borrower-reset-button" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Nullstill skjema</button>',
    '            <button id="borrower-back-to-registry-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Tilbake</button>',
    '          </div>',
    '        </form>',
    '      </section>',
    '    </section>',
    '    <section id="detail-workspace" data-smoke-workspace="detaljgruppe" class="min-w-0 space-y-4 lg:col-span-12" aria-label="Lagervaredetaljer">',
    '      <article id="detail-panel" class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Detalj</h2>',
    '        <p class="mt-2 text-sm text-slate-700" id="detail-placeholder">Velg en inventarlinje for å vise detalj.</p>',
    '        <div id="detail-content" class="mt-3 hidden space-y-3"></div>',
    '      </article>',
    '      <section id="loan-panel" class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Utlån</h2>',
    '        <p class="mt-1 text-sm text-slate-700">Start utlån fra bestilling, og bekreft først når utvalg og låntaker er gyldig.</p>',
    '        <form id="loan-form" class="mt-3 grid gap-3">',
    '          <input id="loan-item-id" name="itemId" type="hidden" />',
    '          <div id="loan-selected-items-panel" class="rounded-lg border border-slate-200 bg-slate-50 p-3">',
    '            <h3 class="text-sm font-semibold text-slate-900">Valgte varer for utlån</h3>',
    '            <p id="loan-selected-items-count" class="mt-1 text-xs text-slate-700">Ingen varer valgt.</p>',
    '            <ul id="loan-selected-items-summary" class="mt-2 space-y-2"></ul>',
    '          </div>',
    '          <p class="text-sm font-medium text-slate-700">Låntaker</p>',
    '          <div class="grid gap-2 sm:grid-cols-2">',
    '            <button id="loan-select-existing-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Velg eksisterende lånetaker</button>',
    '            <button id="loan-create-new-borrower-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny lånetaker</button>',
    '          </div>',
    '          <div id="loan-existing-borrower-panel" class="grid gap-2">',
    '            <label class="text-sm font-medium text-slate-700" for="loan-borrower-select">Eksisterende lånetaker fra liste</label>',
    '            <select id="loan-borrower-select" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="">Velg lånetaker</option></select>',
    '          </div>',
    '          <label class="text-sm font-medium text-slate-700" for="loan-forfall">Forfallsdato (valgfri)</label>',
    '          <input id="loan-forfall" name="forfallDato" type="date" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
    '          <label class="text-sm font-medium text-slate-700" for="loan-notat">Notat</label>',
    '          <textarea id="loan-notat" name="notat" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></textarea>',
    '          <button id="loan-create-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" disabled aria-disabled="true">Registrer utlån</button>',
    '        </form>',
    '        <div class="mt-4">',
    '          <h3 class="text-sm font-semibold text-slate-900">Aktive utlån for valgt vare</h3>',
    '          <ul id="loan-list" class="mt-2 space-y-2"></ul>',
    '        </div>',
    '      </section>',
    '      <section id="detail-error-panel" class="hidden rounded-xl border border-rose-200 bg-rose-50 p-4" role="alert">',
    '        <h2 class="text-sm font-semibold text-rose-800">Feil ved lasting av detalj</h2>',
    '        <p id="detail-error-text" class="mt-1 text-sm text-rose-900"></p>',
    '      </section>',
    '      <section id="write-feedback-panel" class="hidden rounded-xl border p-4" role="status">',
    '        <h2 id="write-feedback-title" class="text-sm font-semibold"></h2>',
    '        <p id="write-feedback-text" class="mt-1 text-sm"></p>',
    '      </section>',
    '      <section id="crud-panel" class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Redigering av lagervare</h2>',
    '        <form id="inventory-form" class="mt-3 grid min-w-0 gap-3">',
    '          <label class="text-sm font-medium text-slate-700" for="form-id">Intern ID</label>',
    '          <input id="form-id" name="id" type="text" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required readonly aria-readonly="true" />',
    '          <label class="text-sm font-medium text-slate-700" for="form-navn">Navn</label>',
    '          <input id="form-navn" name="navn" type="text" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required />',
    '          <label class="text-sm font-medium text-slate-700" for="form-kategori">Kategori</label>',
    '          <select id="form-kategori" name="kategori" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '          <label class="text-sm font-medium text-slate-700" for="form-plassering">Plassering</label>',
    '          <select id="form-plassering" name="plassering" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '          <label class="text-sm font-medium text-slate-700" for="form-ansvarlig">Ansvarlig</label>',
    '          <select id="form-ansvarlig" name="ansvarlig" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '          <p id="form-ansvarlig-help" class="text-xs text-slate-600 sm:col-span-2">Velg ansvarlig fra masterdata.</p>',
    '          <label class="text-sm font-medium text-slate-700" for="form-status">Status</label>',
    '          <select id="form-status" name="status" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option>Tilgjengelig</option><option>Utlånt</option><option>Lav beholdning</option></select>',
    '          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600"><span>Visning:</span><span id="form-status-chip-preview"></span></div>',
    '          <label class="text-sm font-medium text-slate-700" for="form-tilstand">Tilstand</label>',
    '          <select id="form-tilstand" name="tilstand" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option>Ny</option><option>Meget god</option><option>God</option><option>Slitt</option></select>',
    '          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600"><span>Visning:</span><span id="form-tilstand-chip-preview"></span></div>',
    '          <label class="text-sm font-medium text-slate-700" for="form-beholdning">Beholdning</label>',
    '          <input id="form-beholdning" name="beholdning" type="number" min="0" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" required />',
    '          <label class="text-sm font-medium text-slate-700" for="form-arrangementer">Arrangementer</label>',
    '          <select id="form-arrangementer" name="arrangementer" multiple size="5" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '          <p id="form-arrangementer-help" class="text-xs text-slate-600 sm:col-span-2">Velg ett eller flere arrangementer fra masterdata (Ctrl/Cmd + klikk for flere valg).</p>',
    '          <label class="text-sm font-medium text-slate-700" for="form-verdi">Verdi (NOK)</label>',
    '          <input id="form-verdi" name="verdi" type="number" min="0" step="0.01" inputmode="decimal" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
    '          <label class="text-sm font-medium text-slate-700" for="form-beskrivelse">Beskrivelse</label>',
    '          <textarea id="form-beskrivelse" name="beskrivelse" rows="3" class="min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark sm:col-span-2"></textarea>',
    '          <section id="inventory-form-offentlig-panel" class="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:col-span-2">',
    '            <button type="button" data-inventory-form-accordion-toggle="offentligVisning" aria-expanded="false" aria-controls="inventory-form-accordion-panel-offentligVisning" class="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><span class="text-lg font-semibold text-slate-700">Offentlig varevisning</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" data-inventory-form-accordion-icon class="h-5 w-5 text-slate-500 transition-transform duration-200" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></button>',
    '            <div id="inventory-form-accordion-panel-offentligVisning" class="hidden border-t border-slate-100 px-5 py-5">',
    '            <p class="text-xs text-slate-700">Velg hvilke blokker som kan vises i offentlig varelenke (read-only).</p>',
    '            <div class="mt-3 grid gap-2 sm:grid-cols-2">',
    '              <label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"><input id="form-offentlig-hovedbilde" name="offentligHovedbilde" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><span>Hovedbilde</span></label>',
    '              <label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"><input id="form-offentlig-vedlegg" name="offentligVedlegg" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><span>Vedlegg</span></label>',
    '              <label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"><input id="form-offentlig-underenheter" name="offentligUnderenheter" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><span>Underenheter</span></label>',
    '              <label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"><input id="form-offentlig-attributter" name="offentligAttributter" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><span>Attributter</span></label>',
    '              <label class="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 sm:col-span-2"><input id="form-offentlig-tilstand" name="offentligTilstand" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><span>Tilstand</span></label>',
    '            </div>',
    '            </div>',
    '          </section>',
    '          <section id="inventory-form-underenheter-panel" class="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:col-span-2">',
    '            <button type="button" data-inventory-form-accordion-toggle="underenheter" aria-expanded="false" aria-controls="inventory-form-accordion-panel-underenheter" class="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><span class="text-lg font-semibold text-slate-700">Underenheter</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" data-inventory-form-accordion-icon class="h-5 w-5 text-slate-500 transition-transform duration-200" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></button>',
    '            <div id="inventory-form-accordion-panel-underenheter" class="hidden border-t border-slate-100 px-5 py-5">',
    '            <p class="text-xs text-slate-700">Legg til underenheter av type variant eller medfølgende. Type må velges eksplisitt.</p>',
    '            <div id="inventory-form-underenheter-empty" class="mt-2 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-700">Ingen underenheter lagt til i skjemaet ennå.</div>',
    '            <ul id="inventory-form-underenheter-list" class="mt-3 space-y-2"></ul>',
    '            <button id="inventory-form-underenheter-add-button" type="button" class="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til underenhet</button>',
    '            </div>',
    '          </section>',
    '          <section id="inventory-form-attributter-panel" class="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:col-span-2">',
    '            <button type="button" data-inventory-form-accordion-toggle="attributter" aria-expanded="false" aria-controls="inventory-form-accordion-panel-attributter" class="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><span class="text-lg font-semibold text-slate-700">Attributter</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" data-inventory-form-accordion-icon class="h-5 w-5 text-slate-500 transition-transform duration-200" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></button>',
    '            <div id="inventory-form-accordion-panel-attributter" class="hidden border-t border-slate-100 px-5 py-5">',
    '            <p id="inventory-form-attributter-help" class="text-xs text-slate-700">Legg til én eller flere attributter. Hver attributttype kan bare brukes én gang per vare.</p>',
    '            <div id="inventory-form-attributter-empty" class="mt-2 hidden rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">Ingen aktive attributttyper er tilgjengelig. Opprett eller aktiver en type i Innstillinger.</div>',
    '            <ul id="inventory-form-attributter-list" class="mt-3 space-y-2"></ul>',
    '            <button id="inventory-form-attributter-add-button" type="button" class="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til attributt</button>',
    '            </div>',
    '          </section>',
    '          <section id="inventory-form-attachments-panel" class="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:col-span-2">',
    '            <button type="button" data-inventory-form-accordion-toggle="media" aria-expanded="false" aria-controls="inventory-form-accordion-panel-media" class="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><span class="text-lg font-semibold text-slate-700">Bilder & Dokumenter</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" data-inventory-form-accordion-icon class="h-5 w-5 text-slate-500 transition-transform duration-200" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg></button>',
    '            <div id="inventory-form-accordion-panel-media" class="hidden border-t border-slate-100 px-5 py-5">',
    '            <p class="text-xs text-slate-700">Rediger med samme seksjonslogikk som detaljvisningen. Legg til bilder, PDF eller Office-filer (maks 5 MB per fil).</p>',
    '            <div class="mt-3 grid min-w-0 gap-2">',
    '              <label for="form-attachment-input" class="text-xs font-medium text-slate-700">Velg vedlegg</label>',
    '              <input id="form-attachment-input" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.heic,.heif,.svg,.bmp,.tif,.tiff,application/pdf,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,image/svg+xml,image/bmp,image/tiff" class="min-h-11 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
    '              <button type="button" id="form-attachment-add-button" class="inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til valgte vedlegg</button>',
    '            </div>',
    '            <div id="inventory-form-attachments-lists" class="mt-3 grid min-w-0 max-w-full gap-3">',
    '              <div>',
    '                <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-600">Eksisterende vedlegg</h4>',
    '                <ul id="inventory-form-existing-attachments-list" class="mt-2 space-y-2"></ul>',
    '              </div>',
    '              <div>',
    '                <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-600">Nye vedlegg klare for lagring</h4>',
    '                <ul id="inventory-form-pending-attachments-list" class="mt-2 space-y-2"></ul>',
    '              </div>',
    '            </div>',
    '            </div>',
    '          </section>',
    '          <div class="grid min-w-0 gap-2 sm:grid-cols-2">',
    '            <button id="create-button" type="button" class="min-h-11 w-full min-w-0 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett</button>',
    '            <button id="update-button" type="button" class="min-h-11 w-full min-w-0 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Oppdater</button>',
    '            <button id="soft-delete-button" type="button" class="min-h-11 w-full min-w-0 rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Deaktiver</button>',
    '            <button id="hard-delete-button" type="button" class="min-h-11 w-full min-w-0 rounded-lg border border-rose-400 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Slett permanent</button>',
    '          </div>',
    '        </form>',
    '      </section>',
    '    </section>',
    '    <section id="import-workspace" data-smoke-workspace="import" class="hidden min-w-0 lg:col-span-12" aria-label="Import og eksport workspace">',
    '      <section class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <h2 class="text-lg font-semibold text-slate-900">Import og eksport</h2>',
    '        <p class="mt-1 text-sm text-slate-700">Administrer import og eksport for inventory i v1. Preview må bekreftes før commit.</p>',
    '        <div class="mt-3 flex flex-wrap gap-2" aria-label="Undernavigasjon innstillinger">',
    '          <button type="button" data-settings-subpage-target="admin" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Masterdata</button>',
    '          <button type="button" data-settings-subpage-target="brukeradministrasjon" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Brukeradministrasjon</button>',
    '          <button type="button" data-settings-subpage-target="lantakere" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lånetakere</button>',
    '          <button type="button" data-settings-subpage-target="import" class="min-h-11 rounded-lg border border-hulBlue bg-hulBlueSoft px-3 py-2 text-sm font-medium text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Import og eksport</button>',
    '        </div>',
    '        <p id="import-action-feedback" class="mt-3 hidden rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900" role="alert"></p>',
    '        <section class="mt-4 rounded-xl border border-slate-200 bg-slate-50">',
    '          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">',
    '            <h3 class="text-sm font-semibold text-slate-900">Import</h3>',
    '            <div class="flex flex-wrap gap-2">',
    '              <button id="download-import-template-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Last ned importmal (.xlsx)</button>',
    '              <label for="import-file-input" class="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Velg .xlsx-fil</label>',
    '            </div>',
    '          </div>',
    '          <div class="px-4 py-3">',
    '            <p class="text-sm text-slate-700">Støttet format i v1: <strong>.xlsx</strong>. Intern-ID er valgfri for nye varer og settes av backend ved commit.</p>',
    '            <input id="import-file-input" type="file" class="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />',
    '            <section id="import-preview-panel" class="mt-3 hidden rounded-lg border border-slate-200 bg-white p-3">',
    '              <div class="flex flex-wrap items-center justify-between gap-2">',
    '                <h4 class="text-sm font-semibold text-slate-900">Preview før commit</h4>',
    '                <p id="import-preview-summary" class="text-xs text-slate-700"></p>',
    '              </div>',
    '              <div class="mt-2 overflow-x-auto">',
    '                <table class="min-w-full border-collapse text-xs text-slate-700">',
    '                  <thead id="import-preview-head"></thead>',
    '                  <tbody id="import-preview-body"></tbody>',
    '                </table>',
    '              </div>',
    '              <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">',
    '                <span class="rounded border border-emerald-300 bg-emerald-50 px-2 py-1">insert</span>',
    '                <span class="rounded border border-sky-300 bg-sky-50 px-2 py-1">update</span>',
    '                <span class="rounded border border-amber-300 bg-amber-50 px-2 py-1">skip</span>',
    '                <span class="rounded border border-rose-300 bg-rose-50 px-2 py-1">reject</span>',
    '              </div>',
    '            </section>',
    '          </div>',
    '          <div class="border-t border-slate-200 px-4 py-3">',
    '            <button id="import-confirm-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Bekreft commit</button>',
    '          </div>',
    '        </section>',
    '        <section class="mt-4 rounded-xl border border-slate-200 bg-slate-50">',
    '          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">',
    '            <h3 class="text-sm font-semibold text-slate-900">Eksport</h3>',
    '            <button id="export-inventory-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Generer eksport (.xlsx)</button>',
    '          </div>',
    '          <div class="px-4 py-3">',
    '            <p class="text-sm text-slate-700">Eksport er read-only og endrer ikke datatilstand.</p>',
    '          </div>',
    '        </section>',
    '        <section id="import-result-panel" class="mt-4 rounded-xl border border-slate-200 bg-white p-4">',
    '          <h3 class="text-sm font-semibold text-slate-900">Resultat / rapport</h3>',
    '          <p id="import-result-summary" class="mt-1 text-sm text-slate-800"></p>',
    '          <ul id="import-result-errors" class="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700"></ul>',
    '        </section>',
    '      </section>',
    '    </section>',
    '    <section id="admin-workspace" data-smoke-workspace="admin" class="hidden min-w-0 lg:col-span-12" aria-label="Innstillinger">',
    '      <section id="admin-panel" class="rounded-xl border border-slate-200 bg-white p-4">',
    '        <div>',
    '          <h2 class="text-lg font-semibold text-slate-900">Innstillinger</h2>',
    '          <p class="mt-1 text-sm text-slate-700">Administrative funksjoner er samlet under Innstillinger.</p>',
    '        </div>',
    '        <div id="settings-subpage-list" class="mt-3 flex flex-wrap gap-2" aria-label="Undernavigasjon innstillinger">',
    '          <button id="settings-masterdata-button" data-settings-subpage-target="admin" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-hulBlueSoft px-3 py-2 text-sm font-medium text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Masterdata</button>',
    '          <button id="settings-brukeradministrasjon-button" data-settings-subpage-target="brukeradministrasjon" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Brukeradministrasjon</button>',
    '          <button id="settings-lantakere-button" data-settings-subpage-target="lantakere" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lånetakere</button>',
    '          <button id="settings-import-eksport-button" data-settings-subpage-target="import" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Import og eksport</button>',
    '        </div>',
    '        <div id="admin-tab-list" class="hidden" aria-hidden="true"></div>',
    '        <p class="mt-3 text-sm text-slate-700">Masterdata er organisert som én accordion per datatype. Alle accordioner er lukket som standard.</p>',
    '        <section id="admin-masterdata-panel" class="mt-4 space-y-3">',
    '          <div id="admin-type-accordion-list" class="space-y-3"></div>',
    '        </section>',
    '        <section id="admin-user-management-panel" class="mt-4 hidden">',
    '          <p class="text-sm text-slate-700">Kun admin kan opprette, redigere, deaktivere og reaktivere brukere.</p>',
    '          <section id="admin-user-panel" class="mt-3 rounded-lg border border-slate-200 bg-white p-3">',
    '            <div class="grid gap-2 sm:grid-cols-2">',
    '              <label class="grid gap-1 text-sm font-medium text-slate-700">Visningsnavn<input id="admin-user-display-name" type="text" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>',
    '              <label class="grid gap-1 text-sm font-medium text-slate-700">Innloggings-ID<input id="admin-user-username" type="text" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>',
    '              <label class="grid gap-1 text-sm font-medium text-slate-700">Rolle<select id="admin-user-role" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="viewer">Lesebruker</option><option value="editor">Redaktør/drift</option><option value="admin">Admin</option></select></label>',
    '              <label class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"><input id="admin-user-active" type="checkbox" class="h-4 w-4" checked />Aktiv bruker</label>',
    '            </div>',
    '            <div class="mt-3 flex flex-wrap items-center gap-2">',
    '              <button id="admin-user-create-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett bruker</button>',
    '              <span id="admin-user-feedback" class="hidden text-sm" role="status"></span>',
    '            </div>',
    '            <ul id="admin-user-list" class="mt-3 space-y-3"></ul>',
    '          </section>',
    '        </section>',
    '      </section>',
    '    </section>',
    '  </main>',
    '  <footer id="app-shell-footer" class="border-t border-hulBlueSoft bg-white">',
    '    <div class="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">',
    '      <section class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">',
    '        <h2>',
    '          <button id="traceability-accordion-toggle" type="button" aria-expanded="false" aria-controls="traceability-accordion-panel" class="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
    '            <span>Versjonssporbarhet</span>',
    '            <svg id="traceability-accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5 text-slate-500 transition-transform duration-200" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
    '          </button>',
    '        </h2>',
    '        <div id="traceability-accordion-panel" class="hidden border-t border-slate-200 px-3 py-3 sm:px-4">',
    '          <dl class="grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">',
    '            <div class="rounded-lg border border-slate-200 bg-white px-3 py-2">',
    '              <dt class="font-medium text-slate-900">Frontend versjon</dt>',
    '              <dd id="trace-frontend-version" class="mt-1 break-words">Ikke tilgjengelig</dd>',
    '            </div>',
    '            <div class="rounded-lg border border-slate-200 bg-white px-3 py-2">',
    '              <dt class="font-medium text-slate-900">Frontend build</dt>',
    '              <dd id="trace-frontend-build" class="mt-1 break-words">Ikke tilgjengelig</dd>',
    '            </div>',
    '            <div class="rounded-lg border border-slate-200 bg-white px-3 py-2">',
    '              <dt class="font-medium text-slate-900">Siste deploy</dt>',
    '              <dd id="trace-frontend-deploy-time" class="mt-1 break-words">Ikke tilgjengelig</dd>',
    '            </div>',
    '            <div class="rounded-lg border border-slate-200 bg-white px-3 py-2">',
    '              <dt class="font-medium text-slate-900">Aktiv backendversjon</dt>',
    '              <dd id="trace-backend-version" class="mt-1 break-words">Ikke tilgjengelig</dd>',
    '            </div>',
    '          </dl>',
    '        </div>',
    '      </section>',
    '    </div>',
    '  </footer>',
    '  <div id="attachment-overlay" class="hidden fixed inset-0 z-[70] bg-slate-900/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="attachment-overlay-title">',
    '    <div class="mx-auto flex h-full w-full max-w-4xl items-center justify-center">',
    '      <div id="attachment-overlay-card" class="relative max-h-full w-full overflow-auto rounded-xl border border-slate-300 bg-white p-3 sm:p-4">',
    '        <div class="flex items-start justify-between gap-3">',
    '          <div>',
    '            <h2 id="attachment-overlay-title" class="text-base font-semibold text-slate-900">Vedlegg</h2>',
    '            <p id="attachment-overlay-meta" class="mt-1 text-xs text-slate-600"></p>',
    '          </div>',
    '          <button id="attachment-overlay-close" type="button" class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lukk</button>',
    '        </div>',
    '        <div id="attachment-overlay-body" class="mt-3"></div>',
    '      </div>',
    '    </div>',
    '  </div>',
  '  <div id="add-to-list-overlay" class="hidden fixed inset-0 z-[80] bg-slate-900/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="add-to-list-overlay-title">',
    '    <div class="mx-auto flex h-full w-full max-w-xl items-center justify-center">',
    '      <div id="add-to-list-overlay-card" class="w-full rounded-xl border border-slate-300 bg-white p-4 sm:p-5">',
    '        <div class="flex items-start justify-between gap-3">',
    '          <div>',
    '            <h2 id="add-to-list-overlay-title" class="text-base font-semibold text-slate-900">Legg til i liste</h2>',
    '            <p id="add-to-list-overlay-meta" class="mt-1 text-xs text-slate-600"></p>',
    '          </div>',
    '          <button id="add-to-list-overlay-close" type="button" class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lukk</button>',
    '        </div>',
    '        <label for="add-to-list-overlay-select" class="mt-4 block text-sm font-medium text-slate-800">Velg liste</label>',
    '        <select id="add-to-list-overlay-select" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"></select>',
    '        <p id="add-to-list-overlay-error" class="mt-3 hidden rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900" role="alert"></p>',
    '        <section class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">',
    '          <h3 class="text-sm font-semibold text-slate-900">Opprett ny liste</h3>',
    '          <label for="add-to-list-overlay-create-name" class="mt-2 block text-sm font-medium text-slate-800">Listenavn</label>',
    '          <input id="add-to-list-overlay-create-name" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" placeholder="For eksempel: Løpshelg 2026" />',
    '          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">',
    '            <button id="add-to-list-overlay-create-submit" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett liste</button>',
    '            <p id="add-to-list-overlay-create-feedback" class="hidden text-sm" role="status"></p>',
    '          </div>',
    '        </section>',
    '        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">',
    '          <button id="add-to-list-overlay-cancel" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Avbryt</button>',
    '          <button id="add-to-list-overlay-submit" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til</button>',
    '        </div>',
  '      </div>',
  '    </div>',
  '  </div>',
  '  <div id="bestilling-variant-overlay" class="hidden fixed inset-0 z-[90] bg-slate-900/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="bestilling-variant-overlay-title">',
  '    <div class="mx-auto flex h-full w-full max-w-xl items-center justify-center">',
  '      <div id="bestilling-variant-overlay-card" class="w-full rounded-xl border border-slate-300 bg-white p-4 sm:p-5">',
  '        <div class="flex items-start justify-between gap-3">',
  '          <div>',
  '            <h2 id="bestilling-variant-overlay-title" class="text-base font-semibold text-slate-900">Velg varianter</h2>',
  '            <p id="bestilling-variant-overlay-meta" class="mt-1 text-xs text-slate-600"></p>',
  '          </div>',
  '          <button id="bestilling-variant-overlay-close" type="button" class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Lukk</button>',
  '        </div>',
  '        <fieldset id="bestilling-variant-overlay-list" class="mt-4 space-y-2"></fieldset>',
  '        <p id="bestilling-variant-overlay-error" class="mt-3 hidden rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900" role="alert"></p>',
  '        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">',
  '          <button id="bestilling-variant-overlay-cancel" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Avbryt</button>',
  '          <button id="bestilling-variant-overlay-submit" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til valgte varianter</button>',
  '        </div>',
  '      </div>',
  '    </div>',
  '  </div>',
  '</div>'
  ].join('');
}

function getUniqueValues(records, fieldName) {
  const values = {};

  records.forEach(function (record) {
    if (record && typeof record[fieldName] === 'string' && record[fieldName]) {
      values[record[fieldName]] = true;
    }
  });

  return Object.keys(values).sort(function (left, right) {
    return left.localeCompare(right, 'no');
  });
}

function renderFilterOptions() {
  const statusFilterEl = document.getElementById('status-filter');
  const plasseringFilterEl = document.getElementById('plassering-filter');
  const arrangementFilterEl = document.getElementById('arrangement-filter');

  const statuserFraMasterdata = getMasterdataValues('status');
  const statuserFraInventory = getUniqueValues(state.inventory, 'status');
  const statuser = Array.from(new Set(statuserFraMasterdata.concat(statuserFraInventory)));

  const plasseringerFraMasterdata = getMasterdataValues('plassering');
  const plasseringerFraInventory = getUniqueValues(state.inventory, 'plassering');
  const plasseringer = Array.from(new Set(plasseringerFraMasterdata.concat(plasseringerFraInventory)));
  const arrangementFraMasterdata = getMasterdataValues('arrangement');
  const arrangementFraInventory = {};
  state.inventory.forEach(function (lagervare) {
    var values = Array.isArray(lagervare && lagervare.arrangementer) ? lagervare.arrangementer : [];
    values.forEach(function (value) {
      var trimmed = String(value || '').trim();
      if (trimmed) {
        arrangementFraInventory[trimmed] = true;
      }
    });
  });
  const arrangement = Array.from(new Set(arrangementFraMasterdata.concat(Object.keys(arrangementFraInventory))))
    .sort(function (left, right) {
      return left.localeCompare(right, 'no');
    });

  if (statusFilterEl) {
    statusFilterEl.innerHTML = ['<option value="">Alle statuser</option>']
      .concat(
        statuser.map(function (status) {
          return '<option value="' + escapeHtml(status) + '">' + escapeHtml(status) + '</option>';
        })
      )
      .join('');
    statusFilterEl.value = state.filters.status;
  }

  if (plasseringFilterEl) {
    plasseringFilterEl.innerHTML = ['<option value="">Alle plasseringer</option>']
      .concat(
        plasseringer.map(function (plassering) {
          return '<option value="' + escapeHtml(plassering) + '">' + escapeHtml(plassering) + '</option>';
        })
      )
      .join('');
    plasseringFilterEl.value = state.filters.plassering;
  }
  if (arrangementFilterEl) {
    arrangementFilterEl.innerHTML = ['<option value="">Alle arrangement</option>']
      .concat(
        arrangement.map(function (value) {
          return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
        })
      )
      .join('');
    arrangementFilterEl.value = state.filters.arrangement;
  }

  const bulkStatusSelectEl = document.getElementById('bulk-status-select');
  if (bulkStatusSelectEl) {
    bulkStatusSelectEl.innerHTML = ['<option value="">Velg status</option>']
      .concat(
        statuser.map(function (status) {
          return '<option value="' + escapeHtml(status) + '">' + escapeHtml(status) + '</option>';
        })
      )
      .join('');
    bulkStatusSelectEl.value = state.bulkStatusValue || '';
  }
}

function getFilteredInventory() {
  const normalizedSearch = state.search.trim().toLowerCase();

  const filtered = state.inventory.filter(function (lagervare) {
    if (state.filters.status && lagervare.status !== state.filters.status) {
      return false;
    }

    if (state.filters.plassering && lagervare.plassering !== state.filters.plassering) {
      return false;
    }
    if (state.filters.arrangement) {
      var arrangementer = Array.isArray(lagervare && lagervare.arrangementer) ? lagervare.arrangementer : [];
      if (arrangementer.indexOf(state.filters.arrangement) === -1) {
        return false;
      }
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchable = [
      lagervare.id,
      lagervare.navn,
      lagervare.kategori,
      lagervare.plassering,
      lagervare.status,
      lagervare.tilstand,
      Array.isArray(lagervare.arrangementer) ? lagervare.arrangementer.join(' ') : ''
    ]
      .join(' ')
      .toLowerCase();

    return searchable.indexOf(normalizedSearch) !== -1;
  });

  filtered.sort(function (left, right) {
    if (state.sort === 'navn-desc') {
      return right.navn.localeCompare(left.navn, 'no');
    }

    if (state.sort === 'beholdning-desc') {
      return right.beholdning - left.beholdning;
    }

    if (state.sort === 'beholdning-asc') {
      return left.beholdning - right.beholdning;
    }

    return left.navn.localeCompare(right.navn, 'no');
  });

  return filtered;
}

function resultErrorMessage(payload, fallbackMessage) {
  if (payload && payload.error && typeof payload.error.message === 'string' && payload.error.message) {
    return localizeSystemMessage(payload.error.message);
  }

  return localizeSystemMessage(fallbackMessage);
}

function buildEndpointDiagnosticMessage(endpointLabel, endpointUrl, result, fallbackMessage) {
  var label = String(endpointLabel || 'API-kall');
  var url = String(endpointUrl || '').trim();
  var defaultMessage = String(fallbackMessage || 'Kallet feilet.');
  if (!result) {
    return label + ' feilet. ' + defaultMessage + (url ? ' URL: ' + url : '');
  }
  if (result.payload && result.payload.error && result.payload.error.message) {
    return label + ' feilet: ' + localizeSystemMessage(result.payload.error.message) + (url ? ' URL: ' + url : '');
  }
  if (result.fetchError === 'timeout') {
    return label + ' feilet: tidsavbrudd mot backend.' + (url ? ' URL: ' + url : '');
  }
  if (result.fetchError === 'network') {
    return label + ' feilet: nettverksfeil/CORS mot backend.' + (url ? ' URL: ' + url : '');
  }
  if (result.responseFormat === 'html') {
    return label + ' feilet: backend svarte HTML i stedet for JSON.' + (url ? ' URL: ' + url : '');
  }
  if (!result.ok) {
    return label + ' feilet med status ' + String(result.status || 0) + '.' + (url ? ' URL: ' + url : '');
  }
  if (!result.payload) {
    return label + ' feilet: mangler gyldig JSON-respons.' + (url ? ' URL: ' + url : '');
  }
  return defaultMessage + (url ? ' URL: ' + url : '');
}

function logBootstrapFailure(stage, endpointLabel, endpointUrl, result, message) {
  var normalizedStage = String(stage || 'unknown');
  var normalizedLabel = String(endpointLabel || 'ukjent-endepunkt');
  var normalizedUrl = String(endpointUrl || '').trim();
  var normalizedMessage = String(message || 'Ukjent bootstrap-feil.');
  console.error('[HUL][bootstrap][' + normalizedStage + '] ' + normalizedLabel + ' feilet:', {
    message: normalizedMessage,
    url: normalizedUrl,
    status: result && typeof result.status === 'number' ? result.status : null,
    fetchError: result && result.fetchError ? result.fetchError : '',
    responseFormat: result && result.responseFormat ? result.responseFormat : '',
    hasPayload: !!(result && result.payload),
    authMode: state.runtimeConfig ? String(state.runtimeConfig.authMode || '') : ''
  });
}

function awaitWithTimeout(promise, timeoutMs, timeoutErrorCode) {
  var normalizedTimeout = Number(timeoutMs || 0);
  if (!promise || typeof promise.then !== 'function' || normalizedTimeout <= 0) {
    return promise;
  }
  return Promise.race([
    promise,
    new Promise(function (resolve) {
      window.setTimeout(function () {
        resolve({
          ok: false,
          status: 0,
          payload: null,
          fetchError: String(timeoutErrorCode || 'timeout'),
          errorMessage: 'Kall tidsavbrutt etter ' + normalizedTimeout + ' ms.'
        });
      }, normalizedTimeout);
    })
  ]);
}

function localizeSystemMessage(message) {
  var rawMessage = String(message || '').trim();
  if (!rawMessage) {
    return '';
  }
  var localized = rawMessage;
  var replacements = {
    READY_FOR_PICKUP: 'Klar for henting',
    NOT_STARTED: 'Ikke startet',
    IN_PROGRESS: 'Pågår',
    CANCELLED: 'Kansellert',
    MAIN_WITH_EQUIPMENT: 'Produkt med medfølgende utstyr',
    ALL_VARIANTS: 'Alle varianter',
    SINGLE_VARIANT: 'Én variant',
    INVALID_LINE_TYPE: 'Ugyldig linjetype',
    INVALID_STATUS: 'Ugyldig status',
    MISSING_REQUIRED_FIELD: 'Mangler påkrevd felt',
    UNKNOWN_ERROR: 'Ukjent feil'
  };

  Object.keys(replacements).forEach(function (token) {
    localized = localized.replace(new RegExp(token, 'g'), replacements[token]);
  });

  return replaceBestillingStatusTokens(localized);
}

function normalizeListInventoryItem(item) {
  var source = item && typeof item === 'object' ? item : {};
  return {
    id: source.id || source.inventoryId || source.itemId || '',
    navn: source.navn || source.name || 'Uten navn',
    kategori: source.kategori || source.category || 'Ukjent kategori',
    status: source.status || 'Ukjent status',
    tilstand: source.tilstand || source.condition || 'Ukjent tilstand',
    plassering: source.plassering || source.location || 'Ikke registrert',
    beholdning: source.beholdning != null ? source.beholdning : (source.quantity != null ? source.quantity : '-'),
    hovedbildeDokumentId: source.hovedbildeDokumentId || source.mainImageDocumentId || '',
    itemShareCode: source.itemShareCode || ''
  };
}

function normalizePublicListInventoryItem(item) {
  var source = item && typeof item === 'object' ? item : {};
  var normalizedVisibility = normalizeInventoryPublicVisibilityForUi(source.offentligVisning || null);
  var mainImage = source.hovedbilde && typeof source.hovedbilde === 'object' ? source.hovedbilde : null;
  return {
    itemShareCode: source.itemShareCode || '',
    navn: source.navn || source.name || 'Uten navn',
    offentligVisning: normalizedVisibility,
    hovedbildeDokumentId: source.hovedbildeDokumentId || source.mainImageDocumentId || (mainImage ? (mainImage.id || '') : '')
  };
}

function renderInventoryStyleListCard(item, options) {
  var cardOptions = options || {};
  var lagervare = normalizeListInventoryItem(item);
  var cardClassName = cardOptions.cardClassName || 'border-slate-200 bg-white';
  var mainImageDocumentId = String(lagervare.hovedbildeDokumentId || '').trim();
  var imagePreview = mainImageDocumentId
    ? ('<div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><img data-main-image-id="' + escapeHtml(mainImageDocumentId) + '" class="h-full w-full object-cover" alt="" /></div>')
    : '<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[11px] font-medium uppercase tracking-wide text-slate-500">Ingen bilde</div>';
  var topActionHtml = cardOptions.topActionHtml || '';
  var footerHtml = cardOptions.footerHtml || '';
  return {
    cardClassName: cardClassName,
    bodyHtml: [
    '    <div class="flex items-start justify-between gap-3">',
    '      <div class="flex min-w-0 items-start gap-3">',
    '        ' + imagePreview,
    '        <div class="min-w-0">',
    '          <p class="text-sm font-semibold text-slate-900">' + escapeHtml(lagervare.navn) + '</p>',
    '          <p class="mt-1 text-xs text-slate-600">' + escapeHtml(lagervare.id || 'Mangler ID') + ' · ' + escapeHtml(lagervare.kategori || 'Ukjent kategori') + '</p>',
    '        </div>',
    '      </div>',
    '      <div class="flex shrink-0 items-start gap-2">' + renderMasterdataChip('status', lagervare.status) + topActionHtml + '</div>',
    '    </div>',
    '    <div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700"><span>Plassering: ' + escapeHtml(lagervare.plassering) + '</span><span aria-hidden="true">·</span><span>Beholdning: ' + escapeHtml(String(lagervare.beholdning)) + '</span><span aria-hidden="true">·</span>' + renderMasterdataChip('tilstand', lagervare.tilstand) + '</div>',
    footerHtml ? ('    <div class="mt-3">' + footerHtml + '</div>') : ''
  ].join('')
  };
}

function renderPublicInventoryStyleListCard(item, options) {
  var cardOptions = options || {};
  var lagervare = normalizePublicListInventoryItem(item);
  var cardClassName = cardOptions.cardClassName || 'border-slate-200 bg-white';
  var mainImageDocumentId = String(lagervare.hovedbildeDokumentId || '').trim();
  var imagePreview = mainImageDocumentId
    ? ('<div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><img data-main-image-id="' + escapeHtml(mainImageDocumentId) + '" class="h-full w-full object-cover" alt="" /></div>')
    : '<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-[11px] font-medium uppercase tracking-wide text-slate-500">Ingen bilde</div>';
  var footerHtml = cardOptions.footerHtml || '';
  var compactInfoRows = [];
  if (lagervare.offentligVisning.hovedbilde && mainImageDocumentId) {
    compactInfoRows.push('<span>Hovedbilde tilgjengelig</span>');
  }
  if (compactInfoRows.length === 0) {
    compactInfoRows.push('<span>Kun offentlig minimumsinformasjon tilgjengelig.</span>');
  }
  return {
    cardClassName: cardClassName,
    bodyHtml: [
      '    <div class="flex items-start justify-between gap-3">',
      '      <div class="flex min-w-0 items-start gap-3">',
      '        ' + imagePreview,
      '        <div class="min-w-0">',
      '          <p class="text-sm font-semibold text-slate-900">' + escapeHtml(lagervare.navn) + '</p>',
      '          <p class="mt-1 text-xs text-slate-600">' + compactInfoRows.join('') + '</p>',
      '        </div>',
      '      </div>',
      '    </div>',
      footerHtml ? ('    <div class="mt-3">' + footerHtml + '</div>') : ''
    ].join('')
  };
}

function renderInventoryList() {
  const inventoryListEl = document.getElementById('inventory-list');
  const resultsCountEl = document.getElementById('results-count');
  if (!inventoryListEl || !resultsCountEl) {
    return;
  }

  const filteredInventory = getFilteredInventory();
  const selectedCount = Object.keys(state.selectedInventoryIds).filter(function (id) {
    return !!state.selectedInventoryIds[id];
  }).length;

  resultsCountEl.textContent = filteredInventory.length + ' treff';
  renderInventoryListActionState(selectedCount);

  if (state.inventoryDataState === 'loading' && state.inventory.length === 0) {
    inventoryListEl.innerHTML = [
      '<li class="rounded-lg border border-slate-200 bg-slate-50 p-4">',
      '  <p class="text-sm font-medium text-slate-900">Laster lagervarer…</p>',
      '</li>'
    ].join('');
    return;
  }

  if (filteredInventory.length === 0) {
    const noDataState =
      state.inventoryDataState === 'empty' &&
      !state.search.trim() &&
      !state.filters.status &&
      !state.filters.plassering &&
      !state.filters.arrangement;

    const emptyMessage = noDataState
      ? 'Ingen lagervarer funnet i datakilden ennå.'
      : 'Ingen inventarlinjer matcher søk eller filter.';

    inventoryListEl.innerHTML = [
      '<li class="rounded-lg border border-slate-200 bg-slate-50 p-4">',
      '  <p class="text-sm font-medium text-slate-900">' + escapeHtml(emptyMessage) + '</p>',
      '</li>'
    ].join('');
    return;
  }

  inventoryListEl.innerHTML = filteredInventory
    .map(function (lagervare) {
      const isSelected = lagervare.id === state.selectedInventoryId;
      const selectedClasses = isSelected
        ? 'border-hulBlue bg-hulBlueSoft'
        : 'border-slate-200 bg-white hover:border-hulBlueSoft';
      var inventoryCard = renderInventoryStyleListCard(lagervare, {
        cardClassName: selectedClasses
      });
      return [
        '<li>',
        '  <div class="relative">',
        '    <button type="button" data-inventory-id="' + escapeHtml(lagervare.id) + '" class="inventory-row w-full min-h-11 rounded-lg border p-4 pr-16 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark ' + inventoryCard.cardClassName + '">',
        inventoryCard.bodyHtml,
        '    </button>',
        '    <label class="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 bg-white/95 shadow-sm focus-within:ring-2 focus-within:ring-hulBlueDark">',
        '      <input type="checkbox" data-bulk-item-id="' + escapeHtml(lagervare.id) + '" class="h-3.5 w-3.5 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" aria-label="Velg ' + escapeHtml(lagervare.navn || lagervare.id || 'vare') + ' for masseendringer" ' + (state.selectedInventoryIds[lagervare.id] ? 'checked' : '') + ' />',
        '    </label>',
        '  </div>',
        '</li>'
      ].join('');
    })
    .join('');

  void hydrateMainImages();
}

function renderInventoryControls() {
  renderFilterOptions();
  renderInventoryList();
}

function renderInventoryListActionState(selectedCount) {
  var bulkPanelEl = document.getElementById('bulk-panel');
  var bulkAccordionEl = document.getElementById('bulk-actions-accordion');
  var bulkSelectionCountEl = document.getElementById('bulk-selection-count');
  var bulkActionSelectEl = document.getElementById('bulk-actions-select');
  var bulkActionRunButtonEl = document.getElementById('bulk-actions-run-button');
  var bulkStatusRowEl = document.getElementById('bulk-status-row');
  var bulkStatusSelectEl = document.getElementById('bulk-status-select');
  if (bulkSelectionCountEl) {
    bulkSelectionCountEl.textContent = selectedCount + ' ' + (selectedCount === 1 ? 'vare valgt.' : 'varer valgt.');
  }
  if (!bulkPanelEl) {
    return;
  }
  var hasSelection = selectedCount > 0;
  var selectedAction = String(state.bulkAction || '').trim();
  var isStatusAction = selectedAction === 'update-status';
  if (bulkStatusRowEl) {
    bulkStatusRowEl.classList.toggle('hidden', !isStatusAction);
    bulkStatusRowEl.classList.toggle('flex', isStatusAction);
  }
  if (bulkActionSelectEl) {
    bulkActionSelectEl.disabled = !hasSelection;
    bulkActionSelectEl.value = selectedAction;
  }
  if (bulkStatusSelectEl) {
    bulkStatusSelectEl.disabled = !hasSelection || !isStatusAction;
  }
  if (bulkActionRunButtonEl) {
    bulkActionRunButtonEl.disabled = !hasSelection || !selectedAction;
    bulkActionRunButtonEl.classList.toggle('opacity-60', !hasSelection || !selectedAction);
    bulkActionRunButtonEl.classList.toggle('cursor-not-allowed', !hasSelection || !selectedAction);
  }
  if (!hasSelection) {
    state.bulkAction = '';
    state.bulkStatusValue = '';
  }
  if (!hasSelection && bulkAccordionEl && bulkAccordionEl.open) {
    bulkAccordionEl.open = false;
  }
}

function canViewRoleSensitiveFields() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';

  if (state.runtimeConfig && state.runtimeConfig.authMode === 'none') {
    return true;
  }

  return role === 'admin' || role === 'editor' || role === 'superadmin';
}

function canViewAdminOnlyFields() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';

  if (state.runtimeConfig && state.runtimeConfig.authMode === 'none') {
    return true;
  }

  return role === 'admin' || role === 'superadmin';
}

function canManageInventoryWrite() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';

  if (state.runtimeConfig && state.runtimeConfig.authMode === 'none') {
    return true;
  }

  return role === 'admin' || role === 'editor' || role === 'superadmin';
}

function canManageUserAdmin() {
  var role = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';
  if (state.runtimeConfig && state.runtimeConfig.authMode === 'none') {
    return true;
  }
  return role === 'admin' || role === 'superadmin';
}

function formatVerdiForDisplay(verdi) {
  if (verdi == null || verdi === '') {
    return 'Ikke registrert';
  }
  var parsed = Number(verdi);
  if (isNaN(parsed)) {
    return 'Ikke registrert';
  }
  return parsed.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' kr';
}

function formatDetailField(value, fallbackText) {
  var text = String(value == null ? '' : value).trim();
  return text || fallbackText;
}

const DETAIL_FIELD_CONTAINER_CLASS = 'rounded-lg border border-slate-200 bg-white p-3';
const DETAIL_FIELD_LABEL_CLASS = 'text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500';
const DETAIL_FIELD_VALUE_CLASS = 'mt-1.5 text-base font-semibold leading-snug text-slate-900';
const DETAIL_FIELD_VALUE_MUTED_CLASS = 'mt-1.5 text-base font-medium leading-snug text-slate-500';
const DETAIL_ACCORDION_DEFAULT_SECTION = '';
const PUBLIC_ITEM_ACCORDION_DEFAULT_SECTION = '';
const INVENTORY_FORM_ACCORDION_DEFAULT_SECTION = 'media';

function normalizeDetailCollection(value) {
  if (Array.isArray(value)) {
    return value.filter(function (entry) {
      return !!entry;
    });
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    const entries = [];
    for (var index = 0; index < keys.length; index += 1) {
      var key = keys[index];
      var itemValue = value[key];
      if (itemValue == null || itemValue === '') {
        continue;
      }
      if (itemValue && typeof itemValue === 'object') {
        entries.push(itemValue);
      } else {
        entries.push({
          navn: key,
          verdi: itemValue
        });
      }
    }
    return entries;
  }
  return [];
}

function readLagervareCollection(lagervare, keys) {
  for (var index = 0; index < keys.length; index += 1) {
    var key = keys[index];
    if (Object.prototype.hasOwnProperty.call(lagervare, key) && lagervare[key] != null) {
      return normalizeDetailCollection(lagervare[key]);
    }
  }
  return [];
}

function ensureDetailAccordionSection() {
  var openSection = String(state.detailAccordionOpenSection || '').trim();
  if (!openSection) {
    return;
  }
  var validSections = {
    media: true,
    historikk: true,
    lagerkontroll: true,
    offentligVarelenke: true,
    utlan: true,
    lister: true,
    underenheter: true,
    attributter: true
  };
  if (!validSections[openSection]) {
    state.detailAccordionOpenSection = DETAIL_ACCORDION_DEFAULT_SECTION;
  }
}

function ensurePublicItemAccordionSection() {
  var openSection = String(state.offentligVareVisning.accordionSection || '').trim();
  if (!openSection) {
    return;
  }
  var validSections = {
    media: true,
    lagerkontroll: true,
    underenheter: true,
    attributter: true
  };
  if (!validSections[openSection]) {
    state.offentligVareVisning.accordionSection = PUBLIC_ITEM_ACCORDION_DEFAULT_SECTION;
  }
}

function ensureInventoryFormAccordionSection() {
  var openSection = String(state.inventoryFormAccordionOpenSection || '').trim();
  if (!openSection) {
    state.inventoryFormAccordionOpenSection = INVENTORY_FORM_ACCORDION_DEFAULT_SECTION;
    return;
  }
  var validSections = {
    media: true,
    offentligVisning: true,
    underenheter: true,
    attributter: true
  };
  if (!validSections[openSection]) {
    state.inventoryFormAccordionOpenSection = INVENTORY_FORM_ACCORDION_DEFAULT_SECTION;
  }
}

function renderDetail() {
  const detailPlaceholderEl = document.getElementById('detail-placeholder');
  const detailContentEl = document.getElementById('detail-content');

  if (!state.detailItem) {
    detailPlaceholderEl.classList.remove('hidden');
    detailContentEl.classList.add('hidden');
    detailContentEl.innerHTML = '';
    return;
  }

  const lagervare = state.detailItem;
  const arrangementer = Array.isArray(lagervare.arrangementer) && lagervare.arrangementer.length > 0
    ? lagervare.arrangementer.join(', ')
    : 'Ingen arrangementer';
  const overlinjeTekst = String((lagervare.kategori || lagervare.arrangement || arrangementer || 'Lagervare')).trim();
  const ansvarligTekst = formatDetailField(lagervare.ansvarlig, 'Ikke registrert');
  const beskrivelseTekst = formatDetailField(lagervare.beskrivelse, 'Ingen beskrivelse registrert');
  const verdiTekst = formatVerdiForDisplay(lagervare.verdi);
  const roleSensitiveVisible = canViewRoleSensitiveFields();
  const adminOnlyVisible = canViewAdminOnlyFields();
  const vedlegg = Array.isArray(lagervare.vedlegg) ? lagervare : { vedlegg: [] };
  const vedleggListe = Array.isArray(vedlegg.vedlegg) ? vedlegg.vedlegg : [];
  const hovedbilde = resolveMainImageForDocuments(vedleggListe);
  const hovedbildeHtml = hovedbilde
    ? [
      '<button type="button" data-open-document-overlay="' + escapeHtml(hovedbilde.id) + '" class="group relative h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark sm:h-72">',
      '  <img data-main-image-id="' + escapeHtml(hovedbilde.id) + '" class="h-full w-full object-cover" alt="' + escapeHtml(hovedbilde.tittel || hovedbilde.filnavn || 'Hovedbilde') + '" />',
      '  <span class="pointer-events-none absolute inset-x-0 bottom-0 bg-slate-900/60 px-3 py-2 text-xs font-medium text-white">Hovedbilde: ' + escapeHtml(hovedbilde.tittel || hovedbilde.filnavn || hovedbilde.id) + '</span>',
      '</button>'
    ].join('')
    : '<div class="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-sm font-medium text-slate-600 sm:h-72">Ingen hovedbilde valgt</div>';
  const heroThumbnailRows = vedleggListe
    .filter(function(dokument) {
      if (!dokument || !dokument.erBilde || !dokument.id) {
        return false;
      }
      if (hovedbilde && dokument.id === hovedbilde.id) {
        return false;
      }
      return true;
    })
    .slice(0, 5)
    .map(function(dokument) {
      return [
        '<li class="rounded-lg border border-slate-200 bg-white p-1">',
        '  <button type="button" data-open-document-overlay="' + escapeHtml(dokument.id) + '" class="min-h-11 w-full rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
        '    <div class="relative aspect-square overflow-hidden rounded-md bg-slate-100">',
        '      <img data-attachment-thumb-id="' + escapeHtml(dokument.id) + '" class="h-full w-full object-cover" alt="' + escapeHtml(dokument.tittel || dokument.filnavn || dokument.id) + '" />',
        '    </div>',
        '  </button>',
        '</li>'
      ].join('');
    })
    .join('');
  function buildVedleggMetadata(dokument) {
    var metadataParts = [];
    if (dokument && dokument.mimeType) {
      metadataParts.push(String(dokument.mimeType).trim());
    }
    if (dokument && Number(dokument.fileSize || 0) > 0) {
      metadataParts.push(formatBytes(dokument.fileSize));
    }
    if (dokument && dokument.opprettetTid) {
      metadataParts.push('Opprettet ' + String(dokument.opprettetTid).trim());
    }
    return metadataParts.length > 0
      ? metadataParts.join(' · ')
      : 'Metadata ikke tilgjengelig';
  }

  const vedleggRows = state.detailLoading.documents
    ? '<li class="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700" role="status" aria-live="polite">Laster dokumenter og bilder…</li>'
    : vedleggListe.length > 0
      ? vedleggListe.map(function(dokument) {
        const erBilde = !!dokument.erBilde;
        const isMain = !!dokument.isMainImage;
        const placeholderText = erBilde ? 'Bilde' : 'Dok';
        const beskrivelse = String(dokument.beskrivelse || '').trim();
        const metadataTekst = buildVedleggMetadata(dokument);
        return [
          '<li class="rounded-lg border border-slate-200 bg-white p-2">',
          '  <button type="button" data-open-document-overlay="' + escapeHtml(dokument.id) + '" class="group w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
          erBilde
            ? ('    <div class="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><img data-attachment-thumb-id="' + escapeHtml(dokument.id) + '" class="h-full w-full object-cover" alt="' + escapeHtml(dokument.tittel || dokument.filnavn || dokument.id) + '" /></div>')
            : ('    <div class="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600">' + escapeHtml(placeholderText) + '</div>'),
          '    <p class="mt-2 line-clamp-2 text-xs font-semibold text-slate-900">' + escapeHtml(dokument.tittel || dokument.filnavn || dokument.id) + '</p>',
          '    <p class="mt-1 text-[11px] text-slate-600">' + escapeHtml(metadataTekst) + '</p>',
          beskrivelse
            ? ('    <p class="mt-1 line-clamp-2 text-[11px] text-slate-700">' + escapeHtml(beskrivelse) + '</p>')
            : '',
          '  </button>',
          '  <div class="mt-2 flex flex-wrap gap-2">',
          isMain
            ? '<span class="inline-flex min-h-8 items-center rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-800">Hovedbilde</span>'
            : '',
          '  </div>',
          '</li>'
        ].join('');
      }).join('')
      : '<li class="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Ingen dokumenter eller bilder for valgt lagervare.</li>';
  const auditEvents = Array.isArray(state.auditEvents) ? state.auditEvents : [];
  const historikkRows = state.detailLoading.audit
    ? '<li class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" role="status" aria-live="polite">Laster historikk…</li>'
    : auditEvents.length > 0
    ? auditEvents
      .map(function (hendelse) {
        const tidspunkt = String(hendelse.tidsstempel || '').trim() || 'Ukjent tidspunkt';
        const handling = String(hendelse.handling || '').trim() || 'Ukjent handling';
        const bruker = String(hendelse.bruker || '').trim() || 'Ikke registrert';
        const nyVerdi = hendelse.nyttVerdi == null ? '' : JSON.stringify(hendelse.nyttVerdi);
        return [
          '<li class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">',
          '  <span aria-hidden="true" class="absolute left-0 top-0 h-full w-1 bg-hulBlue"></span>',
          '  <div class="pl-3">',
          '    <div class="flex flex-wrap items-start justify-between gap-2">',
          '      <p class="text-sm font-semibold text-slate-900">' + escapeHtml(handling) + '</p>',
          '      <span class="inline-flex min-h-7 items-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">' + escapeHtml(tidspunkt) + '</span>',
          '    </div>',
          '    <p class="mt-2 text-sm text-slate-700">Utført av: <span class="font-medium text-slate-900">' + escapeHtml(bruker) + '</span></p>',
          nyVerdi
            ? ('    <details class="mt-2 rounded-lg border border-slate-200 bg-white p-2"><summary class="cursor-pointer rounded px-1 py-0.5 text-xs font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Vis endringsdetaljer</summary><p class="mt-2 break-all text-xs text-slate-700">Ny verdi: ' + escapeHtml(nyVerdi) + '</p></details>')
            : '    <p class="mt-2 text-xs text-slate-600">Ingen registrert endringsdetalj for denne hendelsen.</p>',
          '  </div>',
          '</li>'
        ].join('');
      })
      .join('')
    : '<li class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">Ingen historikk registrert for denne lagervaren ennå.</li>';

  detailPlaceholderEl.classList.add('hidden');
  detailContentEl.classList.remove('hidden');
  ensureDetailAccordionSection();
  var detailCanonicalItemId = String((lagervare && lagervare.id) || '').trim();
  var detailPublicLinkPanelHtml = canWrite()
    ? [
      '<div data-detail-canonical-item-id="' + escapeHtml(detailCanonicalItemId) + '">',
      '  <p class="text-sm text-slate-700">Stabil read-only lenke for deling uten innlogging.</p>',
      '  <p id="detail-public-link-value" class="mt-2 break-all rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"></p>',
      '  <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">',
      '    <button type="button" data-public-link-copy="true" class="min-h-11 rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Kopier lenke</button>',
      '    <button type="button" data-public-link-ensure="true" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Hent / opprett</button>',
      '    <button type="button" data-public-link-regenerate="true" class="min-h-11 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Regenerer</button>',
      '    <button type="button" data-public-link-revoke="true" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Deaktiver</button>',
      '  </div>',
      '  <p id="detail-public-link-feedback" class="hidden rounded-md border px-3 py-2 text-sm" role="status" aria-live="polite"></p>',
      '</div>'
    ].join('')
    : '<p class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">Offentlig varelenke krever skrivetilgang.</p>';
  const detailActionsHtml = [
    '<section class="rounded-xl border border-slate-200 bg-white p-3 sm:p-4" aria-label="Handlinger for detaljvisning">',
    '  <div class="flex flex-wrap items-center justify-between gap-2">',
    '    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Handlinger</p>',
    '    <button type="button" data-detail-back-to-list="true" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Til lagerliste</button>',
    '  </div>',
    '  <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">',
    '<button type="button" data-open-utlan="true" class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-center text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til låntaker</button>',
    '<button type="button" data-detail-add-to-order="true" class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-center text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg til i bestilling</button>',
    canWrite()
      ? '<button type="button" data-rediger-detail="true" class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-center text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Rediger i skjema</button>'
      : '<button type="button" disabled class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-500">Redigering krever skrivetilgang</button>',
    '  </div>',
    '</section>'
  ].join('');
  const detailSummaryRowsHtml = [
    { label: 'Kategori', value: formatDetailField(lagervare.kategori, 'Ikke registrert'), valueClass: 'break-words' },
    { label: 'Plassering', value: formatDetailField(lagervare.plassering, 'Ikke registrert'), valueClass: 'break-words' },
    { label: 'Antall', value: formatDetailField(lagervare.beholdning, 'Ikke registrert'), valueClass: '' },
    { label: 'Ansvarlig', value: ansvarligTekst, valueClass: 'break-words' },
    { label: 'Løp/arrangement', value: arrangementer, valueClass: 'break-words' },
    { label: 'Verdi', value: roleSensitiveVisible ? verdiTekst : 'Skjult for din rolle', valueClass: roleSensitiveVisible ? '' : 'text-slate-500 italic' }
  ].map(function (row, index) {
    const rowBorderClass = index > 0 ? ' border-t border-slate-200' : '';
    const valueHtml = row.medStatusPrikk
      ? ('<span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true"></span><span>' + escapeHtml(String(row.value)) + '</span></span>')
      : escapeHtml(String(row.value));
    return [
      '<div class="flex items-start justify-between gap-4 py-3' + rowBorderClass + '">',
      '  <p class="' + DETAIL_FIELD_LABEL_CLASS + ' pt-0.5">' + escapeHtml(row.label) + '</p>',
      '  <p class="text-right text-base font-semibold leading-snug text-slate-900 ' + row.valueClass + '">' + valueHtml + '</p>',
      '</div>'
    ].join('');
  }).join('');
  const detailSecondaryMetadataParts = [];
  if (lagervare.opprettetTid) {
    detailSecondaryMetadataParts.push('<span>Opprettet: ' + escapeHtml(formatDetailField(lagervare.opprettetTid, 'Ikke registrert')) + '</span>');
  }
  if (lagervare.oppdatertTid) {
    detailSecondaryMetadataParts.push('<span>Oppdatert: ' + escapeHtml(formatDetailField(lagervare.oppdatertTid, 'Ikke registrert')) + '</span>');
  }
  if (adminOnlyVisible) {
    detailSecondaryMetadataParts.push('<span>Aktiv: ' + (lagervare.aktiv ? 'Ja' : 'Nei') + '</span>');
    detailSecondaryMetadataParts.push('<span>Sist oppdatert: ' + escapeHtml(formatDetailField(lagervare.oppdatertTid, 'Ikke registrert')) + '</span>');
  }
  const detailSecondaryMetadataHtml = detailSecondaryMetadataParts.length > 0
    ? '<div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><p class="text-xs text-slate-700">' + detailSecondaryMetadataParts.join(' <span aria-hidden="true" class="px-1">·</span> ') + '</p></div>'
    : '';
  const underenheterListe = readLagervareCollection(lagervare, ['underenheter', 'underenhet', 'subItems', 'components']);
  const attributtListe = readLagervareCollection(lagervare, ['attributter', 'attributes', 'egenskaper']);
  const accordionOpenSection = String(state.detailAccordionOpenSection || '').trim();
  const accordionOpenIconClass = 'h-5 w-5 text-slate-600 transition-transform duration-200 rotate-180';
  const accordionClosedIconClass = 'h-5 w-5 text-slate-500 transition-transform duration-200';
  function renderAccordionSectionIcon(sectionId) {
    if (sectionId === 'media') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h10m-10 5h16"></path></svg>';
    }
    if (sectionId === 'historikk') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v5l3 2m6-3a9 9 0 11-3-6.7"></path></svg>';
    }
    if (sectionId === 'lagerkontroll') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4m-16 5l8 4 8-4"></path></svg>';
    }
    if (sectionId === 'utlan') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7h8M8 12h8m-8 5h5M4 4h16v16H4z"></path></svg>';
    }
    if (sectionId === 'lister') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"></path></svg>';
    }
    if (sectionId === 'underenheter') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16v10H4zM9 7v10"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7h8M8 12h8m-8 5h5"></path></svg>';
  }
  function renderAccordionSection(sectionId, sectionTitle, sectionContentHtml) {
    const isOpen = accordionOpenSection === sectionId;
    const panelId = 'detail-accordion-panel-' + sectionId;
    return [
      '<section class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100" data-detail-accordion-section="' + sectionId + '">',
      '  <h3>',
      '    <button type="button" data-detail-accordion-toggle="' + sectionId + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + panelId + '" class="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
      '      <span class="flex items-center gap-3">',
      '        <span class="' + (isOpen ? 'text-emerald-500' : 'text-slate-500') + '">' + renderAccordionSectionIcon(sectionId) + '</span>',
      '        <span class="text-lg font-semibold ' + (isOpen ? 'text-emerald-600' : 'text-slate-700') + '">' + sectionTitle + '</span>',
      '      </span>',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="' + (isOpen ? accordionOpenIconClass : accordionClosedIconClass) + '" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
      '    </button>',
      '  </h3>',
      '  <div id="' + panelId + '" class="' + (isOpen ? 'border-t border-slate-100 px-5 py-5' : 'hidden') + '">' + sectionContentHtml + '</div>',
      '</section>'
    ].join('');
  }

  const underenheterRows = underenheterListe.length > 0
    ? underenheterListe.map(function (underenhet, index) {
      const navn = formatDetailField(underenhet.navn || underenhet.name || underenhet.id, 'Underenhet ' + (index + 1));
      const idText = formatDetailField(underenhet.id || underenhet.internId || underenhet.kode, 'Ingen ID');
      const beskrivelse = formatDetailField(underenhet.beskrivelse || underenhet.description, 'Ingen beskrivelse');
      const type = String(underenhet.type || '').trim().toLowerCase();
      const typeLabel = type === 'variant' ? 'Variant' : type === 'medfolgende' ? 'Medfølgende' : 'Ukjent type';
      const status = formatDetailField(underenhet.status, 'Ikke registrert');
      const tilstand = formatDetailField(underenhet.tilstand, 'Ikke registrert');
      const antall = formatDetailField(underenhet.antall || underenhet.beholdning || underenhet.qty, 'Ikke registrert');
      const underenhetVedlegg = Array.isArray(underenhet.vedlegg) ? underenhet.vedlegg.map(normalizeDocumentRecord) : [];
      const underenhetHovedbilde = resolveMainImageForDocuments(underenhetVedlegg);
      const vedleggHtml = underenhetVedlegg.length
        ? underenhetVedlegg.map(function (dokument) {
          return '<button type="button" data-open-document-overlay="' + escapeHtml(dokument.id) + '" class="min-h-11 rounded-lg border border-slate-200 bg-white px-2 py-1 text-left text-xs text-slate-800 break-words hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + escapeHtml(dokument.tittel || dokument.filnavn || dokument.id) + '</button>';
        }).join('')
        : '<p class="text-xs text-slate-600">Ingen vedlegg på denne underenheten.</p>';
      return [
        '<li class="rounded-xl border border-slate-200 bg-white p-4">',
        '  <article class="space-y-3">',
        '    <div class="flex flex-wrap items-start justify-between gap-2">',
        '      <p class="text-base font-semibold text-slate-900 break-words">' + escapeHtml(navn) + '</p>',
        '      <div class="flex flex-wrap items-center justify-end gap-2">',
        '        <span class="inline-flex min-h-8 items-center rounded-lg border border-hulBlue bg-blue-50 px-2 py-1 text-xs font-semibold text-hulBlueDark">Type: ' + escapeHtml(typeLabel) + '</span>',
        '        <span class="inline-flex min-h-8 items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">ID: ' + escapeHtml(idText) + '</span>',
        '      </div>',
        '    </div>',
        '    <p class="text-sm text-slate-700 break-words">' + escapeHtml(beskrivelse) + '</p>',
        '    <dl class="grid gap-2 sm:grid-cols-3">',
        '      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">',
        '        <dt class="text-xs font-medium uppercase tracking-wide text-slate-600">Status</dt>',
        '        <dd class="mt-1 text-sm text-slate-900 break-words">' + escapeHtml(status) + '</dd>',
      '      </div>',
      '      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">',
      '        <dt class="text-xs font-medium uppercase tracking-wide text-slate-600">Tilstand</dt>',
      '        <dd class="mt-1 text-sm text-slate-900 break-words">' + escapeHtml(tilstand) + '</dd>',
      '      </div>',
        '      <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">',
        '        <dt class="text-xs font-medium uppercase tracking-wide text-slate-600">Antall</dt>',
        '        <dd class="mt-1 text-sm text-slate-900 break-words">' + escapeHtml(antall) + '</dd>',
        '      </div>',
        '    </dl>',
        '    <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">',
        '      <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">Vedlegg</p>',
        underenhetHovedbilde
          ? ('      <p class="mt-1 text-xs text-slate-700">Hovedbilde: ' + escapeHtml(underenhetHovedbilde.tittel || underenhetHovedbilde.filnavn || underenhetHovedbilde.id) + '</p>')
          : '      <p class="mt-1 text-xs text-slate-700">Ingen hovedbilde valgt (fallback aktiv).</p>',
        '      <div class="mt-2 grid gap-2 sm:grid-cols-2">' + vedleggHtml + '</div>',
        '    </div>',
        '    <p class="text-xs text-slate-600">Redigering av underenheter gjøres i redigeringsflyt.</p>',
        '  </article>',
        '</li>'
      ].join('');
    }).join('')
    : '<li class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">Ingen underenheter registrert for valgt lagervare ennå.</li>';

  const synligeAttributter = attributtListe.filter(function (attributt) {
    return !!String(attributt && (attributt.verdi || attributt.value || attributt.tekst) || '').trim();
  });
  const attributtRows = synligeAttributter.length > 0
    ? synligeAttributter.map(function (attributt, index) {
      const label = formatDetailField(attributt.navn || attributt.key || attributt.felt || attributt.id, 'Attributt ' + (index + 1));
      const value = formatDetailField(attributt.verdi || attributt.value || attributt.tekst, '');
      return [
        '<article class="rounded-xl border border-slate-200 bg-white p-4">',
        '  <p class="' + DETAIL_FIELD_LABEL_CLASS + ' break-words">' + escapeHtml(label) + '</p>',
        '  <p class="' + DETAIL_FIELD_VALUE_CLASS + ' mt-2 break-words">' + escapeHtml(value) + '</p>',
        '</article>'
      ].join('');
    }).join('')
    : '<p class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">Ingen attributter registrert for valgt lagervare ennå.</p>';
  const detailListerRows = state.detailListerLaster
    ? '<li class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" role="status" aria-live="polite">Laster listetilknytninger…</li>'
    : state.detailListerFeil
      ? '<li class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Kunne ikke hente listetilknytninger nå. Prøv igjen senere eller åpne «Lister» for full oversikt.</li>'
      : state.detailLister.length > 0
        ? state.detailLister.map(function (liste) {
          var listName = formatDetailField(liste.navn || liste.name, 'Uten navn');
          var listId = formatDetailField(liste.id, 'Ingen ID');
          var ownerName = formatDetailField(liste.ownerName || liste.eierNavn || liste.owner, 'Ikke registrert');
          return [
            '<li class="rounded-xl border border-slate-200 bg-white px-3 py-2.5">',
            '  <div class="flex items-start justify-between gap-3">',
            '    <div class="min-w-0">',
            '      <p class="text-sm font-semibold text-slate-900 break-words">' + escapeHtml(listName) + '</p>',
            '      <p class="mt-0.5 text-xs text-slate-600 break-words">ID: ' + escapeHtml(listId) + ' · Eier: ' + escapeHtml(ownerName) + '</p>',
            '    </div>',
            '    <span class="inline-flex min-h-8 shrink-0 items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">Koblet</span>',
            '  </div>',
            '</li>'
          ].join('');
        }).join('')
        : '<li class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">Varen er ikke koblet til noen lister ennå.</li>';
  var alleLister = Array.isArray(state.lister) ? state.lister : [];
  var harLister = alleLister.length > 0;
  if (!harLister) {
    state.detailListSelectedId = '';
  } else if (!state.detailListSelectedId) {
    state.detailListSelectedId = String(alleLister[0].id || '').trim();
  }
  var detailListOptionsHtml = harLister
    ? alleLister.map(function (liste) {
      var listeId = String(liste.id || '').trim();
      var listeNavn = formatDetailField(liste.navn || liste.name, 'Uten navn');
      var erValgt = state.detailListSelectedId === listeId;
      return '<option value="' + escapeHtml(listeId) + '"' + (erValgt ? ' selected' : '') + '>' + escapeHtml(listeNavn) + '</option>';
    }).join('')
    : '<option value="">Ingen lister tilgjengelig</option>';
  var detailCreateListInlineHtml = state.detailListCreateOpen
    ? [
      '<div class="rounded-xl border border-sky-200 bg-sky-50 p-3">',
      '  <label for="detail-list-create-name" class="text-sm font-medium text-slate-800">Navn på ny liste</label>',
      '  <input id="detail-list-create-name" type="text" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" placeholder="For eksempel: Løpshelg 2026" />',
      '  <div class="mt-2 flex flex-wrap gap-2">',
      '    <button type="button" data-detail-list-create="true" class="inline-flex min-h-11 items-center justify-center rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny liste</button>',
      '    <button type="button" data-detail-list-create-cancel="true" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Avbryt</button>',
      '  </div>',
      '</div>'
    ].join('')
    : '';
  var detailUtlanRows = getSelectedItemLoans();
  var detailUtlanRowsHtml = detailUtlanRows.length > 0
    ? detailUtlanRows.map(function (loan) {
      var loanStatusLabel = getLoanStatusLabel(loan.status, loan.isForfalt);
      var loanStatusClassName = getLoanStatusChipClass(loan.status, loan.isForfalt);
      var statusBadge = '<span class="inline-flex min-h-8 items-center rounded-full border px-2.5 py-1 text-xs font-semibold ' + loanStatusClassName + '">' + escapeHtml(loanStatusLabel) + '</span>';
      return [
        '<li class="rounded-lg border border-slate-200 bg-white p-3">',
        '  <div class="flex flex-wrap items-center justify-between gap-2">',
        '    <p class="text-sm font-semibold text-slate-900 break-words">' + escapeHtml(loan.id) + ' · ' + escapeHtml(loan.laaner || '') + '</p>',
        '    ' + statusBadge,
        '  </div>',
        '  <p class="mt-1 text-xs text-slate-600">Utlånt: ' + escapeHtml(loan.utlanDato || 'Ukjent') + ' · Forfall: ' + escapeHtml(loan.forfallDato || 'Ikke satt') + '</p>',
        '  <div class="mt-3 grid gap-2">',
        '    <label class="text-xs font-medium text-slate-700" for="detail-return-note-' + escapeHtml(loan.id) + '">Returmerknad</label>',
        '    <input id="detail-return-note-' + escapeHtml(loan.id) + '" type="text" data-detail-loan-return-note="' + escapeHtml(loan.id) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
        '    <label class="text-xs font-medium text-slate-700" for="detail-return-deviation-' + escapeHtml(loan.id) + '">Avvik (valgfritt)</label>',
        '    <input id="detail-return-deviation-' + escapeHtml(loan.id) + '" type="text" data-detail-loan-deviation="' + escapeHtml(loan.id) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
        '    <button type="button" data-detail-loan-return-button="' + escapeHtml(loan.id) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Registrer retur</button>',
        '  </div>',
        '</li>'
      ].join('');
    }).join('')
    : '<li class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Ingen aktive utlån for valgt lagervare.</li>';

  const detailAccordionHtml = [
    renderAccordionSection('media', 'Bilder & Dokumenter', [
      '<div class="space-y-4">',
      '<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Lesemodus: vedlegg vises kun for lesing i detaljflaten.</p>',
      canWrite()
        ? '<button type="button" data-rediger-detail="true" class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-center text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark sm:w-auto">Gå til redigering og opplasting</button>'
        : '<p class="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">Redigering og opplasting krever skrivetilgang.</p>',
      '  <ul id="document-list" class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">' + vedleggRows + '</ul>',
      '</div>'
    ].join('')),
    renderAccordionSection('historikk', 'Historikk', [
      '<div class="space-y-3">',
      detailSecondaryMetadataHtml,
      '  <p class="text-sm text-slate-700">Siste hendelser vises først for rask lesing i drift.</p>',
      '  <ul id="audit-log-list" class="space-y-3">' + historikkRows + '</ul>',
      '</div>'
    ].join('')),
    renderAccordionSection('lagerkontroll', 'Lagerkontroll', [
      '<div class="space-y-3">',
      '  <p class="text-sm text-slate-700">Lagerstatus vises i lesemodus. Endringer utføres i redigeringsflyt.</p>',
      '  <div class="grid gap-3 lg:grid-cols-1">',
      '    <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">',
      '      <h4 class="text-sm font-semibold text-slate-900">Gjeldende lagerstatus</h4>',
      '      <div class="mt-3 space-y-2">',
      '        <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">',
      '          <p class="text-sm text-slate-700">Beholdning</p>',
      '          <p class="text-lg font-semibold text-hulBlueDark">' + escapeHtml(formatDetailField(lagervare.beholdning, 'Ikke registrert')) + '</p>',
      '        </div>',
      '        <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">',
      '          <p class="text-sm text-slate-700">Plassering</p>',
      '          <p class="text-sm font-medium text-slate-900 break-words text-right">' + escapeHtml(formatDetailField(lagervare.plassering, 'Ikke registrert')) + '</p>',
      '        </div>',
      '        <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">',
      '          <p class="text-sm text-slate-700">Sist oppdatert</p>',
      '          <p class="text-sm font-medium text-slate-900 break-words text-right">' + escapeHtml(formatDetailField(lagervare.oppdatertTid, 'Ikke registrert')) + '</p>',
      '        </div>',
      '      </div>',
      '    </article>',
      '  </div>',
      '</div>'
    ].join('')),
    renderAccordionSection('offentligVarelenke', 'Offentlig varelenke (QR)', [
      '<div class="space-y-3">',
      detailPublicLinkPanelHtml,
      '</div>'
    ].join('')),
    renderAccordionSection('utlan', 'Utlån', [
      '<div class="space-y-3">',
      '  <p class="text-sm text-slate-700">Registrer utlån/retur for valgt vare her. Full utlånsflate er fortsatt tilgjengelig ved behov.</p>',
      '  <div class="rounded-xl border border-slate-200 bg-white p-3">',
      '    <div class="grid gap-3">',
      '      <p class="text-sm font-medium text-slate-700">Låntaker</p>',
      '      <div class="grid gap-2 sm:grid-cols-2">',
      '        <button type="button" data-detail-loan-open-existing="true" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Velg eksisterende lånetaker</button>',
      '        <button type="button" data-detail-loan-open-create="true" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny lånetaker</button>',
      '      </div>',
      '      <div id="detail-loan-existing-borrower-panel" class="grid gap-2">',
      '        <label class="text-sm font-medium text-slate-700" for="detail-loan-borrower-select">Eksisterende lånetaker fra liste</label>',
      '        <select id="detail-loan-borrower-select" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="">Velg lånetaker</option></select>',
      '      </div>',
      '      <label class="text-sm font-medium text-slate-700" for="detail-loan-forfall">Forfallsdato (valgfri)</label>',
      '      <input id="detail-loan-forfall" data-detail-loan-field="forfallDato" type="date" value="' + escapeHtml(state.loanForm.forfallDato || '') + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
      '      <label class="text-sm font-medium text-slate-700" for="detail-loan-notat">Notat</label>',
      '      <textarea id="detail-loan-notat" data-detail-loan-field="notat" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + escapeHtml(state.loanForm.notat || '') + '</textarea>',
      '      <button type="button" data-detail-loan-create="true" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Registrer utlån</button>',
      '    </div>',
      '  </div>',
      '  <div class="space-y-2">',
      '    <h4 class="text-sm font-semibold text-slate-900">Aktive utlån for valgt vare</h4>',
      '    <ul class="space-y-2">' + detailUtlanRowsHtml + '</ul>',
      '  </div>',
      '  <button type="button" data-open-utlan="true" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Åpne full utlånsflate</button>',
      '</div>'
    ].join('')),
    renderAccordionSection('lister', 'Lister', [
      '<div class="space-y-3">',
      '  <p class="text-sm text-slate-700">Koble varen til eksisterende eller ny liste i denne hurtigflyten. Full listehåndtering gjøres i egen listeflate.</p>',
      '  <ul class="space-y-2">' + detailListerRows + '</ul>',
      harLister
        ? [
          '  <div class="rounded-xl border border-slate-200 bg-white p-3">',
          '    <label for="detail-list-select" class="text-sm font-medium text-slate-800">Velg eksisterende liste</label>',
          '    <select id="detail-list-select" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + detailListOptionsHtml + '</select>',
          '    <div class="mt-2 flex flex-wrap gap-2">',
          '      <button type="button" data-detail-list-add="true" class="inline-flex min-h-11 items-center justify-center rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Legg varen til i valgt liste</button>',
          '      <button type="button" data-detail-list-toggle-create="true" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny liste</button>',
          '    </div>',
          '  </div>'
        ].join('')
        : [
          '  <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">',
          '    <p class="text-sm text-slate-700">Ingen lister finnes ennå.</p>',
          '    <button type="button" data-detail-list-toggle-create="true" class="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny liste</button>',
          '  </div>'
        ].join(''),
      detailCreateListInlineHtml,
      '  <p class="text-xs text-slate-600">Tips: Du kan fortsatt åpne listeflaten for full administrasjon og deling.</p>',
      '</div>'
    ].join('')),
    renderAccordionSection('underenheter', 'Underenheter', [
      '<div class="space-y-3">',
      '  <p class="text-sm text-slate-700">Underenheter vises i lesemodus for rask oversikt og kontroll.</p>',
      '  <ul class="space-y-3">' + underenheterRows + '</ul>',
      '</div>'
    ].join('')),
    renderAccordionSection('attributter', 'Attributter', [
      '<div class="space-y-3">',
      '  <p class="text-sm text-slate-700">Attributter er strukturert for lesing. Endringer gjøres i redigeringsflyt.</p>',
      '  <div class="grid gap-3 sm:grid-cols-2">' + attributtRows + '</div>',
      '</div>'
    ].join(''))
  ].join('');

  detailContentEl.innerHTML = [
    '<section class="space-y-4">',
    '  <div class="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">',
    '    ' + hovedbildeHtml,
    '  </div>',
    '  <div class="grid gap-3 sm:grid-cols-2">',
    '    <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">',
    '      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tilstand</p>',
    '      <div class="mt-2 break-words">' + renderMasterdataChip('tilstand', lagervare.tilstand, 'text-sm border-0') + '</div>',
    '    </article>',
    '    <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">',
    '      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>',
    '      <div class="mt-2 break-words">' + renderMasterdataChip('status', lagervare.status, 'text-sm border-0') + '</div>',
    '    </article>',
    '  </div>',
    heroThumbnailRows
      ? ('  <ul class="grid grid-cols-5 gap-2">' + heroThumbnailRows + '</ul>')
      : '',
    '</section>',
    '<section class="mt-5">',
    '  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">' + escapeHtml(overlinjeTekst) + '</p>',
    '  <h2 class="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">' + escapeHtml(formatDetailField(lagervare.navn, 'Uten navn')) + '</h2>',
    '</section>',
    '<section class="mt-5 rounded-2xl border border-slate-200 bg-slate-100 px-4 sm:px-5">',
    detailSummaryRowsHtml,
    '</section>',
    '<section class="mt-5">',
    '  <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-800">Beskrivelse</h3>',
    '  <p class="mt-2 text-base leading-relaxed text-slate-600">' + escapeHtml(beskrivelseTekst) + '</p>',
    '</section>',
    '<section class="mt-6 space-y-4 border-t border-slate-200 pt-6">' + detailAccordionHtml + '</section>',
    '<section class="mt-5">' + detailActionsHtml + '</section>'
  ].join('');
  renderDetailPublicLinkStatus();
  void hydrateMainImages();
  void hydrateDetailAttachmentThumbnails();
}

async function hydrateMainImages() {
  var imageEls = document.querySelectorAll('[data-main-image-id]');
  for (var i = 0; i < imageEls.length; i += 1) {
    var imageEl = imageEls[i];
    if (!imageEl || imageEl.getAttribute('data-media-hydrated') === 'true') {
      continue;
    }
    var documentId = String(imageEl.getAttribute('data-main-image-id') || '').trim();
    if (!documentId) {
      continue;
    }
    var media = await fetchDocumentMedia(documentId);
    if (!media.ok || !media.data || !media.data.dataBase64) {
      continue;
    }
    imageEl.src = 'data:' + (media.data.mimeType || 'image/jpeg') + ';base64,' + media.data.dataBase64;
    imageEl.setAttribute('data-media-hydrated', 'true');
  }
}

async function hydrateDetailAttachmentThumbnails() {
  var thumbEls = document.querySelectorAll('[data-attachment-thumb-id]');
  for (var i = 0; i < thumbEls.length; i += 1) {
    var thumbEl = thumbEls[i];
    if (!thumbEl || thumbEl.getAttribute('data-media-hydrated') === 'true') {
      continue;
    }
    var documentId = String(thumbEl.getAttribute('data-attachment-thumb-id') || '').trim();
    if (!documentId) {
      continue;
    }
    var media = await fetchDocumentMedia(documentId);
    if (!media.ok || !media.data || !media.data.dataBase64) {
      continue;
    }
    thumbEl.src = 'data:' + (media.data.mimeType || 'image/jpeg') + ';base64,' + media.data.dataBase64;
    thumbEl.setAttribute('data-media-hydrated', 'true');
  }
}

async function hydrateOffentligVareMainImage() {
  var imageEls = document.querySelectorAll('[data-public-item-image]');
  for (var i = 0; i < imageEls.length; i += 1) {
    var imageEl = imageEls[i];
    if (!imageEl || imageEl.getAttribute('data-media-hydrated') === 'true') {
      continue;
    }
    var documentId = String(imageEl.getAttribute('data-public-item-image-id') || '').trim();
    var shareCode = String(imageEl.getAttribute('data-public-item-share-code') || '').trim();
    var listShareCode = String(imageEl.getAttribute('data-public-item-list-share-code') || '').trim();
    if (!documentId || !shareCode || !listShareCode) {
      continue;
    }
    var media = await fetchPublicDocumentMedia(shareCode, documentId, listShareCode);
    var loadingEl = document.querySelector('[data-public-item-image-loading="' + documentId + '"]');
    var fallbackEl = document.querySelector('[data-public-item-image-fallback="' + documentId + '"]');
    if (!media.ok || !media.data || !media.data.dataBase64) {
      if (loadingEl) {
        loadingEl.classList.add('hidden');
      }
      if (fallbackEl) {
        fallbackEl.classList.remove('hidden');
      }
      continue;
    }
    imageEl.src = 'data:' + (media.data.mimeType || 'image/jpeg') + ';base64,' + media.data.dataBase64;
    imageEl.classList.remove('hidden');
    imageEl.setAttribute('data-media-hydrated', 'true');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
    if (fallbackEl) {
      fallbackEl.classList.add('hidden');
    }
  }
}

function renderAttachmentOverlay() {
  var overlayEl = document.getElementById('attachment-overlay');
  var bodyEl = document.getElementById('attachment-overlay-body');
  var metaEl = document.getElementById('attachment-overlay-meta');
  if (!overlayEl || !bodyEl || !metaEl) {
    return;
  }
  var overlayState = state.mediaOverlay;
  if (!overlayState.open) {
    overlayEl.classList.add('hidden');
    bodyEl.innerHTML = '';
    metaEl.textContent = '';
    return;
  }
  overlayEl.classList.remove('hidden');
  var documentRecord = overlayState.document || {};
  metaEl.textContent = (documentRecord.filnavn || '') + (documentRecord.mimeType ? (' · ' + documentRecord.mimeType) : '');
  if (overlayState.loading) {
    bodyEl.innerHTML = '<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Laster vedlegg…</p>';
    return;
  }
  if (overlayState.error) {
    bodyEl.innerHTML = '<p class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">' + escapeHtml(overlayState.error) + '</p>';
    return;
  }
  var media = overlayState.document && overlayState.document.media ? overlayState.document.media : null;
  if (!media || !media.dataBase64) {
    bodyEl.innerHTML = '<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Ingen forhåndsvisning tilgjengelig.</p>';
    return;
  }
  var dataUrl = 'data:' + (media.mimeType || 'application/octet-stream') + ';base64,' + media.dataBase64;
  var downloadHtml = '<button type="button" data-download-overlay-document="true" class="inline-flex min-h-11 items-center rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Last ned</button>';
  if (media.previewType === 'image') {
    bodyEl.innerHTML = '<img src="' + escapeHtml(dataUrl) + '" alt="' + escapeHtml(documentRecord.tittel || documentRecord.filnavn || 'Vedlegg') + '" class="max-h-[70vh] w-full rounded-lg border border-slate-200 object-contain bg-slate-100" /><div class="mt-3">' + downloadHtml + '</div>';
    return;
  }
  if (media.previewType === 'pdf') {
    bodyEl.innerHTML = '<iframe title="PDF-forhåndsvisning" src="' + escapeHtml(dataUrl) + '" class="h-[70vh] w-full rounded-lg border border-slate-200"></iframe><div class="mt-3">' + downloadHtml + '</div>';
    return;
  }
  bodyEl.innerHTML = '<div class="rounded-lg border border-slate-200 bg-slate-50 p-3"><p class="text-sm text-slate-800">Forhåndsvisning støttes ikke for denne filtypen.</p><p class="mt-1 text-xs text-slate-700">' + escapeHtml(documentRecord.filnavn || '') + '</p><div class="mt-3">' + downloadHtml + '</div></div>';
}

function closeAttachmentOverlay() {
  if (!state.mediaOverlay.open) {
    return;
  }
  var triggerElement = state.mediaOverlay.triggerElement;
  state.mediaOverlay.open = false;
  state.mediaOverlay.loading = false;
  state.mediaOverlay.error = '';
  state.mediaOverlay.document = null;
  state.mediaOverlay.triggerElement = null;
  renderAttachmentOverlay();
  if (triggerElement && triggerElement.focus) {
    triggerElement.focus();
  }
}

async function openAttachmentOverlay(documentRecord, triggerElement) {
  var cleanDocument = documentRecord || {};
  state.mediaOverlay.open = true;
  state.mediaOverlay.loading = true;
  state.mediaOverlay.error = '';
  state.mediaOverlay.document = Object.assign({}, cleanDocument);
  state.mediaOverlay.triggerElement = triggerElement || null;
  renderAttachmentOverlay();
  var media = await fetchDocumentMedia(cleanDocument.id);
  if (!state.mediaOverlay.open || !state.mediaOverlay.document || state.mediaOverlay.document.id !== cleanDocument.id) {
    return;
  }
  state.mediaOverlay.loading = false;
  if (!media.ok || !media.data) {
    state.mediaOverlay.error = media.message || 'Kunne ikke hente vedleggsdata.';
    renderAttachmentOverlay();
    return;
  }
  state.mediaOverlay.document.media = media.data;
  renderAttachmentOverlay();
}

function closeAddToListOverlay(options) {
  var overlayState = state.addToListOverlay;
  if (!overlayState.open) {
    return;
  }
  var focusTrigger = !options || options.focusTrigger !== false;
  var triggerElement = overlayState.triggerElement;
  overlayState.open = false;
  overlayState.loading = false;
  overlayState.selectedListId = '';
  overlayState.selectedItemIds = [];
  overlayState.error = '';
  overlayState.createName = '';
  overlayState.createLoading = false;
  overlayState.createFeedbackType = '';
  overlayState.createFeedbackMessage = '';
  overlayState.triggerElement = null;
  renderAddToListOverlay();
  if (focusTrigger && triggerElement && triggerElement.focus) {
    triggerElement.focus();
  }
}

function renderAddToListOverlay() {
  var overlayEl = document.getElementById('add-to-list-overlay');
  var metaEl = document.getElementById('add-to-list-overlay-meta');
  var selectEl = document.getElementById('add-to-list-overlay-select');
  var errorEl = document.getElementById('add-to-list-overlay-error');
  var submitButtonEl = document.getElementById('add-to-list-overlay-submit');
  var createNameEl = document.getElementById('add-to-list-overlay-create-name');
  var createSubmitEl = document.getElementById('add-to-list-overlay-create-submit');
  var createFeedbackEl = document.getElementById('add-to-list-overlay-create-feedback');
  if (!overlayEl || !metaEl || !selectEl || !errorEl || !submitButtonEl || !createNameEl || !createSubmitEl || !createFeedbackEl) {
    return;
  }
  var overlayState = state.addToListOverlay;
  if (!overlayState.open) {
    overlayEl.classList.add('hidden');
    return;
  }
  overlayEl.classList.remove('hidden');
  var selectedCount = Array.isArray(overlayState.selectedItemIds) ? overlayState.selectedItemIds.length : 0;
  metaEl.textContent = selectedCount === 1
    ? '1 vare valgt'
    : String(selectedCount) + ' varer valgt';
  var lister = Array.isArray(state.lister) ? state.lister : [];
  var listOptions = lister.map(function (liste) {
    return {
      id: resolveListeId(liste),
      navn: formatDetailField(liste.navn || liste.name, 'Uten navn')
    };
  }).filter(function (liste) {
    return !!liste.id;
  });
  if (!listOptions.length) {
    selectEl.innerHTML = '<option value="">Ingen lister tilgjengelig</option>';
    overlayState.selectedListId = '';
  } else {
    var valgtListeId = String(overlayState.selectedListId || '').trim();
    var harValgtListe = listOptions.some(function (liste) {
      return liste.id === valgtListeId;
    });
    if (!harValgtListe) {
      valgtListeId = listOptions[0].id;
      overlayState.selectedListId = valgtListeId;
    }
    selectEl.innerHTML = listOptions.map(function (liste) {
      var isSelected = valgtListeId === liste.id;
      return '<option value="' + escapeHtml(liste.id) + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(liste.navn) + '</option>';
    }).join('');
    selectEl.value = valgtListeId;
    overlayState.selectedListId = valgtListeId;
  }
  selectEl.disabled = overlayState.loading || !listOptions.length;
  createNameEl.value = overlayState.createName || '';
  createNameEl.disabled = overlayState.loading || overlayState.createLoading;
  createSubmitEl.disabled = overlayState.loading || overlayState.createLoading;
  createSubmitEl.textContent = overlayState.createLoading ? 'Oppretter…' : 'Opprett liste';
  if (overlayState.error) {
    errorEl.textContent = overlayState.error;
    errorEl.classList.remove('hidden');
  } else {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (overlayState.createFeedbackMessage) {
    createFeedbackEl.textContent = overlayState.createFeedbackMessage;
    if (overlayState.createFeedbackType === 'success') {
      createFeedbackEl.className = 'text-sm text-emerald-900';
    } else {
      createFeedbackEl.className = 'text-sm text-rose-900';
    }
    createFeedbackEl.classList.remove('hidden');
  } else {
    createFeedbackEl.textContent = '';
    createFeedbackEl.className = 'hidden text-sm';
  }
  submitButtonEl.disabled = overlayState.loading || !overlayState.selectedListId || !selectedCount;
  submitButtonEl.textContent = overlayState.loading ? 'Legger til…' : 'Legg til';
}

function closeBestillingVariantOverlay(options) {
  var overlayState = state.bestillingVariantOverlay;
  if (!overlayState.open) {
    return;
  }
  var focusTrigger = !options || options.focusTrigger !== false;
  var triggerElement = overlayState.triggerElement;
  overlayState.open = false;
  overlayState.loading = false;
  overlayState.itemId = '';
  overlayState.itemName = '';
  overlayState.variants = [];
  overlayState.selectedVariantIds = [];
  overlayState.selectedVariantQuantities = {};
  overlayState.error = '';
  overlayState.triggerElement = null;
  renderBestillingVariantOverlay();
  if (focusTrigger && triggerElement && triggerElement.focus) {
    triggerElement.focus();
  }
}

function readVariantAvailableQuantity(variant) {
  var rawValue = variant && (variant.tilgjengeligAntall != null
    ? variant.tilgjengeligAntall
    : (variant.antall != null
    ? variant.antall
    : (variant.beholdning != null
      ? variant.beholdning
      : variant.qty)));
  var parsedValue = parseInt(rawValue, 10);
  if (isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }
  return parsedValue;
}

function clampVariantSelectionQuantity(quantityValue, availableQuantity) {
  var parsedQuantity = parseInt(quantityValue, 10);
  var maxQuantity = parseInt(availableQuantity, 10);
  if (isNaN(maxQuantity) || maxQuantity < 0) {
    maxQuantity = 0;
  }
  if (isNaN(parsedQuantity) || parsedQuantity < 1) {
    parsedQuantity = 1;
  }
  if (maxQuantity < 1) {
    return 0;
  }
  if (parsedQuantity > maxQuantity) {
    return maxQuantity;
  }
  return parsedQuantity;
}

function renderBestillingVariantOverlay() {
  var overlayEl = document.getElementById('bestilling-variant-overlay');
  var metaEl = document.getElementById('bestilling-variant-overlay-meta');
  var listEl = document.getElementById('bestilling-variant-overlay-list');
  var errorEl = document.getElementById('bestilling-variant-overlay-error');
  var submitButtonEl = document.getElementById('bestilling-variant-overlay-submit');
  if (!overlayEl || !metaEl || !listEl || !errorEl || !submitButtonEl) {
    return;
  }
  var overlayState = state.bestillingVariantOverlay;
  if (!overlayState.open) {
    overlayEl.classList.add('hidden');
    return;
  }
  overlayEl.classList.remove('hidden');
  var variants = Array.isArray(overlayState.variants) ? overlayState.variants : [];
  var itemLabel = formatDetailField(overlayState.itemName, overlayState.itemId || 'Vare');
  metaEl.textContent = itemLabel + ' · Velg én eller flere varianter';
  if (!variants.length) {
    listEl.innerHTML = '<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Ingen varianter tilgjengelig for denne varen.</p>';
  } else {
    var selectedMap = {};
    var selectedIds = Array.isArray(overlayState.selectedVariantIds) ? overlayState.selectedVariantIds : [];
    var quantityMap = overlayState.selectedVariantQuantities && typeof overlayState.selectedVariantQuantities === 'object'
      ? overlayState.selectedVariantQuantities
      : {};
    for (var selectedIndex = 0; selectedIndex < selectedIds.length; selectedIndex += 1) {
      selectedMap[String(selectedIds[selectedIndex] || '').trim()] = true;
    }
    listEl.innerHTML = variants.map(function (variant) {
      var variantId = String(variant && variant.id || '').trim();
      var variantName = String(variant && variant.navn || '').trim();
      var availableQuantity = readVariantAvailableQuantity(variant);
      var currentQuantity = clampVariantSelectionQuantity(quantityMap[variantId], availableQuantity);
      var checked = !!selectedMap[variantId];
      var checkboxLabel = variantName ? (variantName + ' (' + variantId + ')') : variantId;
      return [
        '<div class="rounded-lg border border-slate-200 bg-white px-3 py-3">',
        '  <div class="flex items-start gap-3">',
        '    <input type="checkbox" data-bestilling-variant-option="' + escapeHtml(variantId) + '" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-hulBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (checked ? 'checked' : '') + ' />',
        '    <div class="min-w-0 flex-1">',
        '      <p class="break-words text-sm font-medium text-slate-900">' + escapeHtml(checkboxLabel) + '</p>',
        '      <p class="mt-1 text-xs text-slate-700">Tilgjengelig: <span class="font-semibold">' + escapeHtml(String(availableQuantity)) + '</span></p>',
        '    </div>',
        '  </div>',
        '  <div class="mt-3 flex flex-wrap items-center gap-2">',
        '    <button type="button" data-bestilling-variant-minus="' + escapeHtml(variantId) + '" class="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-semibold leading-none text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" aria-label="Reduser antall for ' + escapeHtml(checkboxLabel) + '"' + (availableQuantity < 1 ? ' disabled' : '') + '>−</button>',
        '    <input id="bestilling-variant-qty-' + escapeHtml(variantId) + '" aria-label="Antall for ' + escapeHtml(checkboxLabel) + '" data-bestilling-variant-quantity="' + escapeHtml(variantId) + '" data-numeric-enhance="false" type="number" min="' + (availableQuantity > 0 ? '1' : '0') + '" max="' + escapeHtml(String(availableQuantity)) + '" value="' + escapeHtml(String(currentQuantity)) + '" class="min-h-11 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (availableQuantity < 1 ? 'disabled' : '') + ' />',
        '    <button type="button" data-bestilling-variant-plus="' + escapeHtml(variantId) + '" class="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-semibold leading-none text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" aria-label="Øk antall for ' + escapeHtml(checkboxLabel) + '"' + (availableQuantity < 1 ? ' disabled' : '') + '>+</button>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');
  }
  if (overlayState.error) {
    errorEl.textContent = overlayState.error;
    errorEl.classList.remove('hidden');
  } else {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  submitButtonEl.disabled = overlayState.loading || !variants.length;
  submitButtonEl.textContent = overlayState.loading ? 'Legger til…' : 'Legg til valgte varianter';
}

function openBestillingVariantOverlay(item, triggerElement) {
  var selectedItem = item || null;
  var itemId = String(selectedItem && selectedItem.id || '').trim();
  if (!itemId) {
    state.writeError = 'Ingen vare valgt i detaljvisningen.';
    renderState();
    return;
  }
  var variants = getVariantSubunitsForItem(selectedItem || {});
  if (!variants.length) {
    state.writeError = 'Varen har ingen varianter å velge mellom.';
    renderState();
    return;
  }
  state.bestillingVariantOverlay.open = true;
  state.bestillingVariantOverlay.loading = false;
  state.bestillingVariantOverlay.itemId = itemId;
  state.bestillingVariantOverlay.itemName = String(selectedItem && selectedItem.navn || '').trim();
  state.bestillingVariantOverlay.variants = variants.map(function (variant) {
    var availableQuantity = readVariantAvailableQuantity(variant);
    return {
      id: String(variant && variant.id || '').trim(),
      navn: String(variant && variant.navn || '').trim(),
      tilgjengeligAntall: availableQuantity
    };
  }).filter(function (variant) {
    return !!variant.id;
  });
  state.bestillingVariantOverlay.selectedVariantIds = [];
  state.bestillingVariantOverlay.selectedVariantQuantities = state.bestillingVariantOverlay.variants.reduce(function (result, variant) {
    var variantId = String(variant && variant.id || '').trim();
    if (variantId) {
      result[variantId] = clampVariantSelectionQuantity(1, variant.tilgjengeligAntall);
    }
    return result;
  }, {});
  state.bestillingVariantOverlay.error = '';
  state.bestillingVariantOverlay.triggerElement = triggerElement || null;
  renderState();
  window.setTimeout(function () {
    var firstVariantEl = document.querySelector('[data-bestilling-variant-option]');
    if (firstVariantEl && firstVariantEl.focus) {
      firstVariantEl.focus();
    }
  }, 0);
}

async function confirmBestillingVariantOverlaySelection() {
  var overlayState = state.bestillingVariantOverlay;
  if (!overlayState.open || overlayState.loading) {
    return;
  }
  var itemId = String(overlayState.itemId || '').trim();
  if (!itemId) {
    return;
  }
  var selectedVariantIds = Array.isArray(overlayState.selectedVariantIds)
    ? overlayState.selectedVariantIds.map(function (variantId) {
      return String(variantId || '').trim();
    }).filter(function (variantId) {
      return !!variantId;
    })
    : [];
  var selectedVariantQuantities = overlayState.selectedVariantQuantities && typeof overlayState.selectedVariantQuantities === 'object'
    ? overlayState.selectedVariantQuantities
    : {};
  if (!selectedVariantIds.length) {
    overlayState.error = 'Velg minst én variant før du legger til i bestilling.';
    renderBestillingVariantOverlay();
    return;
  }
  var variantLookup = {};
  var variants = Array.isArray(overlayState.variants) ? overlayState.variants : [];
  for (var variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
    var variant = variants[variantIndex] || {};
    var variantId = String(variant.id || '').trim();
    if (variantId) {
      variantLookup[variantId] = variant;
    }
  }
  var detailVariantSelectionByItemId = {};
  var variantSelections = [];
  for (var selectedIndex = 0; selectedIndex < selectedVariantIds.length; selectedIndex += 1) {
    var selectedVariantId = selectedVariantIds[selectedIndex];
    var selectedVariant = variantLookup[selectedVariantId] || {};
    var availableQuantity = readVariantAvailableQuantity(selectedVariant);
    if (availableQuantity < 1) {
      overlayState.error = 'Valgt variant ' + selectedVariantId + ' er ikke tilgjengelig på lager.';
      renderBestillingVariantOverlay();
      return;
    }
    var quantity = clampVariantSelectionQuantity(selectedVariantQuantities[selectedVariantId], availableQuantity);
    if (quantity < 1) {
      overlayState.error = 'Antall for variant ' + selectedVariantId + ' må være minst 1.';
      renderBestillingVariantOverlay();
      return;
    }
    if (quantity > availableQuantity) {
      overlayState.error = 'Antall for variant ' + selectedVariantId + ' kan ikke overstige tilgjengelig antall (' + availableQuantity + ').';
      renderBestillingVariantOverlay();
      return;
    }
    variantSelections.push({ id: selectedVariantId, quantity: quantity });
  }
  detailVariantSelectionByItemId[itemId] = variantSelections;
  overlayState.error = '';
  overlayState.loading = true;
  renderBestillingVariantOverlay();
  try {
    await addItemsToBestillingDraft([itemId], 'detaljvisning', overlayState.triggerElement, 'detail-add-to-order', {
      requireDetailVariantSelection: true,
      detailVariantSelectionByItemId: detailVariantSelectionByItemId
    });
    if (!state.bestilling.errorMessage) {
      closeBestillingVariantOverlay();
    } else {
      overlayState.loading = false;
      overlayState.error = state.bestilling.errorMessage;
      renderBestillingVariantOverlay();
    }
  } catch (error) {
    overlayState.loading = false;
    overlayState.error = String((error && error.message) || 'Kunne ikke legge til valgte varianter.');
    renderBestillingVariantOverlay();
  }
}

async function openAddToListOverlay(itemIds, triggerElement) {
  var ids = (itemIds || []).map(function (itemId) {
    return String(itemId || '').trim();
  }).filter(function (itemId) {
    return !!itemId;
  });
  if (!ids.length) {
    state.writeError = 'Velg minst én vare før «Legg til i liste».';
    renderState();
    return;
  }
  if (!Array.isArray(state.lister) || !state.lister.length) {
    await loadLister();
  }
  state.addToListOverlay.open = true;
  state.addToListOverlay.loading = false;
  state.addToListOverlay.selectedItemIds = ids;
  state.addToListOverlay.selectedListId = Array.isArray(state.lister) && state.lister.length
    ? resolveListeId(state.lister[0])
    : '';
  state.addToListOverlay.error = '';
  state.addToListOverlay.createName = '';
  state.addToListOverlay.createLoading = false;
  state.addToListOverlay.createFeedbackType = '';
  state.addToListOverlay.createFeedbackMessage = '';
  state.addToListOverlay.triggerElement = triggerElement || null;
  renderState();
  window.setTimeout(function () {
    var focusEl = document.getElementById(state.addToListOverlay.selectedListId ? 'add-to-list-overlay-select' : 'add-to-list-overlay-create-name');
    if (focusEl && focusEl.focus) {
      focusEl.focus();
    }
  }, 0);
}

function resolveCreatedListeIdFromPayload(payload) {
  if (!payload || !payload.data || !payload.data.listResult) {
    return '';
  }
  return String(
    payload.data.listResult.id ||
    payload.data.listResult.listId ||
    payload.data.listResult.sharedListId ||
    (payload.data.listResult.list && (
      payload.data.listResult.list.id ||
      payload.data.listResult.list.listId ||
      payload.data.listResult.list.sharedListId
    )) ||
    ''
  ).trim();
}

async function createListeFraAddToListOverlay() {
  if (!state.addToListOverlay.open || state.addToListOverlay.createLoading || state.addToListOverlay.loading) {
    return;
  }
  var navn = String(state.addToListOverlay.createName || '').trim();
  if (!navn) {
    state.addToListOverlay.createFeedbackType = 'error';
    state.addToListOverlay.createFeedbackMessage = 'Navn på liste er påkrevd.';
    renderAddToListOverlay();
    return;
  }
  state.addToListOverlay.createLoading = true;
  state.addToListOverlay.createFeedbackType = '';
  state.addToListOverlay.createFeedbackMessage = '';
  state.addToListOverlay.error = '';
  renderAddToListOverlay();
  var token = getAccessToken();
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.listsPath);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-list');
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { navn: navn });
  if (handleAuthErrorStatus(result.status)) {
    state.addToListOverlay.createLoading = false;
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.addToListOverlay.createLoading = false;
    state.addToListOverlay.createFeedbackType = 'error';
    state.addToListOverlay.createFeedbackMessage = resultErrorMessage(result.payload, 'Kunne ikke opprette liste.');
    renderAddToListOverlay();
    return;
  }
  await loadLister();
  var createdId = resolveCreatedListeIdFromPayload(result.payload);
  var nyListe = Array.isArray(state.lister)
    ? state.lister.find(function (liste) {
      var listeId = resolveListeId(liste);
      if (createdId && listeId === createdId) {
        return true;
      }
      return String((liste && (liste.navn || liste.name)) || '').trim() === navn;
    })
    : null;
  state.addToListOverlay.createLoading = false;
  state.addToListOverlay.createName = '';
  if (nyListe) {
    state.addToListOverlay.selectedListId = resolveListeId(nyListe);
  }
  state.addToListOverlay.createFeedbackType = 'success';
  state.addToListOverlay.createFeedbackMessage = 'Liste opprettet og valgt.';
  renderAddToListOverlay();
}

async function confirmAddToListOverlaySelection() {
  if (!state.addToListOverlay.open) {
    return;
  }
  var selectEl = document.getElementById('add-to-list-overlay-select');
  var valgtListeIdFraSelect = selectEl ? String(selectEl.value || '').trim() : '';
  var listId = valgtListeIdFraSelect || String(state.addToListOverlay.selectedListId || '').trim();
  state.addToListOverlay.selectedListId = listId;
  var itemIds = Array.isArray(state.addToListOverlay.selectedItemIds)
    ? state.addToListOverlay.selectedItemIds.slice()
    : [];
  if (!listId) {
    state.addToListOverlay.error = 'Velg en liste for å fortsette.';
    renderAddToListOverlay();
    return;
  }
  if (!itemIds.length) {
    state.addToListOverlay.error = 'Ingen valgte varer å legge til i liste.';
    renderAddToListOverlay();
    return;
  }
  state.addToListOverlay.loading = true;
  state.addToListOverlay.error = '';
  renderAddToListOverlay();
  var summary = await addInventoryItemsToListShared(listId, itemIds);
  state.addToListOverlay.loading = false;
  if (summary.failed > 0 && summary.added === 0 && summary.skipped === 0) {
    state.addToListOverlay.error = summary.errorMessage || 'Kunne ikke legge valgte varer til valgt liste.';
    renderAddToListOverlay();
    return;
  }
  state.writeError = '';
  state.writeSuccess = 'Legg til i liste fullført. Lagt til: ' + summary.added + ', hoppet over: ' + summary.skipped + ', feilet: ' + summary.failed + '.';
  await loadLister();
  closeAddToListOverlay({ focusTrigger: false });
  renderState();
}

function downloadOverlayDocument() {
  var media = state.mediaOverlay && state.mediaOverlay.document && state.mediaOverlay.document.media
    ? state.mediaOverlay.document.media
    : null;
  if (!media || !media.dataBase64) {
    return;
  }
  var link = document.createElement('a');
  link.href = 'data:' + (media.mimeType || 'application/octet-stream') + ';base64,' + media.dataBase64;
  link.download = media.filnavn || 'vedlegg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function getLoanStatusLabel(statusValue, isForfalt) {
  if (isForfalt) {
    return 'Forfalt';
  }
  var status = String(statusValue || '').trim().toUpperCase();
  if (status === 'ACTIVE') {
    return 'Aktiv';
  }
  if (status === 'RETURNED') {
    return 'Returnert';
  }
  if (status === 'DEVIATION') {
    return 'Avvik';
  }
  if (status === 'OVERDUE') {
    return 'Forfalt';
  }
  return 'Ukjent';
}

function getLoanStatusChipClass(statusValue, isForfalt) {
  var status = String(statusValue || '').trim().toUpperCase();
  if (isForfalt || status === 'OVERDUE') {
    return 'border-rose-300 bg-rose-50 text-rose-800';
  }
  if (status === 'DEVIATION') {
    return 'border-amber-300 bg-amber-50 text-amber-900';
  }
  if (status === 'RETURNED') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-800';
  }
  if (status === 'ACTIVE') {
    return 'border-sky-300 bg-sky-50 text-sky-800';
  }
  return 'border-slate-300 bg-slate-50 text-slate-700';
}

function getSelectedItemLoans() {
  if (!state.selectedInventoryId) {
    return [];
  }

  return state.loans
    .filter(function (loan) {
      return loan && loan.itemId === state.selectedInventoryId && !loan.returDato;
    })
    .sort(function (left, right) {
      return String(left.forfallDato || '').localeCompare(String(right.forfallDato || ''), 'no');
    });
}

function getLoanSelectedItemIds() {
  var ids = Array.isArray(state.loanFlow && state.loanFlow.selectedItemIds)
    ? state.loanFlow.selectedItemIds.slice()
    : [];
  if (!ids.length) {
    var fallbackId = String(state.selectedInventoryId || state.loanForm.itemId || '').trim();
    if (fallbackId) {
      ids = [fallbackId];
    }
  }
  var unique = {};
  var cleaned = [];
  for (var i = 0; i < ids.length; i += 1) {
    var cleanId = String(ids[i] || '').trim();
    if (!cleanId || unique[cleanId]) {
      continue;
    }
    unique[cleanId] = true;
    cleaned.push(cleanId);
  }
  return cleaned;
}

function setLoanFlowSelection(itemIds, originRoute) {
  var ids = Array.isArray(itemIds) ? itemIds : [];
  var unique = {};
  var selectedIds = [];
  for (var i = 0; i < ids.length; i += 1) {
    var cleanId = String(ids[i] || '').trim();
    if (!cleanId || unique[cleanId]) {
      continue;
    }
    unique[cleanId] = true;
    selectedIds.push(cleanId);
  }
  state.loanFlow.selectedItemIds = selectedIds;
  state.loanFlow.originRoute = String(originRoute || '').trim();
  state.loanForm.itemId = selectedIds.length ? selectedIds[0] : '';
}

function openLoanWorkspaceFromContext(itemIds, originRoute) {
  setLoanFlowSelection(itemIds, originRoute);
  state.writeError = '';
  state.writeSuccess = '';
  setWorkspace('utlan', { historyMode: 'push' });
  renderState();
}

function getActiveBorrowersForLoan() {
  return (state.borrowerRegistry.items || []).filter(function (borrower) {
    return String(borrower && borrower.status || '').trim().toLowerCase() === 'aktiv';
  });
}

function applyLoanBorrowerSelection(borrowerId) {
  var cleanBorrowerId = String(borrowerId || '').trim();
  if (!cleanBorrowerId) {
    state.loanForm.borrowerId = '';
    state.loanForm.laaner = '';
    return;
  }
  var borrowers = getActiveBorrowersForLoan();
  for (var i = 0; i < borrowers.length; i++) {
    if (String(borrowers[i].id || '').trim() === cleanBorrowerId) {
      state.loanForm.borrowerId = cleanBorrowerId;
      state.loanForm.laaner = String(borrowers[i].navn || '').trim();
      return;
    }
  }
  state.loanForm.borrowerId = '';
  state.loanForm.laaner = '';
}

function renderLoanSection() {
  const loanListEl = document.getElementById('loan-list');
  const loanFormEl = document.getElementById('loan-form');
  const selectedItemsCountEl = document.getElementById('loan-selected-items-count');
  const selectedItemsSummaryEl = document.getElementById('loan-selected-items-summary');
  const loanCreateButtonEl = document.getElementById('loan-create-button');
  if (!loanListEl || !loanFormEl || !selectedItemsCountEl || !selectedItemsSummaryEl || !loanCreateButtonEl) {
    return;
  }

  var selectedItemIds = getLoanSelectedItemIds();
  var selectedItems = selectedItemIds
    .map(function (itemId) {
      for (var i = 0; i < state.inventory.length; i += 1) {
        var lagervare = state.inventory[i];
        if (String(lagervare && lagervare.id || '').trim() === itemId) {
          return lagervare;
        }
      }
      return { id: itemId, navn: 'Ukjent vare' };
    });

  var formItemId = selectedItemIds.length ? selectedItemIds[0] : '';
  loanFormEl.elements.itemId.value = formItemId;
  state.loanForm.itemId = formItemId;
  loanFormEl.elements.forfallDato.value = state.loanForm.forfallDato || '';
  loanFormEl.elements.notat.value = state.loanForm.notat || '';

  if (!selectedItems.length) {
    selectedItemsCountEl.textContent = 'Ingen varer valgt. Start utlån fra bestilling når du har ferdigstilt utvalget.';
    selectedItemsSummaryEl.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">Ingen varekontekst er valgt for utlån.</li>';
  } else {
    selectedItemsCountEl.textContent = selectedItems.length + ' vare(r) valgt i denne flyten.';
    selectedItemsSummaryEl.innerHTML = selectedItems.map(function (lagervare) {
      return [
        '<li class="rounded-lg border border-slate-200 bg-white p-3">',
        '  <p class="text-sm font-semibold text-slate-900">' + escapeHtml(String(lagervare.navn || 'Ukjent vare')) + '</p>',
        '  <p class="mt-1 text-xs text-slate-600">' + escapeHtml(String(lagervare.id || 'Ukjent ID')) + '</p>',
        '</li>'
      ].join('');
    }).join('');
  }

  var borrowerSelectEl = document.getElementById('loan-borrower-select');
  if (borrowerSelectEl) {
    var activeBorrowers = getActiveBorrowersForLoan();
    borrowerSelectEl.innerHTML = ['<option value="">Velg lånetaker</option>']
      .concat(activeBorrowers.map(function (borrower) {
        return '<option value="' + escapeHtml(borrower.id || '') + '">' + escapeHtml((borrower.navn || '-') + ' (' + (borrower.id || '') + ')') + '</option>';
      }))
      .join('');
    if (state.loanForm.borrowerId) {
      borrowerSelectEl.value = state.loanForm.borrowerId;
    }
  }
  var detailBorrowerSelectEl = document.getElementById('detail-loan-borrower-select');
  if (detailBorrowerSelectEl) {
    var detailActiveBorrowers = getActiveBorrowersForLoan();
    detailBorrowerSelectEl.innerHTML = ['<option value="">Velg lånetaker</option>']
      .concat(detailActiveBorrowers.map(function (borrower) {
        return '<option value="' + escapeHtml(borrower.id || '') + '">' + escapeHtml((borrower.navn || '-') + ' (' + (borrower.id || '') + ')') + '</option>';
      }))
      .join('');
    if (state.loanForm.borrowerId) {
      detailBorrowerSelectEl.value = state.loanForm.borrowerId;
    }
  }

  var canSubmit = selectedItemIds.length > 0 && !!String(state.loanForm.borrowerId || '').trim() && !!String(state.loanForm.laaner || '').trim();
  loanCreateButtonEl.disabled = !canSubmit;
  if (canSubmit) {
    loanCreateButtonEl.removeAttribute('aria-disabled');
    loanCreateButtonEl.classList.remove('opacity-60', 'cursor-not-allowed');
  } else {
    loanCreateButtonEl.setAttribute('aria-disabled', 'true');
    loanCreateButtonEl.classList.add('opacity-60', 'cursor-not-allowed');
  }

  const loans = getSelectedItemLoans();
  if (!state.selectedInventoryId) {
    loanListEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Velg en lagervare for å vise aktive utlån i listen under.</li>';
    return;
  }

  if (!loans.length) {
    loanListEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Ingen aktive utlån for valgt lagervare.</li>';
    return;
  }

  loanListEl.innerHTML = loans
    .map(function (loan) {
      var loanStatusLabel = getLoanStatusLabel(loan.status, loan.isForfalt);
      var loanStatusClassName = getLoanStatusChipClass(loan.status, loan.isForfalt);
      var statusBadge = '<span class="inline-flex min-h-11 items-center rounded-full border px-3 py-1 text-xs font-semibold ' + loanStatusClassName + '">' + escapeHtml(loanStatusLabel) + '</span>';
      return [
        '<li class="rounded-lg border border-slate-200 bg-white p-3">',
        '  <div class="flex flex-wrap items-center justify-between gap-2">',
        '    <p class="text-sm font-semibold text-slate-900">' + escapeHtml(loan.id) + ' · ' + escapeHtml(loan.laaner || '') + '</p>',
        '    ' + statusBadge,
        '  </div>',
        '  <p class="mt-1 text-xs text-slate-600">Utlånt: ' + escapeHtml(loan.utlanDato || 'Ukjent') + ' · Forfall: ' + escapeHtml(loan.forfallDato || 'Ikke satt') + '</p>',
        '  <div class="mt-3 grid gap-2">',
        '    <label class="text-xs font-medium text-slate-700" for="return-note-' + escapeHtml(loan.id) + '">Returmerknad</label>',
        '    <input id="return-note-' + escapeHtml(loan.id) + '" type="text" data-loan-return-note="' + escapeHtml(loan.id) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
        '    <label class="text-xs font-medium text-slate-700" for="return-deviation-' + escapeHtml(loan.id) + '">Avvik (valgfritt)</label>',
        '    <input id="return-deviation-' + escapeHtml(loan.id) + '" type="text" data-loan-deviation="' + escapeHtml(loan.id) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
        '    <button type="button" data-loan-return-button="' + escapeHtml(loan.id) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-4 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Registrer retur</button>',
        '  </div>',
        '</li>'
      ].join('');
    })
    .join('');
}

function getMasterdataEntries(type, includeInactive) {
  const entries = state.masterdata && Array.isArray(state.masterdata[type]) ? state.masterdata[type] : [];
  return entries
    .filter(function (entry) {
      const value = String(entry && entry.value || '').trim();
      if (!value) {
        return false;
      }
      if (includeInactive) {
        return true;
      }
      return entry.isActive !== false;
    })
    .slice()
    .sort(function (left, right) {
      const leftSortOrder = left && left.sortOrder != null ? left.sortOrder : 99;
      const rightSortOrder = right && right.sortOrder != null ? right.sortOrder : 99;
      return Number(leftSortOrder) - Number(rightSortOrder);
    });
}

function getMasterdataValues(type) {
  return getMasterdataEntries(type, false).map(function (entry) {
    return String(entry.value || '').trim();
  });
}

function getMasterdataEntryByValue(type, value) {
  const wanted = String(value || '').trim().toLowerCase();
  if (!wanted) {
    return null;
  }
  const entries = getMasterdataEntries(type, true);
  for (let i = 0; i < entries.length; i += 1) {
    const candidate = String(entries[i].value || '').trim().toLowerCase();
    if (candidate === wanted) {
      return entries[i];
    }
  }
  return null;
}

function getMasterdataEntryById(type, id) {
  const wanted = String(id || '').trim();
  if (!wanted) {
    return null;
  }
  const entries = getMasterdataEntries(type, true);
  for (let i = 0; i < entries.length; i += 1) {
    if (String(entries[i].id || '').trim() === wanted) {
      return entries[i];
    }
  }
  return null;
}

function isChipManagedMasterdataType(type) {
  return type === 'status' || type === 'tilstand';
}

function normalizeChipColorToken(value) {
  const token = String(value || '').trim().toLowerCase();
  const allowed = {
    success: 'success',
    grønn: 'success',
    gronn: 'success',
    warning: 'warning',
    gul: 'warning',
    oransje: 'warning',
    orange: 'warning',
    danger: 'danger',
    rød: 'danger',
    rod: 'danger',
    neutral: 'neutral',
    grå: 'neutral',
    gra: 'neutral'
  };
  return allowed[token] || '';
}

function getChipStyleClass(entry) {
  const byToken = {
    success: 'border-emerald-200 bg-emerald-100 text-emerald-900',
    warning: 'border-amber-200 bg-amber-100 text-amber-900',
    danger: 'border-rose-200 bg-rose-100 text-rose-900',
    neutral: 'border-slate-300 bg-slate-100 text-slate-800'
  };
  const token = normalizeChipColorToken(entry && entry.colorToken);
  if (byToken[token]) {
    return byToken[token];
  }
  return 'border-slate-300 bg-slate-100 text-slate-800';
}

function readAdminBooleanInput(value, fallback) {
  if (value === true || value === false) {
    return value;
  }
  const str = String(value || '').trim().toLowerCase();
  if (str === 'true' || str === '1' || str === 'ja') {
    return true;
  }
  if (str === 'false' || str === '0' || str === 'nei') {
    return false;
  }
  return fallback;
}

function readAdminSortOrderInput(value, fallback) {
  const parsed = Number(value);
  if (isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

function renderMasterdataChip(type, value, extraClasses) {
  const label = String(value || '').trim() || 'Ikke registrert';
  const entry = getMasterdataEntryByValue(type, value);
  const chipClass = getChipStyleClass(entry);
  const additional = String(extraClasses || '').trim();
  return '<span class="inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-tight ' + chipClass + (additional ? (' ' + additional) : '') + '">' + escapeHtml(label) + '</span>';
}

function renderSelectOptions(selectId, values, placeholder) {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) {
    return;
  }
  const currentValue = String(selectEl.value || '');
  selectEl.innerHTML = ['<option value="">' + escapeHtml(placeholder) + '</option>']
    .concat(values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }))
    .join('');
  if (values.indexOf(currentValue) !== -1) {
    selectEl.value = currentValue;
  }
}

function renderInventoryFormMasterdataOptions() {
  renderSelectOptions('form-status', getMasterdataValues('status'), 'Velg status');
  renderSelectOptions('form-tilstand', getMasterdataValues('tilstand'), 'Velg tilstand');
  renderSelectOptions('form-kategori', getMasterdataValues('kategori'), 'Velg kategori');
  renderSelectOptions('form-plassering', getMasterdataValues('plassering'), 'Velg plassering');
  renderAnsvarligSelectOptions();
  renderArrangementSelectOptions();
  renderInventorySubunitRows();
  renderInventoryAttributeRows();
  renderInventoryFormChips();
}

function normalizeInventorySubunitRows(inputRows) {
  if (!Array.isArray(inputRows)) {
    return [];
  }
  return inputRows.map(function (rawRow) {
    var row = rawRow || {};
    var rowId = String(row.rowId || row.id || row.internId || '').trim();
    var type = String(row.type || row.underenhetType || '').trim().toLowerCase();
    var navn = String(row.navn || row.name || '').trim();
    var beskrivelse = String(row.beskrivelse || row.description || '').trim();
    var antallRaw = row.antall != null ? row.antall : (row.beholdning != null ? row.beholdning : row.qty);
    var antallText = String(antallRaw == null ? '' : antallRaw).trim();
    var status = String(row.status || '').trim();
    var tilstand = String(row.tilstand || '').trim();
    var vedlegg = Array.isArray(row.vedlegg) ? row.vedlegg.map(normalizeDocumentRecord) : [];
    if (!rowId) {
      rowId = 'row-' + String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000000));
    }
    return {
      rowId: rowId,
      id: String(row.id || '').trim(),
      type: SUBUNIT_ALLOWED_TYPES.indexOf(type) !== -1 ? type : type,
      navn: navn,
      beskrivelse: beskrivelse,
      antall: antallText,
      status: status,
      tilstand: tilstand,
      hovedbildeDokumentId: String(row.hovedbildeDokumentId || '').trim(),
      existingAttachments: vedlegg,
      pendingAttachments: [],
      removedAttachmentIds: {},
      updatedAttachmentIds: {}
    };
  }).filter(function (row) {
    return !!(row.type || row.navn || row.beskrivelse || row.antall || row.status || row.tilstand || row.id);
  });
}

function renderInventorySubunitRows() {
  var listEl = document.getElementById('inventory-form-underenheter-list');
  var emptyEl = document.getElementById('inventory-form-underenheter-empty');
  if (!listEl || !emptyEl) {
    return;
  }
  if (!Array.isArray(state.formState.subunitRows)) {
    state.formState.subunitRows = [];
  }
  emptyEl.classList.toggle('hidden', state.formState.subunitRows.length > 0);
  var statusOptions = getMasterdataValues('status');
  var tilstandOptions = getMasterdataValues('tilstand');
  listEl.innerHTML = state.formState.subunitRows.map(function (row, index) {
    var type = String(row && row.type || '').trim().toLowerCase();
    var navn = String(row && row.navn || '').trim();
    var beskrivelse = String(row && row.beskrivelse || '').trim();
    var antall = String(row && row.antall != null ? row.antall : '').trim();
    var status = String(row && row.status || '').trim();
    var tilstand = String(row && row.tilstand || '').trim();
    var hiddenId = String(row && row.id || '').trim();
    var rowId = String(row && row.rowId || '').trim();
    var statusSelectOptions = buildSubunitSelectOptions(statusOptions, status, 'Velg status');
    var tilstandSelectOptions = buildSubunitSelectOptions(tilstandOptions, tilstand, 'Velg tilstand');
    var existingAttachments = Array.isArray(row && row.existingAttachments) ? row.existingAttachments.filter(function (attachment) {
      var attachmentId = String(attachment && attachment.id || '').trim();
      return attachmentId && !(row.removedAttachmentIds && row.removedAttachmentIds[attachmentId]);
    }) : [];
    var pendingAttachments = Array.isArray(row && row.pendingAttachments) ? row.pendingAttachments : [];
    var existingHtml = existingAttachments.length
      ? existingAttachments.map(function (attachment) {
        var attachmentId = String(attachment.id || '').trim();
        var isMainImage = !!attachment.erBilde && String(row.hovedbildeDokumentId || '').trim() === attachmentId;
        return [
          '<li class="rounded-lg border border-slate-200 bg-white p-2">',
          '  <p class="break-words text-xs font-medium text-slate-800">' + escapeHtml(attachment.filnavn || attachment.tittel || attachmentId) + '</p>',
          '  <input data-form-subunit-existing-title-row="' + escapeHtml(rowId) + '" data-form-subunit-existing-title-id="' + escapeHtml(attachmentId) + '" value="' + escapeHtml(attachment.tittel || '') + '" maxlength="140" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs" />',
          '  <textarea data-form-subunit-existing-description-row="' + escapeHtml(rowId) + '" data-form-subunit-existing-description-id="' + escapeHtml(attachmentId) + '" rows="2" maxlength="500" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs">' + escapeHtml(attachment.beskrivelse || '') + '</textarea>',
          '  <div class="mt-1 flex flex-wrap gap-2">',
          attachment.erBilde ? ('    <button type="button" data-form-subunit-set-main-row="' + escapeHtml(rowId) + '" data-form-subunit-set-main-id="' + escapeHtml(attachmentId) + '" class="min-h-11 rounded-lg border px-2 py-1 text-xs ' + (isMainImage ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-700') + '">' + (isMainImage ? 'Hovedbilde valgt' : 'Velg som hovedbilde') + '</button>') : '',
          '    <button type="button" data-form-subunit-remove-existing-row="' + escapeHtml(rowId) + '" data-form-subunit-remove-existing-id="' + escapeHtml(attachmentId) + '" class="min-h-11 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">Fjern kobling</button>',
          '  </div>',
          '</li>'
        ].join('');
      }).join('')
      : '<li class="rounded-lg border border-dashed border-slate-300 bg-white p-2 text-xs text-slate-600">Ingen eksisterende vedlegg på underenheten.</li>';
    var pendingHtml = pendingAttachments.length
      ? pendingAttachments.map(function (upload, pendingIndex) {
        return [
          '<li class="rounded-lg border border-slate-200 bg-white p-2">',
          '  <p class="break-words text-xs font-medium text-slate-800">' + escapeHtml(upload.fileName || 'Fil') + '</p>',
          '  <input data-form-subunit-pending-title-row="' + escapeHtml(rowId) + '" data-form-subunit-pending-title-index="' + escapeHtml(String(pendingIndex)) + '" value="' + escapeHtml(upload.tittel || '') + '" maxlength="140" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs" />',
          '  <textarea data-form-subunit-pending-description-row="' + escapeHtml(rowId) + '" data-form-subunit-pending-description-index="' + escapeHtml(String(pendingIndex)) + '" rows="2" maxlength="500" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs">' + escapeHtml(upload.beskrivelse || '') + '</textarea>',
          '  <button type="button" data-form-subunit-remove-pending-row="' + escapeHtml(rowId) + '" data-form-subunit-remove-pending-index="' + escapeHtml(String(pendingIndex)) + '" class="mt-1 min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-800">Fjern</button>',
          '</li>'
        ].join('');
      }).join('')
      : '<li class="rounded-lg border border-dashed border-slate-300 bg-white p-2 text-xs text-slate-600">Ingen nye vedlegg i kø.</li>';
    return [
      '<li class="rounded-lg border border-slate-200 bg-white p-3">',
      '  <input type="hidden" data-form-subunit-id-index="' + escapeHtml(String(index)) + '" value="' + escapeHtml(hiddenId) + '" />',
      '  <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Type',
      '      <select data-form-subunit-type-index="' + escapeHtml(String(index)) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
      '        <option value="">Velg type</option>',
      '        <option value="variant"' + (type === 'variant' ? ' selected' : '') + '>Variant</option>',
      '        <option value="medfolgende"' + (type === 'medfolgende' ? ' selected' : '') + '>Medfølgende</option>',
      '      </select>',
      '    </label>',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Navn',
      '      <input data-form-subunit-navn-index="' + escapeHtml(String(index)) + '" type="text" value="' + escapeHtml(navn) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
      '    </label>',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Antall',
      '      <input data-form-subunit-antall-index="' + escapeHtml(String(index)) + '" type="number" min="0" step="1" inputmode="numeric" value="' + escapeHtml(antall) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
      '    </label>',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Status',
      '      <select data-form-subunit-status-index="' + escapeHtml(String(index)) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + statusSelectOptions + '</select>',
      '    </label>',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Tilstand',
      '      <select data-form-subunit-tilstand-index="' + escapeHtml(String(index)) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + tilstandSelectOptions + '</select>',
      '    </label>',
      '    <button type="button" data-form-subunit-remove-index="' + escapeHtml(String(index)) + '" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Fjern</button>',
      '  </div>',
      '  <label class="mt-2 grid gap-1 text-xs font-medium text-slate-700">Beskrivelse (valgfri)',
      '    <textarea data-form-subunit-beskrivelse-index="' + escapeHtml(String(index)) + '" rows="2" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + escapeHtml(beskrivelse) + '</textarea>',
      '  </label>',
      '  <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">',
      '    <p class="text-xs font-semibold uppercase tracking-wide text-slate-700">Vedlegg på underenhet</p>',
      '    <div class="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">',
      '      <input data-form-subunit-attachment-input-row="' + escapeHtml(rowId) + '" type="file" multiple class="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />',
      '      <button type="button" data-form-subunit-attachment-add-row="' + escapeHtml(rowId) + '" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark">Legg til vedlegg</button>',
      '    </div>',
      '    <ul class="mt-2 space-y-2">' + existingHtml + '</ul>',
      '    <ul class="mt-2 space-y-2">' + pendingHtml + '</ul>',
      '  </div>',
      '</li>'
    ].join('');
  }).join('');
}

function buildSubunitSelectOptions(values, selectedValue, placeholder) {
  var cleanValues = Array.isArray(values) ? values : [];
  var currentValue = String(selectedValue || '').trim();
  var hasCurrentValue = cleanValues.indexOf(currentValue) !== -1;
  var options = ['<option value="">' + escapeHtml(placeholder) + '</option>']
    .concat(cleanValues.map(function (value) {
      var selected = value === currentValue ? ' selected' : '';
      return '<option value="' + escapeHtml(value) + '"' + selected + '>' + escapeHtml(value) + '</option>';
    }));
  if (currentValue && !hasCurrentValue) {
    options.push('<option value="' + escapeHtml(currentValue) + '" selected disabled>' + escapeHtml(currentValue + ' (deaktivert)') + '</option>');
  }
  return options.join('');
}

function normalizeInventoryAttributeRows(attributes) {
  if (!Array.isArray(attributes)) {
    return [];
  }
  return attributes.map(function (attribute) {
    var typeId = String(attribute && (attribute.definitionId || attribute.definisjonId || attribute.typeId || attribute.id) || '').trim();
    var value = String(attribute && (attribute.verdi || attribute.value) || '').trim();
    if (!typeId && !value) {
      return null;
    }
    var typeName = String(attribute && (attribute.navn || attribute.label || attribute.typeName) || '').trim();
    return { definitionId: typeId, verdi: value, navn: typeName };
  }).filter(function (attribute) {
    return !!attribute;
  });
}

function renderInventoryAttributeRows() {
  var listEl = document.getElementById('inventory-form-attributter-list');
  var emptyEl = document.getElementById('inventory-form-attributter-empty');
  var addButtonEl = document.getElementById('inventory-form-attributter-add-button');
  if (!listEl || !emptyEl || !addButtonEl) {
    return;
  }
  var activeTypes = getMasterdataEntries('attributttype', false);
  var hasTypes = activeTypes.length > 0;
  emptyEl.classList.toggle('hidden', hasTypes);
  addButtonEl.disabled = !hasTypes;

  if (!Array.isArray(state.formState.attributeRows)) {
    state.formState.attributeRows = [];
  }
  listEl.innerHTML = state.formState.attributeRows.map(function (row, index) {
    var selected = String(row && row.definitionId || '').trim();
    var selectedName = String(row && row.navn || '').trim();
    var value = String(row && row.verdi || '').trim();
    var usedMap = {};
    for (var i = 0; i < state.formState.attributeRows.length; i += 1) {
      if (i === index) continue;
      var usedId = String(state.formState.attributeRows[i] && state.formState.attributeRows[i].definitionId || '').trim();
      if (usedId) usedMap[usedId] = true;
    }
    var options = ['<option value="">Velg attributttype</option>'];
    for (var typeIndex = 0; typeIndex < activeTypes.length; typeIndex += 1) {
      var typeEntry = activeTypes[typeIndex];
      var optionValue = String(typeEntry.id || typeEntry.value || '').trim();
      if (!optionValue) continue;
      var disabled = usedMap[optionValue] ? ' disabled' : '';
      var isSelected = selected === optionValue ? ' selected' : '';
      options.push('<option value="' + escapeHtml(optionValue) + '"' + disabled + isSelected + '>' + escapeHtml(typeEntry.value) + '</option>');
    }
    if (selected && activeTypes.every(function (entry) { return String(entry.id || entry.value || '').trim() !== selected; })) {
      options.push('<option value="' + escapeHtml(selected) + '" selected>' + escapeHtml(selectedName || selected) + ' (inaktiv/ugyldig)</option>');
    }
    var duplicateClass = selected && usedMap[selected] ? ' border-rose-300 bg-rose-50' : '';
    var duplicateHelp = selected && usedMap[selected]
      ? '<p class="mt-1 text-xs text-rose-800">Denne attributttypen er allerede brukt på varen.</p>'
      : '';
    return [
      '<li class="rounded-lg border border-slate-200 bg-white p-3">',
      '  <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Attributttype',
      '      <select data-form-attribute-type-index="' + escapeHtml(String(index)) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark' + duplicateClass + '">' + options.join('') + '</select>',
      duplicateHelp,
      '    </label>',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Attributtverdi',
      '      <input data-form-attribute-value-index="' + escapeHtml(String(index)) + '" type="text" value="' + escapeHtml(value) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
      '    </label>',
      '    <button type="button" data-form-attribute-remove-index="' + escapeHtml(String(index)) + '" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Fjern</button>',
      '  </div>',
      '</li>'
    ].join('');
  }).join('');
}

function renderAnsvarligSelectOptions() {
  const selectEl = document.getElementById('form-ansvarlig');
  const helperEl = document.getElementById('form-ansvarlig-help');
  if (!selectEl) {
    return;
  }
  const aktiveAnsvarlige = getMasterdataValues('ansvarlig');
  const currentValue = String(selectEl.value || '').trim();
  const detailValue = state.detailItem ? String(state.detailItem.ansvarlig || '').trim() : '';
  const fallbackValue = currentValue || detailValue;
  const hasInvalidCurrent = !!fallbackValue && aktiveAnsvarlige.indexOf(fallbackValue) === -1;
  const options = ['<option value="">Velg ansvarlig</option>'];

  if (hasInvalidCurrent) {
    options.push('<option value="' + escapeHtml(fallbackValue) + '">' + escapeHtml(fallbackValue) + ' (inaktiv/ugyldig – velg ny)</option>');
  }
  for (let i = 0; i < aktiveAnsvarlige.length; i += 1) {
    const value = aktiveAnsvarlige[i];
    options.push('<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>');
  }
  selectEl.innerHTML = options.join('');

  if (hasInvalidCurrent) {
    selectEl.value = fallbackValue;
  } else if (aktiveAnsvarlige.indexOf(currentValue) !== -1) {
    selectEl.value = currentValue;
  } else if (aktiveAnsvarlige.indexOf(detailValue) !== -1) {
    selectEl.value = detailValue;
  } else {
    selectEl.value = '';
  }

  if (helperEl) {
    if (!aktiveAnsvarlige.length) {
      helperEl.textContent = 'Ingen aktive ansvarlige er tilgjengelig i masterdata. Opprett eller aktiver en verdi i Innstillinger.';
      helperEl.className = 'text-xs text-amber-800 sm:col-span-2';
      return;
    }
    if (hasInvalidCurrent) {
      helperEl.textContent = 'Lagret ansvarlig er inaktiv eller ugyldig. Velg en ny gyldig ansvarlig før lagring.';
      helperEl.className = 'text-xs text-amber-800 sm:col-span-2';
      return;
    }
    helperEl.textContent = 'Velg ansvarlig fra masterdata.';
    helperEl.className = 'text-xs text-slate-600 sm:col-span-2';
  }
}

function getSelectedArrangementValuesFromElement(selectEl) {
  if (!selectEl || !selectEl.options) {
    return [];
  }
  var values = [];
  for (var i = 0; i < selectEl.options.length; i += 1) {
    var option = selectEl.options[i];
    if (option.selected) {
      var value = String(option.value || '').trim();
      if (value) {
        values.push(value);
      }
    }
  }
  return values;
}

function renderArrangementSelectOptions(selectedValues) {
  var selectEl = document.getElementById('form-arrangementer');
  var helperEl = document.getElementById('form-arrangementer-help');
  if (!selectEl) {
    return;
  }
  var selected = Array.isArray(selectedValues) ? selectedValues : getSelectedArrangementValuesFromElement(selectEl);
  var aktiveArrangement = getMasterdataValues('arrangement');
  var invalidSelected = selected.filter(function (value) {
    return aktiveArrangement.indexOf(value) === -1;
  });
  var options = [];

  for (var invalidIndex = 0; invalidIndex < invalidSelected.length; invalidIndex += 1) {
    var invalidValue = invalidSelected[invalidIndex];
    options.push('<option value="' + escapeHtml(invalidValue) + '">' + escapeHtml(invalidValue) + ' (inaktiv/ugyldig – fjern før lagring)</option>');
  }
  for (var activeIndex = 0; activeIndex < aktiveArrangement.length; activeIndex += 1) {
    var activeValue = aktiveArrangement[activeIndex];
    options.push('<option value="' + escapeHtml(activeValue) + '">' + escapeHtml(activeValue) + '</option>');
  }
  selectEl.innerHTML = options.join('');

  for (var optionIndex = 0; optionIndex < selectEl.options.length; optionIndex += 1) {
    var option = selectEl.options[optionIndex];
    option.selected = selected.indexOf(String(option.value || '').trim()) !== -1;
  }

  if (helperEl) {
    if (!aktiveArrangement.length) {
      helperEl.textContent = 'Ingen aktive arrangementer er tilgjengelig i masterdata. Opprett eller aktiver en verdi i Innstillinger.';
      helperEl.className = 'text-xs text-amber-800 sm:col-span-2';
      return;
    }
    if (invalidSelected.length) {
      helperEl.textContent = 'Lagret arrangement inneholder inaktive/ugyldige verdier. Fjern disse før lagring.';
      helperEl.className = 'text-xs text-amber-800 sm:col-span-2';
      return;
    }
    helperEl.textContent = 'Velg ett eller flere arrangementer fra masterdata (Ctrl/Cmd + klikk for flere valg).';
    helperEl.className = 'text-xs text-slate-600 sm:col-span-2';
  }
}

function renderInventoryFormChips() {
  const form = document.getElementById('inventory-form');
  if (!form || !form.elements) {
    return;
  }
  const statusPreviewEl = document.getElementById('form-status-chip-preview');
  const tilstandPreviewEl = document.getElementById('form-tilstand-chip-preview');
  const statusValue = String(form.elements.status && form.elements.status.value || '').trim();
  const tilstandValue = String(form.elements.tilstand && form.elements.tilstand.value || '').trim();
  if (statusPreviewEl) {
    statusPreviewEl.innerHTML = renderMasterdataChip('status', statusValue);
  }
  if (tilstandPreviewEl) {
    tilstandPreviewEl.innerHTML = renderMasterdataChip('tilstand', tilstandValue);
  }
}

function renderInventoryFormAccordionState() {
  ensureInventoryFormAccordionSection();
  var sectionIds = ['media', 'offentligVisning', 'underenheter', 'attributter'];
  for (var i = 0; i < sectionIds.length; i += 1) {
    var sectionId = sectionIds[i];
    var buttonEl = document.querySelector('[data-inventory-form-accordion-toggle="' + sectionId + '"]');
    var panelEl = document.getElementById('inventory-form-accordion-panel-' + sectionId);
    if (!buttonEl || !panelEl) {
      continue;
    }
    var isOpen = state.inventoryFormAccordionOpenSection === sectionId;
    buttonEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panelEl.classList.toggle('hidden', !isOpen);
    var iconEl = buttonEl.querySelector('[data-inventory-form-accordion-icon]');
    if (iconEl) {
      iconEl.classList.toggle('rotate-180', isOpen);
      iconEl.classList.toggle('text-slate-600', isOpen);
      iconEl.classList.toggle('text-slate-500', !isOpen);
    }
  }
}

function getAdminTypeMeta(type) {
  const mapping = {
    status: 'Status',
    tilstand: 'Tilstand',
    kategori: 'Kategori',
    plassering: 'Plassering',
    arrangement: 'Arrangement',
    ansvarlig: 'Ansvarlig',
    attributttype: 'Attributttyper',
    brukeradministrasjon: 'Brukeradministrasjon'
  };
  return mapping[type] || type;
}

function getAdminNavigationTypes() {
  return ['status', 'tilstand', 'kategori', 'plassering', 'arrangement', 'ansvarlig', 'attributttype'];
}

function isMasterdataAdminType(type) {
  return ['status', 'tilstand', 'kategori', 'plassering', 'arrangement', 'ansvarlig', 'attributttype'].indexOf(type) !== -1;
}

function getAdminTypeHelpText(type) {
  var labels = {
    status: 'Brukes som synlig statuschip på varer og i filtrering.',
    tilstand: 'Brukes som tilstandschip og kvalitetssignal i lageroversikten.',
    kategori: 'Brukes for gruppering og filtrering av lagervarer.',
    plassering: 'Brukes for å vise og filtrere hvor varen befinner seg.',
    arrangement: 'Brukes for kobling mot arrangement og flerfilter i lagerlisten.',
    ansvarlig: 'Brukes for styrt valg av ansvarlig ved oppretting og redigering.',
    attributttype: 'Brukes for styring av hvilke attributter som kan registreres.',
    brukeradministrasjon: 'Administrer brukere, roller og aktivstatus i en separat arbeidsflate.'
  };
  return labels[type] || 'Administrer verdier for valgt datatype.';
}

function getActiveSettingsSubpage(route) {
  if (route === 'import') {
    return 'import';
  }
  if (route === 'lantakere' || route === 'lantakerNy') {
    return 'lantakere';
  }
  if (route === 'brukeradministrasjon') {
    return 'brukeradministrasjon';
  }
  return 'admin';
}

function renderSettingsSubpageNavigationState() {
  var activeSubpage = getActiveSettingsSubpage(state.route);
  var buttonEls = document.querySelectorAll('[data-settings-subpage-target]');
  Array.prototype.forEach.call(buttonEls, function (buttonEl) {
    var target = String(buttonEl.getAttribute('data-settings-subpage-target') || '').trim();
    buttonEl.className = target === activeSubpage
      ? SETTINGS_SUBPAGE_BUTTON_ACTIVE_CLASSES
      : SETTINGS_SUBPAGE_BUTTON_INACTIVE_CLASSES;
  });
}

function ensureAdminOpenTypeState() {
  if (!state.admin) {
    state.admin = {};
  }
  if (typeof state.admin.openType !== 'string') {
    state.admin.openType = '';
  }
}

function renderAdminPanel() {
  const panelEl = document.getElementById('admin-panel');
  const accordionListEl = document.getElementById('admin-type-accordion-list');
  const masterdataPanelEl = document.getElementById('admin-masterdata-panel');
  const userManagementPanelEl = document.getElementById('admin-user-management-panel');
  if (!panelEl || !masterdataPanelEl || !accordionListEl || !userManagementPanelEl) {
    return;
  }

  if ((state.route !== 'admin' && state.route !== 'brukeradministrasjon') || !canAccessAdminWorkspace()) {
    panelEl.classList.add('hidden');
    return;
  }
  panelEl.classList.remove('hidden');
  ensureAdminOpenTypeState();
  var showMasterdataPanel = state.route === 'admin';
  masterdataPanelEl.classList.toggle('hidden', !showMasterdataPanel);
  userManagementPanelEl.classList.toggle('hidden', showMasterdataPanel);
  if (!showMasterdataPanel) {
    renderAdminUsersPanel();
    return;
  }
  const types = getAdminNavigationTypes();
  const openType = String(state.admin.openType || '').trim();
  accordionListEl.innerHTML = types.map(function (type) {
    const isOpen = openType === type;
    return [
      '<section class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">',
      '  <h3>',
      '    <button type="button" data-admin-type-accordion-toggle="' + escapeHtml(type) + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="admin-type-accordion-panel-' + escapeHtml(type) + '" class="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
      '      <span>' + escapeHtml(getAdminTypeMeta(type)) + '</span>',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5 text-slate-500 transition-transform duration-200' + (isOpen ? ' rotate-180' : '') + '" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
      '    </button>',
      '  </h3>',
      '  <div id="admin-type-accordion-panel-' + escapeHtml(type) + '" class="' + (isOpen ? 'border-t border-slate-200 px-4 py-4' : 'hidden') + '"></div>',
      '</section>'
    ].join('');
  }).join('');

  state.admin.activeType = openType || state.admin.activeType;
  renderAdminOpenTypePanel();
}

function renderAdminOpenTypePanel() {
  var activeType = String(state.admin.openType || '').trim();
  if (!activeType) {
    return;
  }
  var panelEl = document.getElementById('admin-type-accordion-panel-' + activeType);
  if (!panelEl) {
    return;
  }
  var supportsChipMeta = isChipManagedMasterdataType(activeType);
  var entries = getMasterdataEntries(activeType, true);
  var editingEntryId = String(state.admin.editingEntryId || '').trim();
  var editingEntry = editingEntryId ? getMasterdataEntryById(activeType, editingEntryId) : null;
  var editKey = activeType + '::' + editingEntryId;
  var entryMarkup = entries.length
    ? entries.map(function (entry) {
      const value = String(entry.value || '');
      const entryId = String(entry.id || value);
      const rowEditKey = activeType + '::' + entryId;
      const editColorToken = Object.prototype.hasOwnProperty.call(state.admin.editColorTokens, rowEditKey)
        ? normalizeChipColorToken(state.admin.editColorTokens[rowEditKey])
        : normalizeChipColorToken(entry.colorToken || '');
      const editSortOrder = Object.prototype.hasOwnProperty.call(state.admin.editSortOrders, rowEditKey)
        ? state.admin.editSortOrders[rowEditKey]
        : String(entry.sortOrder != null ? entry.sortOrder : 99);
      const activeLabel = entry.isActive === false
        ? '<span class="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">Inaktiv</span>'
        : '<span class="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900">Aktiv</span>';
      const previewChip = supportsChipMeta ? renderMasterdataChip(activeType, value) : '';
      return '<li class="border-b border-slate-200 py-3 last:border-b-0"><div class="flex flex-wrap items-start justify-between gap-3"><div class="min-w-0 space-y-1.5"><p class="text-sm font-semibold text-slate-900 break-words">' + escapeHtml(value) + '</p><div class="flex flex-wrap items-center gap-2 text-xs text-slate-600">' + activeLabel + (supportsChipMeta ? ('<span>Visning: ' + previewChip + '</span>') : '') + '</div><div class="flex flex-wrap items-center gap-2 text-xs text-slate-600">' + (supportsChipMeta ? ('<span>Fargetoken: ' + escapeHtml(editColorToken || 'standard') + '</span><span aria-hidden="true">·</span><span>Sortering: ' + escapeHtml(editSortOrder) + '</span>') : '<span>Sortering: ' + escapeHtml(editSortOrder) + '</span>') + '</div></div><div class="flex flex-wrap items-center gap-2 sm:justify-end"><button type="button" data-admin-start-edit-id="' + escapeHtml(entryId) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Rediger</button><button type="button" data-admin-delete-id="' + escapeHtml(entryId) + '" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Deaktiver</button></div></div></li>';
    }).join('')
    : '<li class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">Ingen verdier registrert for valgt type.</li>';

  var editMarkup = '';
  if (editingEntry) {
    var editColorToken = Object.prototype.hasOwnProperty.call(state.admin.editColorTokens, editKey)
      ? normalizeChipColorToken(state.admin.editColorTokens[editKey])
      : normalizeChipColorToken(editingEntry.colorToken || '');
    var editSortOrder = Object.prototype.hasOwnProperty.call(state.admin.editSortOrders, editKey)
      ? String(state.admin.editSortOrders[editKey] || '')
      : String(editingEntry.sortOrder != null ? editingEntry.sortOrder : 99);
    var editIsActive = Object.prototype.hasOwnProperty.call(state.admin.editIsActive, editKey)
      ? readAdminBooleanInput(state.admin.editIsActive[editKey], true)
      : editingEntry.isActive !== false;
    editMarkup = '<section class="mt-3 rounded-xl border border-hulBlue/30 bg-hulBlueSoft/30 p-3"><p id="admin-edit-context" class="text-sm text-slate-700">Redigerer: ' + escapeHtml(String(editingEntry.value || '')) + '</p><div class="mt-2 grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center"><input id="admin-edit-input" type="text" value="' + escapeHtml(Object.prototype.hasOwnProperty.call(state.admin.editValues, editKey) ? String(state.admin.editValues[editKey] || '') : String(editingEntry.value || '')) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><button id="admin-edit-update-button" type="button" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Oppdater</button><button id="admin-edit-cancel-button" type="button" class="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Avbryt</button></div><div id="admin-edit-meta-fields" class="mt-2 ' + (supportsChipMeta ? 'grid gap-2 sm:grid-cols-3' : 'hidden') + '"><label class="grid gap-1 text-xs font-medium text-slate-700">Fargetoken<select id="admin-edit-color-token" data-admin-edit-color-token="" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="">Standard (reserve)</option><option value="success"' + (editColorToken === 'success' ? ' selected' : '') + '>Grønn</option><option value="warning"' + (editColorToken === 'warning' ? ' selected' : '') + '>Gul/oransje</option><option value="danger"' + (editColorToken === 'danger' ? ' selected' : '') + '>Rød</option><option value="neutral"' + (editColorToken === 'neutral' ? ' selected' : '') + '>Grå</option></select></label><label class="grid gap-1 text-xs font-medium text-slate-700">Sortering<input id="admin-edit-sort-order" data-admin-edit-sort-order="" type="number" inputmode="numeric" value="' + escapeHtml(editSortOrder) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /></label><label class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"><input id="admin-edit-is-active" data-admin-edit-is-active="" type="checkbox" class="h-4 w-4"' + (editIsActive ? ' checked' : '') + ' />Aktiv verdi</label></div></section>';
  }

  var addMetaMarkup = '';
  if (supportsChipMeta) {
    addMetaMarkup = '<div id="admin-add-meta-fields" class="mt-2 grid gap-2 sm:grid-cols-3"><label class="grid gap-1 text-xs font-medium text-slate-700">Fargetoken<select id="admin-add-color-token" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><option value="">Standard (reserve)</option><option value="success"' + (normalizeChipColorToken(state.admin.addColorToken || '') === 'success' ? ' selected' : '') + '>Grønn</option><option value="warning"' + (normalizeChipColorToken(state.admin.addColorToken || '') === 'warning' ? ' selected' : '') + '>Gul/oransje</option><option value="danger"' + (normalizeChipColorToken(state.admin.addColorToken || '') === 'danger' ? ' selected' : '') + '>Rød</option><option value="neutral"' + (normalizeChipColorToken(state.admin.addColorToken || '') === 'neutral' ? ' selected' : '') + '>Grå</option></select></label><label class="grid gap-1 text-xs font-medium text-slate-700">Sortering<input id="admin-add-sort-order" type="number" inputmode="numeric" value="' + escapeHtml(String(state.admin.addSortOrder || '99')) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /></label><label class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"><input id="admin-add-is-active" type="checkbox" class="h-4 w-4"' + (readAdminBooleanInput(state.admin.addIsActive, true) ? ' checked' : '') + ' />Aktiv verdi</label></div>';
  }
  panelEl.innerHTML = '<p class="text-sm text-slate-700">' + escapeHtml(getAdminTypeHelpText(activeType)) + '</p><div class="mt-3 grid gap-2"><label class="text-sm font-medium text-slate-700" for="admin-add-input">Ny verdi</label><div class="flex flex-wrap gap-2"><input id="admin-add-input" type="text" value="' + escapeHtml(String(state.admin.addValue || '')) + '" class="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" /><button id="admin-add-button" type="button" class="min-h-11 rounded-lg bg-hulBlue px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Opprett ny ' + escapeHtml(getAdminTypeMeta(activeType).toLowerCase()) + '</button></div>' + addMetaMarkup + '</div><ul id="admin-values-list" class="mt-3">' + entryMarkup + '</ul>' + editMarkup;
}

function renderAdminUsersPanel() {
  var panelEl = document.getElementById('admin-user-panel');
  var listEl = document.getElementById('admin-user-list');
  var displayNameEl = document.getElementById('admin-user-display-name');
  var usernameEl = document.getElementById('admin-user-username');
  var roleEl = document.getElementById('admin-user-role');
  var activeEl = document.getElementById('admin-user-active');
  if (!panelEl || !listEl || !displayNameEl || !usernameEl || !roleEl || !activeEl) return;
  if (!canManageUserAdmin() || state.route !== 'brukeradministrasjon') {
    panelEl.classList.add('hidden');
    return;
  }
  panelEl.classList.remove('hidden');
  displayNameEl.value = String(state.userAdmin.form.displayName || '');
  usernameEl.value = String(state.userAdmin.form.username || '');
  roleEl.value = String(state.userAdmin.form.role || 'viewer');
  activeEl.checked = state.userAdmin.form.active !== false;
  if (state.userAdmin.loading) {
    listEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">Laster brukere…</li>';
    return;
  }
  if (!state.userAdmin.users.length) {
    state.userAdmin.loading = true;
    void loadAdminUsers().then(function () { renderState(); });
  }
  if (!state.userAdmin.users.length) {
    listEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">Ingen brukere funnet.</li>';
    return;
  }
  listEl.innerHTML = state.userAdmin.users.map(function (user) {
    var username = String(user.username || '');
    var edit = state.userAdmin.edit[username] || { displayName: user.displayName || '', role: user.role || 'viewer' };
    var resetDraft = String(state.userAdmin.resetDrafts[username] || '');
    var statusLabel = user.active === false ? 'Deaktivert' : 'Aktiv';
    var statusClass = user.active === false ? 'text-amber-800 bg-amber-100 border-amber-200' : 'text-emerald-800 bg-emerald-100 border-emerald-200';
    var pending = state.userAdmin.pendingStatusUsername === username;
    var statusButtons = user.active === false
      ? '<button data-user-reactivate=\"' + escapeHtml(username) + '\" class=\"min-h-11 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800\">Reaktiver</button>'
      : '<button data-user-deactivate=\"' + escapeHtml(username) + '\" class=\"min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800\">Deaktiver</button>';
    if (pending) {
      statusButtons += '<button data-user-cancel-status=\"' + escapeHtml(username) + '\" class=\"min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm\">Avbryt</button><span class=\"text-xs text-slate-600\">Bekreft ved å trykke samme handling igjen.</span>';
    }
    return [
      '<li class="rounded-lg border border-slate-200 bg-white p-3">',
      '  <div class="grid gap-2 sm:grid-cols-2">',
      '    <label class="grid gap-1 text-sm font-medium text-slate-700">Visningsnavn<input data-user-edit-display="' + escapeHtml(username) + '" value="' + escapeHtml(edit.displayName || '') + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>',
      '    <label class="grid gap-1 text-sm font-medium text-slate-700">Rolle<select data-user-edit-role="' + escapeHtml(username) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="viewer"' + (edit.role === 'viewer' ? ' selected' : '') + '>Lesebruker</option><option value="editor"' + (edit.role === 'editor' ? ' selected' : '') + '>Redaktør/drift</option><option value="admin"' + (edit.role === 'admin' ? ' selected' : '') + '>Admin</option></select></label>',
      '  </div>',
      '  <div class="mt-2 flex flex-wrap items-center gap-2"><span class="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ' + statusClass + '">' + statusLabel + '</span><span class="text-xs text-slate-600">Innlogging: ' + escapeHtml(username) + '</span><span class="text-xs text-slate-600">Sist endret: ' + escapeHtml(String(user.updatedAt || 'Ikke registrert')) + '</span></div>',
      '  <div class="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">',
      '    <label class="grid gap-1 text-sm font-medium text-slate-700">Nytt passord (minst 8 tegn)<input data-user-reset-password="' + escapeHtml(username) + '" type="password" autocomplete="new-password" value="' + escapeHtml(resetDraft) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>',
      '    <button data-user-reset-password-submit="' + escapeHtml(username) + '" class="min-h-11 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">Nullstill passord</button>',
      '  </div>',
      '  <p class="mt-1 text-xs text-slate-600">Passordnullstilling er en separat adminhandling og påvirker ikke rolle eller aktivstatus.</p>',
      '  <div class="mt-2 flex flex-wrap gap-2"><button data-user-save="' + escapeHtml(username) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark">Lagre</button>' + statusButtons + '</div>',
      '</li>'
    ].join('');
  }).join('');
}

function fillFormFromDetail() {
  const form = document.getElementById('inventory-form');
  if (!form) {
    return;
  }

  const lagervare = state.detailItem;
  const values = lagervare || {
    id: '',
    navn: '',
    kategori: getMasterdataValues('kategori')[0] || '',
    plassering: getMasterdataValues('plassering')[0] || '',
    ansvarlig: getMasterdataValues('ansvarlig')[0] || '',
    status: getMasterdataValues('status')[0] || '',
    tilstand: getMasterdataValues('tilstand')[0] || '',
    beholdning: 0,
    arrangementer: [],
    verdi: null,
    beskrivelse: ''
  };

  const sourceId = values.id || '__new__';
  if (state.formState.edited && state.formState.sourceId === sourceId) {
    return;
  }

  if (state.formState.sourceId !== sourceId) {
    state.attachmentForm.pendingUploads = [];
    state.attachmentForm.removedAttachmentIds = {};
    state.attachmentForm.updatedAttachmentIds = {};
    state.attachmentForm.existingAttachments = Array.isArray(values.vedlegg)
      ? values.vedlegg.map(normalizeDocumentRecord)
      : [];
  }

  form.elements.id.value = values.id;
  form.elements.navn.value = values.navn;
  form.elements.kategori.value = values.kategori;
  form.elements.plassering.value = values.plassering;
  form.elements.ansvarlig.value = String(values.ansvarlig || '');
  form.elements.status.value = values.status;
  form.elements.tilstand.value = values.tilstand;
  form.elements.beholdning.value = String(values.beholdning);
  renderArrangementSelectOptions(Array.isArray(values.arrangementer) ? values.arrangementer : []);
  form.elements.verdi.value = values.verdi == null ? '' : String(values.verdi);
  form.elements.beskrivelse.value = String(values.beskrivelse || '');
  var offentligVisning = normalizeInventoryPublicVisibilityForUi(values.offentligVisning || null);
  if (form.elements.offentligHovedbilde) form.elements.offentligHovedbilde.checked = !!offentligVisning.hovedbilde;
  if (form.elements.offentligVedlegg) form.elements.offentligVedlegg.checked = !!offentligVisning.vedlegg;
  if (form.elements.offentligUnderenheter) form.elements.offentligUnderenheter.checked = !!offentligVisning.underenheter;
  if (form.elements.offentligAttributter) form.elements.offentligAttributter.checked = !!offentligVisning.attributter;
  if (form.elements.offentligTilstand) form.elements.offentligTilstand.checked = !!offentligVisning.tilstand;
  state.formState.subunitRows = normalizeInventorySubunitRows(readLagervareCollection(values, ['underenheter', 'underenhet', 'subItems', 'components']));
  state.formState.attributeRows = normalizeInventoryAttributeRows(values.attributter);
  state.formState.edited = false;
  state.formState.sourceId = sourceId;
  renderInventorySubunitRows();
  renderInventoryAttributeRows();
  renderInventoryFormChips();
}

function renderInventoryFormAttachments() {
  var attachmentsPanelEl = document.getElementById('inventory-form-attachments-panel');
  var existingListEl = document.getElementById('inventory-form-existing-attachments-list');
  var pendingListEl = document.getElementById('inventory-form-pending-attachments-list');
  var addButtonEl = document.getElementById('form-attachment-add-button');
  var inputEl = document.getElementById('form-attachment-input');
  var canWrite = false;
  if (typeof canManageInventoryWrite === 'function') {
    canWrite = !!canManageInventoryWrite();
  }
  var hasSelectedItem = !!(state.detailItem && state.detailItem.id);
  var existingContainerEl = existingListEl && existingListEl.parentElement ? existingListEl.parentElement : null;

  if (attachmentsPanelEl) {
    if (canWrite) {
      attachmentsPanelEl.classList.remove('hidden');
    } else {
      attachmentsPanelEl.classList.add('hidden');
    }
  }

  if (addButtonEl) {
    addButtonEl.disabled = !canWrite;
  }

  if (inputEl) {
    inputEl.disabled = !canWrite;
  }

  if (existingContainerEl) {
    if (hasSelectedItem) {
      existingContainerEl.classList.remove('hidden');
    } else {
      existingContainerEl.classList.add('hidden');
    }
  }

  if (!existingListEl || !pendingListEl || !canWrite) {
    return;
  }

  var attachmentForm = state && state.attachmentForm ? state.attachmentForm : {};
  var removedAttachmentIds = attachmentForm.removedAttachmentIds || {};
  var existing = Array.isArray(attachmentForm.existingAttachments)
    ? attachmentForm.existingAttachments.filter(function (attachment) {
      var attachmentId = String(attachment && attachment.id || '').trim();
      return attachmentId && !removedAttachmentIds[attachmentId];
    })
    : [];
  var pending = Array.isArray(attachmentForm.pendingUploads) ? attachmentForm.pendingUploads : [];

  existingListEl.innerHTML = existing.length
    ? existing.map(function (attachment) {
      return [
        '<li class="rounded-lg border border-slate-200 bg-white p-3">',
        '  <div class="flex flex-wrap items-start justify-between gap-2">',
        '    <div class="min-w-0 flex-1">',
        '      <label class="text-xs font-medium text-slate-700" for="existing-attachment-title-' + escapeHtml(attachment.id) + '">Tittel</label>',
        '      <input id="existing-attachment-title-' + escapeHtml(attachment.id) + '" data-form-attachment-title-id="' + escapeHtml(attachment.id) + '" type="text" maxlength="140" value="' + escapeHtml(attachment.tittel || '') + '" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
        '      <label class="mt-2 block text-xs font-medium text-slate-700" for="existing-attachment-description-' + escapeHtml(attachment.id) + '">Beskrivelse</label>',
        '      <textarea id="existing-attachment-description-' + escapeHtml(attachment.id) + '" data-form-attachment-description-id="' + escapeHtml(attachment.id) + '" rows="2" maxlength="500" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + escapeHtml(attachment.beskrivelse || '') + '</textarea>',
        '      <p class="mt-1 break-words text-xs text-slate-600">' + escapeHtml((attachment.filnavn || 'Ukjent filnavn') + (attachment.mimeType ? (' · ' + attachment.mimeType) : '')) + '</p>',
        '    </div>',
        '    <button type="button" data-form-attachment-remove-existing="' + escapeHtml(attachment.id) + '" class="inline-flex min-h-11 items-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Fjern kobling</button>',
        '  </div>',
        '</li>'
      ].join('');
    }).join('')
    : '<li class="rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700">Ingen eksisterende vedlegg i valgt skjema.</li>';

  pendingListEl.innerHTML = pending.length
    ? pending.map(function (upload, index) {
      return [
        '<li class="rounded-lg border border-slate-200 bg-white p-3">',
        '  <div class="flex flex-wrap items-start justify-between gap-2">',
        '    <div class="min-w-0 flex-1">',
        '      <label class="text-xs font-medium text-slate-700" for="pending-attachment-title-' + escapeHtml(String(index)) + '">Tittel</label>',
        '      <input id="pending-attachment-title-' + escapeHtml(String(index)) + '" data-form-pending-title-index="' + escapeHtml(String(index)) + '" type="text" maxlength="140" value="' + escapeHtml(upload.tittel || '') + '" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
        '      <label class="mt-2 block text-xs font-medium text-slate-700" for="pending-attachment-description-' + escapeHtml(String(index)) + '">Beskrivelse</label>',
        '      <textarea id="pending-attachment-description-' + escapeHtml(String(index)) + '" data-form-pending-description-index="' + escapeHtml(String(index)) + '" rows="2" maxlength="500" class="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">' + escapeHtml(upload.beskrivelse || '') + '</textarea>',
        '      <p class="mt-1 break-words text-xs text-slate-600">' + escapeHtml((upload.fileName || 'Ukjent fil') + ' · ' + (upload.mimeType || 'Ukjent MIME-type') + ' · ' + formatBytes(upload.fileSize || 0)) + '</p>',
        '    </div>',
        '    <button type="button" data-form-attachment-remove-pending="' + escapeHtml(String(index)) + '" class="inline-flex min-h-11 items-center rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Fjern</button>',
        '  </div>',
        '</li>'
      ].join('');
    }).join('')
    : '<li class="rounded-lg border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700">Ingen nye vedlegg valgt.</li>';
}

function renderInventoryFormActionState() {
  var createButtonEl = document.getElementById('create-button');
  var updateButtonEl = document.getElementById('update-button');
  var isEditMode = state.formState && state.formState.mode === 'edit';
  var activeItemId = state.formState ? String(state.formState.activeItemId || '').trim() : '';
  var hasExistingItem = isEditMode && !!activeItemId;
  var canWrite = false;
  if (typeof canManageInventoryWrite === 'function') {
    canWrite = !!canManageInventoryWrite();
  }

  if (createButtonEl) {
    createButtonEl.classList.toggle('hidden', hasExistingItem || !canWrite);
  }
  if (updateButtonEl) {
    updateButtonEl.classList.toggle('hidden', !hasExistingItem || !canWrite);
  }
  console.log('inventoryForm CTA-modus:', {
    mode: isEditMode ? 'edit' : 'create',
    activeItemId: activeItemId,
    selectedInventoryId: String(state.selectedInventoryId || '').trim(),
    canWrite: canWrite
  });
}

function formatBytes(value) {
  var bytes = Number(value || 0);
  if (bytes <= 0) {
    return '0 B';
  }
  if (bytes < 1024) {
    return bytes + ' B';
  }
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function buildAttachmentTitleFromFileName(fileName) {
  var cleanName = String(fileName || '').trim();
  if (!cleanName) {
    return '';
  }
  return cleanName.replace(/\.[^.]+$/, '') || cleanName;
}

function getDocumentFileExtension(fileName) {
  var cleanName = String(fileName || '').trim().toLowerCase();
  var extensionMatch = cleanName.match(/(\.[a-z0-9]+)$/);
  return extensionMatch ? extensionMatch[1] : '';
}

function isImageDocumentUpload(file) {
  var mimeType = String(file && file.type || '').trim().toLowerCase();
  if (mimeType.indexOf('image/') === 0) {
    return true;
  }
  var extension = getDocumentFileExtension(file && file.name);
  return !!DOCUMENT_UPLOAD_COMPRESSIBLE_IMAGE_EXTENSIONS[extension];
}

function isCompressibleImageDocumentUpload(file) {
  var mimeType = String(file && file.type || '').trim().toLowerCase();
  var extension = getDocumentFileExtension(file && file.name);
  return !!DOCUMENT_UPLOAD_COMPRESSIBLE_IMAGE_MIME_TYPES[mimeType] || !!DOCUMENT_UPLOAD_COMPRESSIBLE_IMAGE_EXTENSIONS[extension];
}

function loadImageElementFromFile(file) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error('Mangler fil for bildekomprimering.'));
      return;
    }
    var imageUrl = URL.createObjectURL(file);
    var image = new Image();
    image.onload = function () {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = function () {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Kunne ikke lese bildefil for komprimering.'));
    };
    image.src = imageUrl;
  });
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (blob) {
      if (!blob) {
        reject(new Error('Kunne ikke komprimere bildefilen.'));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });
}

function buildCompressedImageFileName(fileName, mimeType) {
  var cleanName = String(fileName || '').trim();
  if (!cleanName) {
    return 'vedlegg-komprimert';
  }
  var extensionByMime = mimeType === 'image/jpeg'
    ? '.jpg'
    : mimeType === 'image/png'
    ? '.png'
    : '.webp';
  var baseName = cleanName.replace(/\.[^.]+$/, '');
  return baseName + extensionByMime;
}

async function compressImageForDocumentUpload(file) {
  var sourceImage = await loadImageElementFromFile(file);
  var naturalWidth = Math.max(1, Number(sourceImage.naturalWidth || sourceImage.width || 1));
  var naturalHeight = Math.max(1, Number(sourceImage.naturalHeight || sourceImage.height || 1));
  var largestDimension = Math.max(naturalWidth, naturalHeight);
  var scale = largestDimension > DOCUMENT_UPLOAD_IMAGE_COMPRESSION_MAX_DIMENSION
    ? (DOCUMENT_UPLOAD_IMAGE_COMPRESSION_MAX_DIMENSION / largestDimension)
    : 1;
  var targetWidth = Math.max(1, Math.floor(naturalWidth * scale));
  var targetHeight = Math.max(1, Math.floor(naturalHeight * scale));

  var canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  var context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Nettleseren støtter ikke bildekomprimering.');
  }
  context.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

  var sourceMimeType = String(file.type || '').trim().toLowerCase();
  var outputMimeType = DOCUMENT_UPLOAD_CANVAS_OUTPUT_MIME_TYPES[sourceMimeType]
    ? sourceMimeType
    : 'image/jpeg';
  var blob = await canvasToBlob(canvas, outputMimeType, DOCUMENT_UPLOAD_IMAGE_COMPRESSION_QUALITY);
  return new File([blob], buildCompressedImageFileName(file.name, outputMimeType), {
    type: outputMimeType,
    lastModified: Date.now()
  });
}

async function prepareDocumentUploadFile(file) {
  if (file.size <= DOCUMENT_UPLOAD_MAX_FILE_SIZE_BYTES) {
    return { ok: true, file: file, wasCompressed: false };
  }
  if (!isImageDocumentUpload(file)) {
    return {
      ok: false,
      message: 'Filen «' + file.name + '» er for stor. Maks tillatt størrelse er 5 MB.'
    };
  }
  if (!isCompressibleImageDocumentUpload(file)) {
    return {
      ok: false,
      message: 'Bildet «' + file.name + '» er over 5 MB og kan ikke komprimeres automatisk. Velg JPG, PNG, WebP, HEIC eller HEIF.'
    };
  }

  var compressedFile = null;
  try {
    compressedFile = await compressImageForDocumentUpload(file);
  } catch (_compressionError) {
    return {
      ok: false,
      message: 'Bildet «' + file.name + '» kunne ikke komprimeres i denne nettleseren. Prøv å konvertere til JPG/PNG/WebP før opplasting.'
    };
  }
  if (compressedFile.size > DOCUMENT_UPLOAD_MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: 'Bildet «' + file.name + '» er fortsatt for stort etter komprimering. Maks tillatt størrelse er 5 MB.'
    };
  }

  return {
    ok: true,
    file: compressedFile,
    wasCompressed: true
  };
}

async function queueInventoryFormAttachmentsFromInput() {
  var inputEl = document.getElementById('form-attachment-input');
  if (!inputEl || !inputEl.files || !inputEl.files.length) {
    state.writeError = 'Velg minst én fil før du legger til vedlegg.';
    renderState();
    return;
  }

  state.writeError = '';
  state.writeSuccess = '';
  var files = Array.prototype.slice.call(inputEl.files);
  var preparedUploads = [];
  var compressedCount = 0;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!isSupportedDocumentUpload(file)) {
      state.writeError = 'Ugyldig filtype for «' + file.name + '». Tillatte formater er bilder, PDF og Office-filer.';
      renderState();
      return;
    }
    if (isImageDocumentUpload(file) && file.size > DOCUMENT_UPLOAD_MAX_FILE_SIZE_BYTES) {
      state.writeSuccess = 'Komprimerer bilde «' + file.name + '» før opplasting...';
      renderState();
    }
    var preparedFileResult = await prepareDocumentUploadFile(file);
    if (!preparedFileResult.ok) {
      state.writeError = preparedFileResult.message || 'Kunne ikke klargjøre vedlegget for opplasting.';
      state.writeSuccess = '';
      renderState();
      return;
    }
    if (preparedFileResult.wasCompressed) {
      compressedCount += 1;
    }
    var uploadFile = preparedFileResult.file;
    var base64Content = await fileToBase64(uploadFile);
    preparedUploads.push({
      fileName: uploadFile.name,
      tittel: buildAttachmentTitleFromFileName(uploadFile.name),
      beskrivelse: '',
      mimeType: String(uploadFile.type || '').trim().toLowerCase(),
      base64Data: base64Content,
      fileSize: Number(uploadFile.size || 0)
    });
  }

  preparedUploads.forEach(function (upload) {
    state.attachmentForm.pendingUploads.push(upload);
  });
  inputEl.value = '';
  state.writeSuccess = preparedUploads.length + ' vedlegg lagt til i kø.' + (compressedCount > 0 ? (' ' + compressedCount + ' bilde(r) ble komprimert før opplasting.') : '');
  renderState();
}

function findSubunitRowByRowId(rowId) {
  var cleanRowId = String(rowId || '').trim();
  var rows = Array.isArray(state.formState.subunitRows) ? state.formState.subunitRows : [];
  for (var i = 0; i < rows.length; i += 1) {
    if (String(rows[i] && rows[i].rowId || '').trim() === cleanRowId) {
      return rows[i];
    }
  }
  return null;
}

async function queueSubunitAttachmentsFromInput(rowId) {
  var cleanRowId = String(rowId || '').trim();
  if (!cleanRowId) return;
  var row = findSubunitRowByRowId(cleanRowId);
  if (!row) return;
  var inputEl = document.querySelector('[data-form-subunit-attachment-input-row=\"' + cleanRowId.replace(/\"/g, '') + '\"]');
  if (!inputEl || !inputEl.files || !inputEl.files.length) {
    state.writeError = 'Velg minst én fil før du legger til vedlegg på underenhet.';
    renderState();
    return;
  }
  row.pendingAttachments = Array.isArray(row.pendingAttachments) ? row.pendingAttachments : [];
  var files = Array.prototype.slice.call(inputEl.files);
  for (var i = 0; i < files.length; i += 1) {
    var file = files[i];
    if (!isSupportedDocumentUpload(file)) {
      state.writeError = 'Ugyldig filtype for «' + file.name + '».';
      renderState();
      return;
    }
    var preparedFileResult = await prepareDocumentUploadFile(file);
    if (!preparedFileResult.ok) {
      state.writeError = preparedFileResult.message || 'Kunne ikke klargjøre vedlegget for opplasting.';
      renderState();
      return;
    }
    var uploadFile = preparedFileResult.file;
    var base64Content = await fileToBase64(uploadFile);
    row.pendingAttachments.push({
      fileName: uploadFile.name,
      tittel: buildAttachmentTitleFromFileName(uploadFile.name),
      beskrivelse: '',
      mimeType: String(uploadFile.type || '').trim().toLowerCase(),
      base64Data: base64Content,
      fileSize: Number(uploadFile.size || 0)
    });
  }
  inputEl.value = '';
  state.formState.edited = true;
  state.writeError = '';
  renderInventorySubunitRows();
}

function parseInventoryForm() {
  const form = document.getElementById('inventory-form');
  if (!form) {
    return null;
  }

  const arrangementer = getSelectedArrangementValuesFromElement(form.elements.arrangementer);

  return {
    id: String(form.elements.id.value || '').trim(),
    navn: String(form.elements.navn.value || '').trim(),
    kategori: String(form.elements.kategori.value || '').trim(),
    plassering: String(form.elements.plassering.value || '').trim(),
    ansvarlig: String(form.elements.ansvarlig.value || '').trim(),
    status: String(form.elements.status.value || '').trim(),
    tilstand: String(form.elements.tilstand.value || '').trim(),
    beholdning: Number(form.elements.beholdning.value || 0),
    arrangementer: arrangementer,
    verdi: String(form.elements.verdi.value || '').trim(),
    beskrivelse: String(form.elements.beskrivelse.value || '').trim(),
    offentligVisning: {
      hovedbilde: !!(form.elements.offentligHovedbilde && form.elements.offentligHovedbilde.checked),
      vedlegg: !!(form.elements.offentligVedlegg && form.elements.offentligVedlegg.checked),
      underenheter: !!(form.elements.offentligUnderenheter && form.elements.offentligUnderenheter.checked),
      attributter: !!(form.elements.offentligAttributter && form.elements.offentligAttributter.checked),
      tilstand: !!(form.elements.offentligTilstand && form.elements.offentligTilstand.checked)
    },
    underenheter: normalizeInventorySubunitRows(state.formState.subunitRows).map(function (row) {
      var antall = Number(String(row.antall || '').trim());
      return {
        rowId: String(row.rowId || '').trim(),
        id: String(row.id || '').trim(),
        type: String(row.type || '').trim().toLowerCase(),
        navn: String(row.navn || '').trim(),
        beskrivelse: String(row.beskrivelse || '').trim(),
        antall: isNaN(antall) ? null : antall,
        status: String(row.status || '').trim(),
        tilstand: String(row.tilstand || '').trim()
      };
    }),
    attributter: normalizeInventoryAttributeRows(state.formState.attributeRows)
  };
}

function validateAnsvarligForWrite(record) {
  const aktiveAnsvarlige = getMasterdataValues('ansvarlig');
  if (!aktiveAnsvarlige.length) {
    return 'Ingen aktive ansvarlige er tilgjengelig. Opprett eller aktiver en verdi i Innstillinger før lagring.';
  }
  if (aktiveAnsvarlige.indexOf(String(record && record.ansvarlig || '').trim()) === -1) {
    return 'Ugyldig ansvarlig. Velg en aktiv ansvarlig fra listen.';
  }
  return '';
}

function validateArrangementerForWrite(record) {
  var aktiveArrangement = getMasterdataValues('arrangement');
  var arrangementer = Array.isArray(record && record.arrangementer) ? record.arrangementer : [];
  if (!arrangementer.length) {
    return '';
  }
  if (!aktiveArrangement.length) {
    return 'Ingen aktive arrangementer er tilgjengelig. Opprett eller aktiver en verdi i Innstillinger før lagring.';
  }
  for (var i = 0; i < arrangementer.length; i += 1) {
    if (aktiveArrangement.indexOf(arrangementer[i]) === -1) {
      return 'Ugyldig arrangement valgt. Fjern inaktive/ugyldige verdier før lagring.';
    }
  }
  return '';
}

function validateInventoryAttributesForWrite(record) {
  var attributter = Array.isArray(record && record.attributter) ? record.attributter : [];
  var seen = {};
  for (var i = 0; i < attributter.length; i += 1) {
    var attribute = attributter[i] || {};
    var definitionId = String(attribute.definitionId || '').trim();
    var value = String(attribute.verdi || '').trim();
    if (!definitionId && !value) {
      continue;
    }
    if (!definitionId) {
      return 'Velg attributttype for alle attributtrader før lagring.';
    }
    if (!value) {
      return 'Fyll inn attributtverdi for alle valgte attributttyper før lagring.';
    }
    if (seen[definitionId]) {
      return 'Samme attributttype kan ikke legges til flere ganger på samme vare.';
    }
    seen[definitionId] = true;
  }
  return '';
}

function validateInventorySubunitsForWrite(record) {
  var underenheter = Array.isArray(record && record.underenheter) ? record.underenheter : [];
  var allowedStatus = getMasterdataValues('status');
  var allowedTilstand = getMasterdataValues('tilstand');
  for (var i = 0; i < underenheter.length; i += 1) {
    var underenhet = underenheter[i] || {};
    var type = String(underenhet.type || '').trim().toLowerCase();
    var navn = String(underenhet.navn || '').trim();
    var antall = Number(underenhet.antall);
    var status = String(underenhet.status || '').trim();
    var tilstand = String(underenhet.tilstand || '').trim();
    if (!type) {
      return 'Velg type (variant eller medfølgende) for alle underenheter før lagring.';
    }
    if (SUBUNIT_ALLOWED_TYPES.indexOf(type) === -1) {
      return 'Ugyldig underenhetstype i rad ' + (i + 1) + '. Tillatte verdier er variant eller medfølgende.';
    }
    if (!navn) {
      return 'Fyll inn navn for alle underenheter før lagring.';
    }
    if (!isFinite(antall) || antall < 0 || Math.floor(antall) !== antall) {
      return 'Antall for underenheter må være et heltall lik eller større enn 0.';
    }
    if (!status) {
      return 'Velg status for alle underenheter før lagring.';
    }
    if (allowedStatus.indexOf(status) === -1) {
      return 'Ugyldig status i underenhet rad ' + (i + 1) + '. Velg en aktiv status fra listen.';
    }
    if (!tilstand) {
      return 'Velg tilstand for alle underenheter før lagring.';
    }
    if (allowedTilstand.indexOf(tilstand) === -1) {
      return 'Ugyldig tilstand i underenhet rad ' + (i + 1) + '. Velg en aktiv tilstand fra listen.';
    }
  }
  return '';
}

function validatePersistedSubunits(record, responsePayload) {
  var expected = normalizeInventorySubunitRows(Array.isArray(record && record.underenheter) ? record.underenheter : []);
  var responseData = responsePayload && responsePayload.data ? responsePayload.data : {};
  var persisted = normalizeInventorySubunitRows(Array.isArray(responseData.underenheter) ? responseData.underenheter : []);
  if (persisted.length !== expected.length) {
    return 'Lagring av underenheter ble ikke bekreftet av backend. Ingen write-suksess vises før underenheter er persistert.';
  }
  return '';
}

function resetInventoryForm() {
  const form = document.getElementById('inventory-form');
  if (!form) {
    return;
  }

  const statusValues = getMasterdataValues('status');
  const tilstandValues = getMasterdataValues('tilstand');
  const kategoriValues = getMasterdataValues('kategori');
  const plasseringValues = getMasterdataValues('plassering');
  const ansvarligValues = getMasterdataValues('ansvarlig');
  form.elements.id.value = generateNextInventoryId();
  form.elements.navn.value = '';
  form.elements.kategori.value = kategoriValues[0] || '';
  form.elements.plassering.value = plasseringValues[0] || '';
  form.elements.ansvarlig.value = ansvarligValues[0] || '';
  form.elements.status.value = statusValues[0] || '';
  form.elements.tilstand.value = tilstandValues[0] || '';
  form.elements.beholdning.value = '0';
  renderArrangementSelectOptions([]);
  form.elements.verdi.value = '';
  form.elements.beskrivelse.value = '';
  if (form.elements.offentligHovedbilde) form.elements.offentligHovedbilde.checked = false;
  if (form.elements.offentligVedlegg) form.elements.offentligVedlegg.checked = false;
  if (form.elements.offentligUnderenheter) form.elements.offentligUnderenheter.checked = false;
  if (form.elements.offentligAttributter) form.elements.offentligAttributter.checked = false;
  if (form.elements.offentligTilstand) form.elements.offentligTilstand.checked = false;
  state.formState.subunitRows = [];
  state.formState.attributeRows = [];
  state.attachmentForm.pendingUploads = [];
  state.attachmentForm.existingAttachments = [];
  state.attachmentForm.removedAttachmentIds = {};
  state.attachmentForm.updatedAttachmentIds = {};
  state.formState.edited = false;
  state.formState.sourceId = '__new__';
  state.formState.mode = 'create';
  state.formState.activeItemId = '';
  console.log('inventoryForm åpnet i create-modus:', {
    mode: state.formState.mode,
    activeItemId: state.formState.activeItemId,
    sourceId: state.formState.sourceId
  });
  renderInventoryAttributeRows();
  renderInventorySubunitRows();
  renderInventoryFormChips();
}

function markInventoryFormEditMode(itemId, contextLabel) {
  var normalizedItemId = String(itemId || '').trim();
  state.formState.mode = normalizedItemId ? 'edit' : 'create';
  state.formState.activeItemId = normalizedItemId;
  if (normalizedItemId) {
    state.formState.sourceId = normalizedItemId;
  }
  console.log('inventoryForm modus oppdatert:', {
    context: String(contextLabel || '').trim() || 'ukjent',
    mode: state.formState.mode,
    activeItemId: state.formState.activeItemId,
    selectedInventoryId: String(state.selectedInventoryId || '').trim(),
    detailItemId: state.detailItem ? String(state.detailItem.id || '').trim() : ''
  });
}

function refreshAutoGeneratedInventoryId() {
  const form = document.getElementById('inventory-form');
  if (!form || !form.elements || !form.elements.id) {
    return;
  }
  if (state.detailItem) {
    return;
  }
  form.elements.id.value = generateNextInventoryId();
}

function renderErrors() {
  const inventoryErrorPanelEl = document.getElementById('inventory-error-panel');
  const inventoryErrorTextEl = document.getElementById('inventory-error-text');
  const detailErrorPanelEl = document.getElementById('detail-error-panel');
  const detailErrorTextEl = document.getElementById('detail-error-text');
  const initErrorPanelEl = document.getElementById('init-error-panel');
  const initErrorTextEl = document.getElementById('init-error-text');
  const writeFeedbackPanelEl = document.getElementById('write-feedback-panel');
  const writeFeedbackTitleEl = document.getElementById('write-feedback-title');
  const writeFeedbackTextEl = document.getElementById('write-feedback-text');

  if (state.inventoryError) {
    inventoryErrorPanelEl.classList.remove('hidden');
    inventoryErrorTextEl.textContent = state.inventoryError;
  } else {
    inventoryErrorPanelEl.classList.add('hidden');
    inventoryErrorTextEl.textContent = '';
  }

  if (state.detailError) {
    detailErrorPanelEl.classList.remove('hidden');
    detailErrorTextEl.textContent = state.detailError;
  } else {
    detailErrorPanelEl.classList.add('hidden');
    detailErrorTextEl.textContent = '';
  }

  if (state.initError) {
    initErrorPanelEl.classList.remove('hidden');
    initErrorTextEl.textContent = state.initError;
  } else {
    initErrorPanelEl.classList.add('hidden');
    initErrorTextEl.textContent = '';
  }

  if (state.writeError) {
    writeFeedbackPanelEl.classList.remove('hidden');
    writeFeedbackPanelEl.classList.remove('border-emerald-200', 'bg-emerald-50');
    writeFeedbackPanelEl.classList.add('border-rose-200', 'bg-rose-50');
    writeFeedbackTitleEl.className = 'text-sm font-semibold text-rose-800';
    writeFeedbackTextEl.className = 'mt-1 text-sm text-rose-900';
    writeFeedbackTitleEl.textContent = 'Write-feil';
    writeFeedbackTextEl.textContent = state.writeError;
  } else if (state.writeSuccess) {
    writeFeedbackPanelEl.classList.remove('hidden');
    writeFeedbackPanelEl.classList.remove('border-rose-200', 'bg-rose-50');
    writeFeedbackPanelEl.classList.add('border-emerald-200', 'bg-emerald-50');
    writeFeedbackTitleEl.className = 'text-sm font-semibold text-emerald-800';
    writeFeedbackTextEl.className = 'mt-1 text-sm text-emerald-900';
    writeFeedbackTitleEl.textContent = 'Write OK';
    writeFeedbackTextEl.textContent = state.writeSuccess;
  } else {
    writeFeedbackPanelEl.classList.add('hidden');
    writeFeedbackTitleEl.textContent = '';
    writeFeedbackTextEl.textContent = '';
  }
}

function renderHamburgerMenu() {
  var menuEl = document.getElementById('hamburger-menu');
  var hamburgerBtn = document.getElementById('hamburger-button');
  if (!menuEl || !hamburgerBtn) {
    return;
  }
  if (state.menuOpen) {
    menuEl.classList.remove('hidden');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    positionHamburgerMenu(hamburgerBtn, menuEl);
  } else {
    menuEl.classList.add('hidden');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    menuEl.style.left = '';
    menuEl.style.right = '';
    menuEl.style.width = '';
    menuEl.style.maxWidth = '';
  }
}

function positionHamburgerMenu(buttonEl, menuEl) {
  if (!buttonEl || !menuEl || menuEl.classList.contains('hidden')) {
    return;
  }

  var viewportWidth = Math.max(window.innerWidth || 0, document.documentElement ? document.documentElement.clientWidth : 0);
  if (!viewportWidth) {
    return;
  }

  var viewportMargin = 8;
  var maxViewportWidth = viewportWidth - (viewportMargin * 2);
  var safeMaxWidth = Math.max(0, maxViewportWidth);
  var preferredWidth = 288;

  menuEl.style.left = 'auto';
  menuEl.style.right = '0px';
  menuEl.style.maxWidth = safeMaxWidth + 'px';
  menuEl.style.width = Math.min(preferredWidth, safeMaxWidth) + 'px';

  var buttonRect = buttonEl.getBoundingClientRect();
  var menuRect = menuEl.getBoundingClientRect();
  var menuWidth = menuRect.width;
  var idealLeft = buttonRect.right - menuWidth;
  var minLeft = viewportMargin;
  var maxLeft = viewportWidth - menuWidth - viewportMargin;
  var targetLeft = idealLeft;

  if (maxLeft < minLeft) {
    targetLeft = minLeft;
  } else {
    if (targetLeft < minLeft) {
      targetLeft = minLeft;
    }
    if (targetLeft > maxLeft) {
      targetLeft = maxLeft;
    }
  }

  var rightOffset = idealLeft - targetLeft;
  menuEl.style.right = rightOffset + 'px';
}

function renderHeaderAuthStatus() {
  const wrapperEl = document.getElementById('header-auth-wrapper');
  const buttonEl = document.getElementById('header-auth-button');
  const dropdownEl = document.getElementById('header-auth-dropdown');
  const roleEl = document.getElementById('header-auth-role');
  const detailStatusEl = document.getElementById('header-auth-detail-status');
  const detailRoleEl = document.getElementById('header-auth-detail-role');
  const detailSessionEl = document.getElementById('header-auth-detail-session');

  if (!wrapperEl || !buttonEl || !dropdownEl || !roleEl || !detailStatusEl || !detailRoleEl || !detailSessionEl) {
    return;
  }

  const isAuthenticated = state.auth && state.auth.status === 'authenticated' && state.route !== 'offentligListe' && state.route !== 'offentligVare';
  if (!isAuthenticated) {
    wrapperEl.classList.add('hidden');
    dropdownEl.classList.add('hidden');
    buttonEl.setAttribute('aria-expanded', 'false');
    state.headerAuthMenuOpen = false;
    return;
  }

  const roleText = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role)
    : 'Ukjent rolle';
  wrapperEl.classList.remove('hidden');
  roleEl.textContent = roleText;
  buttonEl.setAttribute('aria-label', 'Innlogget som ' + roleText + '. Vis detaljer.');
  detailStatusEl.textContent = 'Innlogget';
  detailRoleEl.textContent = roleText;
  detailSessionEl.textContent = 'Aktiv';

  if (state.headerAuthMenuOpen) {
    dropdownEl.classList.remove('hidden');
    buttonEl.setAttribute('aria-expanded', 'true');
    positionHeaderAuthDropdown(wrapperEl, dropdownEl);
  } else {
    dropdownEl.classList.add('hidden');
    buttonEl.setAttribute('aria-expanded', 'false');
    dropdownEl.style.right = '';
    dropdownEl.style.left = '';
    dropdownEl.style.maxWidth = '';
  }
}

function positionHeaderAuthDropdown(wrapperEl, dropdownEl) {
  if (!wrapperEl || !dropdownEl || dropdownEl.classList.contains('hidden')) {
    return;
  }

  var viewportWidth = Math.max(window.innerWidth || 0, document.documentElement ? document.documentElement.clientWidth : 0);
  if (!viewportWidth) {
    return;
  }

  var viewportMargin = 8;
  var maxViewportWidth = viewportWidth - (viewportMargin * 2);
  dropdownEl.style.maxWidth = Math.max(0, maxViewportWidth) + 'px';
  dropdownEl.style.left = 'auto';
  dropdownEl.style.right = '0px';

  var wrapperRect = wrapperEl.getBoundingClientRect();
  var dropdownRect = dropdownEl.getBoundingClientRect();
  var dropdownWidth = dropdownRect.width;
  var idealLeft = wrapperRect.right - dropdownWidth;
  var minLeft = viewportMargin;
  var maxLeft = viewportWidth - dropdownWidth - viewportMargin;
  var targetLeft = idealLeft;

  if (targetLeft < minLeft) {
    targetLeft = minLeft;
  }
  if (targetLeft > maxLeft) {
    targetLeft = maxLeft;
  }

  var rightOffset = idealLeft - targetLeft;
  dropdownEl.style.right = rightOffset + 'px';
}

function isPublicRouteActive() {
  return state.route === 'offentligListe' || state.route === 'offentligVare';
}

function isAuthOnlySurfaceActive() {
  if (isPublicRouteActive()) {
    return false;
  }
  if (state.phase === 'loading') {
    return true;
  }
  return state.auth.status !== 'authenticated';
}

function renderWorkspaceLayout() {
  const listSection = document.getElementById('liste-workspace');
  const lagerSection = document.getElementById('lager-workspace');
  const orderSection = document.getElementById('bestilling-workspace');
  const listsSection = document.getElementById('lister-workspace');
  const publicListSection = document.getElementById('public-list-workspace');
  const publicItemSection = document.getElementById('public-item-workspace');
  const borrowerWorkspaceSection = document.getElementById('borrower-workspace');
  const borrowerCreateWorkspaceSection = document.getElementById('borrower-create-workspace');
  const detailSection = document.getElementById('detail-workspace');
  const mobileBackButtonEl = document.getElementById('mobile-back-button');
  const detailPanelEl = document.getElementById('detail-panel');
  const loanPanelEl = document.getElementById('loan-panel');
  const crudPanelEl = document.getElementById('crud-panel');
  const importWorkspaceEl = document.getElementById('import-workspace');
  const adminWorkspaceEl = document.getElementById('admin-workspace');
  const menuUtlanEl = document.getElementById('menu-utlan');
  const borrowerStatusFilterEl = document.getElementById('borrower-status-filter');
  const borrowerListEl = document.getElementById('borrower-list');
  const borrowerTypeEl = document.getElementById('borrower-type');
  const borrowerSaveButtonEl = document.getElementById('borrower-save-button');
  const borrowerResetButtonEl = document.getElementById('borrower-reset-button');
  const loanCaseSourceTypeEl = document.getElementById('loan-case-source-type');
  const loanCaseCreateButtonEl = document.getElementById('loan-case-create-button');
  const loanCaseListEl = document.getElementById('loan-case-list');

  if (!listSection || !detailSection || !mobileBackButtonEl) {
    return;
  }

  if (isAuthOnlySurfaceActive()) {
    var workspaceSections = [
      listSection,
      lagerSection,
      orderSection,
      listsSection,
      publicListSection,
      publicItemSection,
      borrowerWorkspaceSection,
      borrowerCreateWorkspaceSection,
      detailSection,
      importWorkspaceEl,
      adminWorkspaceEl
    ];
    workspaceSections.forEach(function (workspaceEl) {
      if (workspaceEl) {
        workspaceEl.classList.add('hidden');
        workspaceEl.setAttribute('inert', '');
        workspaceEl.setAttribute('aria-hidden', 'true');
      }
    });
    mobileBackButtonEl.classList.add('hidden');
    if (detailPanelEl) {
      detailPanelEl.classList.add('hidden');
    }
    if (loanPanelEl) {
      loanPanelEl.classList.add('hidden');
    }
    if (crudPanelEl) {
      crudPanelEl.classList.add('hidden');
    }
    return;
  }

  var hasSelectedItem = !!state.selectedInventoryId;
  if (menuUtlanEl) {
    menuUtlanEl.disabled = false;
    menuUtlanEl.classList.remove('opacity-50');
  }

  var canViewAdmin = canAccessAdminWorkspace();
  var canViewLager = canAccessLagerWorkspace();

  if ((state.route === 'admin' || state.route === 'brukeradministrasjon') && !canViewAdmin) {
    state.route = 'liste';
  }
  if (state.route === 'lager' && !canViewLager) {
    state.route = 'liste';
  }

  if (state.route === 'detalj' && !hasSelectedItem) {
    state.route = 'liste';
  }

  if (detailPanelEl) {
    detailPanelEl.classList.add('hidden');
  }
  if (loanPanelEl) {
    loanPanelEl.classList.add('hidden');
  }
  if (crudPanelEl) {
    crudPanelEl.classList.add('hidden');
  }

  if (state.route === 'detalj') {
    if (detailPanelEl) {
      detailPanelEl.classList.remove('hidden');
    }
  } else if (state.route === 'rediger') {
    if (crudPanelEl) {
      crudPanelEl.classList.remove('hidden');
    }
  } else if (state.route === 'utlan') {
    if (loanPanelEl) {
      loanPanelEl.classList.remove('hidden');
    }
  }

  // SMOKE_CONTRACT_WORKSPACE_VISIBILITY_V2_START
  var primaryWorkspaces = [
    listSection,
    lagerSection,
    orderSection,
    listsSection,
    publicListSection,
    publicItemSection,
    borrowerWorkspaceSection,
    borrowerCreateWorkspaceSection,
    detailSection,
    importWorkspaceEl,
    adminWorkspaceEl
  ];
  primaryWorkspaces.forEach(function (workspaceEl) {
    if (workspaceEl) {
      workspaceEl.removeAttribute('inert');
      workspaceEl.removeAttribute('aria-hidden');
      workspaceEl.classList.add('hidden');
    }
  });
  // SMOKE_CONTRACT_WORKSPACE_VISIBILITY_V2_END


  if (state.route === 'liste') {
    listSection.classList.remove('hidden');
  } else if (state.route === 'lager' && lagerSection) {
    lagerSection.classList.remove('hidden');
  } else if (state.route === 'bestilling' && orderSection) {
    orderSection.classList.remove('hidden');
  } else if (state.route === 'lister' && listsSection) {
    listsSection.classList.remove('hidden');
  } else if (state.route === 'offentligListe' && publicListSection) {
    publicListSection.classList.remove('hidden');
  } else if (state.route === 'offentligVare' && publicItemSection) {
    publicItemSection.classList.remove('hidden');
  } else if (state.route === 'lantakere' && borrowerWorkspaceSection) {
    borrowerWorkspaceSection.classList.remove('hidden');
  } else if (state.route === 'lantakerNy' && borrowerCreateWorkspaceSection) {
    borrowerCreateWorkspaceSection.classList.remove('hidden');
  } else if ((state.route === 'admin' || state.route === 'brukeradministrasjon') && adminWorkspaceEl) {
    adminWorkspaceEl.classList.remove('hidden');
  } else if (state.route === 'import' && importWorkspaceEl) {
    importWorkspaceEl.classList.remove('hidden');
  } else {
    detailSection.classList.remove('hidden');
  }

  if (state.route === 'liste' || state.route === 'lager' || state.route === 'bestilling' || state.route === 'lister' || state.route === 'offentligListe' || state.route === 'offentligVare' || state.route === 'lantakere' || state.route === 'lantakerNy' || state.route === 'admin' || state.route === 'brukeradministrasjon' || state.route === 'import') {
    mobileBackButtonEl.classList.add('hidden');
  } else {
    if (window.innerWidth >= 1024) {
      mobileBackButtonEl.classList.add('hidden');
    } else {
      mobileBackButtonEl.classList.remove('hidden');
    }
  }
}

function renderAuthState() {
  function applyAuthSurfaceVisibility(useAuthOnlySurface) {
    const shellHeaderEl = document.getElementById('app-shell-header');
    const shellMainEl = document.getElementById('app-shell-main');
    const shellFooterEl = document.getElementById('app-shell-footer');
    const authPanel = document.getElementById('auth-panel');
    const initErrorPanel = document.getElementById('init-error-panel');
    if (!shellMainEl || !authPanel) {
      return;
    }

    if (useAuthOnlySurface) {
      if (shellHeaderEl) {
        shellHeaderEl.classList.add('hidden');
        shellHeaderEl.setAttribute('inert', '');
        shellHeaderEl.setAttribute('aria-hidden', 'true');
      }
      if (shellFooterEl) {
        shellFooterEl.classList.add('hidden');
        shellFooterEl.setAttribute('inert', '');
        shellFooterEl.setAttribute('aria-hidden', 'true');
      }
      shellMainEl.classList.remove('grid', 'gap-6', 'lg:grid-cols-12', 'max-w-6xl');
      shellMainEl.classList.add('flex', 'max-w-xl', 'items-center', 'justify-center');
      Array.prototype.forEach.call(shellMainEl.children, function (childEl) {
        if (childEl && childEl.id !== 'auth-panel' && childEl.id !== 'init-error-panel') {
          childEl.classList.add('hidden');
          childEl.setAttribute('inert', '');
          childEl.setAttribute('aria-hidden', 'true');
        } else if (childEl) {
          childEl.removeAttribute('inert');
          childEl.removeAttribute('aria-hidden');
        }
      });
      authPanel.classList.remove('hidden');
      authPanel.classList.remove('lg:col-span-12');
      authPanel.classList.add('w-full', 'rounded-2xl', 'border-hulBlueSoft', 'p-5', 'sm:p-6');
      if (initErrorPanel) {
        initErrorPanel.classList.remove('lg:col-span-12');
        initErrorPanel.classList.add('w-full');
      }
      return;
    }

    if (shellHeaderEl) {
      shellHeaderEl.classList.remove('hidden');
      shellHeaderEl.removeAttribute('inert');
      shellHeaderEl.removeAttribute('aria-hidden');
    }
    if (shellFooterEl) {
      shellFooterEl.classList.remove('hidden');
      shellFooterEl.removeAttribute('inert');
      shellFooterEl.removeAttribute('aria-hidden');
    }
    shellMainEl.classList.remove('flex', 'max-w-xl', 'items-center', 'justify-center');
    shellMainEl.classList.add('grid', 'gap-6', 'lg:grid-cols-12', 'max-w-6xl');
    Array.prototype.forEach.call(shellMainEl.children, function (childEl) {
      if (!childEl) {
        return;
      }
      childEl.removeAttribute('inert');
      childEl.removeAttribute('aria-hidden');
    });
    authPanel.classList.remove('w-full', 'rounded-2xl', 'border-hulBlueSoft', 'p-5', 'sm:p-6');
    authPanel.classList.add('lg:col-span-12', 'p-4');
    if (initErrorPanel) {
      initErrorPanel.classList.remove('w-full');
      initErrorPanel.classList.add('lg:col-span-12');
    }
  }

  const authPanelEl = document.getElementById('auth-panel');
  const loginButtonEl = document.getElementById('login-button');
  const logoutButtonEl = document.getElementById('logout-button');
  const adminToggleButtonEl = document.getElementById('admin-toggle-button');
  const menuLagerButtonEl = document.getElementById('menu-lager');
  const listSection = document.getElementById('liste-workspace');
  const detailSection = document.getElementById('detail-workspace');
  const hardDeleteButtonEl = document.getElementById('hard-delete-button');
  const authMode = state.runtimeConfig ? String(state.runtimeConfig.authMode || '') : '';
  const loginFormEl = document.getElementById('credentials-login-form');
  const loginErrorEl = document.getElementById('credentials-login-error');
  const loginSubmitBtnEl = document.getElementById('credentials-login-submit');
  const usernameInputEl = document.getElementById('credentials-username');
  const passwordInputEl = document.getElementById('credentials-password');
  const loginPending = !!state.loadingState.pendingActions['credentials-login'];
  const useAuthOnlySurface = isAuthOnlySurfaceActive();
  const writePanels = ['bulk-panel', 'ny-vare-row']
    .map(function (panelId) {
      return document.getElementById(panelId);
    })
    .filter(Boolean);

  if (!loginButtonEl || !logoutButtonEl || !listSection || !detailSection) {
    return;
  }

  applyAuthSurfaceVisibility(useAuthOnlySurface);
  renderHeaderAuthStatus();

  if (authPanelEl) {
    if (state.route === 'offentligListe' || state.route === 'offentligVare' || state.auth.status === 'authenticated') {
      authPanelEl.classList.add('hidden');
    } else {
      authPanelEl.classList.remove('hidden');
    }
  }

  if (state.phase === 'loading') {
    loginButtonEl.classList.add('hidden');
    logoutButtonEl.classList.add('hidden');
    if (loginFormEl) {
      loginFormEl.classList.add('hidden');
    }
    if (loginErrorEl) {
      loginErrorEl.classList.add('hidden');
      loginErrorEl.textContent = '';
    }
    writePanels.forEach(function (panel) {
      panel.classList.add('hidden');
    });
    detailSection.classList.add('hidden');
    return;
  }

  if (adminToggleButtonEl) {
    const role = state.auth && state.auth.session && state.auth.session.role
      ? String(state.auth.session.role).toLowerCase()
      : '';
    const adminVisible = !!(
      state.runtimeConfig &&
      (
        authMode === 'none' ||
        (authMode !== 'none' && (role === 'admin' || role === 'superadmin'))
      )
    );
    const menuAdminSepEl = document.getElementById('menu-admin-sep');
    if (adminVisible) {
      adminToggleButtonEl.classList.remove('hidden');
      if (menuAdminSepEl) {
        menuAdminSepEl.classList.remove('hidden');
      }
    } else {
      adminToggleButtonEl.classList.add('hidden');
      if (menuAdminSepEl) {
        menuAdminSepEl.classList.add('hidden');
      }
      if (state.route === 'admin' || state.route === 'brukeradministrasjon') {
        state.route = 'liste';
      }
    }
  }

  if (menuLagerButtonEl) {
    if (canAccessLagerWorkspace()) {
      menuLagerButtonEl.classList.remove('hidden');
    } else {
      menuLagerButtonEl.classList.add('hidden');
      if (state.route === 'lager') {
        state.route = 'liste';
      }
    }
  }

  if (hardDeleteButtonEl) {
    const role = state.auth && state.auth.session && state.auth.session.role
      ? String(state.auth.session.role).toLowerCase()
      : '';
    const hardDeleteVisible = !!(
      state.runtimeConfig &&
      authMode !== 'none' &&
      (role === 'admin' || role === 'superadmin')
    );

    if (hardDeleteVisible) {
      hardDeleteButtonEl.classList.remove('hidden');
    } else {
      hardDeleteButtonEl.classList.add('hidden');
    }
  }

  if (state.auth.status === 'authenticated') {
    if (authMode === 'none') {
      loginButtonEl.classList.add('hidden');
      logoutButtonEl.classList.add('hidden');
      if (loginFormEl) {
        loginFormEl.classList.add('hidden');
      }
    } else {
      if (state.runtimeConfig && state.runtimeConfig.authMode === 'credentials') {
        loginButtonEl.classList.add('hidden');
        if (loginFormEl) {
          loginFormEl.classList.add('hidden');
        }
      } else {
        loginButtonEl.classList.add('hidden');
      }
      logoutButtonEl.classList.remove('hidden');
    }

    if (loginErrorEl) {
      loginErrorEl.classList.add('hidden');
      loginErrorEl.textContent = '';
    }

    var canWrite = canManageInventoryWrite();
    writePanels.forEach(function (panel) {
      if (canWrite) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    return;
  }

  if (state.runtimeConfig && state.runtimeConfig.authMode === 'credentials') {
    loginButtonEl.classList.add('hidden');
    if (loginFormEl) {
      loginFormEl.classList.remove('hidden');
      loginFormEl.setAttribute('aria-busy', loginPending ? 'true' : 'false');
    }
  } else {
    loginButtonEl.classList.remove('hidden');
    if (loginFormEl) {
      loginFormEl.classList.add('hidden');
    }
  }
  if (loginErrorEl) {
    if (state.auth && state.auth.bootstrapError) {
      loginErrorEl.textContent = state.auth.bootstrapError;
      loginErrorEl.classList.remove('hidden');
    } else {
      loginErrorEl.classList.add('hidden');
      loginErrorEl.textContent = '';
    }
  }
  logoutButtonEl.classList.add('hidden');
  writePanels.forEach(function (panel) {
    panel.classList.add('hidden');
  });
  listSection.classList.add('hidden');
  detailSection.classList.add('hidden');
  if (usernameInputEl) {
    usernameInputEl.disabled = loginPending;
  }
  if (passwordInputEl) {
    passwordInputEl.disabled = loginPending;
  }
  if (loginSubmitBtnEl) {
    loginSubmitBtnEl.disabled = loginPending;
    loginSubmitBtnEl.setAttribute('aria-disabled', loginPending ? 'true' : 'false');
  }
}

function renderListeArbeidsflate() {
  var feilPanelEl = document.getElementById('lister-feil-panel');
  var feilTekstEl = document.getElementById('lister-feil-tekst');
  var summaryListEl = document.getElementById('list-summary-list');
  var detailTitleEl = document.getElementById('list-detail-title');
  var detailMetaEl = document.getElementById('list-detail-meta');
  var detailItemsEl = document.getElementById('list-item-list');
  var detailCountEl = document.getElementById('list-items-count');
  var ownerControlsEl = document.getElementById('list-owner-controls');
  var shareLinkEl = document.getElementById('list-share-link');
  var shareCopyButtonEl = document.getElementById('list-share-copy-button');
  var shareCopyFeedbackEl = document.getElementById('list-share-copy-feedback');
  var editNameEl = document.getElementById('list-edit-name');
  var editDescriptionEl = document.getElementById('list-edit-description');
  var itemSelectEl = document.getElementById('list-item-select');
  if (!summaryListEl || !detailTitleEl || !detailItemsEl || !detailMetaEl || !ownerControlsEl || !detailCountEl) {
    return;
  }

  if (feilPanelEl && feilTekstEl) {
    if (state.listeFeil) {
      feilPanelEl.classList.remove('hidden');
      feilTekstEl.textContent = state.listeFeil;
    } else {
      feilPanelEl.classList.add('hidden');
      feilTekstEl.textContent = '';
    }
  }

  summaryListEl.innerHTML = (state.lister || []).map(function (liste) {
    var aktivKlasse = liste.id === state.aktivListeId ? 'border-hulBlue bg-hulBlueSoft' : 'border-slate-200 bg-white';
    return '<li><button type="button" data-list-id="' + escapeHtml(liste.id) + '" class="min-h-11 w-full rounded-lg border px-3 py-2 text-left ' + aktivKlasse + ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark"><span class="block text-sm font-semibold text-slate-900">' + escapeHtml(liste.navn || liste.id) + '</span><span class="block text-xs text-slate-600">Antall varer: ' + escapeHtml(String(liste.itemCount || 0)) + '</span></button></li>';
  }).join('');

  var detail = state.aktivListeDetalj;
  if (!detail) {
    detailTitleEl.textContent = 'Velg liste';
    detailMetaEl.textContent = state.listeLaster ? 'Laster liste…' : 'Velg en liste for å redigere og dele.';
    ownerControlsEl.classList.add('hidden');
    detailCountEl.textContent = '0 treff';
    detailItemsEl.innerHTML = '';
    state.listeDelingslenkeFeedback = { type: '', message: '' };
    if (shareLinkEl) {
      shareLinkEl.textContent = 'Ingen delingskode tilgjengelig.';
    }
    if (shareCopyButtonEl) {
      shareCopyButtonEl.disabled = true;
      shareCopyButtonEl.setAttribute('aria-disabled', 'true');
    }
    if (shareCopyFeedbackEl) {
      shareCopyFeedbackEl.classList.add('hidden');
      shareCopyFeedbackEl.className = 'mt-2 hidden rounded-md border px-3 py-2 text-sm';
      shareCopyFeedbackEl.textContent = '';
    }
    return;
  }

  ownerControlsEl.classList.remove('hidden');
  detailTitleEl.textContent = detail.navn || detail.id || 'Liste';
  detailMetaEl.textContent = 'Antall varer: ' + String(detail.itemCount || 0);
  detailCountEl.textContent = String((Array.isArray(detail.items) ? detail.items.length : 0)) + ' treff';
  var shareUrl = detail.shareCode ? buildPublicListShareUrl(detail.shareCode) : '';
  if (shareLinkEl) {
    shareLinkEl.textContent = shareUrl || 'Ingen delingskode tilgjengelig.';
  }
  if (shareCopyButtonEl) {
    var canCopyShareLink = !!shareUrl;
    shareCopyButtonEl.disabled = !canCopyShareLink;
    if (canCopyShareLink) {
      shareCopyButtonEl.removeAttribute('aria-disabled');
    } else {
      shareCopyButtonEl.setAttribute('aria-disabled', 'true');
    }
  }
  if (shareCopyFeedbackEl) {
    var feedbackState = state.listeDelingslenkeFeedback || { type: '', message: '' };
    shareCopyFeedbackEl.classList.add('hidden');
    shareCopyFeedbackEl.className = 'mt-2 hidden rounded-md border px-3 py-2 text-sm';
    shareCopyFeedbackEl.textContent = '';
    if (feedbackState.message) {
      shareCopyFeedbackEl.textContent = feedbackState.message;
      shareCopyFeedbackEl.classList.remove('hidden');
      if (feedbackState.type === 'error') {
        shareCopyFeedbackEl.classList.add('border-rose-200', 'bg-rose-50', 'text-rose-800');
      } else {
        shareCopyFeedbackEl.classList.add('border-emerald-200', 'bg-emerald-50', 'text-emerald-800');
      }
    }
  }
  if (editNameEl) {
    editNameEl.value = String(detail.navn || '');
  }
  if (editDescriptionEl) {
    editDescriptionEl.value = String(detail.beskrivelse || '');
  }
  if (itemSelectEl) {
    itemSelectEl.innerHTML = ['<option value="">Velg lagervare</option>'].concat((state.inventory || []).map(function (vare) {
      return '<option value="' + escapeHtml(vare.id) + '">' + escapeHtml(vare.navn || vare.id) + ' (' + escapeHtml(vare.id) + ')</option>';
    })).join('');
  }
  detailItemsEl.innerHTML = (Array.isArray(detail.items) ? detail.items : []).map(function (vare) {
    var removeButton = '<button type="button" data-remove-list-item-id="' + escapeHtml(vare.id || '') + '" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Fjern</button>';
    var listCard = renderInventoryStyleListCard(vare, {
      cardClassName: 'border-slate-200 bg-white',
      topActionHtml: removeButton
    });
    return '<li><article class="min-h-11 rounded-lg border p-4 text-left transition ' + listCard.cardClassName + '">' + listCard.bodyHtml + '</article></li>';
  }).join('');
  if (!detailItemsEl.innerHTML) {
    detailItemsEl.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">Listen har ingen varer ennå.</li>';
  }
  void hydrateMainImages();
}

function normalizeBestillingLineType(rawValue) {
  var value = String(rawValue || '').trim().toUpperCase();
  if (value === 'PRODUCT' || value === 'INCLUDE_EQUIPMENT') {
    return BESTILLING_LINE_TYPE.MAIN_WITH_EQUIPMENT;
  }
  if (value === 'VARIANT') {
    return BESTILLING_LINE_TYPE.ALL_VARIANTS;
  }
  var validValues = {};
  BESTILLING_LINE_TYPE_OPTIONS.forEach(function (option) {
    validValues[String(option.value || '').trim()] = true;
  });
  return validValues[value] ? value : BESTILLING_LINE_TYPE.MAIN_WITH_EQUIPMENT;
}

function getBestillingLineTypeLabel(lineTypeValue) {
  var normalizedValue = normalizeBestillingLineType(lineTypeValue);
  var match = BESTILLING_LINE_TYPE_OPTIONS.find(function (option) {
    return option.value === normalizedValue;
  });
  return match ? match.label : normalizedValue;
}

function getBestillingStatusLabel(statusValue) {
  var status = String(statusValue || '').trim().toUpperCase();
  return BESTILLING_STATUS_LABELS[status] || 'Ukjent status';
}

function getBestillingLineStatusLabel(statusValue) {
  var status = String(statusValue || '').trim().toUpperCase();
  return BESTILLING_LINE_STATUS_LABELS[status] || 'Ukjent linjestatus';
}

function replaceBestillingStatusTokens(textValue) {
  var text = String(textValue || '');
  if (!text) {
    return '';
  }
  var localized = text;
  Object.keys(BESTILLING_STATUS_LABELS).forEach(function (statusKey) {
    localized = localized.replace(new RegExp(statusKey, 'g'), BESTILLING_STATUS_LABELS[statusKey]);
  });
  Object.keys(BESTILLING_LINE_STATUS_LABELS).forEach(function (statusKey) {
    localized = localized.replace(new RegExp(statusKey, 'g'), BESTILLING_LINE_STATUS_LABELS[statusKey]);
  });
  return localized;
}

function lagerkoErrorMessage(payload, fallbackMessage) {
  return replaceBestillingStatusTokens(resultErrorMessage(payload, fallbackMessage));
}

function readBestillingCartSummary() {
  var lines = Array.isArray(state.bestilling && state.bestilling.lines) ? state.bestilling.lines : [];
  var lineCount = lines.length;
  var quantitySum = lines.reduce(function (sum, line) {
    var quantity = Number(line && line.requestedQty || 0);
    return sum + (isNaN(quantity) ? 0 : quantity);
  }, 0);
  return {
    lineCount: lineCount,
    quantitySum: quantitySum
  };
}

function findInventoryItemById(itemId) {
  var cleanItemId = String(itemId || '').trim();
  if (!cleanItemId) {
    return null;
  }
  for (var i = 0; i < state.inventory.length; i += 1) {
    var item = state.inventory[i] || {};
    if (String(item.id || '').trim() === cleanItemId) {
      return item;
    }
  }
  return null;
}

function findInventoryItemWithDetailFallback(itemId) {
  var cleanItemId = String(itemId || '').trim();
  if (!cleanItemId) {
    return null;
  }
  var detailItemId = String(state.detailItem && state.detailItem.id || '').trim();
  if (detailItemId && detailItemId === cleanItemId) {
    return state.detailItem;
  }
  return findInventoryItemById(cleanItemId);
}

function getVariantSubunitsForItem(item) {
  var underenheter = readLagervareCollection(item || {}, ['underenheter', 'underenhet', 'subItems', 'components']);
  return underenheter.filter(function (underenhet) {
    return String(underenhet && underenhet.type || '').trim().toLowerCase() === 'variant'
      && String(underenhet && underenhet.id || '').trim();
  });
}

function getVariantLabelForOrderLine(line) {
  var variantKey = String(line && line.variantKey || '').trim();
  if (!variantKey) {
    return '';
  }
  var mainProductId = String(line && (line.mainProductId || line.productId) || '').trim();
  var inventoryItem = findInventoryItemById(mainProductId);
  var variants = getVariantSubunitsForItem(inventoryItem || {});
  for (var i = 0; i < variants.length; i += 1) {
    var variant = variants[i] || {};
    if (String(variant.id || '').trim() === variantKey) {
      var variantName = String(variant.navn || '').trim();
      return variantName ? (variantName + ' (' + variantKey + ')') : variantKey;
    }
  }
  return variantKey;
}

function renderBestillingCartButton() {
  var cartButtonEl = document.getElementById('order-cart-button');
  var cartBadgeEl = document.getElementById('order-cart-badge');
  if (!cartButtonEl || !cartBadgeEl) {
    return;
  }
  var summary = readBestillingCartSummary();
  cartButtonEl.setAttribute('aria-label', summary.quantitySum > 0
    ? ('Åpne bestilling. Kurven har ' + summary.quantitySum + ' enheter fordelt på ' + summary.lineCount + ' linjer.')
    : 'Åpne bestilling. Kurven er tom.');
  if (summary.quantitySum > 0) {
    cartBadgeEl.textContent = String(summary.quantitySum);
    cartBadgeEl.classList.remove('hidden');
    cartBadgeEl.classList.add('inline-flex');
  } else {
    cartBadgeEl.textContent = '';
    cartBadgeEl.classList.add('hidden');
    cartBadgeEl.classList.remove('inline-flex');
  }
}

function renderBestillingWorkspace() {
  var cartIndicatorEl = document.getElementById('order-cart-indicator');
  var linesListEl = document.getElementById('order-lines-list');
  var feedbackEl = document.getElementById('order-feedback');
  if (!cartIndicatorEl || !linesListEl || !feedbackEl) {
    return;
  }

  var summary = readBestillingCartSummary();
  var lineCount = summary.lineCount;
  var quantitySum = summary.quantitySum;
  var draftText = state.bestilling.orderNumber ? ('Utkast ' + state.bestilling.orderNumber + ' · ') : '';
  if (quantitySum > 0) {
    cartIndicatorEl.innerHTML = '<span class="inline-flex items-center gap-2"><span aria-hidden="true" class="inline-flex h-5 w-5 items-center justify-center text-hulBlueDark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.2 10.2c.2.9.9 1.5 1.8 1.5h8.6c.9 0 1.6-.6 1.8-1.4L22 7H7.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="19" r="1.7" fill="currentColor"/><circle cx="18" cy="19" r="1.7" fill="currentColor"/></svg></span><span>' +
      escapeHtml(draftText + lineCount + ' linjer i kurven') +
      '</span><span class="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full border border-hulBlueDark bg-hulBlue px-2 text-xs font-semibold text-white">' +
      escapeHtml(String(quantitySum)) +
      '</span><span>enheter totalt</span></span>';
  } else {
    cartIndicatorEl.textContent = draftText + 'Kurven er tom.';
  }

  if (state.bestilling.errorMessage) {
    feedbackEl.className = 'mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900';
    feedbackEl.textContent = state.bestilling.errorMessage;
    feedbackEl.classList.remove('hidden');
  } else if (state.bestilling.statusMessage) {
    feedbackEl.className = 'mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900';
    feedbackEl.textContent = state.bestilling.statusMessage;
    feedbackEl.classList.remove('hidden');
  } else {
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
  }

  if (!lineCount) {
    linesListEl.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Kurven er tom. Legg varer til bestilling fra lagerliste, detaljvisning eller masseendringer.</li>';
    return;
  }
  linesListEl.innerHTML = state.bestilling.lines.map(function (line) {
    var lineId = String(line.id || '');
    var qty = Number(line.requestedQty || 0);
    var safeQty = qty > 0 ? qty : 1;
    var variantLabel = getVariantLabelForOrderLine(line);
    return [
      '<li class="rounded-lg border border-slate-200 bg-white p-3">',
      '  <div class="flex flex-wrap items-center justify-between gap-3">',
      '    <div><p class="text-sm font-semibold text-slate-900">' + escapeHtml(line.productNameSnapshot || line.productId || 'Vare') + '</p><p class="text-xs text-slate-600">Type: ' + escapeHtml(getBestillingLineTypeLabel(line.lineType)) + '</p>' + (variantLabel ? ('<p class="text-xs text-slate-700">Variant: ' + escapeHtml(variantLabel) + '</p>') : '') + '<p class="text-xs text-slate-700">Valgt antall: ' + escapeHtml(String(safeQty)) + '</p></div>',
      '    <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">',
      '      <button type="button" data-order-line-decrease="' + escapeHtml(lineId) + '" class="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-semibold leading-none text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" aria-label="Reduser antall" ' + (safeQty <= 1 ? 'disabled' : '') + '>−</button>',
      '      <input type="number" min="1" value="' + escapeHtml(String(safeQty)) + '" data-order-line-qty="' + escapeHtml(lineId) + '" data-numeric-enhance="false" class="min-h-11 w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" />',
      '      <button type="button" data-order-line-increase="' + escapeHtml(lineId) + '" class="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-semibold leading-none text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" aria-label="Øk antall">+</button>',
      '      <button type="button" data-order-line-remove="' + escapeHtml(lineId) + '" class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 px-2 py-2 text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" aria-label="Fjern bestillingslinje" title="Fjern bestillingslinje"><svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4.5h8V6"/><path d="M6.5 6l1 13h9l1-13"/><path d="M10 10v6"/><path d="M14 10v6"/></svg></button>',
      '    </div>',
      '  </div>',
      '</li>'
    ].join('');
  }).join('');
}

function renderOrderStatusChip(statusValue) {
  var status = String(statusValue || '').trim().toUpperCase();
  var styleMap = {
    SUBMITTED: 'border-sky-200 bg-sky-50 text-sky-900',
    PICKING: 'border-amber-200 bg-amber-50 text-amber-900',
    READY_FOR_PICKUP: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    COMPLETED: 'border-slate-200 bg-slate-100 text-slate-800',
    DEVIATION: 'border-rose-200 bg-rose-50 text-rose-900',
    DRAFT: 'border-slate-200 bg-slate-100 text-slate-700'
  };
  return '<span class="inline-flex min-h-8 items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ' + (styleMap[status] || styleMap.DRAFT) + '">' + escapeHtml(getBestillingStatusLabel(status)) + '</span>';
}

function renderOrderLineStatusChip(statusValue) {
  var status = String(statusValue || '').trim().toUpperCase();
  var styleMap = {
    NOT_STARTED: 'border-slate-200 bg-slate-100 text-slate-800',
    IN_PROGRESS: 'border-amber-200 bg-amber-50 text-amber-900',
    PICKED: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    PACKED: 'border-sky-200 bg-sky-50 text-sky-900',
    DEVIATION: 'border-rose-200 bg-rose-50 text-rose-900'
  };
  return '<span class="inline-flex min-h-8 items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ' + (styleMap[status] || styleMap.NOT_STARTED) + '">' + escapeHtml(getBestillingLineStatusLabel(status)) + '</span>';
}

function renderLagerProgressSummary(linjer) {
  var rows = Array.isArray(linjer) ? linjer : [];
  var totalLinjer = rows.length;
  if (!totalLinjer) {
    return 'Ingen linjer registrert.';
  }
  var ferdigeLinjer = rows.filter(function (linje) {
    var status = String(linje && linje.lineStatus || '').trim().toUpperCase();
    return status === 'PICKED' || status === 'PACKED' || status === 'DEVIATION';
  }).length;
  var requestedTotal = rows.reduce(function (sum, linje) {
    return sum + (parseInt(linje && linje.requestedQty, 10) || 0);
  }, 0);
  var pickedTotal = rows.reduce(function (sum, linje) {
    return sum + (parseInt(linje && linje.pickedQty, 10) || 0);
  }, 0);
  return 'Fremdrift: ' + ferdigeLinjer + '/' + totalLinjer + ' linjer ferdig · Plukket ' + pickedTotal + ' av ' + requestedTotal + ' enheter';
}

function renderLagerWorkspace() {
  var summaryEl = document.getElementById('lager-order-summary');
  var errorPanelEl = document.getElementById('lager-order-error-panel');
  var errorTextEl = document.getElementById('lager-order-error-text');
  var orderListEl = document.getElementById('lager-order-list');
  var detailEl = document.getElementById('lager-order-detail');
  if (!summaryEl || !errorPanelEl || !errorTextEl || !orderListEl || !detailEl) {
    return;
  }

  var orderCount = Array.isArray(state.lagerko.orders) ? state.lagerko.orders.length : 0;
  if (state.lagerko.loadingOrders) {
    summaryEl.textContent = 'Laster ordrekø…';
  } else {
    summaryEl.textContent = orderCount + ' bestillinger i køen.';
  }

  if (state.lagerko.errorMessage) {
    errorPanelEl.classList.remove('hidden');
    errorTextEl.textContent = state.lagerko.errorMessage;
  } else {
    errorPanelEl.classList.add('hidden');
    errorTextEl.textContent = '';
  }
  if (state.lagerko.statusMessage) {
    summaryEl.textContent = summaryEl.textContent + ' ' + state.lagerko.statusMessage;
  }

  if (state.lagerko.loadingOrders) {
    orderListEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Laster ordrekø…</li>';
  } else if (!orderCount) {
    orderListEl.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Ingen bestillinger i lagerkø akkurat nå.</li>';
  } else {
    orderListEl.innerHTML = state.lagerko.orders.map(function (bestilling) {
      var bestillingId = String(bestilling && bestilling.id || '').trim();
      var isSelected = bestillingId && bestillingId === state.lagerko.selectedOrderId;
      var cardClassName = isSelected ? 'border-hulBlue bg-hulBlueSoft' : 'border-slate-200 bg-white';
      return [
        '<li>',
        '  <article class="rounded-lg border p-3 ' + cardClassName + '">',
        '    <div class="flex flex-wrap items-start justify-between gap-3">',
        '      <div>',
        '        <p class="text-sm font-semibold text-slate-900">' + escapeHtml(bestilling.orderNumber || bestilling.id || 'Bestilling') + '</p>',
        '        <p class="mt-1 text-xs text-slate-700">Bestiller: ' + escapeHtml(bestilling.requesterName || bestilling.requesterId || 'Ukjent') + '</p>',
        '        <p class="mt-1 text-xs text-slate-700">Linjer: ' + escapeHtml(String(bestilling.lineCount || 0)) + ' · Antall: ' + escapeHtml(String(bestilling.totalUnits || 0)) + '</p>',
        '      </div>',
        '      <div class="flex flex-col items-end gap-2">',
        renderOrderStatusChip(bestilling.status),
        '        <button type="button" data-open-lager-order="' + escapeHtml(bestillingId) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Åpne</button>',
        '      </div>',
        '    </div>',
        '  </article>',
        '</li>'
      ].join('');
    }).join('');
  }

  if (state.lagerko.loadingDetail) {
    detailEl.innerHTML = '<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Laster bestilling…</p>';
    return;
  }

  var valgtBestilling = state.lagerko.selectedOrder;
  if (!valgtBestilling) {
    detailEl.innerHTML = '<p class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Velg en bestilling fra ordrekøen for å åpne den.</p>';
    return;
  }

  var linjer = Array.isArray(valgtBestilling.linjer) ? valgtBestilling.linjer : [];
  var orderStatus = String(valgtBestilling.status || '').trim().toUpperCase();
  var kanStartePlukk = orderStatus === 'SUBMITTED';
  var kanSetteKlarForHenting = orderStatus === 'PICKING' || orderStatus === 'DEVIATION';
  var kanRedigereLinjer = orderStatus === 'SUBMITTED' || orderStatus === 'PICKING' || orderStatus === 'DEVIATION';
  var kanOppretteUtlan = orderStatus === 'READY_FOR_PICKUP';
  var lagerKommentarValue = String(valgtBestilling.lagerComment || '').trim();
  var activeBorrowers = getActiveBorrowersForLoan();
  var borrowerOptions = ['<option value="">Velg låntaker</option>']
    .concat(activeBorrowers.map(function (borrower) {
      return '<option value="' + escapeHtml(borrower.id || '') + '"' + (String(state.lagerko.selectedBorrowerId || '').trim() === String(borrower.id || '').trim() ? ' selected' : '') + '>' + escapeHtml((borrower.navn || '-') + ' (' + (borrower.id || '') + ')') + '</option>';
    }))
    .join('');
  var loanLinks = Array.isArray(valgtBestilling.loanLinks) ? valgtBestilling.loanLinks : [];
  var transitionSummary = loanLinks.length
    ? ('Opprettede utlån: ' + loanLinks.map(function (link) { return String(link.loanId || '').trim(); }).filter(function (id) { return !!id; }).join(', '))
    : 'Ingen utlån opprettet fra denne bestillingen ennå.';
  var linjerHtml = linjer.map(function (linje) {
    var lineId = String(linje && linje.id || '').trim();
    var requestedQty = parseInt(linje && linje.requestedQty, 10) || 0;
    var pickedQty = parseInt(linje && linje.pickedQty, 10);
    if (isNaN(pickedQty) || pickedQty < 0) {
      pickedQty = 0;
    }
    var selectedReason = String(linje && linje.deviationReason || '').trim();
    var avvikOptionsHtml = BESTILLING_LINJE_AVVIKSARSAK_OPTIONS.map(function (option) {
      var isSelected = selectedReason === option.value;
      return '<option value="' + escapeHtml(option.value) + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(option.label) + '</option>';
    }).join('');
    return [
      '<li class="rounded-lg border border-slate-200 bg-white p-3">',
      '  <div class="flex flex-wrap items-start justify-between gap-2">',
      '    <div>',
      '      <p class="text-sm font-semibold text-slate-900">' + escapeHtml(linje.productNameSnapshot || linje.productId || lineId || 'Vare') + '</p>',
      '      <p class="mt-1 text-xs text-slate-700">Ønsket antall: ' + escapeHtml(String(requestedQty)) + ' · Plukket: ' + escapeHtml(String(pickedQty)) + '</p>',
      '    </div>',
      renderOrderLineStatusChip(linje && linje.lineStatus),
      '  </div>',
      '  <div class="mt-3 grid gap-2 md:grid-cols-4">',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Plukket antall',
      '      <input type="number" min="0" value="' + escapeHtml(String(pickedQty)) + '" data-lager-line-pickedqty="' + escapeHtml(lineId) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" ' + (kanRedigereLinjer ? '' : 'disabled') + ' />',
      '    </label>',
      '    <div class="grid items-end">',
      '      <button type="button" data-lager-line-pick="' + escapeHtml(lineId) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanRedigereLinjer ? '' : 'disabled') + '>Registrer plukk</button>',
      '    </div>',
      '    <label class="grid gap-1 text-xs font-medium text-slate-700">Avviksårsak',
      '      <select data-lager-line-deviation-reason="' + escapeHtml(lineId) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" ' + (kanRedigereLinjer ? '' : 'disabled') + '><option value="">Velg avviksårsak</option>' + avvikOptionsHtml + '</select>',
      '    </label>',
      '    <div class="grid items-end">',
      '      <button type="button" data-lager-line-deviation="' + escapeHtml(lineId) + '" class="min-h-11 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanRedigereLinjer ? '' : 'disabled') + '>Registrer avvik</button>',
      '    </div>',
      '  </div>',
      '</li>'
    ].join('');
  }).join('');
  detailEl.innerHTML = [
    '<article class="rounded-lg border border-slate-200 bg-slate-50 p-3">',
    '  <div class="flex flex-wrap items-start justify-between gap-3">',
    '    <div>',
    '      <p class="text-sm font-semibold text-slate-900">' + escapeHtml(valgtBestilling.orderNumber || valgtBestilling.id || 'Bestilling') + '</p>',
    '      <p class="mt-1 text-xs text-slate-700">Bestiller: ' + escapeHtml(valgtBestilling.requesterName || valgtBestilling.requesterId || 'Ukjent') + '</p>',
    '      <p class="mt-1 text-xs text-slate-700">Opprettet: ' + escapeHtml(valgtBestilling.createdAt || '-') + '</p>',
    '    </div>',
    '    <div class="flex flex-col items-end gap-2">',
    renderOrderStatusChip(valgtBestilling.status),
    '    </div>',
    '  </div>',
    '  <p class="mt-3 text-xs text-slate-700">' + escapeHtml(renderLagerProgressSummary(linjer)) + '</p>',
    '  <p class="mt-2 text-xs text-slate-700">' + escapeHtml(transitionSummary) + '</p>',
    '  <label class="mt-3 grid gap-1 text-xs font-medium text-slate-700">Lagerkommentar til bestiller',
    '    <textarea data-lager-order-comment="' + escapeHtml(String(valgtBestilling.id || '')) + '" rows="3" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900" ' + (kanSetteKlarForHenting ? '' : 'disabled') + '>' + escapeHtml(lagerKommentarValue) + '</textarea>',
    '  </label>',
    '  <div class="mt-3 flex flex-wrap gap-2">',
    '    <button type="button" data-lager-order-start-picking="' + escapeHtml(String(valgtBestilling.id || '')) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanStartePlukk ? '' : 'disabled') + '>Start plukking</button>',
    '    <button type="button" data-lager-order-ready="' + escapeHtml(String(valgtBestilling.id || '')) + '" class="min-h-11 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanSetteKlarForHenting ? '' : 'disabled') + '>Marker klar for henting</button>',
    '  </div>',
    '  <div class="mt-3 grid gap-2 md:grid-cols-4">',
    '    <label class="grid gap-1 text-xs font-medium text-slate-700">Låntaker',
    '      <select data-lager-order-loan-borrower="' + escapeHtml(String(valgtBestilling.id || '')) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanOppretteUtlan ? '' : 'disabled') + '>' + borrowerOptions + '</select>',
    '    </label>',
    '    <label class="grid gap-1 text-xs font-medium text-slate-700">Forfallsdato (valgfritt)',
    '      <input type="date" data-lager-order-loan-due="' + escapeHtml(String(valgtBestilling.id || '')) + '" value="' + escapeHtml(String(state.lagerko.forfallDato || '').trim()) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanOppretteUtlan ? '' : 'disabled') + ' />',
    '    </label>',
    '    <label class="grid gap-1 text-xs font-medium text-slate-700 md:col-span-2">Notat til utlån (valgfritt)',
    '      <input type="text" data-lager-order-loan-note="' + escapeHtml(String(valgtBestilling.id || '')) + '" value="' + escapeHtml(String(state.lagerko.overgangNotat || '').trim()) + '" class="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanOppretteUtlan ? '' : 'disabled') + ' />',
    '    </label>',
    '  </div>',
    '  <div class="mt-3 flex flex-wrap gap-2">',
    '    <button type="button" data-lager-order-create-loans="' + escapeHtml(String(valgtBestilling.id || '')) + '" class="min-h-11 rounded-lg border border-hulBlue bg-hulBlueSoft px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark" ' + (kanOppretteUtlan ? '' : 'disabled') + '>Opprett utlån fra bestilling</button>',
    '  </div>',
    '</article>',
    '<h4 class="mt-3 text-sm font-semibold text-slate-900">Ordrelinjer</h4>',
    '<ul class="mt-2 space-y-2">' + (linjerHtml || '<li class="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-700">Ingen ordrelinjer registrert.</li>') + '</ul>'
  ].join('');
}

function renderOffentligListe() {
  var titleEl = document.getElementById('public-list-title');
  var metaEl = document.getElementById('public-list-meta');
  var itemsEl = document.getElementById('public-list-items');
  var countEl = document.getElementById('public-list-items-count');
  var errorPanelEl = document.getElementById('public-list-error-panel');
  var errorTextEl = document.getElementById('public-list-error-text');
  if (!titleEl || !metaEl || !itemsEl || !countEl || !errorPanelEl || !errorTextEl) {
    return;
  }

  if (state.offentligVisning.feil) {
    errorPanelEl.classList.remove('hidden');
    errorTextEl.textContent = state.offentligVisning.feil;
  } else {
    errorPanelEl.classList.add('hidden');
    errorTextEl.textContent = '';
  }

  var liste = state.offentligVisning.liste;
  if (!liste) {
    titleEl.textContent = 'Offentlig liste';
    metaEl.textContent = state.offentligVisning.laster ? 'Laster delt liste…' : 'Ingen liste funnet.';
    countEl.textContent = '0 treff';
    itemsEl.innerHTML = '';
    return;
  }

  titleEl.textContent = liste.navn || 'Offentlig liste';
  metaEl.textContent = 'Antall varer: ' + String(liste.itemCount || 0);
  countEl.textContent = String((Array.isArray(liste.items) ? liste.items.length : 0)) + ' treff';
  itemsEl.innerHTML = (Array.isArray(liste.items) ? liste.items : []).map(function (vare) {
    var itemShareCode = String(vare.itemShareCode || '').trim();
    var footerHtml = itemShareCode
      ? ('<button type="button" data-open-public-item-share-code="' + escapeHtml(itemShareCode) + '" data-open-public-item-list-share-code="' + escapeHtml(String(liste.shareCode || '')) + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-xs font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Åpne offentlig varedetalj</button>')
      : '<p class="text-xs text-slate-600">Offentlig varedetalj er ikke tilgjengelig for denne varen.</p>';
    var listCard = renderPublicInventoryStyleListCard(vare, {
      cardClassName: 'border-slate-200 bg-white',
      footerHtml: footerHtml
    });
    return '<li><article class="min-h-11 rounded-lg border p-4 text-left transition ' + listCard.cardClassName + '">' + listCard.bodyHtml + '</article></li>';
  }).join('');
  if (!itemsEl.innerHTML) {
    itemsEl.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">Listen inneholder ingen varer ennå.</li>';
  }
  void hydrateMainImages();
}

function renderOffentligVare() {
  var titleEl = document.getElementById('public-item-title');
  var metaEl = document.getElementById('public-item-meta');
  var contentEl = document.getElementById('public-item-content');
  var errorPanelEl = document.getElementById('public-item-error-panel');
  var errorTextEl = document.getElementById('public-item-error-text');
  if (!titleEl || !metaEl || !contentEl || !errorPanelEl || !errorTextEl) {
    return;
  }
  if (state.offentligVareVisning.feil) {
    errorPanelEl.classList.remove('hidden');
    errorTextEl.textContent = state.offentligVareVisning.feil;
  } else {
    errorPanelEl.classList.add('hidden');
    errorTextEl.textContent = '';
  }
  var vare = state.offentligVareVisning.vare;
  if (!vare) {
    titleEl.textContent = 'Offentlig vare';
    metaEl.textContent = state.offentligVareVisning.laster ? 'Laster vare…' : 'Ingen vare funnet.';
    contentEl.innerHTML = '<p class="text-sm text-slate-700">Denne visningen er skrivebeskyttet.</p>';
    return;
  }
  ensurePublicItemAccordionSection();

  titleEl.textContent = vare.navn || 'Offentlig vare';
  var visning = normalizeInventoryPublicVisibilityForUi(vare.offentligVisning || null);
  var hovedbilde = vare.hovedbilde || null;
  var vedlegg = Array.isArray(vare.vedlegg) ? vare.vedlegg : [];
  var underenheter = Array.isArray(vare.underenheter) ? vare.underenheter : [];
  var attributter = Array.isArray(vare.attributter) ? vare.attributter : [];
  var beskrivelseTekst = formatDetailField(vare.beskrivelse, 'Ingen beskrivelse registrert.');

  metaEl.textContent = 'Skrivebeskyttet visning uten innlogging.';

  var summaryRows = [
    { label: 'Kategori', value: formatDetailField(vare.kategori, 'Ikke registrert') },
    { label: 'Antall', value: formatDetailField(vare.beholdning, 'Ikke registrert') },
    { label: 'Status', value: formatDetailField(vare.status, 'Ikke registrert') }
  ].map(function (row, index) {
    var rowBorderClass = index > 0 ? ' border-t border-slate-200' : '';
    return [
      '<div class="flex items-start justify-between gap-4 py-3' + rowBorderClass + '">',
      '  <p class="' + DETAIL_FIELD_LABEL_CLASS + ' pt-0.5">' + escapeHtml(row.label) + '</p>',
      '  <p class="text-right text-base font-semibold leading-snug text-slate-900 break-words">' + escapeHtml(String(row.value)) + '</p>',
      '</div>'
    ].join('');
  }).join('');

  function renderPublicImageTile(dokument, options) {
    var imageId = String(dokument && dokument.id || '').trim();
    var shareCode = String(state.offentligVareVisning && state.offentligVareVisning.shareCode || '').trim();
    var listShareCode = String(state.offentligVareVisning && state.offentligVareVisning.listShareCode || '').trim();
    var imageAlt = escapeHtml(dokument && (dokument.tittel || dokument.filnavn || 'Bilde') || 'Bilde');
    var fallbackText = escapeHtml(String(options && options.fallbackText || 'Bilde utilgjengelig.'));
    var imageClass = escapeHtml(String(options && options.imageClass || 'h-64 w-full object-cover'));
    var canHydrate = !!(imageId && shareCode && listShareCode);
    return [
      '<div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">',
      canHydrate
        ? ('  <img data-public-item-image="true" data-public-item-image-id="' + escapeHtml(imageId) + '" data-public-item-share-code="' + escapeHtml(shareCode) + '" data-public-item-list-share-code="' + escapeHtml(listShareCode) + '" class="hidden ' + imageClass + '" alt="' + imageAlt + '" loading="lazy" />')
        : '',
      '  <div class="' + (canHydrate ? '' : 'hidden ') + 'flex items-center justify-center bg-slate-100 px-3 py-8 text-sm font-medium text-slate-700" data-public-item-image-loading="' + escapeHtml(imageId) + '">Laster bilde…</div>',
      '  <div class="hidden flex items-center justify-center bg-slate-100 px-3 py-8 text-sm font-medium text-slate-700" data-public-item-image-fallback="' + escapeHtml(imageId) + '">' + fallbackText + '</div>',
      '</div>'
    ].join('');
  }

  var mediaSectionHtml = ['<div class="space-y-4">'];
  if (hovedbilde) {
    mediaSectionHtml.push('<p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">Hovedbilde vises øverst på siden.</p>');
  } else {
    mediaSectionHtml.push('<p class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Ingen hovedbilde tilgjengelig.</p>');
  }
  if (vedlegg.length > 0) {
    mediaSectionHtml.push('<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">' + vedlegg.map(function (dokument) {
      var filnavn = dokument.tittel || dokument.filnavn || 'Vedlegg';
      if (dokument.erBilde) {
        return [
          '<li class="rounded-lg border border-slate-200 bg-white p-2">',
          renderPublicImageTile(dokument, {
            fallbackText: 'Bilde utilgjengelig.',
            imageClass: 'aspect-square h-auto w-full object-cover'
          }),
          '  <p class="mt-2 line-clamp-2 text-xs font-semibold text-slate-900">' + escapeHtml(filnavn) + '</p>',
          '</li>'
        ].join('');
      }
      if (!dokument.driveUrl) {
        return '<li class="rounded-lg border border-slate-200 bg-slate-50 p-3"><p class="text-sm font-medium text-slate-900">' + escapeHtml(filnavn) + '</p><p class="mt-1 text-xs text-amber-800">Vedlegg utilgjengelig.</p></li>';
      }
      return '<li class="rounded-lg border border-slate-200 bg-slate-50 p-3"><a class="text-sm font-medium text-hulBlueDark underline" href="' + escapeHtml(dokument.driveUrl) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(filnavn) + '</a></li>';
    }).join('') + '</ul>');
  } else {
    mediaSectionHtml.push('<p class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Ingen vedlegg tilgjengelig.</p>');
  }
  mediaSectionHtml.push('</div>');

  var lagerkontrollRows = [
    '<div class="space-y-2">',
    '  <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><p class="text-sm text-slate-700">Beholdning</p><p class="text-lg font-semibold text-hulBlueDark">' + escapeHtml(formatDetailField(vare.beholdning, 'Ikke registrert')) + '</p></div>',
    '  <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><p class="text-sm text-slate-700">Status</p><p class="text-sm font-medium text-slate-900 break-words text-right">' + escapeHtml(formatDetailField(vare.status, 'Ikke registrert')) + '</p></div>',
    visning.tilstand ? ('  <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><p class="text-sm text-slate-700">Tilstand</p><p class="text-sm font-medium text-slate-900 break-words text-right">' + escapeHtml(formatDetailField(vare.tilstand, 'Ikke registrert')) + '</p></div>') : '',
    '</div>'
  ].join('');

  function renderReadOnlyAccordionSection(sectionId, sectionTitle, contentHtml) {
    var isOpen = String(state.offentligVareVisning.accordionSection || '').trim() === sectionId;
    var panelId = 'public-item-accordion-panel-' + sectionId;
    return [
      '<section class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">',
      '    <button type="button" data-public-item-accordion-toggle="' + sectionId + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '" aria-controls="' + panelId + '" class="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">',
      '      <span class="text-lg font-semibold text-slate-700">' + escapeHtml(sectionTitle) + '</span>',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-5 w-5 transition-transform duration-200 ' + (isOpen ? 'rotate-180 text-slate-600' : 'text-slate-500') + '" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>',
      '    </button>',
      '    <div id="' + panelId + '" class="border-t border-slate-100 px-5 py-5' + (isOpen ? '' : ' hidden') + '">' + contentHtml + '</div>',
      '</section>'
    ].join('');
  }

  var underenheterHtml = underenheter.length > 0
    ? '<ul class="space-y-2">' + underenheter.map(function (underenhet) {
      return '<li class="rounded-lg border border-slate-200 bg-white p-3"><p class="text-sm font-semibold text-slate-900">' + escapeHtml(underenhet.navn || underenhet.id || 'Underenhet') + '</p><p class="mt-1 text-xs text-slate-700">Antall: ' + escapeHtml(String(underenhet.antall || 0)) + ' · Status: ' + escapeHtml(underenhet.status || '-') + '</p></li>';
    }).join('') + '</ul>'
    : '<p class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Ingen underenheter tilgjengelig i offentlig visning.</p>';

  var attributterHtml = attributter.length > 0
    ? '<dl class="grid gap-2 sm:grid-cols-2">' + attributter.map(function (attributt) {
      return '<div class="rounded-lg border border-slate-200 bg-white p-3"><dt class="text-xs font-medium uppercase tracking-wide text-slate-600">' + escapeHtml(attributt.navn || 'Attributt') + '</dt><dd class="mt-1 text-sm text-slate-900">' + escapeHtml(attributt.verdi || '-') + '</dd></div>';
    }).join('') + '</dl>'
    : '<p class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Ingen attributter tilgjengelig i offentlig visning.</p>';

  contentEl.innerHTML = [
    '<section class="space-y-4">',
    hovedbilde
      ? ('  <div class="space-y-2">' + renderPublicImageTile(hovedbilde, { fallbackText: 'Hovedbilde utilgjengelig.', imageClass: 'h-72 w-full object-cover' }) + '<p class="text-xs text-slate-600">Hovedbilde</p></div>')
      : '  <p class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">Ingen hovedbilde tilgjengelig.</p>',
    '  <div class="grid gap-3 sm:grid-cols-2">',
    '    <article class="rounded-xl border border-slate-200 bg-slate-50 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p><p class="mt-2 text-sm font-semibold text-slate-900">' + escapeHtml(formatDetailField(vare.status, 'Ikke registrert')) + '</p></article>',
    visning.tilstand ? ('    <article class="rounded-xl border border-slate-200 bg-slate-50 p-4"><p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tilstand</p><p class="mt-2 text-sm font-semibold text-slate-900">' + escapeHtml(formatDetailField(vare.tilstand, 'Ikke registrert')) + '</p></article>') : '',
    '  </div>',
    '</section>',
    '<section class="mt-5">',
    '  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Offentlig vare</p>',
    '  <h2 class="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">' + escapeHtml(formatDetailField(vare.navn, 'Uten navn')) + '</h2>',
    '</section>',
    '<section class="mt-5 rounded-2xl border border-slate-200 bg-slate-100 px-4 sm:px-5">' + summaryRows + '</section>',
    '<section class="mt-5"><h3 class="text-sm font-semibold uppercase tracking-wide text-slate-800">Beskrivelse</h3><p class="mt-2 text-base leading-relaxed text-slate-600">' + escapeHtml(beskrivelseTekst) + '</p></section>',
    '<section class="mt-6 space-y-4 border-t border-slate-200 pt-6">',
    renderReadOnlyAccordionSection('media', 'Bilder & Dokumenter', mediaSectionHtml.join('')),
    renderReadOnlyAccordionSection('lagerkontroll', 'Lagerkontroll', lagerkontrollRows),
    renderReadOnlyAccordionSection('underenheter', 'Underenheter', underenheterHtml),
    renderReadOnlyAccordionSection('attributter', 'Attributter', attributterHtml),
    '</section>'
  ].join('');
  void hydrateOffentligVareMainImage();
}

function renderGlobalLoadingIndicator() {
  var overlayEl = document.getElementById('global-loading-overlay');
  var overlayTextEl = document.getElementById('global-loading-overlay-text');
  if (!overlayEl || !overlayTextEl) {
    return;
  }
  var activeKeys = state.loadingState.globalActiveKeys || {};
  var keyList = Object.keys(activeKeys);
  var hasGlobalLoading = keyList.length > 0;
  var hasBlockingLoading = keyList.some(function (key) {
    var entry = activeKeys[key];
    return !entry || entry.blocking !== false;
  });
  if (!hasGlobalLoading) {
    overlayEl.classList.add('hidden');
    overlayEl.setAttribute('aria-hidden', 'true');
    return;
  }
  var loadingText = state.loadingState.globalMessage || 'Behandler forespørsel…';
  overlayTextEl.textContent = loadingText;
  overlayEl.classList.toggle('hidden', !hasBlockingLoading);
  overlayEl.setAttribute('aria-hidden', hasBlockingLoading ? 'false' : 'true');
}

function formatNorwegianDateTime(value) {
  var trimmed = String(value || '').trim();
  if (!trimmed) {
    return '';
  }
  var parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(parsed);
}

function resolveTraceabilityFooterValues() {
  var runtimeConfig = state.runtimeConfig || {};
  var healthPayload = state.health && state.health.payload ? state.health.payload : null;
  var healthData = healthPayload && healthPayload.data && typeof healthPayload.data === 'object'
    ? healthPayload.data
    : {};
  var frontendVersion = String(runtimeConfig.frontendVersion || '').trim();
  var frontendBuild = String(runtimeConfig.frontendBuildNumber || runtimeConfig.appBuildId || '').trim();
  var deployLabel = formatNorwegianDateTime(runtimeConfig.frontendLastDeployAt);
  var backendVersion = String(
    healthData.backendVersion ||
    healthData.version ||
    (healthPayload && healthPayload.backendVersion) ||
    ''
  ).trim();
  return {
    frontendVersion: frontendVersion || 'ukjent',
    frontendBuild: frontendBuild || 'ukjent',
    frontendDeployTime: deployLabel || 'ukjent',
    backendVersion: backendVersion || 'ukjent'
  };
}

function renderTraceabilityAccordionState() {
  var toggleButtonEl = document.getElementById('traceability-accordion-toggle');
  var panelEl = document.getElementById('traceability-accordion-panel');
  var iconEl = document.getElementById('traceability-accordion-icon');
  if (!toggleButtonEl || !panelEl || !iconEl) {
    return;
  }
  var isOpen = !!state.traceabilityAccordionOpen;
  toggleButtonEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  panelEl.classList.toggle('hidden', !isOpen);
  iconEl.classList.toggle('rotate-180', isOpen);
}

function renderTraceabilityFooter() {
  var frontendVersionEl = document.getElementById('trace-frontend-version');
  var frontendBuildEl = document.getElementById('trace-frontend-build');
  var deployTimeEl = document.getElementById('trace-frontend-deploy-time');
  var backendVersionEl = document.getElementById('trace-backend-version');
  if (!frontendVersionEl || !frontendBuildEl || !deployTimeEl || !backendVersionEl) {
    return;
  }
  renderTraceabilityAccordionState();
  var values = resolveTraceabilityFooterValues();
  frontendVersionEl.textContent = values.frontendVersion;
  frontendBuildEl.textContent = values.frontendBuild;
  deployTimeEl.textContent = values.frontendDeployTime;
  backendVersionEl.textContent = values.backendVersion;
}

function renderState() {
  renderAuthState();
  renderHamburgerMenu();
  renderBestillingCartButton();
  renderInventoryFormMasterdataOptions();
  renderInventoryControls();
  renderDetail();
  renderLoanSection();
  renderBorrowerRegistry();
  renderLoanCaseRegistry();
  fillFormFromDetail();
  try {
    renderInventoryFormAttachments();
  } catch (error) {
    console.error('renderInventoryFormAttachments feilet:', error);
  }
  renderInventoryFormAccordionState();
  renderInventoryFormActionState();
  renderAdminPanel();
  renderBestillingWorkspace();
  renderLagerWorkspace();
  renderListeArbeidsflate();
  renderOffentligListe();
  renderOffentligVare();
  renderErrors();
  renderImportPanels();
  renderSettingsSubpageNavigationState();
  renderWorkspaceLayout();
  renderAttachmentOverlay();
  renderAddToListOverlay();
  renderBestillingVariantOverlay();
  renderGlobalLoadingIndicator();
  renderTraceabilityFooter();
  scheduleNumericInputEnhancement();
  syncNavigationUrl('replace');
}

function renderDetailWorkspaceState() {
  renderInventoryControls();
  renderDetail();
  renderLoanSection();
  renderBorrowerRegistry();
  renderLoanCaseRegistry();
  fillFormFromDetail();
  renderInventoryFormActionState();
  renderErrors();
  renderSettingsSubpageNavigationState();
  renderWorkspaceLayout();
  renderAttachmentOverlay();
  renderAddToListOverlay();
  renderBestillingVariantOverlay();
  renderGlobalLoadingIndicator();
  renderTraceabilityFooter();
  scheduleNumericInputEnhancement();
}

function renderImportPanels() {
  const previewPanelEl = document.getElementById('import-preview-panel');
  const previewHeadEl = document.getElementById('import-preview-head');
  const previewBodyEl = document.getElementById('import-preview-body');
  const previewSummaryEl = document.getElementById('import-preview-summary');
  const resultPanelEl = document.getElementById('import-result-panel');
  const resultSummaryEl = document.getElementById('import-result-summary');
  const resultErrorsEl = document.getElementById('import-result-errors');
  const importConfirmButtonEl = document.getElementById('import-confirm-button');
  const importActionFeedbackEl = document.getElementById('import-action-feedback');

  if (previewPanelEl && previewHeadEl && previewBodyEl) {
    if (state.importPreviewRows.length) {
      previewPanelEl.classList.remove('hidden');
      const rows = state.importPreviewRows.slice(0, 10);
      previewHeadEl.innerHTML = [
        '<tr>',
        '<th class="border border-slate-200 bg-slate-100 px-2 py-1 text-left">Rad</th>',
        '<th class="border border-slate-200 bg-slate-100 px-2 py-1 text-left">Handling</th>',
        '<th class="border border-slate-200 bg-slate-100 px-2 py-1 text-left">Intern-ID</th>',
        '<th class="border border-slate-200 bg-slate-100 px-2 py-1 text-left">Navn</th>',
        '<th class="border border-slate-200 bg-slate-100 px-2 py-1 text-left">Feil (blokkerende)</th>',
        '<th class="border border-slate-200 bg-slate-100 px-2 py-1 text-left">Advarsler</th>',
        '</tr>'
      ].join('');
      previewBodyEl.innerHTML = rows.map(function (row) {
        var payload = row && row.payload ? row.payload : {};
        var action = String(row && row.action || 'reject');
        var blockingErrors = Array.isArray(row && row.blockingErrors) ? row.blockingErrors : [];
        var warnings = Array.isArray(row && row.warnings) ? row.warnings : [];
        var actionClass = 'bg-rose-50 text-rose-800 border-rose-200';
        if (action === 'insert') actionClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (action === 'update') actionClass = 'bg-sky-50 text-sky-800 border-sky-200';
        if (action === 'skip') actionClass = 'bg-amber-50 text-amber-900 border-amber-200';
        return [
          '<tr>',
          '<td class="border border-slate-200 px-2 py-1 align-top">' + escapeHtml(row && row.rowNumber != null ? String(row.rowNumber) : '') + '</td>',
          '<td class="border border-slate-200 px-2 py-1 align-top"><span class="inline-flex rounded border px-2 py-1 text-[11px] font-semibold ' + actionClass + '">' + escapeHtml(action) + '</span></td>',
          '<td class="border border-slate-200 px-2 py-1 align-top">' + escapeHtml(String(payload.id || row.targetId || '')) + '</td>',
          '<td class="border border-slate-200 px-2 py-1 align-top">' + escapeHtml(String(payload.navn || '')) + '</td>',
          '<td class="border border-slate-200 px-2 py-1 align-top">' + escapeHtml(blockingErrors.map(function (err) { return err && err.message ? err.message : ''; }).filter(Boolean).join(' | ')) + '</td>',
          '<td class="border border-slate-200 px-2 py-1 align-top">' + escapeHtml(warnings.map(function (warn) { return warn && warn.message ? warn.message : ''; }).filter(Boolean).join(' | ')) + '</td>',
          '</tr>'
        ].join('');
      }).join('');
      if (previewSummaryEl && state.importPreviewSummary) {
        var summary = state.importPreviewSummary;
        previewSummaryEl.textContent =
          'Totalt: ' + Number(summary.totalRows || 0) +
          ' · insert: ' + Number(summary.insert || 0) +
          ' · update: ' + Number(summary.update || 0) +
          ' · skip: ' + Number(summary.skip || 0) +
          ' · reject: ' + Number(summary.reject || 0);
      } else if (previewSummaryEl) {
        previewSummaryEl.textContent = '';
      }
    } else {
      previewPanelEl.classList.add('hidden');
      previewHeadEl.innerHTML = '';
      previewBodyEl.innerHTML = '';
      if (previewSummaryEl) {
        previewSummaryEl.textContent = '';
      }
    }
  }

  if (resultPanelEl && resultSummaryEl && resultErrorsEl) {
    if (state.importResult) {
      var summary = state.importResult.summary || state.importResult;
      resultSummaryEl.textContent =
        'Status: ' + escapeHtml(String(summary.status || state.importResult.totalStatus || 'ukjent')) +
        ' · Opprettet: ' + Number(summary.inserted != null ? summary.inserted : state.importResult.inserted || 0) +
        ' · Oppdatert: ' + Number(summary.updated != null ? summary.updated : state.importResult.updated || 0) +
        ' · Hoppet over: ' + Number(summary.skipped != null ? summary.skipped : state.importResult.skipped || 0) +
        ' · Avvist: ' + Number(summary.rejected != null ? summary.rejected : state.importResult.rejected || 0);
      const errors = Array.isArray(state.importResult.errors) ? state.importResult.errors : [];
      resultErrorsEl.innerHTML = errors.map(function (err) {
        return '<li>Rad ' + escapeHtml(err.row || '?') + (err.field ? (' [' + escapeHtml(err.field) + ']') : '') + ': ' + escapeHtml(err.message || 'Ukjent feil') + '</li>';
      }).join('');
    } else {
      resultSummaryEl.textContent = '';
      resultErrorsEl.innerHTML = '';
    }
  }

  if (importConfirmButtonEl) {
    importConfirmButtonEl.disabled = !state.importPreviewToken;
    importConfirmButtonEl.classList.toggle('opacity-60', !state.importPreviewToken);
    importConfirmButtonEl.classList.toggle('cursor-not-allowed', !state.importPreviewToken);
  }

  if (importActionFeedbackEl) {
    if (state.route === 'import' && state.writeError) {
      importActionFeedbackEl.classList.remove('hidden');
      importActionFeedbackEl.textContent = state.writeError;
    } else {
      importActionFeedbackEl.classList.add('hidden');
      importActionFeedbackEl.textContent = '';
    }
  }
}

function bindEvents() {
  function addListenerIfElement(element, eventName, handler) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(eventName, handler);
    }
  }

  const searchInputEl = document.getElementById('search-input');
  const sortSelectEl = document.getElementById('sort-select');
  const statusFilterEl = document.getElementById('status-filter');
  const plasseringFilterEl = document.getElementById('plassering-filter');
  const arrangementFilterEl = document.getElementById('arrangement-filter');
  const inventoryListEl = document.getElementById('inventory-list');
  const mobileBackButtonEl = document.getElementById('mobile-back-button');
  const nyVareButtonEl = document.getElementById('ny-vare-button');
  const createButtonEl = document.getElementById('create-button');
  const updateButtonEl = document.getElementById('update-button');
  const softDeleteButtonEl = document.getElementById('soft-delete-button');
  const hardDeleteButtonEl = document.getElementById('hard-delete-button');
  const inventoryFormEl = document.getElementById('inventory-form');
  const formStatusEl = document.getElementById('form-status');
  const formTilstandEl = document.getElementById('form-tilstand');
  const formSubunitAddButtonEl = document.getElementById('inventory-form-underenheter-add-button');
  const formAttributeAddButtonEl = document.getElementById('inventory-form-attributter-add-button');
  const formAttachmentAddButtonEl = document.getElementById('form-attachment-add-button');
  const loanFormEl = document.getElementById('loan-form');
  const loanCreateButtonEl = document.getElementById('loan-create-button');
  const loanSelectExistingButtonEl = document.getElementById('loan-select-existing-button');
  const loanCreateNewBorrowerButtonEl = document.getElementById('loan-create-new-borrower-button');
  const loanBorrowerSelectEl = document.getElementById('loan-borrower-select');
  const loanListEl = document.getElementById('loan-list');
  const detailContentEl = document.getElementById('detail-content');
  const publicListItemsEl = document.getElementById('public-list-items');
  const publicItemContentEl = document.getElementById('public-item-content');
  const loginButtonEl = document.getElementById('login-button');
  const logoutButtonEl = document.getElementById('logout-button');
  const credentialsLoginFormEl = document.getElementById('credentials-login-form');
  const credentialsLoginSubmitEl = document.getElementById('credentials-login-submit');
  const adminToggleButtonEl = document.getElementById('admin-toggle-button');
  const adminPanelEl = document.getElementById('admin-panel');
  const adminAddButtonEl = document.getElementById('admin-add-button');
  const adminAddInputEl = document.getElementById('admin-add-input');
  const downloadImportTemplateButtonEl = document.getElementById('download-import-template-button');
  const exportInventoryButtonEl = document.getElementById('export-inventory-button');
  const importFileInputEl = document.getElementById('import-file-input');
  const importConfirmButtonEl = document.getElementById('import-confirm-button');
  const bulkActionsSelectEl = document.getElementById('bulk-actions-select');
  const bulkStatusSelectEl = document.getElementById('bulk-status-select');
  const bulkActionsRunButtonEl = document.getElementById('bulk-actions-run-button');
  const addToListOverlayEl = document.getElementById('add-to-list-overlay');
  const addToListOverlayCardEl = document.getElementById('add-to-list-overlay-card');
  const addToListOverlayCloseButtonEl = document.getElementById('add-to-list-overlay-close');
  const addToListOverlayCancelButtonEl = document.getElementById('add-to-list-overlay-cancel');
  const addToListOverlaySubmitButtonEl = document.getElementById('add-to-list-overlay-submit');
  const addToListOverlaySelectEl = document.getElementById('add-to-list-overlay-select');
  const addToListOverlayCreateNameEl = document.getElementById('add-to-list-overlay-create-name');
  const addToListOverlayCreateSubmitEl = document.getElementById('add-to-list-overlay-create-submit');
  const bestillingVariantOverlayEl = document.getElementById('bestilling-variant-overlay');
  const bestillingVariantOverlayCardEl = document.getElementById('bestilling-variant-overlay-card');
  const bestillingVariantOverlayCloseEl = document.getElementById('bestilling-variant-overlay-close');
  const bestillingVariantOverlayCancelEl = document.getElementById('bestilling-variant-overlay-cancel');
  const bestillingVariantOverlaySubmitEl = document.getElementById('bestilling-variant-overlay-submit');
  const bestillingVariantOverlayListEl = document.getElementById('bestilling-variant-overlay-list');
  const borrowerStatusFilterEl = document.getElementById('borrower-status-filter');
  const borrowerListEl = document.getElementById('borrower-list');
  const borrowerOpenCreateButtonEl = document.getElementById('borrower-open-create-button');
  const borrowerTypeEl = document.getElementById('borrower-type');
  const borrowerSaveButtonEl = document.getElementById('borrower-save-button');
  const borrowerResetButtonEl = document.getElementById('borrower-reset-button');
  const borrowerCancelButtonEl = document.getElementById('borrower-cancel-button');
  const borrowerBackToRegistryButtonEl = document.getElementById('borrower-back-to-registry-button');
  const borrowerReturnButtonEl = document.getElementById('borrower-return-button');
  const loanCaseSourceTypeEl = document.getElementById('loan-case-source-type');
  const loanCaseCreateButtonEl = document.getElementById('loan-case-create-button');
  const loanCaseListEl = document.getElementById('loan-case-list');

  addListenerIfElement(searchInputEl, 'input', function (event) {
    const target = event.target;
    state.search = target && typeof target.value === 'string' ? target.value : '';
    if (searchInputDebounceTimer) {
      window.clearTimeout(searchInputDebounceTimer);
    }
    searchInputDebounceTimer = window.setTimeout(function () {
      renderInventoryList();
    }, 180);
  });

  addListenerIfElement(sortSelectEl, 'change', function (event) {
    const target = event.target;
    state.sort = target && typeof target.value === 'string' ? target.value : 'navn-asc';
    renderInventoryList();
  });

  addListenerIfElement(statusFilterEl, 'change', function (event) {
    const target = event.target;
    state.filters.status = target && typeof target.value === 'string' ? target.value : '';
    renderInventoryList();
  });

  addListenerIfElement(plasseringFilterEl, 'change', function (event) {
    const target = event.target;
    state.filters.plassering = target && typeof target.value === 'string' ? target.value : '';
    renderInventoryList();
  });

  addListenerIfElement(arrangementFilterEl, 'change', function (event) {
    const target = event.target;
    state.filters.arrangement = target && typeof target.value === 'string' ? target.value : '';
    renderInventoryList();
  });

  addListenerIfElement(formStatusEl, 'change', function () {
    renderInventoryFormChips();
  });

  addListenerIfElement(formTilstandEl, 'change', function () {
    renderInventoryFormChips();
  });

  addListenerIfElement(inventoryListEl, 'click', function (event) {
    const target = event.target;
    const button = target && target.closest ? target.closest('[data-inventory-id]') : null;

    if (!button) {
      return;
    }

    const inventoryId = button.getAttribute('data-inventory-id') || '';
    if (!inventoryId) {
      return;
    }

    void loadInventoryDetail(inventoryId, { historyMode: 'push' });
  });

  addListenerIfElement(inventoryListEl, 'change', function (event) {
    const target = event.target;
    if (!target || !target.getAttribute) {
      return;
    }
    const itemId = String(target.getAttribute('data-bulk-item-id') || '').trim();
    if (!itemId) {
      return;
    }
    state.selectedInventoryIds[itemId] = !!target.checked;
    renderInventoryList();
  });

  addListenerIfElement(mobileBackButtonEl, 'click', function () {
    setWorkspace('liste', { historyMode: 'push' });
    renderState();
  });

  if (nyVareButtonEl) {
    nyVareButtonEl.addEventListener('click', function () {
      state.selectedInventoryId = '';
      state.detailItem = null;
      state.auditEvents = [];
      state.detailError = '';
      state.writeError = '';
      state.writeSuccess = '';
      state.loanForm.itemId = '';
      resetInventoryForm();
      markInventoryFormEditMode('', 'ny-vare-knapp');
      setWorkspace('rediger');
      renderState();
    });
  }

  window.addEventListener('resize', function () {
    renderWorkspaceLayout();
  });

  addListenerIfElement(createButtonEl, 'click', function () {
    console.log('submit-handler aktivert:', { handler: 'createInventoryFromForm' });
    void createInventoryFromForm();
  });

  addListenerIfElement(updateButtonEl, 'click', function () {
    console.log('submit-handler aktivert:', { handler: 'updateInventoryFromForm' });
    void updateInventoryFromForm();
  });

  addListenerIfElement(softDeleteButtonEl, 'click', function () {
    void deleteInventoryFromForm('soft');
  });

  addListenerIfElement(hardDeleteButtonEl, 'click', function () {
    void deleteInventoryFromForm('hard');
  });

  if (inventoryFormEl) {
    inventoryFormEl.addEventListener('input', function () {
      state.formState.edited = true;
    });
    inventoryFormEl.addEventListener('input', function (event) {
      var target = event && event.target ? event.target : null;
      if (!target || !target.getAttribute) {
        return;
      }

      var pendingTitleIndexRaw = target.getAttribute('data-form-pending-title-index');
      var subunitTypeIndexRaw = target.getAttribute('data-form-subunit-type-index');
      if (subunitTypeIndexRaw != null) {
        var subunitTypeIndex = Number(subunitTypeIndexRaw);
        if (!isNaN(subunitTypeIndex) && subunitTypeIndex >= 0 && subunitTypeIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows[subunitTypeIndex].type = String(target.value || '').trim().toLowerCase();
        }
        return;
      }
      var subunitNavnIndexRaw = target.getAttribute('data-form-subunit-navn-index');
      if (subunitNavnIndexRaw != null) {
        var subunitNavnIndex = Number(subunitNavnIndexRaw);
        if (!isNaN(subunitNavnIndex) && subunitNavnIndex >= 0 && subunitNavnIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows[subunitNavnIndex].navn = String(target.value || '').trim();
        }
        return;
      }
      var subunitBeskrivelseIndexRaw = target.getAttribute('data-form-subunit-beskrivelse-index');
      if (subunitBeskrivelseIndexRaw != null) {
        var subunitBeskrivelseIndex = Number(subunitBeskrivelseIndexRaw);
        if (!isNaN(subunitBeskrivelseIndex) && subunitBeskrivelseIndex >= 0 && subunitBeskrivelseIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows[subunitBeskrivelseIndex].beskrivelse = String(target.value || '').trim();
        }
        return;
      }
      var subunitAntallIndexRaw = target.getAttribute('data-form-subunit-antall-index');
      if (subunitAntallIndexRaw != null) {
        var subunitAntallIndex = Number(subunitAntallIndexRaw);
        if (!isNaN(subunitAntallIndex) && subunitAntallIndex >= 0 && subunitAntallIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows[subunitAntallIndex].antall = String(target.value || '').trim();
        }
        return;
      }
      var subunitStatusIndexRaw = target.getAttribute('data-form-subunit-status-index');
      if (subunitStatusIndexRaw != null) {
        var subunitStatusIndex = Number(subunitStatusIndexRaw);
        if (!isNaN(subunitStatusIndex) && subunitStatusIndex >= 0 && subunitStatusIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows[subunitStatusIndex].status = String(target.value || '').trim();
        }
        return;
      }
      var subunitTilstandIndexRaw = target.getAttribute('data-form-subunit-tilstand-index');
      if (subunitTilstandIndexRaw != null) {
        var subunitTilstandIndex = Number(subunitTilstandIndexRaw);
        if (!isNaN(subunitTilstandIndex) && subunitTilstandIndex >= 0 && subunitTilstandIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows[subunitTilstandIndex].tilstand = String(target.value || '').trim();
        }
        return;
      }
      var subunitPendingTitleRow = String(target.getAttribute('data-form-subunit-pending-title-row') || '').trim();
      var subunitPendingTitleIndexRaw = target.getAttribute('data-form-subunit-pending-title-index');
      if (subunitPendingTitleRow && subunitPendingTitleIndexRaw != null) {
        var subunitPendingRow = findSubunitRowByRowId(subunitPendingTitleRow);
        var subunitPendingTitleIndex = Number(subunitPendingTitleIndexRaw);
        if (subunitPendingRow && !isNaN(subunitPendingTitleIndex) && subunitPendingTitleIndex >= 0 && subunitPendingTitleIndex < subunitPendingRow.pendingAttachments.length) {
          subunitPendingRow.pendingAttachments[subunitPendingTitleIndex].tittel = String(target.value || '').trim();
        }
        return;
      }
      var subunitPendingDescriptionRow = String(target.getAttribute('data-form-subunit-pending-description-row') || '').trim();
      var subunitPendingDescriptionIndexRaw = target.getAttribute('data-form-subunit-pending-description-index');
      if (subunitPendingDescriptionRow && subunitPendingDescriptionIndexRaw != null) {
        var subunitPendingDescription = findSubunitRowByRowId(subunitPendingDescriptionRow);
        var subunitPendingDescriptionIndex = Number(subunitPendingDescriptionIndexRaw);
        if (subunitPendingDescription && !isNaN(subunitPendingDescriptionIndex) && subunitPendingDescriptionIndex >= 0 && subunitPendingDescriptionIndex < subunitPendingDescription.pendingAttachments.length) {
          subunitPendingDescription.pendingAttachments[subunitPendingDescriptionIndex].beskrivelse = String(target.value || '').trim();
        }
        return;
      }
      var subunitExistingTitleRow = String(target.getAttribute('data-form-subunit-existing-title-row') || '').trim();
      var subunitExistingTitleId = String(target.getAttribute('data-form-subunit-existing-title-id') || '').trim();
      if (subunitExistingTitleRow && subunitExistingTitleId) {
        var subunitTitleRow = findSubunitRowByRowId(subunitExistingTitleRow);
        if (subunitTitleRow && Array.isArray(subunitTitleRow.existingAttachments)) {
          for (var subunitTitleIndex = 0; subunitTitleIndex < subunitTitleRow.existingAttachments.length; subunitTitleIndex += 1) {
            if (String(subunitTitleRow.existingAttachments[subunitTitleIndex].id || '').trim() === subunitExistingTitleId) {
              subunitTitleRow.existingAttachments[subunitTitleIndex].tittel = String(target.value || '').trim();
              subunitTitleRow.updatedAttachmentIds[subunitExistingTitleId] = true;
              break;
            }
          }
        }
        return;
      }
      var subunitExistingDescriptionRow = String(target.getAttribute('data-form-subunit-existing-description-row') || '').trim();
      var subunitExistingDescriptionId = String(target.getAttribute('data-form-subunit-existing-description-id') || '').trim();
      if (subunitExistingDescriptionRow && subunitExistingDescriptionId) {
        var subunitDescriptionRow = findSubunitRowByRowId(subunitExistingDescriptionRow);
        if (subunitDescriptionRow && Array.isArray(subunitDescriptionRow.existingAttachments)) {
          for (var subunitDescriptionIndex = 0; subunitDescriptionIndex < subunitDescriptionRow.existingAttachments.length; subunitDescriptionIndex += 1) {
            if (String(subunitDescriptionRow.existingAttachments[subunitDescriptionIndex].id || '').trim() === subunitExistingDescriptionId) {
              subunitDescriptionRow.existingAttachments[subunitDescriptionIndex].beskrivelse = String(target.value || '').trim();
              subunitDescriptionRow.updatedAttachmentIds[subunitExistingDescriptionId] = true;
              break;
            }
          }
        }
        return;
      }
      var attributeTypeIndexRaw = target.getAttribute('data-form-attribute-type-index');
      if (attributeTypeIndexRaw != null) {
        var attributeTypeIndex = Number(attributeTypeIndexRaw);
        if (!isNaN(attributeTypeIndex) && attributeTypeIndex >= 0 && attributeTypeIndex < state.formState.attributeRows.length) {
          state.formState.attributeRows[attributeTypeIndex].definitionId = String(target.value || '').trim();
          renderInventoryAttributeRows();
        }
        return;
      }

      var attributeValueIndexRaw = target.getAttribute('data-form-attribute-value-index');
      if (attributeValueIndexRaw != null) {
        var attributeValueIndex = Number(attributeValueIndexRaw);
        if (!isNaN(attributeValueIndex) && attributeValueIndex >= 0 && attributeValueIndex < state.formState.attributeRows.length) {
          state.formState.attributeRows[attributeValueIndex].verdi = String(target.value || '').trim();
        }
        return;
      }

      if (pendingTitleIndexRaw != null) {
        var pendingTitleIndex = Number(pendingTitleIndexRaw);
        if (!isNaN(pendingTitleIndex) && pendingTitleIndex >= 0 && pendingTitleIndex < state.attachmentForm.pendingUploads.length) {
          state.attachmentForm.pendingUploads[pendingTitleIndex].tittel = String(target.value || '').trim();
        }
        return;
      }

      var pendingDescriptionIndexRaw = target.getAttribute('data-form-pending-description-index');
      if (pendingDescriptionIndexRaw != null) {
        var pendingDescriptionIndex = Number(pendingDescriptionIndexRaw);
        if (!isNaN(pendingDescriptionIndex) && pendingDescriptionIndex >= 0 && pendingDescriptionIndex < state.attachmentForm.pendingUploads.length) {
          state.attachmentForm.pendingUploads[pendingDescriptionIndex].beskrivelse = String(target.value || '').trim();
        }
        return;
      }

      var existingTitleId = String(target.getAttribute('data-form-attachment-title-id') || '').trim();
      if (existingTitleId) {
        for (var i = 0; i < state.attachmentForm.existingAttachments.length; i++) {
          if (state.attachmentForm.existingAttachments[i].id === existingTitleId) {
            state.attachmentForm.existingAttachments[i].tittel = String(target.value || '').trim();
            state.attachmentForm.updatedAttachmentIds[existingTitleId] = true;
            break;
          }
        }
        return;
      }

      var existingDescriptionId = String(target.getAttribute('data-form-attachment-description-id') || '').trim();
      if (existingDescriptionId) {
        for (var j = 0; j < state.attachmentForm.existingAttachments.length; j++) {
          if (state.attachmentForm.existingAttachments[j].id === existingDescriptionId) {
            state.attachmentForm.existingAttachments[j].beskrivelse = String(target.value || '').trim();
            state.attachmentForm.updatedAttachmentIds[existingDescriptionId] = true;
            break;
          }
        }
      }
    });
    inventoryFormEl.addEventListener('click', function (event) {
      const target = event.target;
      const removePendingButton = target && target.closest ? target.closest('[data-form-attachment-remove-pending]') : null;
      const removeSubunitButton = target && target.closest ? target.closest('[data-form-subunit-remove-index]') : null;
      const addSubunitAttachmentButton = target && target.closest ? target.closest('[data-form-subunit-attachment-add-row]') : null;
      const removeSubunitPendingButton = target && target.closest ? target.closest('[data-form-subunit-remove-pending-row]') : null;
      const removeSubunitExistingButton = target && target.closest ? target.closest('[data-form-subunit-remove-existing-row]') : null;
      const setSubunitMainImageButton = target && target.closest ? target.closest('[data-form-subunit-set-main-row]') : null;
      const removeAttributeButton = target && target.closest ? target.closest('[data-form-attribute-remove-index]') : null;
      if (addSubunitAttachmentButton) {
        const subunitRowId = String(addSubunitAttachmentButton.getAttribute('data-form-subunit-attachment-add-row') || '').trim();
        void queueSubunitAttachmentsFromInput(subunitRowId);
        return;
      }
      if (removeSubunitPendingButton) {
        var removeSubunitPendingRowId = String(removeSubunitPendingButton.getAttribute('data-form-subunit-remove-pending-row') || '').trim();
        var removeSubunitPendingIndex = Number(removeSubunitPendingButton.getAttribute('data-form-subunit-remove-pending-index'));
        var removeSubunitPendingRow = findSubunitRowByRowId(removeSubunitPendingRowId);
        if (removeSubunitPendingRow && !isNaN(removeSubunitPendingIndex) && removeSubunitPendingIndex >= 0 && removeSubunitPendingIndex < removeSubunitPendingRow.pendingAttachments.length) {
          removeSubunitPendingRow.pendingAttachments.splice(removeSubunitPendingIndex, 1);
          state.formState.edited = true;
          renderInventorySubunitRows();
        }
        return;
      }
      if (removeSubunitExistingButton) {
        var removeSubunitExistingRowId = String(removeSubunitExistingButton.getAttribute('data-form-subunit-remove-existing-row') || '').trim();
        var removeSubunitExistingId = String(removeSubunitExistingButton.getAttribute('data-form-subunit-remove-existing-id') || '').trim();
        var removeSubunitExistingRow = findSubunitRowByRowId(removeSubunitExistingRowId);
        if (removeSubunitExistingRow && removeSubunitExistingId) {
          removeSubunitExistingRow.removedAttachmentIds[removeSubunitExistingId] = true;
          delete removeSubunitExistingRow.updatedAttachmentIds[removeSubunitExistingId];
          if (String(removeSubunitExistingRow.hovedbildeDokumentId || '').trim() === removeSubunitExistingId) {
            removeSubunitExistingRow.hovedbildeDokumentId = '';
          }
          state.formState.edited = true;
          renderInventorySubunitRows();
        }
        return;
      }
      if (setSubunitMainImageButton) {
        var setSubunitMainImageRowId = String(setSubunitMainImageButton.getAttribute('data-form-subunit-set-main-row') || '').trim();
        var setSubunitMainImageId = String(setSubunitMainImageButton.getAttribute('data-form-subunit-set-main-id') || '').trim();
        var setSubunitMainImageRow = findSubunitRowByRowId(setSubunitMainImageRowId);
        if (setSubunitMainImageRow && setSubunitMainImageId) {
          setSubunitMainImageRow.hovedbildeDokumentId = setSubunitMainImageId;
          state.formState.edited = true;
          renderInventorySubunitRows();
        }
        return;
      }
      if (removeSubunitButton) {
        const subunitIndex = Number(removeSubunitButton.getAttribute('data-form-subunit-remove-index'));
        if (!isNaN(subunitIndex) && subunitIndex >= 0 && subunitIndex < state.formState.subunitRows.length) {
          state.formState.subunitRows.splice(subunitIndex, 1);
          state.formState.edited = true;
          renderInventorySubunitRows();
        }
        return;
      }
      if (removeAttributeButton) {
        const attributeIndex = Number(removeAttributeButton.getAttribute('data-form-attribute-remove-index'));
        if (!isNaN(attributeIndex) && attributeIndex >= 0 && attributeIndex < state.formState.attributeRows.length) {
          state.formState.attributeRows.splice(attributeIndex, 1);
          state.formState.edited = true;
          renderInventoryAttributeRows();
        }
        return;
      }
      if (removePendingButton) {
        const index = Number(removePendingButton.getAttribute('data-form-attachment-remove-pending'));
        if (!isNaN(index) && index >= 0 && index < state.attachmentForm.pendingUploads.length) {
          state.attachmentForm.pendingUploads.splice(index, 1);
          state.formState.edited = true;
          renderState();
        }
        return;
      }

      const removeExistingButton = target && target.closest ? target.closest('[data-form-attachment-remove-existing]') : null;
      if (removeExistingButton) {
        const attachmentId = String(removeExistingButton.getAttribute('data-form-attachment-remove-existing') || '').trim();
        if (attachmentId) {
          state.attachmentForm.removedAttachmentIds[attachmentId] = true;
          delete state.attachmentForm.updatedAttachmentIds[attachmentId];
          state.formState.edited = true;
          renderState();
        }
      }
    });
  }

  addListenerIfElement(formAttachmentAddButtonEl, 'click', function () {
    void queueInventoryFormAttachmentsFromInput();
  });
  addListenerIfElement(formSubunitAddButtonEl, 'click', function () {
    var statusValues = getMasterdataValues('status');
    var tilstandValues = getMasterdataValues('tilstand');
    state.formState.subunitRows.push({
      rowId: 'row-' + String(Date.now()) + '-' + String(Math.floor(Math.random() * 1000000)),
      id: '',
      type: '',
      navn: '',
      beskrivelse: '',
      antall: '0',
      status: statusValues[0] || '',
      tilstand: tilstandValues[0] || '',
      hovedbildeDokumentId: '',
      existingAttachments: [],
      pendingAttachments: [],
      removedAttachmentIds: {},
      updatedAttachmentIds: {}
    });
    state.formState.edited = true;
    renderInventorySubunitRows();
  });
  addListenerIfElement(formAttributeAddButtonEl, 'click', function () {
    state.formState.attributeRows.push({ definitionId: '', verdi: '' });
    state.formState.edited = true;
    renderInventoryAttributeRows();
  });

  if (loanFormEl) {
    loanFormEl.addEventListener('input', function (event) {
      const target = event.target;
      if (!target || !target.name) {
        return;
      }
      state.loanForm[target.name] = target.value || '';
    });
  }

  if (loanCreateButtonEl) {
    loanCreateButtonEl.addEventListener('click', function () {
      void createLoanFromForm();
    });
  }

  if (loanSelectExistingButtonEl) {
    loanSelectExistingButtonEl.addEventListener('click', function () {
      if (loanBorrowerSelectEl) {
        loanBorrowerSelectEl.focus();
      }
    });
  }

  if (loanCreateNewBorrowerButtonEl) {
    loanCreateNewBorrowerButtonEl.addEventListener('click', function () {
      openBorrowerCreateFromLoan('utlan');
    });
  }

  if (loanBorrowerSelectEl) {
    loanBorrowerSelectEl.addEventListener('change', function (event) {
      var target = event.target;
      applyLoanBorrowerSelection(target && target.value || '');
      renderState();
    });
  }

  if (loanListEl) {
    loanListEl.addEventListener('click', function (event) {
      const target = event.target;
      const button = target && target.closest ? target.closest('[data-loan-return-button]') : null;
      if (!button) {
        return;
      }
      const loanId = button.getAttribute('data-loan-return-button') || '';
      if (!loanId) {
        return;
      }
      void returnLoanFromList(loanId);
    });
  }

  if (detailContentEl) {
    detailContentEl.addEventListener('click', function (event) {
      const target = event.target;

      const redigerButton = target && target.closest ? target.closest('[data-rediger-detail]') : null;
      if (redigerButton) {
        markInventoryFormEditMode(state.selectedInventoryId, 'rediger-fra-detalj');
        setWorkspace('rediger', { historyMode: 'push' });
        renderState();
        return;
      }

      const utlanButton = target && target.closest ? target.closest('[data-open-utlan]') : null;
      if (utlanButton) {
        var detailItemId = String(state.selectedInventoryId || '').trim();
        if (!detailItemId) {
          state.writeError = 'Ingen vare valgt i detaljvisningen.';
          renderState();
          return;
        }
        openLoanWorkspaceFromContext([detailItemId], 'detalj');
        return;
      }
      const detailAddToOrderButton = target && target.closest ? target.closest('[data-detail-add-to-order]') : null;
      if (detailAddToOrderButton) {
        var detailOrderItemId = String(state.selectedInventoryId || '').trim();
        if (!detailOrderItemId) {
          state.writeError = 'Ingen vare valgt i detaljvisningen.';
          renderState();
          return;
        }
        var detailItem = findInventoryItemWithDetailFallback(detailOrderItemId);
        var detailVariants = getVariantSubunitsForItem(detailItem || {});
        if (detailVariants.length > 0) {
          openBestillingVariantOverlay(detailItem || {}, detailAddToOrderButton);
          return;
        }
        void addItemsToBestillingDraft([detailOrderItemId], 'detaljvisning', detailAddToOrderButton, 'detail-add-to-order');
        return;
      }
      const detailLoanCreateButton = target && target.closest ? target.closest('[data-detail-loan-create]') : null;
      if (detailLoanCreateButton) {
        var selectedFromDetail = String(state.selectedInventoryId || '').trim();
        if (selectedFromDetail) {
          setLoanFlowSelection([selectedFromDetail], 'detalj');
        }
        void createLoanFromForm();
        return;
      }
      const detailLoanOpenExisting = target && target.closest ? target.closest('[data-detail-loan-open-existing]') : null;
      if (detailLoanOpenExisting) {
        var detailBorrowerSelectEl = document.getElementById('detail-loan-borrower-select');
        if (detailBorrowerSelectEl) {
          detailBorrowerSelectEl.focus();
        }
        return;
      }
      const detailLoanOpenCreate = target && target.closest ? target.closest('[data-detail-loan-open-create]') : null;
      if (detailLoanOpenCreate) {
        openBorrowerCreateFromLoan('detalj');
        return;
      }
      const detailLoanReturnButton = target && target.closest ? target.closest('[data-detail-loan-return-button]') : null;
      if (detailLoanReturnButton) {
        var detailLoanId = String(detailLoanReturnButton.getAttribute('data-detail-loan-return-button') || '').trim();
        if (!detailLoanId) {
          return;
        }
        void returnLoanFromList(detailLoanId);
        return;
      }

      const detailAddToSelectedListButton = target && target.closest ? target.closest('[data-detail-list-add]') : null;
      if (detailAddToSelectedListButton) {
        void addSelectedDetailItemToList(readDetailSelectedListId());
        return;
      }

      const detailToggleCreateButton = target && target.closest ? target.closest('[data-detail-list-toggle-create]') : null;
      if (detailToggleCreateButton) {
        state.detailListCreateOpen = !state.detailListCreateOpen;
        renderDetailWorkspaceState();
        return;
      }

      const detailCreateListButton = target && target.closest ? target.closest('[data-detail-list-create]') : null;
      if (detailCreateListButton) {
        void createListeFraDetaljflyt();
        return;
      }

      const detailCreateCancelButton = target && target.closest ? target.closest('[data-detail-list-create-cancel]') : null;
      if (detailCreateCancelButton) {
        state.detailListCreateOpen = false;
        renderDetailWorkspaceState();
        return;
      }

      const backToListButton = target && target.closest ? target.closest('[data-detail-back-to-list]') : null;
      if (backToListButton) {
        setWorkspace('liste', { historyMode: 'push' });
        renderState();
        return;
      }
      const ensurePublicLinkButton = target && target.closest ? target.closest('[data-public-link-ensure]') : null;
      if (ensurePublicLinkButton) {
        void updatePublicProductLink(getDetailContextItemId(), 'ensure');
        return;
      }
      const copyPublicLinkButton = target && target.closest ? target.closest('[data-public-link-copy]') : null;
      if (copyPublicLinkButton) {
        void copyDetailPublicLink();
        return;
      }
      const regeneratePublicLinkButton = target && target.closest ? target.closest('[data-public-link-regenerate]') : null;
      if (regeneratePublicLinkButton) {
        void updatePublicProductLink(getDetailContextItemId(), 'regenerate');
        return;
      }
      const revokePublicLinkButton = target && target.closest ? target.closest('[data-public-link-revoke]') : null;
      if (revokePublicLinkButton) {
        void updatePublicProductLink(getDetailContextItemId(), 'revoke');
        return;
      }

      const accordionButton = target && target.closest ? target.closest('[data-detail-accordion-toggle]') : null;
      if (accordionButton) {
        var sectionId = String(accordionButton.getAttribute('data-detail-accordion-toggle') || '').trim();
        if (!sectionId) {
          return;
        }
        state.detailAccordionOpenSection = state.detailAccordionOpenSection === sectionId
          ? ''
          : sectionId;
        ensureDetailAccordionSection();
        persistCurrentViewState();
        syncNavigationUrl('replace');
        renderDetailWorkspaceState();
        return;
      }

      const openOverlayButton = target && target.closest ? target.closest('[data-open-document-overlay]') : null;
      if (openOverlayButton) {
        const documentId = String(openOverlayButton.getAttribute('data-open-document-overlay') || '').trim();
        if (!documentId) {
          return;
        }
        var vedlegg = state.detailItem && Array.isArray(state.detailItem.vedlegg) ? state.detailItem.vedlegg.slice() : [];
        var underenheterForOverlay = state.detailItem && Array.isArray(state.detailItem.underenheter) ? state.detailItem.underenheter : [];
        for (var underenhetIndex = 0; underenhetIndex < underenheterForOverlay.length; underenhetIndex += 1) {
          var underenhetVedlegg = Array.isArray(underenheterForOverlay[underenhetIndex].vedlegg) ? underenheterForOverlay[underenhetIndex].vedlegg : [];
          vedlegg = vedlegg.concat(underenhetVedlegg);
        }
        for (var index = 0; index < vedlegg.length; index += 1) {
          if (String(vedlegg[index].id || '').trim() === documentId) {
            void openAttachmentOverlay(vedlegg[index], openOverlayButton);
            break;
          }
        }
        return;
      }

      const setMainImageButton = target && target.closest ? target.closest('[data-set-main-image-id]') : null;
      if (setMainImageButton) {
        const documentIdForMainImage = String(setMainImageButton.getAttribute('data-set-main-image-id') || '').trim();
        if (!documentIdForMainImage || !state.selectedInventoryId) {
          return;
        }
        void (async function () {
          state.writeError = '';
          state.writeSuccess = '';
          renderState();
          const result = await setMainImageByDocumentId(state.selectedInventoryId, documentIdForMainImage);
          if (!result.ok) {
            state.writeError = result.message || 'Kunne ikke velge hovedbilde.';
            renderState();
            return;
          }
          state.writeSuccess = 'Hovedbilde oppdatert.';
          await loadInventoryList({ autoLoadFirstDetail: false });
          await loadInventoryDetail(state.selectedInventoryId, { switchToDetail: false });
          renderState();
        })();
        return;
      }

      const deleteButton = target && target.closest ? target.closest('[data-document-delete-id]') : null;
      if (!deleteButton) {
        return;
      }

      const documentId = deleteButton.getAttribute('data-document-delete-id') || '';
      if (!documentId) {
        return;
      }
      void deleteDocumentFromDetailPanel(documentId);
    });

    detailContentEl.addEventListener('change', function (event) {
      const target = event.target;
      if (!target) {
        return;
      }
      if (target.id === 'detail-list-select') {
        state.detailListSelectedId = String(target.value || '').trim();
        return;
      }
      if (target.id === 'detail-loan-borrower-select') {
        applyLoanBorrowerSelection(String(target.value || '').trim());
        renderState();
        return;
      }
    });
    detailContentEl.addEventListener('input', function (event) {
      const target = event.target;
      const loanField = target && target.getAttribute ? String(target.getAttribute('data-detail-loan-field') || '').trim() : '';
      if (loanField) {
        state.loanForm[loanField] = target.value || '';
      }
    });
  }

  if (publicItemContentEl) {
    publicItemContentEl.addEventListener('click', function (event) {
      const target = event.target;
      const accordionButton = target && target.closest ? target.closest('[data-public-item-accordion-toggle]') : null;
      if (!accordionButton) {
        return;
      }
      var sectionId = String(accordionButton.getAttribute('data-public-item-accordion-toggle') || '').trim();
      if (!sectionId) {
        return;
      }
      state.offentligVareVisning.accordionSection = state.offentligVareVisning.accordionSection === sectionId
        ? ''
        : sectionId;
      ensurePublicItemAccordionSection();
      renderOffentligVare();
    });
    publicItemContentEl.addEventListener('error', function (event) {
      const target = event.target;
      if (!target || target.tagName !== 'IMG' || !target.getAttribute('data-public-item-image')) {
        return;
      }
      const imageId = String(target.getAttribute('data-public-item-image-id') || '').trim();
      if (imageId) {
        var loadingEl = publicItemContentEl.querySelector('[data-public-item-image-loading="' + imageId + '"]');
        if (loadingEl) {
          loadingEl.classList.add('hidden');
        }
        var fallbackEl = publicItemContentEl.querySelector('[data-public-item-image-fallback="' + imageId + '"]');
        if (fallbackEl) {
          fallbackEl.classList.remove('hidden');
        }
      }
      target.remove();
    }, true);
  }

  if (publicListItemsEl) {
    publicListItemsEl.addEventListener('click', function (event) {
      const target = event.target;
      const openPublicItemButton = target && target.closest ? target.closest('[data-open-public-item-share-code]') : null;
      if (!openPublicItemButton) {
        return;
      }
      var itemShareCode = String(openPublicItemButton.getAttribute('data-open-public-item-share-code') || '').trim();
      var listShareCode = String(openPublicItemButton.getAttribute('data-open-public-item-list-share-code') || '').trim();
      if (!itemShareCode || !listShareCode) {
        state.offentligVareVisning.aktiv = true;
        state.route = 'offentligVare';
        state.offentligVareVisning.feil = 'Mangler gyldig offentlig listekontekst for varedetalj.';
        renderState();
        return;
      }
      window.location.href = buildPublicItemShareUrl(itemShareCode, listShareCode);
    });
  }

  if (inventoryFormEl) {
    inventoryFormEl.addEventListener('click', function (event) {
      const target = event.target;
      const accordionButton = target && target.closest ? target.closest('[data-inventory-form-accordion-toggle]') : null;
      if (!accordionButton) {
        return;
      }
      var sectionId = String(accordionButton.getAttribute('data-inventory-form-accordion-toggle') || '').trim();
      if (!sectionId) {
        return;
      }
      state.inventoryFormAccordionOpenSection = state.inventoryFormAccordionOpenSection === sectionId
        ? ''
        : sectionId;
      ensureInventoryFormAccordionSection();
      renderInventoryFormAccordionState();
    });
  }

  const hamburgerButtonEl = document.getElementById('hamburger-button');
  const headerAuthButtonEl = document.getElementById('header-auth-button');
  const menuLagerlisteEl = document.getElementById('menu-lagerliste');
  const menuLagerEl = document.getElementById('menu-lager');
  const menuBestillingEl = document.getElementById('menu-bestilling');
  const orderCartButtonEl = document.getElementById('order-cart-button');
  const menuListerEl = document.getElementById('menu-lister');
  const menuNyVareEl = document.getElementById('menu-ny-vare');
  const menuUtlanEl = document.getElementById('menu-utlan');
  const listSummaryListEl = document.getElementById('list-summary-list');
  const listCreateButtonEl = document.getElementById('list-create-button');
  const listUpdateButtonEl = document.getElementById('list-update-button');
  const listDeleteButtonEl = document.getElementById('list-delete-button');
  const listShareCopyButtonEl = document.getElementById('list-share-copy-button');
  const listItemAddButtonEl = document.getElementById('list-item-add-button');
  const listReloadButtonEl = document.getElementById('list-reload-button');
  const listItemListEl = document.getElementById('list-item-list');
  const orderSubmitButtonEl = document.getElementById('order-submit-button');
  const orderLinesListEl = document.getElementById('order-lines-list');
  const lagerOrderListEl = document.getElementById('lager-order-list');
  const lagerOrderDetailEl = document.getElementById('lager-order-detail');
  const settingsSubpageButtonEls = document.querySelectorAll('[data-settings-subpage-target]');

  function closeHamburgerMenu() {
    state.menuOpen = false;
    renderHamburgerMenu();
  }

  function closeHeaderAuthMenu() {
    state.headerAuthMenuOpen = false;
    renderHeaderAuthStatus();
  }

  function repositionOpenHeaderAuthMenu() {
    if (!state.headerAuthMenuOpen) {
      return;
    }
    var wrapperEl = document.getElementById('header-auth-wrapper');
    var dropdownEl = document.getElementById('header-auth-dropdown');
    positionHeaderAuthDropdown(wrapperEl, dropdownEl);
  }

  function repositionOpenHamburgerMenu() {
    if (!state.menuOpen) {
      return;
    }
    var menuEl = document.getElementById('hamburger-menu');
    var buttonEl = document.getElementById('hamburger-button');
    positionHamburgerMenu(buttonEl, menuEl);
  }

  function repositionOpenHeaderMenus() {
    repositionOpenHeaderAuthMenu();
    repositionOpenHamburgerMenu();
  }

  if (hamburgerButtonEl) {
    hamburgerButtonEl.addEventListener('click', function (event) {
      event.stopPropagation();
      state.menuOpen = !state.menuOpen;
      renderHamburgerMenu();
    });
  }

  if (headerAuthButtonEl) {
    headerAuthButtonEl.addEventListener('click', function (event) {
      event.stopPropagation();
      state.headerAuthMenuOpen = !state.headerAuthMenuOpen;
      renderHeaderAuthStatus();
    });
  }

  var traceabilityAccordionToggleEl = document.getElementById('traceability-accordion-toggle');
  if (traceabilityAccordionToggleEl) {
    traceabilityAccordionToggleEl.addEventListener('click', function () {
      state.traceabilityAccordionOpen = !state.traceabilityAccordionOpen;
      renderTraceabilityAccordionState();
    });
  }

  window.addEventListener('resize', repositionOpenHeaderMenus);
  window.addEventListener('orientationchange', repositionOpenHeaderMenus);

  document.addEventListener('click', function (event) {
    if (state.menuOpen) {
      const menuEl = document.getElementById('hamburger-menu');
      if (menuEl && !menuEl.contains(event.target)) {
        closeHamburgerMenu();
      }
    }
    if (state.headerAuthMenuOpen) {
      const headerAuthWrapperEl = document.getElementById('header-auth-wrapper');
      if (headerAuthWrapperEl && !headerAuthWrapperEl.contains(event.target)) {
        closeHeaderAuthMenu();
      }
    }

    if (state.mediaOverlay.open) {
      var overlayCardEl = document.getElementById('attachment-overlay-card');
      var overlayEl = document.getElementById('attachment-overlay');
      if (overlayEl && event.target === overlayEl) {
        closeAttachmentOverlay();
        return;
      }
      if (overlayCardEl && !overlayCardEl.contains(event.target) && overlayEl && overlayEl.contains(event.target)) {
        closeAttachmentOverlay();
      }
    }

    if (state.addToListOverlay.open) {
      if (addToListOverlayEl && event.target === addToListOverlayEl) {
        closeAddToListOverlay();
        return;
      }
      if (addToListOverlayCardEl && !addToListOverlayCardEl.contains(event.target) && addToListOverlayEl && addToListOverlayEl.contains(event.target)) {
        closeAddToListOverlay();
        return;
      }
    }

    if (state.bestillingVariantOverlay.open) {
      if (bestillingVariantOverlayEl && event.target === bestillingVariantOverlayEl) {
        closeBestillingVariantOverlay();
        return;
      }
      if (bestillingVariantOverlayCardEl && !bestillingVariantOverlayCardEl.contains(event.target) && bestillingVariantOverlayEl && bestillingVariantOverlayEl.contains(event.target)) {
        closeBestillingVariantOverlay();
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (state.bestillingVariantOverlay.open) {
        closeBestillingVariantOverlay();
        return;
      }
      if (state.addToListOverlay.open) {
        closeAddToListOverlay();
        return;
      }
      if (state.mediaOverlay.open) {
        closeAttachmentOverlay();
        return;
      }
      if (state.menuOpen) {
        closeHamburgerMenu();
        if (hamburgerButtonEl) {
          hamburgerButtonEl.focus();
        }
        return;
      }
      if (state.headerAuthMenuOpen) {
        closeHeaderAuthMenu();
        if (headerAuthButtonEl) {
          headerAuthButtonEl.focus();
        }
      }
    }
  });

  var overlayCloseButtonEl = document.getElementById('attachment-overlay-close');
  if (overlayCloseButtonEl) {
    overlayCloseButtonEl.addEventListener('click', function () {
      closeAttachmentOverlay();
    });
  }
  var overlayBodyEl = document.getElementById('attachment-overlay-body');
  if (overlayBodyEl) {
    overlayBodyEl.addEventListener('click', function(event) {
      var target = event.target;
      var downloadButton = target && target.closest ? target.closest('[data-download-overlay-document]') : null;
      if (downloadButton) {
        downloadOverlayDocument();
      }
    });
  }
  if (addToListOverlayCloseButtonEl) {
    addToListOverlayCloseButtonEl.addEventListener('click', function () {
      closeAddToListOverlay();
    });
  }
  if (addToListOverlayCancelButtonEl) {
    addToListOverlayCancelButtonEl.addEventListener('click', function () {
      closeAddToListOverlay();
    });
  }
  if (addToListOverlaySubmitButtonEl) {
    addToListOverlaySubmitButtonEl.addEventListener('click', function () {
      void confirmAddToListOverlaySelection();
    });
  }
  if (addToListOverlaySelectEl) {
    addToListOverlaySelectEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      state.addToListOverlay.selectedListId = target && target.value ? String(target.value).trim() : '';
      state.addToListOverlay.error = '';
      renderAddToListOverlay();
    });
  }
  if (addToListOverlayCreateNameEl) {
    addToListOverlayCreateNameEl.addEventListener('input', function (event) {
      var target = event && event.target ? event.target : null;
      state.addToListOverlay.createName = target && target.value ? String(target.value) : '';
      if (state.addToListOverlay.createFeedbackType === 'error') {
        state.addToListOverlay.createFeedbackType = '';
        state.addToListOverlay.createFeedbackMessage = '';
      }
      renderAddToListOverlay();
    });
    addToListOverlayCreateNameEl.addEventListener('keydown', function (event) {
      if (event && event.key === 'Enter') {
        event.preventDefault();
        void createListeFraAddToListOverlay();
      }
    });
  }
  if (addToListOverlayCreateSubmitEl) {
    addToListOverlayCreateSubmitEl.addEventListener('click', function () {
      void createListeFraAddToListOverlay();
    });
  }
  if (bestillingVariantOverlayCloseEl) {
    bestillingVariantOverlayCloseEl.addEventListener('click', function () {
      closeBestillingVariantOverlay();
    });
  }
  if (bestillingVariantOverlayCancelEl) {
    bestillingVariantOverlayCancelEl.addEventListener('click', function () {
      closeBestillingVariantOverlay();
    });
  }
  if (bestillingVariantOverlaySubmitEl) {
    bestillingVariantOverlaySubmitEl.addEventListener('click', function () {
      void confirmBestillingVariantOverlaySelection();
    });
  }
  if (bestillingVariantOverlayListEl) {
    bestillingVariantOverlayListEl.addEventListener('click', function (event) {
      var target = event && event.target ? event.target : null;
      var minusButton = target && target.closest ? target.closest('[data-bestilling-variant-minus]') : null;
      var plusButton = target && target.closest ? target.closest('[data-bestilling-variant-plus]') : null;
      var variantId = '';
      var delta = 0;
      if (minusButton) {
        variantId = String(minusButton.getAttribute('data-bestilling-variant-minus') || '').trim();
        delta = -1;
      } else if (plusButton) {
        variantId = String(plusButton.getAttribute('data-bestilling-variant-plus') || '').trim();
        delta = 1;
      }
      if (!variantId || !delta) {
        return;
      }
      var variants = Array.isArray(state.bestillingVariantOverlay.variants) ? state.bestillingVariantOverlay.variants : [];
      var currentVariant = null;
      for (var variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
        var variant = variants[variantIndex] || {};
        if (String(variant.id || '').trim() === variantId) {
          currentVariant = variant;
          break;
        }
      }
      var maxAvailable = readVariantAvailableQuantity(currentVariant);
      var quantityMap = state.bestillingVariantOverlay.selectedVariantQuantities && typeof state.bestillingVariantOverlay.selectedVariantQuantities === 'object'
        ? state.bestillingVariantOverlay.selectedVariantQuantities
        : {};
      var currentValue = clampVariantSelectionQuantity(quantityMap[variantId], maxAvailable);
      quantityMap[variantId] = clampVariantSelectionQuantity(currentValue + delta, maxAvailable);
      state.bestillingVariantOverlay.selectedVariantQuantities = quantityMap;
      state.bestillingVariantOverlay.error = '';
      renderBestillingVariantOverlay();
    });
    bestillingVariantOverlayListEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      var variantId = String(target && target.getAttribute ? target.getAttribute('data-bestilling-variant-option') : '').trim();
      if (variantId) {
        var selectedVariantIds = Array.isArray(state.bestillingVariantOverlay.selectedVariantIds)
          ? state.bestillingVariantOverlay.selectedVariantIds.slice()
          : [];
        var index = selectedVariantIds.indexOf(variantId);
        if (target.checked && index < 0) {
          selectedVariantIds.push(variantId);
        } else if (!target.checked && index >= 0) {
          selectedVariantIds.splice(index, 1);
        }
        state.bestillingVariantOverlay.selectedVariantIds = selectedVariantIds;
        state.bestillingVariantOverlay.error = '';
        renderBestillingVariantOverlay();
        return;
      }
      var quantityVariantId = String(target && target.getAttribute ? target.getAttribute('data-bestilling-variant-quantity') : '').trim();
      if (!quantityVariantId) {
        return;
      }
      var variants = Array.isArray(state.bestillingVariantOverlay.variants) ? state.bestillingVariantOverlay.variants : [];
      var currentVariant = null;
      for (var variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
        var variant = variants[variantIndex] || {};
        if (String(variant.id || '').trim() === quantityVariantId) {
          currentVariant = variant;
          break;
        }
      }
      var maxAvailable = readVariantAvailableQuantity(currentVariant);
      var quantityMap = state.bestillingVariantOverlay.selectedVariantQuantities && typeof state.bestillingVariantOverlay.selectedVariantQuantities === 'object'
        ? state.bestillingVariantOverlay.selectedVariantQuantities
        : {};
      quantityMap[quantityVariantId] = clampVariantSelectionQuantity(target && target.value ? target.value : '1', maxAvailable);
      state.bestillingVariantOverlay.selectedVariantQuantities = quantityMap;
      state.bestillingVariantOverlay.error = '';
      renderBestillingVariantOverlay();
    });
  }

  if (menuLagerlisteEl) {
    menuLagerlisteEl.addEventListener('click', function () {
      closeHamburgerMenu();
      setWorkspace('liste', { historyMode: 'push' });
      renderState();
    });
  }

  if (menuBestillingEl) {
    menuBestillingEl.addEventListener('click', function () {
      closeHamburgerMenu();
      setWorkspace('bestilling', { historyMode: 'push' });
      void loadBestillingDraft().then(function () {
        renderState();
      }).catch(function (error) {
        state.bestilling.errorMessage = String((error && error.message) || 'Kunne ikke hente bestillingsutkast.');
        renderState();
      });
      renderState();
    });
  }

  if (orderCartButtonEl) {
    orderCartButtonEl.addEventListener('click', function () {
      closeHamburgerMenu();
      setWorkspace('bestilling', { historyMode: 'push' });
      void loadBestillingDraft().then(function () {
        renderState();
      }).catch(function (error) {
        state.bestilling.errorMessage = String((error && error.message) || 'Kunne ikke hente bestillingsutkast.');
        renderState();
      });
      renderState();
    });
  }

  if (menuLagerEl) {
    menuLagerEl.addEventListener('click', function () {
      closeHamburgerMenu();
      setWorkspace('lager', { historyMode: 'push' });
      void Promise.all([loadLagerOrderQueue(), loadBorrowers()]).then(function () {
        renderState();
      });
      renderState();
    });
  }

  if (menuListerEl) {
    menuListerEl.addEventListener('click', function () {
      closeHamburgerMenu();
      setWorkspace('lister', { historyMode: 'push' });
      void loadLister().then(function () {
        renderState();
      });
      renderState();
    });
  }

  if (menuNyVareEl) {
    menuNyVareEl.addEventListener('click', function () {
      closeHamburgerMenu();
      state.selectedInventoryId = '';
      state.detailItem = null;
      state.auditEvents = [];
      state.detailError = '';
      state.writeError = '';
      state.writeSuccess = '';
      state.loanForm.itemId = '';
      resetInventoryForm();
      markInventoryFormEditMode('', 'ny-vare-meny');
      setWorkspace('rediger', { historyMode: 'push' });
      renderState();
    });
  }

  if (menuUtlanEl) {
    menuUtlanEl.addEventListener('click', function () {
      closeHamburgerMenu();
      var selectedIds = Object.keys(state.selectedInventoryIds).filter(function (id) {
        return !!state.selectedInventoryIds[id];
      });
      if (!selectedIds.length && state.selectedInventoryId) {
        selectedIds = [state.selectedInventoryId];
      }
      setLoanFlowSelection(selectedIds, state.route);
      setWorkspace('utlan', { historyMode: 'push' });
      renderState();
    });
  }
  if (borrowerStatusFilterEl) {
    borrowerStatusFilterEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      state.borrowerRegistry.activeFilter = target && target.value === 'all' ? 'all' : 'active';
      void loadBorrowers().then(function () {
        renderState();
      });
    });
  }
  if (borrowerOpenCreateButtonEl) {
    borrowerOpenCreateButtonEl.addEventListener('click', function () {
      openBorrowerCreateWorkspace();
    });
  }
  if (borrowerTypeEl) {
    borrowerTypeEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      var nextType = target && target.value ? String(target.value).trim() : 'person';
      state.borrowerRegistry.form.type = nextType;
      if (nextType === 'person') {
        state.borrowerRegistry.form.organisasjonNavn = '';
        state.borrowerRegistry.form.kontaktpersonNavn = '';
        state.borrowerRegistry.form.kontaktpersonTlf = '';
        state.borrowerRegistry.form.kontaktpersonEpost = '';
      }
      renderBorrowerRegistry();
    });
  }
  var borrowerFormEl = document.getElementById('borrower-form');
  if (borrowerFormEl) {
    borrowerFormEl.addEventListener('input', function () {
      var parsed = parseBorrowerForm();
      fillBorrowerForm(parsed);
    });
  }
  if (borrowerSaveButtonEl) {
    borrowerSaveButtonEl.addEventListener('click', function () {
      void upsertBorrowerFromForm();
    });
  }
  if (borrowerResetButtonEl) {
    borrowerResetButtonEl.addEventListener('click', function () {
      fillBorrowerForm({ mode: 'create', type: 'person', status: 'aktiv' });
      renderBorrowerRegistry();
    });
  }
  if (borrowerCancelButtonEl) {
    borrowerCancelButtonEl.addEventListener('click', function () {
      returnFromBorrowerCreateWorkspace();
    });
  }
  if (borrowerBackToRegistryButtonEl) {
    borrowerBackToRegistryButtonEl.addEventListener('click', function () {
      returnFromBorrowerCreateWorkspace();
    });
  }
  if (borrowerReturnButtonEl) {
    borrowerReturnButtonEl.addEventListener('click', function () {
      returnToLoanFlowAfterBorrower();
    });
  }
  if (borrowerListEl) {
    borrowerListEl.addEventListener('click', function (event) {
      var target = event && event.target ? event.target : null;
      var editButton = target && target.closest ? target.closest('[data-edit-borrower-id]') : null;
      if (!editButton) return;
      var borrowerId = String(editButton.getAttribute('data-edit-borrower-id') || '').trim();
      if (!borrowerId) return;
      void openBorrowerForEdit(borrowerId);
    });
  }
  if (loanCaseSourceTypeEl) {
    loanCaseSourceTypeEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      state.loanCaseRegistry.createForm.sourceType = target && target.value === 'list' ? 'list' : 'item';
      renderLoanCaseRegistry();
    });
  }
  var loanCaseFormEl = document.getElementById('loan-case-form');
  if (loanCaseFormEl) {
    loanCaseFormEl.addEventListener('input', function () {
      state.loanCaseRegistry.createForm = {
        borrowerId: String(document.getElementById('loan-case-borrower-id') && document.getElementById('loan-case-borrower-id').value || '').trim(),
        sourceType: String(document.getElementById('loan-case-source-type') && document.getElementById('loan-case-source-type').value || 'item').trim(),
        itemId: String(document.getElementById('loan-case-item-id') && document.getElementById('loan-case-item-id').value || '').trim(),
        listId: String(document.getElementById('loan-case-list-id') && document.getElementById('loan-case-list-id').value || '').trim(),
        notat: String(document.getElementById('loan-case-note') && document.getElementById('loan-case-note').value || '').trim()
      };
    });
  }
  if (loanCaseCreateButtonEl) {
    loanCaseCreateButtonEl.addEventListener('click', function () {
      void createLoanCaseFromForm();
    });
  }
  if (loanCaseListEl) {
    loanCaseListEl.addEventListener('click', function (event) {
      var target = event && event.target ? event.target : null;
      var openButton = target && target.closest ? target.closest('[data-open-loan-case-id]') : null;
      if (!openButton) return;
      var loanCaseId = String(openButton.getAttribute('data-open-loan-case-id') || '').trim();
      if (!loanCaseId) return;
      void openLoanCase(loanCaseId);
    });
  }
  Array.prototype.forEach.call(settingsSubpageButtonEls, function (buttonEl) {
    buttonEl.addEventListener('click', function () {
      var target = String(buttonEl.getAttribute('data-settings-subpage-target') || '').trim();
      if (target === 'admin') {
        setWorkspace('admin', { historyMode: 'push' });
        renderState();
        return;
      }
      if (target === 'brukeradministrasjon') {
        setWorkspace('brukeradministrasjon', { historyMode: 'push' });
        renderState();
        return;
      }
      if (target === 'lantakere') {
        setWorkspace('lantakere', { historyMode: 'push' });
        void loadBorrowers().then(function () {
          renderState();
        });
        renderState();
        return;
      }
      if (target === 'import') {
        setWorkspace('import', { historyMode: 'push' });
        renderState();
      }
    });
  });

  if (listCreateButtonEl) {
    listCreateButtonEl.addEventListener('click', function () {
      void createListe();
    });
  }
  if (listUpdateButtonEl) {
    listUpdateButtonEl.addEventListener('click', function () {
      void updateAktivListe();
    });
  }
  if (listDeleteButtonEl) {
    listDeleteButtonEl.addEventListener('click', function () {
      void deleteAktivListe();
    });
  }
  if (listShareCopyButtonEl) {
    listShareCopyButtonEl.addEventListener('click', function () {
      void copyAktivListeDelingslenke();
    });
  }
  if (listItemAddButtonEl) {
    listItemAddButtonEl.addEventListener('click', function () {
      void addVareTilAktivListe();
    });
  }
  if (listReloadButtonEl) {
    listReloadButtonEl.addEventListener('click', function () {
      void loadLister().then(function () {
        renderState();
      });
    });
  }
  if (listSummaryListEl) {
    listSummaryListEl.addEventListener('click', function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest('[data-list-id]') : null;
      if (!button) return;
      var listId = String(button.getAttribute('data-list-id') || '').trim();
      if (!listId) return;
      void loadListeDetalj(listId).then(function () {
        renderState();
      });
    });
  }
  if (listItemListEl) {
    listItemListEl.addEventListener('click', function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest('[data-remove-list-item-id]') : null;
      if (!button) return;
      var itemId = String(button.getAttribute('data-remove-list-item-id') || '').trim();
      if (!itemId) return;
      void removeVareFraAktivListe(itemId);
    });
  }

  if (orderSubmitButtonEl) {
    orderSubmitButtonEl.addEventListener('click', function () {
      void submitBestillingDraft();
    });
  }
  if (orderLinesListEl) {
    orderLinesListEl.addEventListener('click', function (event) {
      var target = event && event.target ? event.target : null;
      var decreaseButton = target && target.closest ? target.closest('[data-order-line-decrease]') : null;
      if (decreaseButton) {
        var decreaseLineId = String(decreaseButton.getAttribute('data-order-line-decrease') || '').trim();
        if (!decreaseLineId) return;
        var decreaseLine = (state.bestilling.lines || []).find(function (line) {
          return String(line && line.id || '').trim() === decreaseLineId;
        });
        var decreaseCurrentQty = Number(decreaseLine && decreaseLine.requestedQty || 0);
        if (decreaseCurrentQty > 1) {
          void updateBestillingLineQuantity(decreaseLineId, decreaseCurrentQty - 1);
        }
        return;
      }
      var increaseButton = target && target.closest ? target.closest('[data-order-line-increase]') : null;
      if (increaseButton) {
        var increaseLineId = String(increaseButton.getAttribute('data-order-line-increase') || '').trim();
        if (!increaseLineId) return;
        var increaseLine = (state.bestilling.lines || []).find(function (line) {
          return String(line && line.id || '').trim() === increaseLineId;
        });
        var increaseCurrentQty = Number(increaseLine && increaseLine.requestedQty || 0);
        var safeCurrentQty = increaseCurrentQty > 0 ? increaseCurrentQty : 1;
        void updateBestillingLineQuantity(increaseLineId, safeCurrentQty + 1);
        return;
      }
      var removeButton = target && target.closest ? target.closest('[data-order-line-remove]') : null;
      if (!removeButton) return;
      var lineId = String(removeButton.getAttribute('data-order-line-remove') || '').trim();
      if (!lineId) return;
      void removeBestillingLine(lineId);
    });
    orderLinesListEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      if (!target) return;
      var lineId = String(target.getAttribute('data-order-line-qty') || '').trim();
      if (!lineId) return;
      void updateBestillingLineQuantity(lineId, target.value);
    });
  }
  if (lagerOrderListEl) {
    lagerOrderListEl.addEventListener('click', function (event) {
      var target = event && event.target ? event.target : null;
      var openButton = target && target.closest ? target.closest('[data-open-lager-order]') : null;
      if (!openButton) return;
      var orderId = String(openButton.getAttribute('data-open-lager-order') || '').trim();
      if (!orderId) return;
      void openLagerOrder(orderId);
    });
  }
  if (lagerOrderDetailEl) {
    lagerOrderDetailEl.addEventListener('click', function (event) {
      var target = event && event.target ? event.target : null;
      if (!target || !target.closest) return;

      var startPickingButton = target.closest('[data-lager-order-start-picking]');
      if (startPickingButton) {
        var startOrderId = String(startPickingButton.getAttribute('data-lager-order-start-picking') || '').trim();
        if (!startOrderId) return;
        void startLagerOrderPicking(startOrderId);
        return;
      }

      var readyForPickupButton = target.closest('[data-lager-order-ready]');
      if (readyForPickupButton) {
        var readyOrderId = String(readyForPickupButton.getAttribute('data-lager-order-ready') || '').trim();
        if (!readyOrderId) return;
        void markLagerOrderReadyForPickup(readyOrderId);
        return;
      }

      var createLoansButton = target.closest('[data-lager-order-create-loans]');
      if (createLoansButton) {
        var createLoansOrderId = String(createLoansButton.getAttribute('data-lager-order-create-loans') || '').trim();
        if (!createLoansOrderId) return;
        void createLoansFromLagerOrder(createLoansOrderId);
        return;
      }

      var pickButton = target.closest('[data-lager-line-pick]');
      if (pickButton) {
        var pickLineId = String(pickButton.getAttribute('data-lager-line-pick') || '').trim();
        if (!pickLineId) return;
        void submitLagerLinePick(pickLineId);
        return;
      }

      var deviationButton = target.closest('[data-lager-line-deviation]');
      if (deviationButton) {
        var deviationLineId = String(deviationButton.getAttribute('data-lager-line-deviation') || '').trim();
        if (!deviationLineId) return;
        void submitLagerLineDeviation(deviationLineId);
      }
    });
    lagerOrderDetailEl.addEventListener('change', function (event) {
      var target = event && event.target ? event.target : null;
      if (!target) return;
      var borrowerOrderId = String(target.getAttribute('data-lager-order-loan-borrower') || '').trim();
      if (borrowerOrderId) {
        var selectedBorrowerId = String(target.value || '').trim();
        state.lagerko.selectedBorrowerId = selectedBorrowerId;
        state.lagerko.selectedBorrowerName = '';
        if (selectedBorrowerId) {
          applyLoanBorrowerSelection(selectedBorrowerId);
          state.lagerko.selectedBorrowerName = String(state.loanForm.laaner || '').trim();
        }
        return;
      }
      var dueOrderId = String(target.getAttribute('data-lager-order-loan-due') || '').trim();
      if (dueOrderId) {
        state.lagerko.forfallDato = String(target.value || '').trim();
      }
    });
    lagerOrderDetailEl.addEventListener('input', function (event) {
      var target = event && event.target ? event.target : null;
      if (!target) return;
      var noteOrderId = String(target.getAttribute('data-lager-order-loan-note') || '').trim();
      if (noteOrderId) {
        state.lagerko.overgangNotat = String(target.value || '');
      }
    });
  }

  if (loginButtonEl) {
    loginButtonEl.addEventListener('click', function () {
      closeHamburgerMenu();
      if (state.runtimeConfig && state.runtimeConfig.authMode === 'auth0') {
        startLoginRedirect();
      }
    });
  }

  if (credentialsLoginFormEl) {
    credentialsLoginFormEl.addEventListener('submit', function (event) {
      event.preventDefault();
      void loginWithCredentialsForm();
    });
  }

  if (credentialsLoginSubmitEl) {
    credentialsLoginSubmitEl.addEventListener('click', function (event) {
      event.preventDefault();
      void loginWithCredentialsForm();
    });
  }

  if (logoutButtonEl) {
    logoutButtonEl.addEventListener('click', function () {
      closeHamburgerMenu();
      logoutFromApp();
    });
  }

  if (adminToggleButtonEl) {
    adminToggleButtonEl.addEventListener('click', function () {
      closeHamburgerMenu();
      setWorkspace('admin', { historyMode: 'push' });
      renderState();
    });
  }

  if (adminAddInputEl) {
    adminAddInputEl.addEventListener('input', function (event) {
      const target = event.target;
      state.admin.addValue = target && typeof target.value === 'string' ? target.value : '';
    });
  }

  if (adminAddButtonEl) {
    adminAddButtonEl.addEventListener('click', function () {
      void createMasterdataValue();
    });
  }

  if (downloadImportTemplateButtonEl) {
    downloadImportTemplateButtonEl.addEventListener('click', function () {
      closeHamburgerMenu();
      void downloadInventoryImportTemplateXlsx();
    });
  }

  if (exportInventoryButtonEl) {
    exportInventoryButtonEl.addEventListener('click', function () {
      closeHamburgerMenu();
      void exportInventoryXlsx();
    });
  }

  if (importFileInputEl) {
    importFileInputEl.addEventListener('change', function () {
      void previewImportFile(importFileInputEl);
    });
  }

  if (importConfirmButtonEl) {
    importConfirmButtonEl.addEventListener('click', function () {
      void confirmImportFile();
    });
  }

  if (bulkActionsSelectEl) {
    bulkActionsSelectEl.addEventListener('change', function (event) {
      const target = event.target;
      state.bulkAction = target && target.value ? target.value : '';
      if (state.bulkAction !== 'update-status') {
        state.bulkStatusValue = '';
      }
      renderInventoryListActionState(Object.keys(state.selectedInventoryIds).filter(function (id) {
        return !!state.selectedInventoryIds[id];
      }).length);
    });
  }

  if (bulkStatusSelectEl) {
    bulkStatusSelectEl.addEventListener('change', function (event) {
      const target = event.target;
      state.bulkStatusValue = target && target.value ? target.value : '';
    });
  }
  if (bulkActionsRunButtonEl) {
    bulkActionsRunButtonEl.addEventListener('click', function () {
      void submitBulkContextAction();
    });
  }

  if (adminPanelEl) {
    adminPanelEl.addEventListener('input', function (event) {
      const target = event.target;
      if (!target || !target.getAttribute) {
        return;
      }
      if (target.id === 'admin-add-color-token') {
        state.admin.addColorToken = String(target.value || '');
        return;
      }
      if (target.id === 'admin-user-display-name') {
        state.userAdmin.form.displayName = String(target.value || '');
        return;
      }
      if (target.id === 'admin-user-username') {
        state.userAdmin.form.username = String(target.value || '');
        return;
      }
      if (target.id === 'admin-user-role') {
        state.userAdmin.form.role = String(target.value || 'viewer');
        return;
      }
      if (target.id === 'admin-add-sort-order') {
        state.admin.addSortOrder = String(target.value || '');
        return;
      }
      var activeEditId = String(state.admin.editingEntryId || '').trim();
      var activeEditKey = activeEditId ? (state.admin.activeType + '::' + activeEditId) : '';
      if (target.id === 'admin-edit-input' && activeEditKey) {
        state.admin.editValues[activeEditKey] = String(target.value || '');
        return;
      }
      if (target.id === 'admin-edit-color-token' && activeEditKey) {
        state.admin.editColorTokens[activeEditKey] = String(target.value || '');
        return;
      }
      if (target.id === 'admin-edit-sort-order' && activeEditKey) {
        state.admin.editSortOrders[activeEditKey] = String(target.value || '');
        return;
      }
      if (target.id === 'admin-edit-is-active' && activeEditKey) {
        state.admin.editIsActive[activeEditKey] = !!target.checked;
        return;
      }
      if (!activeEditKey) {
        var editUserDisplay = target.getAttribute('data-user-edit-display');
        if (editUserDisplay) {
          if (!state.userAdmin.edit[editUserDisplay]) state.userAdmin.edit[editUserDisplay] = {};
          state.userAdmin.edit[editUserDisplay].displayName = String(target.value || '');
          return;
        }
        var editUserRole = target.getAttribute('data-user-edit-role');
        if (editUserRole) {
          if (!state.userAdmin.edit[editUserRole]) state.userAdmin.edit[editUserRole] = {};
          state.userAdmin.edit[editUserRole].role = String(target.value || 'viewer');
          return;
        }
        var resetPasswordUsername = target.getAttribute('data-user-reset-password');
        if (resetPasswordUsername) {
          state.userAdmin.resetDrafts[resetPasswordUsername] = String(target.value || '');
        }
        return;
      }
    });

    adminPanelEl.addEventListener('change', function (event) {
      const target = event.target;
      if (!target || !target.getAttribute) {
        return;
      }
      if (target.id === 'admin-add-color-token') {
        state.admin.addColorToken = String(target.value || '');
        return;
      }
      if (target.id === 'admin-add-sort-order') {
        state.admin.addSortOrder = String(target.value || '');
        return;
      }
      if (target.id === 'admin-add-is-active') {
        state.admin.addIsActive = !!target.checked;
        return;
      }
      if (target.id === 'admin-user-active') {
        state.userAdmin.form.active = !!target.checked;
        return;
      }
      var activeEditId = String(state.admin.editingEntryId || '').trim();
      var activeEditKey = activeEditId ? (state.admin.activeType + '::' + activeEditId) : '';
      if (target.id === 'admin-edit-color-token' && activeEditKey) {
        state.admin.editColorTokens[activeEditKey] = String(target.value || '');
        return;
      }
      if (target.id === 'admin-edit-sort-order' && activeEditKey) {
        state.admin.editSortOrders[activeEditKey] = String(target.value || '');
        return;
      }
      if (target.id === 'admin-edit-is-active' && activeEditKey) {
        state.admin.editIsActive[activeEditKey] = !!target.checked;
      }
    });

    adminPanelEl.addEventListener('click', function (event) {
      const target = event.target;
      const typeAccordionButton = target && target.closest ? target.closest('[data-admin-type-accordion-toggle]') : null;
      if (typeAccordionButton) {
        var selectedType = String(typeAccordionButton.getAttribute('data-admin-type-accordion-toggle') || '').trim();
        if (selectedType) {
          state.admin.openType = state.admin.openType === selectedType ? '' : selectedType;
          state.admin.activeType = selectedType;
          state.admin.addValue = '';
          state.admin.editingEntryId = '';
          if (state.admin.openType !== selectedType) {
            state.admin.addColorToken = '';
            state.admin.addSortOrder = '99';
            state.admin.addIsActive = true;
          }
          renderState();
        }
        return;
      }

      const startEditButton = target && target.closest ? target.closest('[data-admin-start-edit-id]') : null;
      if (startEditButton) {
        const editId = String(startEditButton.getAttribute('data-admin-start-edit-id') || '').trim();
        if (editId) {
          const editType = String(state.admin.activeType || '').trim();
          const editEntry = getMasterdataEntryById(editType, editId);
          const editKey = editType + '::' + editId;
          state.admin.editingEntryId = editId;
          if (editEntry) {
            state.admin.editValues[editKey] = String(editEntry.value || '');
            state.admin.editColorTokens[editKey] = normalizeChipColorToken(editEntry.colorToken || '');
            state.admin.editSortOrders[editKey] = String(editEntry.sortOrder != null ? editEntry.sortOrder : 99);
            state.admin.editIsActive[editKey] = editEntry.isActive !== false;
          }
          renderState();
        }
        return;
      }

      const cancelEditButton = target && target.closest ? target.closest('#admin-edit-cancel-button') : null;
      if (cancelEditButton) {
        state.admin.editingEntryId = '';
        renderState();
        return;
      }

      const updateButton = target && target.closest ? target.closest('#admin-edit-update-button') : null;
      if (updateButton) {
        const valueId = String(state.admin.editingEntryId || '').trim();
        if (valueId) {
          void updateMasterdataValue(valueId);
        }
        return;
      }

      const deleteButton = target && target.closest ? target.closest('[data-admin-delete-id]') : null;
      if (deleteButton) {
        const valueId = String(deleteButton.getAttribute('data-admin-delete-id') || '').trim();
        if (valueId) {
          void deleteMasterdataValue(valueId);
        }
        return;
      }
      const editDeleteButton = target && target.closest ? target.closest('#admin-edit-delete-button') : null;
      if (editDeleteButton) {
        var editValueId = String(state.admin.editingEntryId || '').trim();
        if (editValueId) {
          void deleteMasterdataValue(editValueId);
        }
        return;
      }

      const createUserButton = target && target.closest ? target.closest('#admin-user-create-button') : null;
      if (createUserButton) {
        void createAdminUser();
        return;
      }
      const saveUserButton = target && target.closest ? target.closest('[data-user-save]') : null;
      if (saveUserButton) {
        void updateAdminUser(String(saveUserButton.getAttribute('data-user-save') || ''));
        return;
      }
      const deactivateUserButton = target && target.closest ? target.closest('[data-user-deactivate]') : null;
      if (deactivateUserButton) {
        void changeAdminUserStatus(String(deactivateUserButton.getAttribute('data-user-deactivate') || ''), 'deactivate');
        return;
      }
      const reactivateUserButton = target && target.closest ? target.closest('[data-user-reactivate]') : null;
      if (reactivateUserButton) {
        void changeAdminUserStatus(String(reactivateUserButton.getAttribute('data-user-reactivate') || ''), 'reactivate');
        return;
      }
      const cancelStatusButton = target && target.closest ? target.closest('[data-user-cancel-status]') : null;
      if (cancelStatusButton) {
        state.userAdmin.pendingStatusUsername = '';
        renderState();
        return;
      }
      const resetPasswordButton = target && target.closest ? target.closest('[data-user-reset-password-submit]') : null;
      if (resetPasswordButton) {
        void resetAdminUserPassword(String(resetPasswordButton.getAttribute('data-user-reset-password-submit') || ''));
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    persistCurrentViewState();
  });

  window.addEventListener('scroll', function () {
    persistCurrentViewState();
  }, { passive: true });

  window.addEventListener('popstate', function () {
    if (state.phase !== 'ready' || state.auth.status !== 'authenticated') {
      return;
    }
    void applyNavigationStateFromUrl();
  });
}

function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  const parts = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    parts.push(String.fromCharCode.apply(null, chunk));
  }
  return window.btoa(parts.join(''));
}

function assertValidXlsxBase64(base64) {
  const normalizedBase64 = String(base64 || '').trim();
  if (!normalizedBase64) {
    throw new Error('Mangler filinnhold.');
  }
  const binary = window.atob(normalizedBase64);
  if (!binary || binary.length < 4) {
    throw new Error('Filen er tom.');
  }
  if (binary.charCodeAt(0) !== 0x50 || binary.charCodeAt(1) !== 0x4b) {
    throw new Error('Ugyldig XLSX-fil.');
  }
  const hasContentTypes = binary.indexOf('[Content_Types].xml') !== -1;
  const hasWorkbook = binary.indexOf('xl/workbook.xml') !== -1;
  if (!hasContentTypes || !hasWorkbook) {
    throw new Error('Ugyldig XLSX-fil.');
  }
  return normalizedBase64;
}

function downloadBase64File(base64, mimeType, fileName) {
  const normalizedBase64 = String(base64 || '').trim();
  if (!normalizedBase64) {
    throw new Error('Mangler filinnhold.');
  }
  const binary = window.atob(normalizedBase64);
  const bytes = Uint8Array.from(binary, function (char) { return char.charCodeAt(0); });
  const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' });
  if (!blob.size) {
    throw new Error('Filen er tom.');
  }
  const anchor = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  anchor.href = objectUrl;
  anchor.download = fileName || 'nedlasting.bin';
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  if (typeof anchor.click === 'function') {
    anchor.click();
  } else {
    anchor.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }
  anchor.remove();
  window.setTimeout(function () {
    URL.revokeObjectURL(objectUrl);
  }, 60000);
  return true;
}

async function downloadInventoryImportTemplateXlsx() {
  const btn = document.getElementById('download-import-template-button');
  setButtonBusy(btn, true);
  const token = getAccessToken();
  const endpointUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.importInventoryPath + '/template');
  const actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'import-template-inventory');
  try {
    const result = await fetchJsonWithRoutingFallback(endpointUrl, token, actionUrl);
    if (!result.ok || (result.payload && result.payload.error)) {
      state.writeError = resultErrorMessage(result.payload, 'Kunne ikke laste ned importmal.');
      renderState();
      return;
    }
    const data = result.payload && result.payload.data ? result.payload.data : {};
    if (!data.fileBase64) {
      state.writeError = 'Importmal mangler filinnhold fra backend.';
      renderState();
      return;
    }
    const validatedBase64 = assertValidXlsxBase64(data.fileBase64);
    const downloaded = downloadBase64File(
      validatedBase64,
      data.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data.filename || 'inventory-importmal-v1.xlsx'
    );
    if (!downloaded) {
      state.writeError = 'Kunne ikke starte nedlasting av importmal.';
      renderState();
      return;
    }
    state.writeError = '';
    state.writeSuccess = '';
    renderState();
  } catch (error) {
    const message = error && error.message ? String(error.message) : '';
    if (message === 'Mangler filinnhold.' || message === 'Filen er tom.' || message === 'Ugyldig XLSX-fil.') {
      state.writeError = 'Importmal mangler gyldig filinnhold.';
    } else {
      state.writeError = 'Nettverksfeil ved nedlasting av importmal.';
    }
    renderState();
  } finally {
    setButtonBusy(btn, false);
  }
}

async function exportInventoryXlsx() {
  const btn = document.getElementById('export-inventory-button');
  setButtonBusy(btn, true);
  const token = getAccessToken();
  const url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.exportInventoryPath + '?format=xlsx');
  const actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'export-inventory-xlsx');
  try {
    const result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (!result.ok || (result.payload && result.payload.error)) {
      state.writeError = resultErrorMessage(result.payload, 'Kunne ikke eksportere inventory.');
      renderState();
      return;
    }
    const data = result.payload && result.payload.data ? result.payload.data : null;
    if (!data || !data.fileBase64) {
      state.writeError = 'Eksporten mangler filinnhold.';
      renderState();
      return;
    }
    const validatedBase64 = assertValidXlsxBase64(data.fileBase64);
    const downloaded = downloadBase64File(
      validatedBase64,
      data.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data.filename || 'inventory-eksport.xlsx'
    );
    if (!downloaded) {
      state.writeError = 'Kunne ikke starte nedlasting av eksportfil.';
      renderState();
      return;
    }
    state.writeError = '';
    state.writeSuccess = '';
    renderState();
  } catch (error) {
    const message = error && error.message ? String(error.message) : '';
    if (message === 'Mangler filinnhold.' || message === 'Filen er tom.' || message === 'Ugyldig XLSX-fil.') {
      state.writeError = 'Eksporten mangler gyldig filinnhold.';
    } else {
      state.writeError = 'Kunne ikke eksportere inventory.';
    }
    renderState();
  } finally {
    setButtonBusy(btn, false);
  }
}

async function previewImportFile(inputEl) {
  state.importResult = null;
  state.writeError = '';
  state.writeSuccess = '';
  state.importPreviewSummary = null;
  state.importPreviewToken = '';
  const file = inputEl && inputEl.files && inputEl.files.length ? inputEl.files[0] : null;
  if (!file) {
    state.importPreviewRows = [];
    state.pendingImport = null;
    renderState();
    return;
  }

  try {
    const lowerName = String(file.name || '').toLowerCase();
    if (lowerName.indexOf('.xlsx') === -1) {
      state.importPreviewRows = [];
      state.pendingImport = null;
      state.writeError = 'Kun .xlsx støttes i import v1.';
      renderState();
      return;
    }
    const fileBuffer = await file.arrayBuffer();
    const token = getAccessToken();
    const fileBase64 = arrayBufferToBase64(fileBuffer);
    const endpointUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.importInventoryPath);
    const actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'import-inventory');
    const previewPayload = {
      mode: 'preview',
      format: 'xlsx',
      fileName: String(file.name || 'import.xlsx'),
      fileBase64: fileBase64
    };
    const result = await sendJsonWithRoutingFallback(actionUrl, endpointUrl, 'POST', token, previewPayload);
    if (!result.ok || (result.payload && result.payload.error)) {
      state.importPreviewRows = [];
      state.importPreviewSummary = null;
      state.importPreviewToken = '';
      state.pendingImport = null;
      state.writeError = resultErrorMessage(result.payload, 'Kunne ikke kjøre import-preview.');
      renderState();
      return;
    }
    const previewData = result.payload && result.payload.data ? result.payload.data : {};
    state.importPreviewRows = Array.isArray(previewData.rows) ? previewData.rows : [];
    state.importPreviewSummary = previewData.summary || null;
    state.importPreviewToken = String(previewData.previewToken || '');
    state.pendingImport = {
      mode: 'commit',
      previewToken: state.importPreviewToken
    };
    state.writeError = '';
    renderState();
  } catch (_error) {
    state.importPreviewRows = [];
    state.importPreviewSummary = null;
    state.importPreviewToken = '';
    state.pendingImport = null;
    state.writeError = 'Kunne ikke lese importfil eller kjøre preview.';
    renderState();
  }
}

function parseCsvPreviewRows(csvText) {
  const lines = String(csvText || '').split(/\r?\n/).filter(function (line) {
    return line.trim().length > 0;
  });
  if (!lines.length) {
    return [];
  }
  const header = parseCsvLine(lines[0]).map(function (cell) {
    return cell.trim();
  });
  return lines.slice(1).map(function (line) {
    const cells = parseCsvLine(line);
    const row = {};
    header.forEach(function (name, index) {
      row[name || ('felt_' + index)] = String(cells[index] || '').trim();
    });
    return row;
  });
}

function parseCsvLine(line) {
  const source = String(line || '');
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source.charAt(i);
    if (char === '"') {
      const isEscapedQuote = inQuotes && source.charAt(i + 1) === '"';
      if (isEscapedQuote) {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

async function confirmImportFile() {
  if (!state.importPreviewToken || !state.pendingImport) {
    state.writeError = 'Kjør preview før commit.';
    renderState();
    return;
  }

  if (!window.confirm('Bekreft commit av import-preview.')) {
    return;
  }

  const importBtn = document.getElementById('import-confirm-button');
  const token = getAccessToken();
  const url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.importInventoryPath);
  const importActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'import-inventory');
  await withPendingAction('import-confirm', importBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('import-confirm', 'Importerer data…');
    try {
      const result = await sendJsonWithRoutingFallback(importActionUrl, url, 'POST', token, state.pendingImport);
      if (!result.ok || (result.payload && result.payload.error)) {
        state.writeError = resultErrorMessage(result.payload, 'Import feilet.');
        renderState();
        return;
      }

      state.importResult = result.payload && result.payload.data ? result.payload.data : null;
      state.importPreviewToken = '';
      state.pendingImport = null;
      state.importPreviewRows = [];
      state.importPreviewSummary = null;
      await loadInventoryList({ autoLoadFirstDetail: false });
      renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved import.';
      renderState();
    } finally {
      stopGlobalLoading('import-confirm', loadingTimeoutId);
    }
  });
}

async function submitBulkStatusUpdate() {
  const selectedIds = Object.keys(state.selectedInventoryIds).filter(function (id) {
    return !!state.selectedInventoryIds[id];
  });
  if (!selectedIds.length) {
    state.writeError = 'Velg minst én vare før bulk-oppdatering.';
    renderState();
    return;
  }
  if (!state.bulkStatusValue) {
    state.writeError = 'Velg ny status før bulk-oppdatering.';
    renderState();
    return;
  }
  if (!window.confirm('Bekreft bulk-statusoppdatering for ' + selectedIds.length + ' varer.')) {
    return;
  }

  const bulkBtn = document.getElementById('bulk-actions-run-button');
  const token = getAccessToken();
  const url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.bulkStatusUpdatePath);
  const bulkActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'bulk-status-update');
  const payload = { itemIds: selectedIds, status: state.bulkStatusValue };
  await withPendingAction('bulk-status-update', bulkBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('bulk-status-update', 'Oppdaterer masseendringer…');
    try {
      const result = await sendJsonWithRoutingFallback(bulkActionUrl, url, 'POST', token, payload);
      if (!result.ok || (result.payload && result.payload.error)) {
        state.writeError = resultErrorMessage(result.payload, 'Bulk-statusoppdatering feilet.');
        renderState();
        return;
      }

      state.selectedInventoryIds = {};
      state.writeSuccess = 'Bulk-statusoppdatering fullført.';
      await loadInventoryList({ autoLoadFirstDetail: false });
      renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved bulk-statusoppdatering.';
      renderState();
    } finally {
      stopGlobalLoading('bulk-status-update', loadingTimeoutId);
    }
  });
}

function readDetailSelectedListId() {
  var selectEl = document.getElementById('detail-list-select');
  if (selectEl) {
    var selectedFromControl = String(selectEl.value || '').trim();
    if (selectedFromControl) {
      state.detailListSelectedId = selectedFromControl;
      return selectedFromControl;
    }
  }
  return String(state.detailListSelectedId || '').trim();
}

async function addSelectedDetailItemToList(preselectedListId) {
  var itemId = String(state.selectedInventoryId || '').trim();
  if (!itemId) {
    state.writeError = 'Velg en vare før du legger til i liste.';
    renderState();
    return;
  }
  var listId = String(preselectedListId || '').trim();
  if (!listId) {
    listId = await chooseTargetListIdForAddToList();
  }
  if (!listId) {
    return;
  }
  state.writeError = '';
  state.writeSuccess = '';
  var summary = await addInventoryItemsToListShared(listId, [itemId]);
  if (summary.failed > 0) {
    state.writeError = 'Kunne ikke legge varen til valgt liste.';
  } else if (summary.added > 0) {
    state.writeSuccess = 'Varen ble lagt til i valgt liste.';
  } else {
    state.writeSuccess = 'Varen finnes allerede i valgt liste og ble hoppet over.';
  }
  await loadLister();
  await loadDetailListConnectionsForSelectedItem();
  renderState();
}

async function submitBulkAddToList() {
  var selectedIds = Object.keys(state.selectedInventoryIds).filter(function (id) {
    return !!state.selectedInventoryIds[id];
  });
  if (!selectedIds.length) {
    state.writeError = 'Velg minst én vare før «Legg til i liste».';
    renderState();
    return;
  }
  state.writeError = '';
  state.writeSuccess = '';
  var bulkBtn = document.getElementById('bulk-actions-run-button');
  await withPendingAction('bulk-add-to-list-open-overlay', bulkBtn, async function () {
    await openAddToListOverlay(selectedIds, bulkBtn);
  });
}

async function submitBulkAddToOrder() {
  var selectedIds = Object.keys(state.selectedInventoryIds).filter(function (id) {
    return !!state.selectedInventoryIds[id];
  });
  if (!selectedIds.length) {
    state.writeError = 'Velg minst én vare før «Legg til i bestilling».';
    renderState();
    return;
  }
  var bulkBtn = document.getElementById('bulk-actions-run-button');
  await addItemsToBestillingDraft(selectedIds, 'lagerliste (bulkvalg)', bulkBtn, 'bulk-add-to-order');
}

async function submitBulkContextAction() {
  var actionSelectEl = document.getElementById('bulk-actions-select');
  var selectedAction = String(actionSelectEl && actionSelectEl.value || state.bulkAction || '').trim();
  state.bulkAction = selectedAction;
  if (!selectedAction) {
    state.writeError = 'Velg en handling i menyen før du fortsetter.';
    renderState();
    return;
  }
  if (selectedAction === 'update-status') {
    await submitBulkStatusUpdate();
    return;
  }
  if (selectedAction === 'add-to-list') {
    await submitBulkAddToList();
    return;
  }
  if (selectedAction === 'add-to-order') {
    await submitBulkAddToOrder();
    return;
  }
  state.writeError = 'Ugyldig handling valgt.';
  renderState();
}

async function loginWithCredentialsForm() {
  if (!state.runtimeConfig || state.runtimeConfig.authMode !== 'credentials') {
    return;
  }

  const usernameInputEl = document.getElementById('credentials-username');
  const passwordInputEl = document.getElementById('credentials-password');
  if (!usernameInputEl || !passwordInputEl) {
    state.auth.bootstrapError = 'Innloggingsskjema er ikke klart. Last siden på nytt.';
    renderState();
    return;
  }

  const username = String(usernameInputEl.value || '').trim();
  const password = String(passwordInputEl.value || '');
  if (!username || !password) {
    state.auth.bootstrapError = 'Brukernavn og passord må fylles ut.';
    renderState();
    return;
  }

  state.auth.bootstrapError = '';
  renderState();

  const loginSubmitBtn = document.getElementById('credentials-login-submit');
  const loginActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'auth-login');
  const loginUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.authLoginPath);
  await withPendingAction('credentials-login', loginSubmitBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('credentials-login-overlay', 'Logger inn…', { blocking: true });
    try {
    const result = await sendJsonWithRoutingFallback(loginActionUrl, loginUrl, 'POST', '', { username: username, password: password });
    if (!result.ok || !result.payload || result.payload.error) {
      state.auth.status = 'unauthenticated';
      state.auth.session = null;
      state.auth.detail = 'Innlogging feilet.';
      state.auth.bootstrapError = buildEndpointDiagnosticMessage(
        '/api/v1/auth/login',
        loginUrl,
        result,
        resultErrorMessage(result.payload, 'Innlogging feilet. Kontroller brukernavn/passord.')
      );
      renderState();
      return;
    }

    const loginData = result.payload && result.payload.data ? result.payload.data : {};
    const sessionToken = String(loginData.sessionToken || '');
    if (!sessionToken || !loginData.session) {
      const loginShapeMessage = buildEndpointDiagnosticMessage(
        '/api/v1/auth/login',
        loginUrl,
        result,
        'Innlogging feilet: uventet JSON-format (mangler data.sessionToken eller data.session).'
      );
      logBootstrapFailure('login', '/api/v1/auth/login', loginUrl, result, loginShapeMessage);
      state.auth.status = 'unauthenticated';
      state.auth.session = null;
      state.auth.detail = 'Innlogging feilet.';
      state.auth.bootstrapError = loginShapeMessage;
      renderState();
      return;
    }
    setAccessToken(sessionToken);
    state.auth = {
      status: 'authenticated',
      session: loginData.session || null,
      detail: '',
      bootstrapError: ''
    };
    state.phase = 'ready';
    state.inventoryDataState = 'loading';
    renderState();
    await Promise.all([
      loadMasterdata(),
      loadInventoryList({ autoLoadFirstDetail: false })
    ]);
    renderState();
    } catch (_error) {
      state.auth.status = 'unauthenticated';
      state.auth.bootstrapError = buildEndpointDiagnosticMessage(
        '/api/v1/auth/login',
        loginUrl,
        { fetchError: 'network' },
        'Nettverksfeil ved innlogging.'
      );
      renderState();
    } finally {
      stopGlobalLoading('credentials-login-overlay', loadingTimeoutId);
    }
  });
}

function logoutFromApp() {
  const runtimeConfig = state.runtimeConfig;
  if (runtimeConfig && runtimeConfig.authMode === 'credentials') {
    const token = getAccessToken();
    const logoutActionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'auth-logout');
    const logoutUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, runtimeConfig.authLogoutPath);
    void sendJsonWithRoutingFallback(logoutActionUrl, logoutUrl, 'POST', '', { sessionToken: token });
  }
  clearAuthState();
  renderState();

  if (!runtimeConfig || !runtimeConfig.auth0Domain || !runtimeConfig.auth0ClientId) {
    return;
  }

  const auth0Domain = String(runtimeConfig.auth0Domain).replace(/\/$/, '');
  const logoutParams = new URLSearchParams();
  logoutParams.set('client_id', runtimeConfig.auth0ClientId);
  logoutParams.set('returnTo', runtimeConfig.auth0LogoutReturnTo || (window.location.origin + window.location.pathname));
  window.location.assign(auth0Domain + '/v2/logout?' + logoutParams.toString());
}

async function createInventoryFromForm() {
  state.writeError = '';
  state.writeSuccess = '';

  const record = parseInventoryForm();
  if (!record) {
    return;
  }
  const arrangementValidationError = validateArrangementerForWrite(record);
  if (arrangementValidationError) {
    state.writeError = arrangementValidationError;
    renderState();
    return;
  }
  const ansvarligValidationError = validateAnsvarligForWrite(record);
  if (ansvarligValidationError) {
    state.writeError = ansvarligValidationError;
    renderState();
    return;
  }
  const attributeValidationError = validateInventoryAttributesForWrite(record);
  if (attributeValidationError) {
    state.writeError = attributeValidationError;
    renderState();
    return;
  }
  const subunitValidationError = validateInventorySubunitsForWrite(record);
  if (subunitValidationError) {
    state.writeError = subunitValidationError;
    renderState();
    return;
  }
  // Intern-ID skal alltid settes automatisk etter sekvens.
  record.id = generateNextInventoryId();
  var queuedAttachments = Array.isArray(state.attachmentForm.pendingUploads)
    ? state.attachmentForm.pendingUploads.slice()
    : [];

  const createBtn = document.getElementById('create-button');
  const token = getAccessToken();
  const listUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.inventoryListPath);
  const createInventoryActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-inventory');

  await withPendingAction('inventory-create', createBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('inventory-create', 'Oppretter lagervare…');
    try {
    console.log('submit-branch valgt:', {
      branch: 'create',
      action: 'create-inventory',
      payloadId: record.id,
      selectedInventoryId: String(state.selectedInventoryId || '').trim(),
      formMode: state.formState.mode
    });
    const result = await sendJsonWithRoutingFallback(createInventoryActionUrl, listUrl, 'POST', token, record);
    const writeErrorMessage = resultErrorMessage(result.payload, 'Oppretting feilet.');

    if (!result.ok || (result.payload && result.payload.error)) {
      if (handleAuthErrorStatus(result.status)) {
        renderState();
        return;
      }

      state.writeError = writeErrorMessage;
      renderState();
      return;
    }
    var persistedSubunitError = validatePersistedSubunits(record, result.payload);
    if (persistedSubunitError) {
      state.writeError = persistedSubunitError;
      renderState();
      return;
    }

    const createdId = String(
      (result.payload && result.payload.data && result.payload.data.id)
      || record.id
    ).trim();
    if (queuedAttachments.length) {
      var attachmentSync = await synchronizeInventoryFormAttachments(createdId);
      if (!attachmentSync.ok) {
        state.writeError = attachmentSync.message || 'Lagervare opprettet, men vedlegg kunne ikke lastes opp.';
        renderState();
        return;
      }
    }
    var persistedCreatedSubunits = result && result.payload && result.payload.data && Array.isArray(result.payload.data.underenheter)
      ? result.payload.data.underenheter
      : [];
    var createdSubunitSync = await synchronizeSubunitAttachments(createdId, persistedCreatedSubunits);
    if (!createdSubunitSync.ok) {
      state.writeError = createdSubunitSync.message || 'Lagervare opprettet, men underenhetsvedlegg kunne ikke synkroniseres.';
      renderState();
      return;
    }
    state.writeSuccess = 'Lagervare opprettet.';
    await loadInventoryList();
    refreshAutoGeneratedInventoryId();
    await loadInventoryDetail(createdId, { switchToDetail: false });
    state.attachmentForm.pendingUploads = [];
    state.attachmentForm.existingAttachments = [];
    state.attachmentForm.removedAttachmentIds = {};
    state.attachmentForm.updatedAttachmentIds = {};
    resetInventoryForm();
    state.formState.edited = true;
    state.formState.sourceId = createdId;
    renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved oppretting.';
      renderState();
    } finally {
      stopGlobalLoading('inventory-create', loadingTimeoutId);
    }
  });
}

async function updateInventoryFromForm() {
  state.writeError = '';
  state.writeSuccess = '';

  var selectedId = String(state.formState.activeItemId || state.selectedInventoryId || '').trim();
  // SMOKE_CONTRACT_UPDATE_GUARD_SELECTED_ID_START
  if (!selectedId) {
    state.writeError = 'Velg en eksisterende lagervare før du oppdaterer.';
    renderState();
    return;
  }
  // SMOKE_CONTRACT_UPDATE_GUARD_SELECTED_ID_END

  const record = parseInventoryForm();
  if (!record) {
    return;
  }
  const arrangementValidationError = validateArrangementerForWrite(record);
  if (arrangementValidationError) {
    state.writeError = arrangementValidationError;
    renderState();
    return;
  }
  const ansvarligValidationError = validateAnsvarligForWrite(record);
  if (ansvarligValidationError) {
    state.writeError = ansvarligValidationError;
    renderState();
    return;
  }
  const attributeValidationError = validateInventoryAttributesForWrite(record);
  if (attributeValidationError) {
    state.writeError = attributeValidationError;
    renderState();
    return;
  }
  const subunitValidationError = validateInventorySubunitsForWrite(record);
  if (subunitValidationError) {
    state.writeError = subunitValidationError;
    renderState();
    return;
  }
  if (!record.id) {
    state.writeError = 'Intern ID må settes før oppdatering.';
    renderState();
    return;
  }
  // SMOKE_CONTRACT_UPDATE_GUARD_FORM_ID_START
  if (record.id !== selectedId) {
    state.writeError = 'Skjema-ID matcher ikke valgt lagervare. Last varen på nytt før oppdatering.';
    renderState();
    return;
  }
  // SMOKE_CONTRACT_UPDATE_GUARD_FORM_ID_END

  const updateBtn = document.getElementById('update-button');
  const token = getAccessToken();
  const detailPath = buildInventoryDetailPath(state.runtimeConfig.inventoryDetailPathTemplate, selectedId);
  const detailUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, detailPath);
  const updateInventoryActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'update-inventory', { id: selectedId });
  var updateIdentifiers = {
    pathId: selectedId,
    bodyId: String(record.id || '').trim()
  };
  const writePayload = Object.assign({ _method: 'PUT' }, record, {
    id: selectedId
  });

  await withPendingAction('inventory-update', updateBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('inventory-update', 'Oppdaterer lagervare…');
    try {
    console.log('submit-branch valgt:', {
      branch: 'update',
      action: 'update-inventory',
      formMode: state.formState.mode,
      selectedInventoryId: String(state.selectedInventoryId || '').trim(),
      activeItemId: String(state.formState.activeItemId || '').trim(),
      payloadId: String(writePayload.id || '').trim()
    });
    console.log('updateInventoryFromForm identifikatorer:', updateIdentifiers);
    const result = await sendJsonWithRoutingFallback(updateInventoryActionUrl, detailUrl, 'POST', token, writePayload);
    const writeErrorMessage = resultErrorMessage(result.payload, 'Oppdatering feilet.');

    if (!result.ok || (result.payload && result.payload.error)) {
      if (handleAuthErrorStatus(result.status)) {
        renderState();
        return;
      }

      state.writeError = writeErrorMessage;
      renderState();
      return;
    }
    var persistedSubunitError = validatePersistedSubunits(record, result.payload);
    if (persistedSubunitError) {
      state.writeError = persistedSubunitError;
      renderState();
      return;
    }

    var attachmentSync = await synchronizeInventoryFormAttachments(record.id);
    if (!attachmentSync.ok) {
      state.writeError = attachmentSync.message;
      renderState();
      return;
    }
    var persistedUpdatedSubunits = result && result.payload && result.payload.data && Array.isArray(result.payload.data.underenheter)
      ? result.payload.data.underenheter
      : [];
    var updatedSubunitSync = await synchronizeSubunitAttachments(record.id, persistedUpdatedSubunits);
    if (!updatedSubunitSync.ok) {
      state.writeError = updatedSubunitSync.message || 'Underenhetsvedlegg kunne ikke synkroniseres.';
      renderState();
      return;
    }

    state.writeSuccess = attachmentSync.message || 'Lagervare oppdatert.';
    await loadInventoryList();
    await loadInventoryDetail(record.id, { switchToDetail: false });
    state.attachmentForm.pendingUploads = [];
    state.attachmentForm.existingAttachments = [];
    state.attachmentForm.removedAttachmentIds = {};
    state.attachmentForm.updatedAttachmentIds = {};
    resetInventoryForm();
    state.formState.edited = true;
    state.formState.sourceId = record.id;
    renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved oppdatering.';
      renderState();
    } finally {
      stopGlobalLoading('inventory-update', loadingTimeoutId);
    }
  });
}

async function synchronizeInventoryFormAttachments(itemId) {
  var itemInventoryId = String(itemId || '').trim();
  if (!itemInventoryId) {
    return { ok: false, message: 'Kan ikke synkronisere vedlegg uten lagervare-ID.' };
  }

  var removedIds = Object.keys(state.attachmentForm.removedAttachmentIds || {});
  var updatedIds = Object.keys(state.attachmentForm.updatedAttachmentIds || {});
  var pendingUploads = Array.isArray(state.attachmentForm.pendingUploads)
    ? state.attachmentForm.pendingUploads.slice()
    : [];
  if (!removedIds.length && !pendingUploads.length && !updatedIds.length) {
    return { ok: true, message: 'Lagervare oppdatert.' };
  }

  var token = getAccessToken();
  for (var r = 0; r < removedIds.length; r++) {
    var removeResult = await deleteAttachmentById(removedIds[r], token);
    if (!removeResult.ok) {
      return { ok: false, message: removeResult.message || 'Kunne ikke fjerne ett eller flere vedlegg.' };
    }
  }

  for (var p = 0; p < pendingUploads.length; p++) {
    var uploadResult = await uploadAttachmentForItem(itemInventoryId, pendingUploads[p], token);
    if (!uploadResult.ok) {
      return { ok: false, message: uploadResult.message || 'Kunne ikke laste opp ett eller flere vedlegg.' };
    }
  }

  for (var u = 0; u < updatedIds.length; u++) {
    var attachmentId = updatedIds[u];
    if (state.attachmentForm.removedAttachmentIds[attachmentId]) {
      continue;
    }
    var matchingAttachment = null;
    for (var a = 0; a < state.attachmentForm.existingAttachments.length; a++) {
      if (state.attachmentForm.existingAttachments[a].id === attachmentId) {
        matchingAttachment = state.attachmentForm.existingAttachments[a];
        break;
      }
    }
    if (!matchingAttachment) {
      continue;
    }
    var metadataUpdateResult = await updateAttachmentMetadataById(attachmentId, {
      tittel: matchingAttachment.tittel || '',
      beskrivelse: matchingAttachment.beskrivelse || ''
    }, token);
    if (!metadataUpdateResult.ok) {
      return { ok: false, message: metadataUpdateResult.message || 'Kunne ikke oppdatere metadata for ett eller flere vedlegg.' };
    }
  }

  return {
    ok: true,
    message: 'Lagervare oppdatert. Vedlegg synkronisert (lagt til: ' + pendingUploads.length + ', fjernet: ' + removedIds.length + ', metadata oppdatert: ' + updatedIds.length + ').'
  };
}

async function uploadAttachmentForItem(itemId, attachmentPayload, providedToken) {
  return uploadAttachmentForOwner(itemId, 'item', itemId, attachmentPayload, providedToken);
}

async function uploadAttachmentForOwner(itemId, ownerType, ownerId, attachmentPayload, providedToken) {
  var token = providedToken || getAccessToken();
  var uploadPath = buildPathFromTemplate(state.runtimeConfig.inventoryDocumentsPathTemplate, itemId);
  var uploadUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, uploadPath);
  var uploadActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'upload-document', { id: itemId });
  var normalizedOwnerType = String(ownerType || 'item').trim().toLowerCase() === 'subunit' ? 'subunit' : 'item';
  var normalizedOwnerId = String(ownerId || itemId).trim();
  var payload = {
    filnavn: attachmentPayload.fileName,
    mimeType: attachmentPayload.mimeType,
    base64Content: attachmentPayload.base64Data,
    tittel: attachmentPayload.tittel || attachmentPayload.fileName,
    beskrivelse: attachmentPayload.beskrivelse || '',
    sortering: 0,
    metadata: {
      ownerType: normalizedOwnerType,
      ownerId: normalizedOwnerId,
      koblingType: normalizedOwnerType,
      koblingId: normalizedOwnerId,
      synligForRoller: ['viewer', 'editor', 'admin', 'superadmin']
    }
  };

  var result = await sendJsonWithRoutingFallback(uploadActionUrl, uploadUrl, 'POST', token, payload);
  if (!result.ok || (result.payload && result.payload.error)) {
    if (handleAuthErrorStatus(result.status)) {
      return { ok: false, message: 'Økten er utløpt eller mangler tilgang til vedleggsopplasting.' };
    }
    return { ok: false, message: resultErrorMessage(result.payload, 'Opplasting av vedlegg feilet.') };
  }
  return { ok: true };
}

async function synchronizeSubunitAttachments(itemId, persistedSubunits) {
  var itemInventoryId = String(itemId || '').trim();
  var rows = Array.isArray(state.formState.subunitRows) ? state.formState.subunitRows : [];
  var persisted = Array.isArray(persistedSubunits) ? persistedSubunits : [];
  var token = getAccessToken();
  for (var rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    var row = rows[rowIndex] || {};
    var persistedSubunit = persisted[rowIndex] || {};
    var subunitId = String(row.id || persistedSubunit.id || '').trim();
    if (!subunitId) {
      continue;
    }
    var removedIds = Object.keys(row.removedAttachmentIds || {});
    var updatedIds = Object.keys(row.updatedAttachmentIds || {});
    var pendingUploads = Array.isArray(row.pendingAttachments) ? row.pendingAttachments.slice() : [];
    for (var r = 0; r < removedIds.length; r += 1) {
      var removeResult = await deleteAttachmentById(removedIds[r], token);
      if (!removeResult.ok) return removeResult;
    }
    for (var p = 0; p < pendingUploads.length; p += 1) {
      var uploadResult = await uploadAttachmentForOwner(itemInventoryId, 'subunit', subunitId, pendingUploads[p], token);
      if (!uploadResult.ok) return uploadResult;
    }
    for (var u = 0; u < updatedIds.length; u += 1) {
      var attachmentId = String(updatedIds[u] || '').trim();
      if (!attachmentId || row.removedAttachmentIds[attachmentId]) continue;
      var matching = null;
      for (var m = 0; m < row.existingAttachments.length; m += 1) {
        if (String(row.existingAttachments[m].id || '').trim() === attachmentId) {
          matching = row.existingAttachments[m];
          break;
        }
      }
      if (!matching) continue;
      var updateResult = await updateAttachmentMetadataById(attachmentId, { tittel: matching.tittel || '', beskrivelse: matching.beskrivelse || '' }, token);
      if (!updateResult.ok) return updateResult;
    }
    if (String(row.hovedbildeDokumentId || '').trim()) {
      var mainImageResult = await setMainImageByDocumentId(itemInventoryId, row.hovedbildeDokumentId, token, 'subunit', subunitId);
      if (!mainImageResult.ok) return mainImageResult;
    }
  }
  return { ok: true };
}

async function updateAttachmentMetadataById(attachmentId, metadataPayload, providedToken) {
  var token = providedToken || getAccessToken();
  var updatePath = buildPathFromTemplate(state.runtimeConfig.documentDeletePathTemplate, attachmentId);
  var updateUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, updatePath);
  var updateActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'update-document-metadata', { id: attachmentId });
  var payload = {
    _method: 'PUT',
    tittel: String(metadataPayload && metadataPayload.tittel || '').trim(),
    beskrivelse: String(metadataPayload && metadataPayload.beskrivelse || '').trim()
  };
  var result = await sendJsonWithRoutingFallback(updateActionUrl, updateUrl, 'POST', token, payload);
  if (!result.ok || (result.payload && result.payload.error)) {
    if (handleAuthErrorStatus(result.status)) {
      return { ok: false, message: 'Økten er utløpt eller mangler tilgang til metadataoppdatering.' };
    }
    return { ok: false, message: resultErrorMessage(result.payload, 'Oppdatering av dokumentmetadata feilet.') };
  }
  return { ok: true };
}

async function deleteAttachmentById(attachmentId, providedToken) {
  var token = providedToken || getAccessToken();
  var deletePath = buildPathFromTemplate(state.runtimeConfig.documentDeletePathTemplate, attachmentId);
  var deleteUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, deletePath);
  var deleteDocActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'delete-document', { id: attachmentId });
  var result = await sendJsonWithRoutingFallback(deleteDocActionUrl, deleteUrl, 'POST', token, { _method: 'DELETE' });
  if (!result.ok || (result.payload && result.payload.error)) {
    if (handleAuthErrorStatus(result.status)) {
      return { ok: false, message: 'Økten er utløpt eller mangler tilgang til å fjerne vedlegg.' };
    }
    return { ok: false, message: resultErrorMessage(result.payload, 'Sletting av vedlegg feilet.') };
  }
  return { ok: true };
}

async function setMainImageByDocumentId(itemId, documentId, providedToken, ownerType, ownerId) {
  var token = providedToken || getAccessToken();
  var cleanItemId = String(itemId || '').trim();
  var cleanDocumentId = String(documentId || '').trim();
  if (!cleanItemId || !cleanDocumentId) {
    return { ok: false, message: 'Mangler vare eller vedlegg for hovedbildevalg.' };
  }
  var path = 'api/v1/inventory/' + encodeURIComponent(cleanItemId) + '/main-image';
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'set-main-image', { id: cleanItemId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, {
    documentId: cleanDocumentId,
    ownerType: ownerType || 'item',
    ownerId: ownerId || cleanItemId
  });
  if (!result.ok || (result.payload && result.payload.error)) {
    if (handleAuthErrorStatus(result.status)) {
      return { ok: false, message: 'Økten er utløpt eller mangler tilgang til hovedbildevalg.' };
    }
    return { ok: false, message: resultErrorMessage(result.payload, 'Kunne ikke oppdatere hovedbilde.') };
  }
  return { ok: true };
}

async function deleteInventoryFromForm(mode) {
  state.writeError = '';
  state.writeSuccess = '';

  const record = parseInventoryForm();
  if (!record || !record.id) {
    state.writeError = 'Intern ID må settes før sletting.';
    renderState();
    return;
  }

  const token = getAccessToken();
  const detailPath = buildInventoryDetailPath(state.runtimeConfig.inventoryDetailPathTemplate, record.id);
  const actionSegment = mode === 'hard' ? 'hard-delete' : 'soft-delete';
  const detailUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, detailPath + '/' + actionSegment);
  const deleteInventoryActionName = mode === 'hard' ? 'hard-delete-inventory' : 'soft-delete-inventory';
  const deleteInventoryActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, deleteInventoryActionName, { id: record.id });
  const confirmationMessage = mode === 'hard'
    ? 'Er du sikker på at du vil slette denne lagervaren permanent? Handlingen kan ikke angres.'
    : 'Er du sikker på at du vil deaktivere denne lagervaren?';

  if (!window.confirm(confirmationMessage)) {
    return;
  }

  const deleteBtn = document.getElementById(mode === 'hard' ? 'hard-delete-button' : 'soft-delete-button');
  await withPendingAction('inventory-delete-' + mode, deleteBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('inventory-delete-' + mode, mode === 'hard' ? 'Sletter lagervare permanent…' : 'Deaktiverer lagervare…');
    try {
    const result = await sendJsonWithRoutingFallback(deleteInventoryActionUrl, detailUrl, 'POST', token, {});
    const writeErrorMessage = resultErrorMessage(result.payload, 'Sletting feilet.');

    if (!result.ok || (result.payload && result.payload.error)) {
      if (handleAuthErrorStatus(result.status)) {
        renderState();
        return;
      }

      state.writeError = writeErrorMessage;
      renderState();
      return;
    }

    state.writeSuccess = mode === 'hard'
      ? 'Lagervare slettet permanent.'
      : 'Lagervare deaktivert.';
    resetInventoryForm();
    await loadInventoryList({ autoLoadFirstDetail: false });
    state.selectedInventoryId = '';
    state.detailItem = null;
    state.auditEvents = [];
    state.detailError = '';
    state.route = 'liste';
    renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved sletting.';
      renderState();
    } finally {
      stopGlobalLoading('inventory-delete-' + mode, loadingTimeoutId);
    }
  });
}

function parseLoanForm() {
  return {
    itemIds: getLoanSelectedItemIds(),
    borrowerId: String(state.loanForm.borrowerId || '').trim(),
    laaner: String(state.loanForm.laaner || '').trim(),
    forfallDato: String(state.loanForm.forfallDato || '').trim(),
    notat: String(state.loanForm.notat || '').trim()
  };
}

async function createLoanFromForm() {
  state.writeError = '';
  state.writeSuccess = '';

  const record = parseLoanForm();
  if (!record || !record.itemIds || !record.itemIds.length || !record.borrowerId || !record.laaner) {
    state.writeError = 'Minst én vare og gyldig låntaker er påkrevd for utlån.';
    renderState();
    return;
  }

  const loanCreateBtn = document.getElementById('loan-create-button') || document.querySelector('[data-detail-loan-create="true"]');
  const token = getAccessToken();
  const loanListUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.loanListPath);
  const createLoanActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-loan');

  await withPendingAction('loan-create', loanCreateBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('loan-create', 'Registrerer utlån…');
    try {
    var failed = [];
    for (var i = 0; i < record.itemIds.length; i += 1) {
      var itemId = record.itemIds[i];
      var payload = {
        itemId: itemId,
        borrowerId: record.borrowerId,
        laaner: record.laaner,
        forfallDato: record.forfallDato,
        notat: record.notat
      };
      const result = await sendJsonWithRoutingFallback(createLoanActionUrl, loanListUrl, 'POST', token, payload);
      if (!result.ok || (result.payload && result.payload.error)) {
        if (handleAuthErrorStatus(result.status)) {
          renderState();
          return;
        }
        failed.push({
          itemId: itemId,
          message: resultErrorMessage(result.payload, 'Registrering av utlån feilet.')
        });
      }
    }

    if (failed.length === record.itemIds.length) {
      state.writeError = failed[0].message;
      renderState();
      return;
    }

    if (failed.length > 0) {
      state.writeSuccess = 'Utlån registrert for ' + (record.itemIds.length - failed.length) + ' av ' + record.itemIds.length + ' varer.';
      state.writeError = 'Noen varer feilet: ' + failed.map(function (entry) { return entry.itemId; }).join(', ');
    } else {
      state.writeSuccess = record.itemIds.length > 1
        ? ('Utlån registrert for ' + record.itemIds.length + ' varer.')
        : 'Utlån registrert.';
    }

    state.loanForm = {
      itemId: record.itemIds[0] || '',
      borrowerId: '',
      laaner: '',
      forfallDato: '',
      notat: ''
    };
    state.loanFlow.selectedItemIds = record.itemIds.slice();
    await loadInventoryList({ autoLoadFirstDetail: false });
    if (record.itemIds[0]) {
      await loadInventoryDetail(record.itemIds[0], { switchToDetail: false });
    }
    await loadLoans();
    renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved registrering av utlån.';
      renderState();
    } finally {
      stopGlobalLoading('loan-create', loadingTimeoutId);
    }
  });
}

async function returnLoanFromList(loanId) {
  state.writeError = '';
  state.writeSuccess = '';

  const returnBtn = document.querySelector('[data-loan-return-button="' + loanId + '"], [data-detail-loan-return-button="' + loanId + '"]');
  const noteInputEl = document.querySelector('[data-loan-return-note="' + loanId + '"], [data-detail-loan-return-note="' + loanId + '"]');
  const deviationInputEl = document.querySelector('[data-loan-deviation="' + loanId + '"], [data-detail-loan-deviation="' + loanId + '"]');
  const returMerknad = noteInputEl ? String(noteInputEl.value || '').trim() : '';
  const avvik = deviationInputEl ? String(deviationInputEl.value || '').trim() : '';
  const token = getAccessToken();
  const pathTemplate = avvik ? state.runtimeConfig.loanDeviationPathTemplate : state.runtimeConfig.loanReturnPathTemplate;
  const payload = avvik ? { returMerknad, avvik } : { returMerknad };
  const returnUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, buildPathFromTemplate(pathTemplate, loanId));
  const returnActionName = avvik ? 'loan-deviation' : 'return-loan';
  const returnActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, returnActionName, { id: loanId });

  await withPendingAction('loan-return-' + loanId, returnBtn, async function () {
    var loadingTimeoutId = startGlobalLoading('loan-return-' + loanId, 'Registrerer retur…');
    try {
    const result = await sendJsonWithRoutingFallback(returnActionUrl, returnUrl, 'POST', token, payload);
    const writeErrorMessage = resultErrorMessage(result.payload, 'Registrering av retur feilet.');
    if (!result.ok || (result.payload && result.payload.error)) {
      if (handleAuthErrorStatus(result.status)) {
        renderState();
        return;
      }
      state.writeError = writeErrorMessage;
      renderState();
      return;
    }

    state.writeSuccess = avvik ? 'Retur med avvik registrert.' : 'Retur registrert.';
    await loadInventoryList({ autoLoadFirstDetail: false });
    if (state.selectedInventoryId) {
      await loadInventoryDetail(state.selectedInventoryId, { switchToDetail: false });
    }
    await loadLoans();
    renderState();
    } catch (_error) {
      state.writeError = 'Nettverksfeil ved registrering av retur.';
      renderState();
    } finally {
      stopGlobalLoading('loan-return-' + loanId, loadingTimeoutId);
    }
  });
}

function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const marker = 'base64,';
      const markerIndex = result.indexOf(marker);
      if (markerIndex === -1) {
        reject(new Error('Filen kunne ikke konverteres til base64.'));
        return;
      }
      resolve(result.slice(markerIndex + marker.length));
    };
    reader.onerror = function () {
      reject(new Error('Filen kunne ikke leses.'));
    };
    reader.readAsDataURL(file);
  });
}

function normalizeDocumentRecord(documentRecord) {
  var filnavn = String(documentRecord.filnavn || '').trim();
  var tittel = String(documentRecord.tittel || '').trim();
  return {
    id: String(documentRecord.documentId || documentRecord.id || '').trim(),
    tittel: tittel || filnavn,
    beskrivelse: String(documentRecord.beskrivelse || '').trim(),
    filnavn: filnavn || tittel,
    mimeType: String(documentRecord.mimeType || '').trim(),
    fileSize: Number(documentRecord.fileSize || 0),
    sortering: Number(documentRecord.sortering || 0),
    opprettetTid: String(documentRecord.opprettetTid || '').trim(),
    oppdatertTid: String(documentRecord.oppdatertTid || '').trim(),
    driveUrl: String(documentRecord.driveUrl || '').trim(),
    ownerType: String(documentRecord.ownerType || '').trim().toLowerCase(),
    ownerId: String(documentRecord.ownerId || '').trim(),
    erBilde: !!documentRecord.erBilde,
    isMainImage: !!documentRecord.isMainImage,
    source: String(documentRecord.source || '').trim()
  };
}

function isPdfDocument(documentRecord) {
  var mimeType = String(documentRecord && documentRecord.mimeType || '').trim().toLowerCase();
  return mimeType === 'application/pdf';
}

function canPreviewInOverlay(documentRecord) {
  return !!(documentRecord && (documentRecord.erBilde || isPdfDocument(documentRecord)));
}

function resolveMainImageForDocuments(documents) {
  var normalizedDocuments = Array.isArray(documents) ? documents : [];
  for (var i = 0; i < normalizedDocuments.length; i += 1) {
    if (normalizedDocuments[i] && normalizedDocuments[i].erBilde && normalizedDocuments[i].isMainImage) {
      return normalizedDocuments[i];
    }
  }
  for (var j = 0; j < normalizedDocuments.length; j += 1) {
    if (normalizedDocuments[j] && normalizedDocuments[j].erBilde) {
      return normalizedDocuments[j];
    }
  }
  return null;
}

function normalizeInventoryPublicVisibilityForUi(source) {
  var visning = source && typeof source === 'object' ? source : {};
  return {
    hovedbilde: !!visning.hovedbilde,
    vedlegg: !!visning.vedlegg,
    underenheter: !!visning.underenheter,
    attributter: !!visning.attributter,
    tilstand: !!visning.tilstand
  };
}

function buildDocumentMediaPath(documentId) {
  return 'api/v1/documents/' + encodeURIComponent(String(documentId || '').trim()) + '/media';
}

function buildPublicDocumentMediaPath(publicItemPathTemplate, shareCode, documentId) {
  var sharePath = buildPublicItemPath(publicItemPathTemplate, shareCode);
  var basePath = String(sharePath || '').replace(/\/+$/, '');
  return basePath + '/documents/' + encodeURIComponent(String(documentId || '').trim()) + '/media';
}

async function fetchDocumentMedia(documentId) {
  var cleanDocumentId = String(documentId || '').trim();
  if (!cleanDocumentId) {
    return { ok: false, message: 'Ugyldig vedleggs-ID.' };
  }
  if (attachmentMediaCache[cleanDocumentId]) {
    return { ok: true, data: attachmentMediaCache[cleanDocumentId] };
  }
  var token = getAccessToken();
  var mediaUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, buildDocumentMediaPath(cleanDocumentId));
  var mediaActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'document-media', { id: cleanDocumentId });
  var result = await fetchJsonWithRoutingFallback(mediaUrl, token, mediaActionUrl);
  if (!result.ok || !result.payload || !result.payload.data) {
    return { ok: false, message: resultErrorMessage(result.payload, 'Kunne ikke hente vedleggsdata.') };
  }
  attachmentMediaCache[cleanDocumentId] = result.payload.data;
  return { ok: true, data: result.payload.data };
}

async function fetchPublicDocumentMedia(shareCode, documentId, listShareCode) {
  var cleanShareCode = String(shareCode || '').trim();
  var cleanDocumentId = String(documentId || '').trim();
  var cleanListShareCode = String(listShareCode || '').trim();
  if (!cleanShareCode) {
    return { ok: false, message: 'Ugyldig delingskode for offentlig vedlegg.' };
  }
  if (!cleanListShareCode) {
    return { ok: false, message: 'Mangler offentlig listekontekst for vedleggsvisning.' };
  }
  if (!cleanDocumentId) {
    return { ok: false, message: 'Ugyldig vedleggs-ID.' };
  }
  var cacheKey = cleanShareCode + ':' + cleanListShareCode + ':' + cleanDocumentId;
  if (attachmentMediaCache[cacheKey]) {
    return { ok: true, data: attachmentMediaCache[cacheKey] };
  }
  var mediaPath = buildPublicDocumentMediaPath(state.runtimeConfig.publicItemPathTemplate, cleanShareCode, cleanDocumentId);
  var mediaUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, mediaPath);
  var mediaRequestUrl = new URL(mediaUrl, window.location.href);
  mediaRequestUrl.searchParams.set('listShareCode', cleanListShareCode);
  var mediaActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'public-document-media', {
    shareCode: cleanShareCode,
    documentId: cleanDocumentId,
    listShareCode: cleanListShareCode
  });
  var result = await fetchJsonWithRoutingFallback(mediaRequestUrl.toString(), '', mediaActionUrl);
  if (!result.ok || !result.payload || !result.payload.data) {
    return { ok: false, message: resultErrorMessage(result.payload, 'Kunne ikke hente offentlig vedleggsdata.') };
  }
  attachmentMediaCache[cacheKey] = result.payload.data;
  return { ok: true, data: result.payload.data };
}

function isSupportedDocumentUpload(file) {
  const fileName = String(file && file.name || '').trim().toLowerCase();
  const mimeType = String(file && file.type || '').trim().toLowerCase();
  const extensionMatch = fileName.match(/(\.[a-z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1] : '';

  return !!DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES[mimeType] || !!DOCUMENT_UPLOAD_ALLOWED_EXTENSIONS[extension];
}

async function deleteDocumentFromDetailPanel(documentId) {
  state.writeError = '';
  state.writeSuccess = '';

  try {
    const result = await deleteAttachmentById(documentId);
    if (!result.ok) {
      state.writeError = result.message || 'Sletting av vedlegg feilet.';
      renderState();
      return;
    }

    state.writeSuccess = 'Vedlegg slettet.';
    if (state.selectedInventoryId) {
      await loadInventoryDetail(state.selectedInventoryId, { switchToDetail: false });
    }
    renderState();
  } catch (_error) {
    state.writeError = 'Nettverksfeil ved sletting av vedlegg.';
    renderState();
  }
}

function normalizeMasterdataPayload(payload) {
  const emptySet = {
    status: [],
    tilstand: [],
    kategori: [],
    plassering: [],
    arrangement: [],
    ansvarlig: [],
    attributttype: []
  };
  if (!payload || typeof payload !== 'object') {
    return emptySet;
  }

  const normalized = Object.assign({}, emptySet);
  Object.keys(normalized).forEach(function (type) {
    const source = Array.isArray(payload[type]) ? payload[type] : [];
    normalized[type] = source
      .map(function (entry) {
        if (entry && typeof entry === 'object') {
          const value = String(entry.value || entry.verdi || '').trim();
          if (!value) {
            return null;
          }
          return {
            id: String(entry.id || value).trim(),
            value: value,
            isActive: entry.isActive !== false && entry.aktiv !== false,
            sortOrder: Number(entry.sortOrder != null ? entry.sortOrder : (entry.sortering != null ? entry.sortering : 99)),
            colorToken: normalizeChipColorToken(entry.colorToken || entry.farge),
            labelColor: String(entry.labelColor || '').trim(),
            textColor: String(entry.textColor || '').trim()
          };
        }
        const simpleValue = String(entry || '').trim();
        if (!simpleValue) {
          return null;
        }
        return {
          id: simpleValue,
          value: simpleValue,
          isActive: true,
          sortOrder: 99,
          colorToken: '',
          labelColor: '',
          textColor: ''
        };
      })
      .filter(function (entry) {
        return !!entry;
      });
  });
  return normalized;
}

async function loadMasterdata() {
  const token = getAccessToken();
  const masterdataUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.masterdataPath);
  const masterdataActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'masterdata');
  try {
    const result = await fetchJsonWithRoutingFallback(masterdataUrl, token, masterdataActionUrl);
    if (handleAuthErrorStatus(result.status)) {
      return;
    }
    if (hasUnauthorizedPayload(result)) {
      _handleDataUnauthorized();
      return;
    }
    if (!result.ok || !result.payload || !result.payload.data) {
      state.masterdata = normalizeMasterdataPayload(null);
      return;
    }
    state.masterdata = normalizeMasterdataPayload(result.payload.data);
  } catch (_error) {
    state.masterdata = normalizeMasterdataPayload(null);
  }
}

async function loadAdminUsers() {
  if (!canManageUserAdmin()) return;
  state.userAdmin.loading = true;
  var token = getAccessToken();
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, '/api/v1/admin/users');
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'admin-users');
  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (!result.ok || !result.payload || !result.payload.data || !Array.isArray(result.payload.data.users)) {
      state.userAdmin.users = [];
      return;
    }
    state.userAdmin.users = result.payload.data.users;
  } catch (_error) {
    state.userAdmin.users = [];
  } finally {
    state.userAdmin.loading = false;
  }
}

async function createAdminUser() {
  state.writeError = '';
  state.writeSuccess = '';
  var token = getAccessToken();
  var payload = {
    displayName: String(state.userAdmin.form.displayName || '').trim(),
    username: String(state.userAdmin.form.username || '').trim(),
    role: String(state.userAdmin.form.role || 'viewer'),
    active: state.userAdmin.form.active !== false
  };
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, '/api/v1/admin/users');
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-admin-user');
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, payload);
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke opprette bruker.');
    renderState();
    return;
  }
  state.writeSuccess = 'Bruker opprettet.';
  state.userAdmin.form = { displayName: '', username: '', role: 'viewer', active: true };
  await loadAdminUsers();
  renderState();
}

async function updateAdminUser(username) {
  state.writeError = '';
  state.writeSuccess = '';
  var token = getAccessToken();
  var edit = state.userAdmin.edit[username] || {};
  var payload = { _method: 'PUT', username: username, displayName: String(edit.displayName || '').trim(), role: String(edit.role || 'viewer') };
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, '/api/v1/admin/users');
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'update-admin-user');
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, payload);
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke oppdatere bruker.');
    renderState();
    return;
  }
  state.writeSuccess = 'Bruker oppdatert.';
  await loadAdminUsers();
  renderState();
}

async function changeAdminUserStatus(username, actionName) {
  if (state.userAdmin.pendingStatusUsername !== username) {
    state.userAdmin.pendingStatusUsername = username;
    renderState();
    return;
  }
  state.userAdmin.pendingStatusUsername = '';
  state.writeError = '';
  state.writeSuccess = '';
  var token = getAccessToken();
  var path = '/api/v1/admin/users/' + encodeURIComponent(username) + '/' + actionName;
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, actionName === 'reactivate' ? 'reactivate-admin-user' : 'deactivate-admin-user', { id: username });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { username: username });
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke oppdatere brukerstatus.');
    renderState();
    return;
  }
  state.writeSuccess = actionName === 'reactivate' ? 'Bruker reaktivert.' : 'Bruker deaktivert.';
  await loadAdminUsers();
  renderState();
}

async function resetAdminUserPassword(username) {
  state.writeError = '';
  state.writeSuccess = '';
  var cleanUsername = String(username || '').trim();
  var newPassword = String(state.userAdmin.resetDrafts[cleanUsername] || '').trim();
  if (!cleanUsername) {
    state.writeError = 'Manglende brukernavn for passordnullstilling.';
    renderState();
    return;
  }
  if (newPassword.length < 8) {
    state.writeError = 'Nytt passord må være minst 8 tegn.';
    renderState();
    return;
  }
  var token = getAccessToken();
  var path = '/api/v1/admin/users/' + encodeURIComponent(cleanUsername) + '/reset-password';
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'reset-admin-user-password', { id: cleanUsername });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { username: cleanUsername, newPassword: newPassword });
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke nullstille passord.');
    renderState();
    return;
  }
  state.userAdmin.resetDrafts[cleanUsername] = '';
  state.writeSuccess = 'Passord nullstilt for ' + cleanUsername + '.';
  await loadAdminUsers();
  renderState();
}

async function createMasterdataValue() {
  state.writeError = '';
  state.writeSuccess = '';
  const value = String(state.admin.addValue || '').trim();
  const type = String(state.admin.activeType || '').trim();
  if (!isMasterdataAdminType(type)) {
    state.writeError = 'Velg en masterdatatype før du lagrer ny verdi.';
    renderState();
    return;
  }
  if (!value || !type) {
    state.writeError = 'Ny verdi må fylles ut før lagring.';
    renderState();
    return;
  }

  const token = getAccessToken();
  const path = buildMasterdataTypePath(state.runtimeConfig.masterdataTypePathTemplate, type);
  const url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  const createMdActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-masterdata', { type: type });
  const payload = {
    value: value
  };
  if (isChipManagedMasterdataType(type)) {
    payload.sortOrder = readAdminSortOrderInput(state.admin.addSortOrder, 99);
    payload.isActive = readAdminBooleanInput(state.admin.addIsActive, true);
    payload.colorToken = normalizeChipColorToken(state.admin.addColorToken);
  }

  try {
    const result = await sendJsonWithRoutingFallback(createMdActionUrl, url, 'POST', token, payload);
    if (handleAuthErrorStatus(result.status)) {
      renderState();
      return;
    }
    if (!result.ok || (result.payload && result.payload.error)) {
      state.writeError = resultErrorMessage(result.payload, 'Kunne ikke opprette verdi.');
      renderState();
      return;
    }
    state.writeSuccess = getAdminTypeMeta(type) + ' oppdatert.';
    state.admin.addValue = '';
    state.admin.addColorToken = '';
    state.admin.addSortOrder = '99';
    state.admin.addIsActive = true;
    state.admin.editingEntryId = '';
    await loadMasterdata();
    renderState();
  } catch (_error) {
    state.writeError = 'Nettverksfeil ved oppretting av masterdata.';
    renderState();
  }
}

async function updateMasterdataValue(valueId) {
  state.writeError = '';
  state.writeSuccess = '';
  const type = String(state.admin.activeType || '').trim();
  if (!isMasterdataAdminType(type)) {
    state.writeError = 'Velg en masterdatatype før du oppdaterer verdi.';
    renderState();
    return;
  }
  const currentEntry = getMasterdataEntryById(type, valueId);
  const currentValue = String(currentEntry && currentEntry.value || valueId || '').trim();
  const editKey = type + '::' + valueId;
  const nextValue = String(state.admin.editValues[editKey] || currentValue).trim();
  if (!nextValue) {
    state.writeError = 'Verdi kan ikke være tom.';
    renderState();
    return;
  }

  const token = getAccessToken();
  const path = buildMasterdataTypeIdPath(state.runtimeConfig.masterdataTypeIdPathTemplate, type, valueId);
  const url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  const updateMdActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'update-masterdata', { type: type, id: valueId });
  const payload = { _method: 'PUT', value: nextValue };
  if (isChipManagedMasterdataType(type)) {
    payload.sortOrder = readAdminSortOrderInput(
      Object.prototype.hasOwnProperty.call(state.admin.editSortOrders, editKey) ? state.admin.editSortOrders[editKey] : (currentEntry && currentEntry.sortOrder),
      99
    );
    payload.isActive = readAdminBooleanInput(
      Object.prototype.hasOwnProperty.call(state.admin.editIsActive, editKey) ? state.admin.editIsActive[editKey] : (currentEntry && currentEntry.isActive),
      true
    );
    payload.colorToken = normalizeChipColorToken(
      Object.prototype.hasOwnProperty.call(state.admin.editColorTokens, editKey) ? state.admin.editColorTokens[editKey] : (currentEntry && currentEntry.colorToken)
    );
  }
  try {
    const result = await sendJsonWithRoutingFallback(updateMdActionUrl, url, 'POST', token, payload);
    if (handleAuthErrorStatus(result.status)) {
      renderState();
      return;
    }
    if (!result.ok || (result.payload && result.payload.error)) {
      state.writeError = resultErrorMessage(result.payload, 'Kunne ikke oppdatere verdi.');
      renderState();
      return;
    }
    state.writeSuccess = getAdminTypeMeta(type) + ' oppdatert.';
    state.admin.editingEntryId = '';
    await loadMasterdata();
    renderState();
  } catch (_error) {
    state.writeError = 'Nettverksfeil ved oppdatering av masterdata.';
    renderState();
  }
}

async function deleteMasterdataValue(valueId) {
  const type = String(state.admin.activeType || '').trim();
  if (!isMasterdataAdminType(type)) {
    state.writeError = 'Velg en masterdatatype før du deaktiverer verdi.';
    renderState();
    return;
  }
  const confirmed = window.confirm(
    'Er du sikker på at du vil deaktivere «' + valueId + '»? Verdien skjules for nye valg, men historiske referanser beholdes.'
  );
  if (!confirmed) {
    return;
  }

  state.writeError = '';
  state.writeSuccess = '';
  const token = getAccessToken();
  const path = buildMasterdataTypeIdPath(state.runtimeConfig.masterdataTypeIdPathTemplate, type, valueId);
  const url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  const deleteMdActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'delete-masterdata', { type: type, id: valueId });
  try {
    const result = await sendJsonWithRoutingFallback(deleteMdActionUrl, url, 'POST', token, { _method: 'DELETE' });
    if (handleAuthErrorStatus(result.status)) {
      renderState();
      return;
    }
    if (!result.ok || (result.payload && result.payload.error)) {
      state.writeError = resultErrorMessage(result.payload, 'Kunne ikke deaktivere verdi.');
      renderState();
      return;
    }
    state.writeSuccess = getAdminTypeMeta(type) + ' deaktivert.';
    state.admin.editingEntryId = '';
    await loadMasterdata();
    renderState();
  } catch (_error) {
    state.writeError = 'Nettverksfeil ved deaktivering av masterdata.';
    renderState();
  }
}

async function loadLister() {
  var token = getAccessToken();
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.listsPath);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'lists');
  state.listeFeil = '';
  state.listeDelingslenkeFeedback = { type: '', message: '' };
  state.listeLaster = true;
  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (handleAuthErrorStatus(result.status)) {
      return;
    }
    if (hasUnauthorizedPayload(result)) {
      _handleDataUnauthorized();
      return;
    }
    if (!result.ok || !result.payload || !result.payload.data || !Array.isArray(result.payload.data.lists)) {
      state.lister = [];
      state.aktivListeId = '';
      state.aktivListeDetalj = null;
      state.listeFeil = resultErrorMessage(result.payload, 'Kunne ikke lese lister.');
      return;
    }
    state.lister = result.payload.data.lists;
    if (state.lister.length > 0 && !state.aktivListeId) {
      state.aktivListeId = String(state.lister[0].id || '');
    }
    if (state.aktivListeId) {
      await loadListeDetalj(state.aktivListeId);
    }
  } catch (_error) {
    state.lister = [];
    state.aktivListeDetalj = null;
    state.listeFeil = 'Nettverksfeil ved lasting av lister.';
  } finally {
    state.listeLaster = false;
  }
}

async function loadListeDetalj(listId) {
  if (!listId) return;
  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.listDetailPathTemplate, listId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'lists', { id: listId });
  state.listeFeil = '';
  state.listeDelingslenkeFeedback = { type: '', message: '' };
  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (handleAuthErrorStatus(result.status)) {
      return;
    }
    if (hasUnauthorizedPayload(result)) {
      _handleDataUnauthorized();
      return;
    }
    if (!result.ok || !result.payload || !result.payload.data || !result.payload.data.list) {
      state.aktivListeDetalj = null;
      state.listeFeil = resultErrorMessage(result.payload, 'Kunne ikke lese listedetalj.');
      return;
    }
    state.aktivListeId = String(listId);
    state.aktivListeDetalj = result.payload.data.list;
  } catch (_error) {
    state.aktivListeDetalj = null;
    state.listeFeil = 'Nettverksfeil ved lasting av listedetalj.';
  }
}

async function loadOffentligListe(shareCode) {
  state.offentligVisning.shareCode = shareCode;
  state.offentligVisning.feil = '';
  state.offentligVisning.laster = true;
  state.offentligVisning.liste = null;
  try {
    var path = buildPublicListPath(state.runtimeConfig.publicListPathTemplate, shareCode);
    var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
    var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'public-list', { shareCode: shareCode });
    var result = await fetchJsonWithRoutingFallback(url, '', actionUrl);
    if (!result.ok || !result.payload || !result.payload.data || !result.payload.data.list) {
      state.offentligVisning.feil = resultErrorMessage(result.payload, 'Delt lenke er ugyldig eller utilgjengelig.');
      return;
    }
    state.offentligVisning.liste = result.payload.data.list;
  } catch (_error) {
    state.offentligVisning.feil = 'Nettverksfeil ved lasting av offentlig liste.';
  } finally {
    state.offentligVisning.laster = false;
  }
}

async function loadOffentligVare(shareCode, listShareCode) {
  state.offentligVareVisning.shareCode = shareCode;
  state.offentligVareVisning.listShareCode = listShareCode;
  state.offentligVareVisning.feil = '';
  state.offentligVareVisning.laster = true;
  state.offentligVareVisning.vare = null;
  state.offentligVareVisning.accordionSection = PUBLIC_ITEM_ACCORDION_DEFAULT_SECTION;
  try {
    if (!String(listShareCode || '').trim()) {
      state.offentligVareVisning.feil = 'Mangler gyldig offentlig listekontekst for varedetalj.';
      return;
    }
    var path = buildPublicItemPath(state.runtimeConfig.publicItemPathTemplate, shareCode);
    var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
    var requestUrl = new URL(url, window.location.href);
    requestUrl.searchParams.set('listShareCode', listShareCode);
    var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'public-item', { shareCode: shareCode, listShareCode: listShareCode });
    var result = await fetchJsonWithRoutingFallback(requestUrl.toString(), '', actionUrl);
    var resolvedItem = result && result.payload && result.payload.data ? result.payload.data.item : null;
    var resolvedItemId = String((resolvedItem && (resolvedItem.id || resolvedItem.itemId)) || '').trim();
    if (!result.ok || (result.payload && result.payload.error) || !resolvedItem || !resolvedItemId) {
      state.offentligVareVisning.feil = resultErrorMessage(result.payload, 'Delt varelenke er ugyldig eller utilgjengelig.');
      return;
    }
    resolvedItem.id = resolvedItemId;
    state.offentligVareVisning.vare = resolvedItem;
  } catch (_error) {
    state.offentligVareVisning.feil = 'Nettverksfeil ved lasting av offentlig vare.';
  } finally {
    state.offentligVareVisning.laster = false;
  }
}

async function loadDetailPublicLinkStatus(itemId) {
  if (!itemId || !canWrite()) {
    state.detailPublicLinkStatus = null;
    state.detailPublicLinkFeedback = { type: '', message: '' };
    return;
  }
  var token = getAccessToken();
  var path = buildInventoryPublicLinkPath(state.runtimeConfig.inventoryPublicLinkPathTemplate, itemId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'public-product-link', { itemId: itemId });
  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (!result.ok || (result.payload && result.payload.error)) {
      state.detailPublicLinkStatus = null;
      state.detailPublicLinkFeedback = { type: '', message: '' };
      return;
    }
    state.detailPublicLinkStatus = result.payload && result.payload.data ? result.payload.data.link : null;
  } catch (_error) {
    state.detailPublicLinkStatus = null;
    state.detailPublicLinkFeedback = { type: '', message: '' };
  }
}

function renderDetailPublicLinkStatus() {
  var valueEl = document.getElementById('detail-public-link-value');
  var feedbackEl = document.getElementById('detail-public-link-feedback');
  var copyButton = document.querySelector('[data-public-link-copy]');
  if (!valueEl) {
    return;
  }
  var feedbackState = state.detailPublicLinkFeedback || { type: '', message: '' };
  if (feedbackEl) {
    feedbackEl.classList.add('hidden');
    feedbackEl.className = 'hidden rounded-md border px-3 py-2 text-sm';
    feedbackEl.textContent = '';
    if (feedbackState.message) {
      feedbackEl.textContent = feedbackState.message;
      feedbackEl.classList.remove('hidden');
      if (feedbackState.type === 'error') {
        feedbackEl.classList.add('border-rose-200', 'bg-rose-50', 'text-rose-800');
      } else {
        feedbackEl.classList.add('border-emerald-200', 'bg-emerald-50', 'text-emerald-800');
      }
    }
  }
  var detailContextId = getDetailContextItemId();
  if (!detailContextId) {
    valueEl.textContent = 'Kan ikke oppdatere offentlig varelenke: detaljkontekst mangler gyldig vare-ID.';
    if (copyButton) {
      copyButton.disabled = true;
      copyButton.setAttribute('aria-disabled', 'true');
    }
    return;
  }
  var link = state.detailPublicLinkStatus;
  if (!link || !link.shareCode) {
    valueEl.textContent = 'Ingen aktiv lenke. Velg «Hent / opprett».';
    if (copyButton) {
      copyButton.disabled = true;
      copyButton.setAttribute('aria-disabled', 'true');
    }
    return;
  }
  valueEl.textContent = buildPublicItemShareUrl(link.shareCode);
  if (copyButton) {
    copyButton.disabled = false;
    copyButton.removeAttribute('aria-disabled');
  }
}

function copyTextWithFallback(text) {
  var normalizedText = String(text || '').trim();
  if (!normalizedText) {
    return Promise.reject(new Error('Mangler tekst å kopiere.'));
  }
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(normalizedText);
  }
  return new Promise(function(resolve, reject) {
    var textarea = document.createElement('textarea');
    textarea.value = normalizedText;
    textarea.setAttribute('readonly', 'readonly');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.className = 'fixed -left-[9999px] top-0 opacity-0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (_error) {
      copied = false;
    }
    document.body.removeChild(textarea);
    if (copied) {
      resolve();
      return;
    }
    reject(new Error('Fallback-kopiering feilet.'));
  });
}

async function copyDetailPublicLink() {
  var link = state.detailPublicLinkStatus;
  if (!link || !link.shareCode) {
    state.detailPublicLinkFeedback = {
      type: 'error',
      message: 'Ingen aktiv offentlig varelenke å kopiere.'
    };
    renderState();
    return;
  }
  var shareUrl = buildPublicItemShareUrl(link.shareCode);
  try {
    await copyTextWithFallback(shareUrl);
    state.detailPublicLinkFeedback = {
      type: 'success',
      message: 'Offentlig varelenke er kopiert til utklippstavlen.'
    };
  } catch (_error) {
    state.detailPublicLinkFeedback = {
      type: 'error',
      message: 'Kunne ikke kopiere offentlig varelenke. Prøv igjen.'
    };
  }
  renderState();
}

async function copyAktivListeDelingslenke() {
  var detail = state.aktivListeDetalj;
  var shareCode = detail ? String(detail.shareCode || '').trim() : '';
  if (!shareCode) {
    state.listeDelingslenkeFeedback = {
      type: 'error',
      message: 'Ingen aktiv delingslenke å kopiere.'
    };
    renderState();
    return;
  }
  var shareUrl = buildPublicListShareUrl(shareCode);
  try {
    await copyTextWithFallback(shareUrl);
    state.listeDelingslenkeFeedback = {
      type: 'success',
      message: 'Delingslenken er kopiert til utklippstavlen.'
    };
  } catch (_error) {
    state.listeDelingslenkeFeedback = {
      type: 'error',
      message: 'Kunne ikke kopiere delingslenken. Prøv igjen.'
    };
  }
  renderState();
}

function getDetailContextItemId() {
  var detailContextEl = document.querySelector('[data-detail-canonical-item-id]');
  var detailContextId = String((state.detailItem && state.detailItem.id) || '').trim();
  if (detailContextEl) {
    var domContextId = String(detailContextEl.getAttribute('data-detail-canonical-item-id') || '').trim();
    if (domContextId) {
      detailContextId = domContextId;
    }
  }
  if (!detailContextId) {
    return '';
  }
  return detailContextId;
}

async function updatePublicProductLink(itemId, mode) {
  if (!itemId) {
    state.writeError = 'Kan ikke oppdatere offentlig varelenke: detaljkontekst mangler gyldig vare-ID.';
    renderState();
    return;
  }
  var token = getAccessToken();
  var path = buildInventoryPublicLinkPath(state.runtimeConfig.inventoryPublicLinkPathTemplate, itemId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var payload = {};
  var actionName = 'ensure-public-product-link';
  if (mode === 'regenerate') {
    payload._method = 'PUT';
    actionName = 'regenerate-public-product-link';
  } else if (mode === 'revoke') {
    payload._method = 'DELETE';
    actionName = 'revoke-public-product-link';
  }
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, actionName, { itemId: itemId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, payload);
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke oppdatere offentlig varelenke.');
    renderState();
    return;
  }
  state.detailPublicLinkStatus = result.payload && result.payload.data ? result.payload.data.link : null;
  state.detailPublicLinkFeedback = { type: '', message: '' };
  if (state.detailPublicLinkStatus && state.detailPublicLinkStatus.shareCode) {
    state.writeSuccess = 'Offentlig varelenke er oppdatert.';
  } else {
    state.writeSuccess = 'Offentlig varelenke er deaktivert.';
  }
  renderState();
}

async function createListe() {
  var inputEl = document.getElementById('list-name-input');
  var navn = inputEl ? String(inputEl.value || '').trim() : '';
  if (!navn) {
    state.listeFeil = 'Navn på liste er påkrevd.';
    renderState();
    return;
  }
  var token = getAccessToken();
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.listsPath);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-list');
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { navn: navn });
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.listeFeil = resultErrorMessage(result.payload, 'Kunne ikke opprette liste.');
    renderState();
    return;
  }
  if (inputEl) {
    inputEl.value = '';
  }
  await loadLister();
  renderState();
}

async function createListeFraDetaljflyt() {
  var inputEl = document.getElementById('detail-list-create-name');
  var navn = inputEl ? String(inputEl.value || '').trim() : '';
  if (!navn) {
    state.writeError = 'Navn på liste er påkrevd.';
    state.writeSuccess = '';
    renderState();
    return;
  }
  var token = getAccessToken();
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.listsPath);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-list');
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { navn: navn });
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke opprette liste.');
    state.writeSuccess = '';
    renderState();
    return;
  }
  state.writeError = '';
  state.writeSuccess = 'Ny liste opprettet. Velg listen og legg varen til.';
  state.detailListCreateOpen = false;
  if (inputEl) {
    inputEl.value = '';
  }
  await loadLister();
  var createdListId = '';
  if (result.payload && result.payload.data && result.payload.data.listResult) {
    createdListId = String(
      result.payload.data.listResult.id ||
      result.payload.data.listResult.listId ||
      result.payload.data.listResult.sharedListId ||
      ''
    ).trim();
  }
  var nyListe = Array.isArray(state.lister)
    ? state.lister.find(function (liste) {
      var listeId = String(liste.id || '').trim();
      if (createdListId && listeId === createdListId) {
        return true;
      }
      return String(liste.navn || '').trim() === navn;
    })
    : null;
  if (nyListe && nyListe.id) {
    state.detailListSelectedId = String(nyListe.id).trim();
  }
  renderState();
}

async function updateAktivListe() {
  if (!state.aktivListeId) return;
  var navnEl = document.getElementById('list-edit-name');
  var beskrivelseEl = document.getElementById('list-edit-description');
  var payload = {
    _method: 'PUT',
    navn: navnEl ? String(navnEl.value || '').trim() : '',
    beskrivelse: beskrivelseEl ? String(beskrivelseEl.value || '').trim() : ''
  };
  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.listDetailPathTemplate, state.aktivListeId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'update-list', { listId: state.aktivListeId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, payload);
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.listeFeil = resultErrorMessage(result.payload, 'Kunne ikke oppdatere liste.');
    renderState();
    return;
  }
  await loadLister();
  renderState();
}

async function deleteAktivListe() {
  if (!state.aktivListeId) return;
  if (!window.confirm('Slette valgt liste?')) {
    return;
  }
  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.listDetailPathTemplate, state.aktivListeId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'delete-list', { listId: state.aktivListeId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { _method: 'DELETE' });
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.listeFeil = resultErrorMessage(result.payload, 'Kunne ikke slette liste.');
    renderState();
    return;
  }
  state.aktivListeId = '';
  await loadLister();
  renderState();
}

function buildListSelectionPromptText(lister) {
  return ['Velg mål-liste ved å skrive nummeret:', '']
    .concat((lister || []).map(function (liste, index) {
      return String(index + 1) + '. ' + (liste.navn || liste.id) + ' (' + liste.id + ')';
    }))
    .join('\n');
}

async function chooseTargetListIdForAddToList() {
  if (!Array.isArray(state.lister) || !state.lister.length) {
    await loadLister();
  }
  if (!Array.isArray(state.lister) || !state.lister.length) {
    state.writeError = 'Ingen tilgjengelige lister. Opprett en liste først.';
    renderState();
    return '';
  }

  var answer = window.prompt(buildListSelectionPromptText(state.lister), '1');
  if (answer == null) {
    return '';
  }
  var selectedIndex = Number(String(answer || '').trim()) - 1;
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= state.lister.length) {
    state.writeError = 'Ugyldig listevalg. Ingen varer ble lagt til.';
    renderState();
    return '';
  }
  return String(state.lister[selectedIndex].id || '').trim();
}

async function addInventoryItemsToListShared(listId, itemIds) {
  var ids = (itemIds || []).map(function (itemId) {
    return String(itemId || '').trim();
  }).filter(function (itemId) {
    return !!itemId;
  });
  if (!listId || !ids.length) {
    return { added: 0, skipped: 0, failed: ids.length, errorMessage: '' };
  }

  var uniqueMap = {};
  var uniqueIds = [];
  ids.forEach(function (itemId) {
    if (!uniqueMap[itemId]) {
      uniqueMap[itemId] = true;
      uniqueIds.push(itemId);
    }
  });

  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.listItemsPathTemplate, listId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var resultSummary = { added: 0, skipped: 0, failed: 0, errorMessage: '' };
  for (var i = 0; i < uniqueIds.length; i++) {
    var itemId = uniqueIds[i];
    try {
      var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'add-list-item', { listId: listId, itemId: itemId });
      var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { itemId: itemId });
      if (!result.ok || (result.payload && result.payload.error)) {
        resultSummary.failed += 1;
        if (!resultSummary.errorMessage) {
          resultSummary.errorMessage = resultErrorMessage(result.payload, 'Kunne ikke legge valgte varer til valgt liste.');
        }
      } else if (result.payload && result.payload.data && result.payload.data.listResult && result.payload.data.listResult.added) {
        resultSummary.added += 1;
      } else {
        resultSummary.skipped += 1;
      }
    } catch (_error) {
      resultSummary.failed += 1;
      if (!resultSummary.errorMessage) {
        resultSummary.errorMessage = 'Nettverksfeil ved oppdatering av liste.';
      }
    }
  }
  return resultSummary;
}

async function addVareTilAktivListe() {
  if (!state.aktivListeId) return;
  var selectEl = document.getElementById('list-item-select');
  var itemId = selectEl ? String(selectEl.value || '').trim() : '';
  if (!itemId) {
    state.listeFeil = 'Velg en lagervare som skal legges til listen.';
    renderState();
    return;
  }
  var summary = await addInventoryItemsToListShared(state.aktivListeId, [itemId]);
  if (summary.failed > 0) {
    state.listeFeil = 'Kunne ikke legge vare til liste.';
    renderState();
    return;
  }
  state.writeError = '';
  state.writeSuccess = summary.added > 0
    ? 'Vare lagt til i listen.'
    : 'Varen finnes allerede i listen og ble hoppet over.';
  await loadListeDetalj(state.aktivListeId);
  renderState();
}

async function removeVareFraAktivListe(itemId) {
  if (!state.aktivListeId || !itemId) return;
  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.listItemsPathTemplate, state.aktivListeId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'remove-list-item', { listId: state.aktivListeId, itemId: itemId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { _method: 'DELETE', itemId: itemId });
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.listeFeil = resultErrorMessage(result.payload, 'Kunne ikke fjerne vare fra liste.');
    renderState();
    return;
  }
  await loadListeDetalj(state.aktivListeId);
  renderState();
}

async function loadLoans() {
  const token = getAccessToken();
  const loanListUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.loanListPath);
  const loanActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'loans');

  try {
    const loanResult = await fetchJsonWithRoutingFallback(loanListUrl, token, loanActionUrl);
    if (handleAuthErrorStatus(loanResult.status)) {
      return;
    }
    if (hasUnauthorizedPayload(loanResult)) {
      _handleDataUnauthorized();
      return;
    }
    if (!loanResult.ok || !loanResult.payload || !Array.isArray(loanResult.payload.data)) {
      state.loans = [];
      return;
    }

    state.loans = loanResult.payload.data.map(function (loan) {
      return Object.assign({}, loan, { isForfalt: !!loan.isForfalt });
    });
  } catch (_error) {
    state.loans = [];
  }
}

function formatBorrowerTypeLabel(typeValue) {
  var normalized = String(typeValue || '').trim().toLowerCase();
  if (normalized === 'organisasjon') return 'Organisasjon';
  return 'Person';
}

function formatBorrowerStatusLabel(statusValue) {
  return String(statusValue || '').trim().toLowerCase() === 'inaktiv' ? 'Inaktiv' : 'Aktiv';
}

function fillBorrowerForm(formData) {
  var data = formData || {};
  state.borrowerRegistry.form = {
    mode: String(data.mode || 'create'),
    id: String(data.id || '').trim(),
    type: String(data.type || 'person').trim() || 'person',
    navn: String(data.navn || '').trim(),
    tlf: String(data.tlf || '').trim(),
    epost: String(data.epost || '').trim(),
    status: String(data.status || 'aktiv').trim() || 'aktiv',
    organisasjonNavn: String(data.organisasjonNavn || '').trim(),
    kontaktpersonNavn: String(data.kontaktpersonNavn || (data.ansvarligKontaktperson && data.ansvarligKontaktperson.navn) || '').trim(),
    kontaktpersonTlf: String(data.kontaktpersonTlf || (data.ansvarligKontaktperson && data.ansvarligKontaktperson.tlf) || '').trim(),
    kontaktpersonEpost: String(data.kontaktpersonEpost || (data.ansvarligKontaktperson && data.ansvarligKontaktperson.epost) || '').trim(),
    notat: String(data.notat || '').trim()
  };
}

function parseBorrowerForm() {
  var formEl = document.getElementById('borrower-form');
  if (!formEl) {
    return Object.assign({}, state.borrowerRegistry.form);
  }
  return {
    mode: state.borrowerRegistry.form.mode,
    id: String(document.getElementById('borrower-id') && document.getElementById('borrower-id').value || '').trim(),
    type: String(document.getElementById('borrower-type') && document.getElementById('borrower-type').value || 'person').trim(),
    navn: String(document.getElementById('borrower-name') && document.getElementById('borrower-name').value || '').trim(),
    tlf: String(document.getElementById('borrower-phone') && document.getElementById('borrower-phone').value || '').trim(),
    epost: String(document.getElementById('borrower-email') && document.getElementById('borrower-email').value || '').trim(),
    status: String(document.getElementById('borrower-status') && document.getElementById('borrower-status').value || 'aktiv').trim(),
    organisasjonNavn: String(document.getElementById('borrower-org-name') && document.getElementById('borrower-org-name').value || '').trim(),
    kontaktpersonNavn: String(document.getElementById('borrower-contact-name') && document.getElementById('borrower-contact-name').value || '').trim(),
    kontaktpersonTlf: String(document.getElementById('borrower-contact-phone') && document.getElementById('borrower-contact-phone').value || '').trim(),
    kontaktpersonEpost: String(document.getElementById('borrower-contact-email') && document.getElementById('borrower-contact-email').value || '').trim(),
    notat: String(document.getElementById('borrower-note') && document.getElementById('borrower-note').value || '').trim()
  };
}

function renderBorrowerRegistry() {
  var listEl = document.getElementById('borrower-list');
  var filterEl = document.getElementById('borrower-status-filter');
  var returnButtonEl = document.getElementById('borrower-return-button');
  var borrowerSelectEl = document.getElementById('loan-case-borrower-id');
  if (filterEl) {
    filterEl.value = state.borrowerRegistry.activeFilter;
  }
  if (returnButtonEl) {
    if (state.borrowerRegistry.returnContext) {
      returnButtonEl.classList.remove('hidden');
    } else {
      returnButtonEl.classList.add('hidden');
    }
  }
  if (borrowerSelectEl) {
    var activeBorrowers = (state.borrowerRegistry.items || []).filter(function (borrower) {
      return String(borrower.status || '').trim().toLowerCase() === 'aktiv';
    });
    borrowerSelectEl.innerHTML = ['<option value="">Velg låntaker</option>']
      .concat(activeBorrowers.map(function (borrower) {
        return '<option value="' + escapeHtml(borrower.id || '') + '">' + escapeHtml((borrower.navn || '-') + ' (' + (borrower.id || '') + ')') + '</option>';
      }))
      .join('');
    if (state.loanCaseRegistry.createForm.borrowerId) {
      borrowerSelectEl.value = state.loanCaseRegistry.createForm.borrowerId;
    }
  }
  if (listEl) {
    var listItems = state.borrowerRegistry.items || [];
    if (state.borrowerRegistry.activeFilter === 'active') {
      listItems = listItems.filter(function (borrower) {
        return String(borrower.status || '').trim().toLowerCase() === 'aktiv';
      });
    }
    if (!listItems.length) {
      listEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">Ingen låntakere funnet.</li>';
    } else {
      listEl.innerHTML = listItems.map(function (borrower) {
        return [
          '<li class="rounded-lg border border-slate-200 bg-white p-3">',
          '  <div class="flex flex-wrap items-center justify-between gap-2">',
          '    <div>',
          '      <p class="text-sm font-semibold text-slate-900">' + escapeHtml(borrower.navn || '-') + '</p>',
          '      <p class="text-xs text-slate-600">' + escapeHtml((borrower.id || '-') + ' · ' + formatBorrowerTypeLabel(borrower.type) + ' · ' + formatBorrowerStatusLabel(borrower.status)) + '</p>',
          '    </div>',
          '    <button type="button" data-edit-borrower-id="' + escapeHtml(borrower.id || '') + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Rediger</button>',
          '  </div>',
          '</li>'
        ].join('');
      }).join('');
    }
  }
  var form = state.borrowerRegistry.form;
  var formFields = [
    ['borrower-id', form.id],
    ['borrower-type', form.type],
    ['borrower-status', form.status],
    ['borrower-name', form.navn],
    ['borrower-phone', form.tlf],
    ['borrower-email', form.epost],
    ['borrower-org-name', form.organisasjonNavn],
    ['borrower-contact-name', form.kontaktpersonNavn],
    ['borrower-contact-phone', form.kontaktpersonTlf],
    ['borrower-contact-email', form.kontaktpersonEpost],
    ['borrower-note', form.notat]
  ];
  formFields.forEach(function (entry) {
    var el = document.getElementById(entry[0]);
    if (el && el.value !== entry[1]) {
      el.value = entry[1];
    }
  });
}

function renderLoanCaseRegistry() {
  var listEl = document.getElementById('loan-case-list');
  var detailEl = document.getElementById('loan-case-detail');
  var historyEl = document.getElementById('loan-case-history-list');
  var sourceTypeEl = document.getElementById('loan-case-source-type');
  var itemIdEl = document.getElementById('loan-case-item-id');
  var listIdEl = document.getElementById('loan-case-list-id');
  var noteEl = document.getElementById('loan-case-note');
  if (sourceTypeEl) {
    sourceTypeEl.value = state.loanCaseRegistry.createForm.sourceType;
  }
  if (itemIdEl && itemIdEl.value !== state.loanCaseRegistry.createForm.itemId) itemIdEl.value = state.loanCaseRegistry.createForm.itemId;
  if (listIdEl && listIdEl.value !== state.loanCaseRegistry.createForm.listId) listIdEl.value = state.loanCaseRegistry.createForm.listId;
  if (noteEl && noteEl.value !== state.loanCaseRegistry.createForm.notat) noteEl.value = state.loanCaseRegistry.createForm.notat;

  if (listEl) {
    if (!state.loanCaseRegistry.items.length) {
      listEl.innerHTML = '<li class="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">Ingen lånesaker funnet.</li>';
    } else {
      listEl.innerHTML = state.loanCaseRegistry.items.map(function (loanCase) {
        return [
          '<li class="rounded-lg border border-slate-200 bg-white p-3">',
          '  <div class="flex flex-wrap items-center justify-between gap-2">',
          '    <div>',
          '      <p class="text-sm font-semibold text-slate-900">' + escapeHtml((loanCase.id || '-') + ' · ' + (loanCase.borrowerNavn || '-')) + '</p>',
          '      <p class="text-xs text-slate-600">' + escapeHtml((loanCase.status || '-') + ' · ' + (loanCase.sourceType || 'manuell')) + '</p>',
          '    </div>',
          '    <button type="button" data-open-loan-case-id="' + escapeHtml(loanCase.id || '') + '" class="min-h-11 rounded-lg border border-hulBlue bg-white px-3 py-2 text-sm font-semibold text-hulBlueDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hulBlueDark">Åpne</button>',
          '  </div>',
          '</li>'
        ].join('');
      }).join('');
    }
  }

  if (detailEl) {
    var detail = state.loanCaseRegistry.detail;
    if (!detail) {
      detailEl.textContent = 'Velg en lånesak for detaljer og linjer.';
    } else {
      var lineCount = Array.isArray(detail.linjer) ? detail.linjer.length : 0;
      detailEl.innerHTML = [
        '<p class="text-sm font-semibold text-slate-900">' + escapeHtml(detail.id || '-') + ' · ' + escapeHtml(detail.status || '-') + '</p>',
        '<p class="mt-1 text-sm text-slate-700">Låntaker: ' + escapeHtml(detail.borrowerNavn || '-') + '</p>',
        '<p class="mt-1 text-sm text-slate-700">Linjer: ' + escapeHtml(String(lineCount)) + '</p>',
        '<ul class="mt-2 space-y-1">' + (detail.linjer || []).map(function (line) {
          return '<li class="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">' +
            escapeHtml((line.itemNavn || line.itemId || '-') + ' · ønsket ' + String(line.onsketAntall || 0) + ' · utlevert ' + String(line.utlevertAntall || 0)) +
            '</li>';
        }).join('') + '</ul>'
      ].join('');
    }
  }

  if (historyEl) {
    if (!state.loanCaseRegistry.history.length) {
      historyEl.innerHTML = '<li class="rounded border border-slate-200 bg-white p-2 text-xs text-slate-600">Ingen historikk registrert.</li>';
    } else {
      historyEl.innerHTML = state.loanCaseRegistry.history.map(function (entry) {
        return '<li class="rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">' + escapeHtml((entry.tidspunkt || '-') + ' · ' + (entry.type || '-') + ' · ' + (entry.tilStatus || '-')) + '</li>';
      }).join('');
    }
  }
}

async function loadBorrowers() {
  var token = getAccessToken();
  var statusParam = state.borrowerRegistry.activeFilter === 'active' ? 'aktiv' : '';
  var baseUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.borrowerListPath);
  var listUrl = statusParam ? (baseUrl + '?status=' + encodeURIComponent(statusParam)) : baseUrl;
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'borrowers', statusParam ? { status: statusParam } : {});
  state.borrowerRegistry.loading = true;
  try {
    var result = await fetchJsonWithRoutingFallback(listUrl, token, actionUrl);
    if (handleAuthErrorStatus(result.status)) return;
    if (!result.ok || !result.payload || !Array.isArray(result.payload.data)) {
      state.borrowerRegistry.items = [];
      state.inventoryError = buildEndpointDiagnosticMessage(
        '/api/v1/borrowers',
        listUrl,
        result,
        'Kunne ikke hente låntakere under bootstrap.'
      );
      return;
    }
    state.borrowerRegistry.items = result.payload.data;
    if (state.inventoryError && state.inventoryError.indexOf('/api/v1/borrowers') !== -1) {
      state.inventoryError = '';
    }
  } catch (_error) {
    state.borrowerRegistry.items = [];
    state.inventoryError = buildEndpointDiagnosticMessage(
      '/api/v1/borrowers',
      listUrl,
      { fetchError: 'network' },
      'Kunne ikke hente låntakere under bootstrap.'
    );
  } finally {
    state.borrowerRegistry.loading = false;
  }
}

function openBorrowerCreateFromLoan(originRoute) {
  fillBorrowerForm({ mode: 'create', type: 'person', status: 'aktiv' });
  var selectedItemIds = getLoanSelectedItemIds();
  state.borrowerRegistry.returnContext = {
    route: originRoute === 'detalj' ? 'detalj' : 'utlan',
    inventoryId: String(state.selectedInventoryId || state.loanForm.itemId || '').trim(),
    selectedItemIds: selectedItemIds
  };
  state.writeError = '';
  state.writeSuccess = '';
  setWorkspace('lantakerNy', { historyMode: 'push' });
  renderState();
}

function openBorrowerCreateWorkspace() {
  fillBorrowerForm({ mode: 'create', type: 'person', status: 'aktiv' });
  state.borrowerRegistry.returnContext = null;
  state.writeError = '';
  state.writeSuccess = '';
  setWorkspace('lantakerNy', { historyMode: 'push' });
  renderState();
}

function returnFromBorrowerCreateWorkspace() {
  if (state.borrowerRegistry.returnContext) {
    returnToLoanFlowAfterBorrower();
    return;
  }
  setWorkspace('lantakere', { historyMode: 'push' });
  renderState();
}

function returnToLoanFlowAfterBorrower() {
  var context = state.borrowerRegistry.returnContext;
  state.borrowerRegistry.returnContext = null;
  if (context && context.inventoryId) {
    state.selectedInventoryId = context.inventoryId;
    state.loanForm.itemId = context.inventoryId;
  }
  if (context && Array.isArray(context.selectedItemIds)) {
    setLoanFlowSelection(context.selectedItemIds, context.route || 'utlan');
  }
  setWorkspace(context && context.route === 'detalj' ? 'detalj' : 'utlan', { historyMode: 'push' });
  renderState();
}

async function upsertBorrowerFromForm() {
  var formData = parseBorrowerForm();
  if (!formData.navn || !formData.tlf || !formData.epost) {
    state.writeError = 'Navn, telefon og e-post er påkrevd for låntaker.';
    renderState();
    return;
  }
  if (formData.type === 'organisasjon' && (!formData.kontaktpersonNavn || !formData.kontaktpersonTlf || !formData.kontaktpersonEpost)) {
    state.writeError = 'Organisasjon krever ansvarlig kontaktperson med navn, telefon og e-post.';
    renderState();
    return;
  }
  var token = getAccessToken();
  var isEdit = !!formData.id;
  var path = isEdit ? buildPathFromTemplate(state.runtimeConfig.borrowerDetailPathTemplate, formData.id) : state.runtimeConfig.borrowerListPath;
  var endpointUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, isEdit ? 'update-borrower' : 'create-borrower', isEdit ? { id: formData.id } : {});
  var payload = {
    type: formData.type,
    navn: formData.navn,
    tlf: formData.tlf,
    epost: formData.epost,
    status: formData.status,
    organisasjonNavn: formData.organisasjonNavn,
    kontaktpersonNavn: formData.kontaktpersonNavn,
    kontaktpersonTlf: formData.kontaktpersonTlf,
    kontaktpersonEpost: formData.kontaktpersonEpost,
    notat: formData.notat
  };
  if (isEdit) {
    payload._method = 'PATCH';
  }
  var result = await sendJsonWithRoutingFallback(actionUrl, endpointUrl, 'POST', token, payload);
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, isEdit ? 'Kunne ikke oppdatere låntaker.' : 'Kunne ikke opprette låntaker.');
    renderState();
    return;
  }
  fillBorrowerForm({ mode: 'create', type: 'person', status: 'aktiv' });
  state.writeError = '';
  state.writeSuccess = isEdit ? 'Låntaker oppdatert.' : 'Låntaker opprettet.';
  await loadBorrowers();
  await loadLoanCases();
  if (!isEdit && state.borrowerRegistry.returnContext && result.payload && result.payload.data && result.payload.data.borrower) {
    var createdBorrower = result.payload.data.borrower;
    applyLoanBorrowerSelection(createdBorrower.id || '');
    returnToLoanFlowAfterBorrower();
    return;
  }
  renderState();
}

async function openBorrowerForEdit(borrowerId) {
  var cleanId = String(borrowerId || '').trim();
  if (!cleanId) return;
  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.borrowerDetailPathTemplate, cleanId);
  var detailUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'borrower-detail', { id: cleanId });
  var result = await fetchJsonWithRoutingFallback(detailUrl, token, actionUrl);
  if (!result.ok || !result.payload || result.payload.error || !result.payload.data) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke hente låntaker.');
    renderState();
    return;
  }
  fillBorrowerForm(Object.assign({}, result.payload.data, { mode: 'edit', id: cleanId }));
  state.writeError = '';
  state.writeSuccess = 'Låntaker lastet i redigering.';
  setWorkspace('lantakerNy', { historyMode: 'push' });
  renderState();
}

async function loadLoanCases() {
  var token = getAccessToken();
  var listUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.loanCaseListPath);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'loan-cases');
  state.loanCaseRegistry.loading = true;
  try {
    var result = await fetchJsonWithRoutingFallback(listUrl, token, actionUrl);
    if (handleAuthErrorStatus(result.status)) return;
    if (!result.ok || !result.payload || !Array.isArray(result.payload.data)) {
      state.loanCaseRegistry.items = [];
      state.inventoryError = buildEndpointDiagnosticMessage(
        '/api/v1/loan-cases',
        listUrl,
        result,
        'Kunne ikke hente lånesaker under bootstrap.'
      );
      return;
    }
    state.loanCaseRegistry.items = result.payload.data;
    if (state.inventoryError && state.inventoryError.indexOf('/api/v1/loan-cases') !== -1) {
      state.inventoryError = '';
    }
  } catch (_error) {
    state.loanCaseRegistry.items = [];
    state.inventoryError = buildEndpointDiagnosticMessage(
      '/api/v1/loan-cases',
      listUrl,
      { fetchError: 'network' },
      'Kunne ikke hente lånesaker under bootstrap.'
    );
  } finally {
    state.loanCaseRegistry.loading = false;
  }
}

async function createLoanCaseFromForm() {
  var borrowerIdEl = document.getElementById('loan-case-borrower-id');
  var sourceTypeEl = document.getElementById('loan-case-source-type');
  var itemIdEl = document.getElementById('loan-case-item-id');
  var listIdEl = document.getElementById('loan-case-list-id');
  var noteEl = document.getElementById('loan-case-note');
  var payload = {
    borrowerId: String(borrowerIdEl && borrowerIdEl.value || '').trim(),
    sourceType: String(sourceTypeEl && sourceTypeEl.value || '').trim(),
    itemId: String(itemIdEl && itemIdEl.value || '').trim(),
    listId: String(listIdEl && listIdEl.value || '').trim(),
    notat: String(noteEl && noteEl.value || '').trim()
  };
  if (!payload.borrowerId) {
    state.writeError = 'Velg lånetaker før opprettelse av lånesak.';
    renderState();
    return;
  }
  if (payload.sourceType === 'item' && !payload.itemId) {
    state.writeError = 'Lagervare-ID er påkrevd når kildetype er vare.';
    renderState();
    return;
  }
  if (payload.sourceType === 'list' && !payload.listId) {
    state.writeError = 'Liste-ID er påkrevd når kildetype er liste.';
    renderState();
    return;
  }
  var token = getAccessToken();
  var listUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.loanCaseListPath);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-loan-case');
  var result = await sendJsonWithRoutingFallback(actionUrl, listUrl, 'POST', token, payload);
  if (!result.ok || (result.payload && result.payload.error)) {
    state.writeError = resultErrorMessage(result.payload, 'Kunne ikke opprette lånesak.');
    renderState();
    return;
  }
  state.writeError = '';
  state.writeSuccess = 'Lånesak opprettet.';
  state.loanCaseRegistry.createForm.itemId = payload.sourceType === 'item' ? payload.itemId : '';
  state.loanCaseRegistry.createForm.listId = payload.sourceType === 'list' ? payload.listId : '';
  state.loanCaseRegistry.createForm.notat = '';
  await loadLoanCases();
  if (result.payload && result.payload.data && result.payload.data.loanCase && result.payload.data.loanCase.id) {
    await openLoanCase(String(result.payload.data.loanCase.id || '').trim());
  }
  renderState();
}

async function openLoanCase(loanCaseId) {
  var cleanId = String(loanCaseId || '').trim();
  if (!cleanId) return;
  var token = getAccessToken();
  var detailPath = buildPathFromTemplate(state.runtimeConfig.loanCaseDetailPathTemplate, cleanId);
  var detailUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, detailPath);
  var detailActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'loan-case-detail', { id: cleanId });
  var historyPath = buildPathFromTemplate(state.runtimeConfig.loanCaseHistoryPathTemplate, cleanId);
  var historyUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, historyPath);
  var historyActionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'loan-case-history', { id: cleanId });
  var detailResult = await fetchJsonWithRoutingFallback(detailUrl, token, detailActionUrl);
  if (!detailResult.ok || !detailResult.payload || detailResult.payload.error || !detailResult.payload.data) {
    state.writeError = resultErrorMessage(detailResult.payload, 'Kunne ikke hente lånesak.');
    renderState();
    return;
  }
  var historyResult = await fetchJsonWithRoutingFallback(historyUrl, token, historyActionUrl);
  state.loanCaseRegistry.selectedLoanCaseId = cleanId;
  state.loanCaseRegistry.detail = detailResult.payload.data;
  if (historyResult.ok && historyResult.payload && Array.isArray(historyResult.payload.data)) {
    state.loanCaseRegistry.history = historyResult.payload.data;
  } else {
    state.loanCaseRegistry.history = [];
  }
  state.writeError = '';
  state.writeSuccess = 'Lånesak åpnet.';
  renderState();
}

function resetBestillingFeedback() {
  state.bestilling.errorMessage = '';
  state.bestilling.statusMessage = '';
}

async function ensureBestillingDraft() {
  if (state.bestilling.draftId) {
    return state.bestilling.draftId;
  }
  var token = getAccessToken();
  var runtimeConfig = state.runtimeConfig;
  var path = runtimeConfig.ordersDraftPath;
  var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'create-order-draft');
  var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
  var result = await sendJsonWithRoutingFallback(actionUrl, pathUrl, 'POST', token, { lines: [] });
  if (!result.ok || !result.payload || result.payload.error || !result.payload.success) {
    throw new Error((result.payload && result.payload.error && result.payload.error.message) || 'Kunne ikke opprette bestillingsutkast.');
  }
  state.bestilling.draftId = String(result.payload.orderId || '').trim();
  state.bestilling.orderNumber = String(result.payload.orderNumber || '').trim();
  return state.bestilling.draftId;
}

async function loadBestillingDraft() {
  if (!state.bestilling.draftId) {
    state.bestilling.lines = [];
    return;
  }
  var token = getAccessToken();
  var runtimeConfig = state.runtimeConfig;
  var path = buildPathFromTemplate(runtimeConfig.orderDetailPathTemplate, state.bestilling.draftId);
  var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'order-detail', { id: state.bestilling.draftId });
  var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
  var result = await fetchJsonWithRoutingFallback(pathUrl, token, actionUrl);
  if (!result.ok || !result.payload || result.payload.error) {
    throw new Error((result.payload && result.payload.error && result.payload.error.message) || 'Kunne ikke hente bestilling.');
  }
  var bestilling = result.payload.bestilling || {};
  state.bestilling.lines = Array.isArray(bestilling.linjer) ? bestilling.linjer : [];
  state.bestilling.orderNumber = String(bestilling.orderNumber || state.bestilling.orderNumber || '').trim();
}

async function addLineToBestillingDraft() {
  resetBestillingFeedback();
  var selectedItem = String(state.bestilling.selectedItemId || '').trim();
  var quantity = parseInt(state.bestilling.selectedQuantity, 10);
  if (!selectedItem) {
    state.bestilling.errorMessage = 'Velg en lagervare før du legger til linje.';
    renderBestillingWorkspace();
    return;
  }
  if (isNaN(quantity) || quantity < 1) {
    state.bestilling.errorMessage = 'Antall må være minst 1.';
    renderBestillingWorkspace();
    return;
  }
  var orderId = await ensureBestillingDraft();
  var runtimeConfig = state.runtimeConfig;
  var token = getAccessToken();
  var path = buildPathFromTemplate(runtimeConfig.orderLinesPathTemplate, orderId);
  var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'add-order-line', { id: orderId });
  var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
  var result = await sendJsonWithRoutingFallback(actionUrl, pathUrl, 'POST', token, {
    productId: selectedItem,
    quantity: quantity,
    lineType: normalizeBestillingLineType(state.bestilling.selectedLineType)
  });
  if (!result.ok || !result.payload || result.payload.error) {
    state.bestilling.errorMessage = (result.payload && result.payload.error && result.payload.error.message) || 'Kunne ikke legge til linje.';
    renderBestillingWorkspace();
    return;
  }
  await loadBestillingDraft();
  state.bestilling.statusMessage = 'Linje lagt til i kurven.';
  renderBestillingWorkspace();
}

function buildBestillingLinePayloadsForItems(itemIds, options) {
  var opts = options || {};
  var requireDetailVariantSelection = !!opts.requireDetailVariantSelection;
  var detailVariantSelectionByItemId = opts.detailVariantSelectionByItemId || {};
  var itemLookupFn = typeof opts.itemLookupFn === 'function'
    ? opts.itemLookupFn
    : findInventoryItemWithDetailFallback;
  var linePayloads = [];
  var validationErrors = [];
  var itemSource = Array.isArray(itemIds) ? itemIds : [];
  for (var index = 0; index < itemSource.length; index += 1) {
    var productId = String(itemSource[index] || '').trim();
    if (!productId) {
      continue;
    }
    var item = itemLookupFn(productId);
    var variantSubunits = getVariantSubunitsForItem(item || {});
    if (variantSubunits.length < 1) {
      linePayloads.push({
        productId: productId,
        quantity: 1,
        lineType: BESTILLING_LINE_TYPE.MAIN_WITH_EQUIPMENT
      });
      continue;
    }

    if (requireDetailVariantSelection) {
      var selectedVariantKeysRaw = detailVariantSelectionByItemId[productId];
      var selectedVariantEntries = Array.isArray(selectedVariantKeysRaw)
        ? selectedVariantKeysRaw
        : [selectedVariantKeysRaw];
      var availableVariantKeys = {};
      var availableVariantQuantities = {};
      for (var availableVariantIndex = 0; availableVariantIndex < variantSubunits.length; availableVariantIndex += 1) {
        var availableVariant = variantSubunits[availableVariantIndex] || {};
        var availableVariantKey = String(availableVariant.id || '').trim();
        if (availableVariantKey) {
          availableVariantKeys[availableVariantKey] = true;
          availableVariantQuantities[availableVariantKey] = readVariantAvailableQuantity(availableVariant);
        }
      }
      var cleanedSelectionEntries = [];
      var seenVariantKeys = {};
      for (var selectionIndex = 0; selectionIndex < selectedVariantEntries.length; selectionIndex += 1) {
        var entry = selectedVariantEntries[selectionIndex];
        var variantKey = String(entry && typeof entry === 'object' ? entry.id : entry || '').trim();
        if (!variantKey || !availableVariantKeys[variantKey] || seenVariantKeys[variantKey]) {
          continue;
        }
        seenVariantKeys[variantKey] = true;
        var quantityRaw = entry && typeof entry === 'object' ? entry.quantity : 1;
        var quantity = parseInt(quantityRaw, 10);
        if (isNaN(quantity) || quantity < 1) {
          validationErrors.push({
            itemId: productId,
            message: 'Ugyldig antall for variant ' + variantKey + '.'
          });
          continue;
        }
        var maxAvailable = availableVariantQuantities[variantKey];
        if (quantity > maxAvailable) {
          validationErrors.push({
            itemId: productId,
            message: 'Antall for variant ' + variantKey + ' kan ikke overstige tilgjengelig antall (' + maxAvailable + ').'
          });
          continue;
        }
        cleanedSelectionEntries.push({
          id: variantKey,
          quantity: quantity
        });
      }
      if (!cleanedSelectionEntries.length) {
        validationErrors.push({
          itemId: productId,
          message: 'Velg minst én variant før varen kan legges til bestilling fra detaljsiden.'
        });
        continue;
      }
      for (var detailVariantIndex = 0; detailVariantIndex < cleanedSelectionEntries.length; detailVariantIndex += 1) {
        var detailSelection = cleanedSelectionEntries[detailVariantIndex];
        linePayloads.push({
          productId: productId,
          mainProductId: productId,
          quantity: detailSelection.quantity,
          lineType: BESTILLING_LINE_TYPE.SINGLE_VARIANT,
          variantKey: detailSelection.id
        });
      }
      continue;
    }

    for (var variantIndex = 0; variantIndex < variantSubunits.length; variantIndex += 1) {
      var variant = variantSubunits[variantIndex] || {};
      var variantKey = String(variant.id || '').trim();
      if (!variantKey) {
        continue;
      }
      linePayloads.push({
        productId: productId,
        mainProductId: productId,
        quantity: 1,
        lineType: BESTILLING_LINE_TYPE.SINGLE_VARIANT,
        variantKey: variantKey
      });
    }
  }
  return {
    lines: linePayloads,
    validationErrors: validationErrors
  };
}

async function addItemsToBestillingDraft(itemIds, kildeLabel, triggerButtonEl, pendingActionKey, options) {
  resetBestillingFeedback();
  var opts = options || {};
  var cleanItemIds = Array.from(new Set((Array.isArray(itemIds) ? itemIds : []).map(function (itemId) {
    return String(itemId || '').trim();
  }).filter(function (itemId) {
    return itemId.length > 0;
  })));
  if (!cleanItemIds.length) {
    state.writeError = 'Velg minst én vare før du legger til i bestilling.';
    renderState();
    return;
  }
  state.writeError = '';
  state.writeSuccess = '';
  var runtimeConfig = state.runtimeConfig;
  var token = getAccessToken();
  var pendingKey = String(pendingActionKey || 'bestilling-add-items').trim() || 'bestilling-add-items';
  var sourceName = String(kildeLabel || 'valgt visning').trim();
  var payloadBuildResult = buildBestillingLinePayloadsForItems(cleanItemIds, opts);
  if (payloadBuildResult.validationErrors.length > 0) {
    var firstValidationError = payloadBuildResult.validationErrors[0];
    state.bestilling.errorMessage = firstValidationError.message;
    state.writeError = firstValidationError.message;
    renderState();
    return;
  }
  var linesToAdd = payloadBuildResult.lines;
  if (linesToAdd.length < 1) {
    state.bestilling.errorMessage = 'Ingen gyldige bestillingslinjer kunne opprettes for valgte varer.';
    state.writeError = state.bestilling.errorMessage;
    renderState();
    return;
  }

  await withPendingAction(pendingKey, triggerButtonEl || null, async function () {
    var loadingTimeoutId = startGlobalLoading(pendingKey, 'Legger til i bestilling…', { blocking: false });
    try {
      var orderId = await ensureBestillingDraft();
      var path = buildPathFromTemplate(runtimeConfig.orderLinesPathTemplate, orderId);
      var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'add-order-line', { id: orderId });
      var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
      var addedCount = 0;
      var errorMessages = [];
      for (var index = 0; index < linesToAdd.length; index += 1) {
        var linePayload = linesToAdd[index];
        var productId = String(linePayload.productId || '').trim();
        var result = await sendJsonWithRoutingFallback(actionUrl, pathUrl, 'POST', token, {
          productId: productId,
          mainProductId: linePayload.mainProductId,
          quantity: linePayload.quantity,
          lineType: linePayload.lineType,
          variantKey: linePayload.variantKey
        });
        if (!result.ok || !result.payload || result.payload.error) {
          var feilmelding = resultErrorMessage(result.payload, 'Kunne ikke legge til vare ' + productId + '.');
          errorMessages.push(feilmelding);
          continue;
        }
        addedCount += 1;
      }
      if (addedCount > 0) {
        await loadBestillingDraft();
      }
      if (addedCount > 0 && errorMessages.length === 0) {
        state.bestilling.statusMessage = addedCount === 1
          ? '1 bestillingslinje lagt til i aktiv bestilling.'
          : (addedCount + ' bestillingslinjer lagt til i aktiv bestilling.');
        state.writeSuccess = state.bestilling.statusMessage + ' Kilde: ' + sourceName + '.';
        renderState();
        return;
      }
      if (addedCount > 0) {
        state.bestilling.statusMessage = addedCount + ' bestillingslinjer lagt til i aktiv bestilling.';
        state.writeSuccess = state.bestilling.statusMessage;
        state.writeError = errorMessages.length + ' linjer ble avvist av backend. Første feil: ' + errorMessages[0];
        renderState();
        return;
      }
      state.bestilling.errorMessage = errorMessages[0] || 'Kunne ikke legge til varer i aktiv bestilling.';
      state.writeError = state.bestilling.errorMessage;
      renderState();
    } catch (error) {
      state.bestilling.errorMessage = String((error && error.message) || 'Nettverksfeil ved oppdatering av bestilling.');
      state.writeError = state.bestilling.errorMessage;
      renderState();
    } finally {
      stopGlobalLoading(pendingKey, loadingTimeoutId);
    }
  });
}

async function updateBestillingLineQuantity(lineId, quantityValue) {
  resetBestillingFeedback();
  var orderId = String(state.bestilling.draftId || '').trim();
  var lineIdValue = String(lineId || '').trim();
  var quantity = parseInt(quantityValue, 10);
  if (!orderId || !lineIdValue) return;
  if (isNaN(quantity) || quantity < 1) {
    state.bestilling.errorMessage = 'Antall må være minst 1.';
    renderBestillingWorkspace();
    return;
  }
  var runtimeConfig = state.runtimeConfig;
  var token = getAccessToken();
  var path = buildPathFromTemplate(runtimeConfig.orderLinesPathTemplate, orderId);
  var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'update-order-line-quantity', { id: orderId });
  var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
  var result = await sendJsonWithRoutingFallback(actionUrl, pathUrl, 'POST', token, { _method: 'PUT', lineId: lineIdValue, quantity: quantity });
  if (!result.ok || !result.payload || result.payload.error) {
    state.bestilling.errorMessage = (result.payload && result.payload.error && result.payload.error.message) || 'Kunne ikke oppdatere linje.';
    renderBestillingWorkspace();
    return;
  }
  await loadBestillingDraft();
  renderBestillingWorkspace();
}

async function removeBestillingLine(lineId) {
  resetBestillingFeedback();
  var orderId = String(state.bestilling.draftId || '').trim();
  var lineIdValue = String(lineId || '').trim();
  if (!orderId || !lineIdValue) return;
  var runtimeConfig = state.runtimeConfig;
  var token = getAccessToken();
  var path = buildPathFromTemplate(runtimeConfig.orderLinesPathTemplate, orderId);
  var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'remove-order-line', { id: orderId });
  var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
  var result = await sendJsonWithRoutingFallback(actionUrl, pathUrl, 'POST', token, { _method: 'DELETE', lineId: lineIdValue });
  if (!result.ok || !result.payload || result.payload.error) {
    state.bestilling.errorMessage = (result.payload && result.payload.error && result.payload.error.message) || 'Kunne ikke fjerne linje.';
    renderBestillingWorkspace();
    return;
  }
  await loadBestillingDraft();
  state.bestilling.statusMessage = 'Linje fjernet.';
  renderBestillingWorkspace();
}

async function submitBestillingDraft() {
  resetBestillingFeedback();
  var orderId = String(state.bestilling.draftId || '').trim();
  if (!orderId) {
    state.bestilling.errorMessage = 'Kurven er tom. Legg varer til bestilling fra andre flater før innsending.';
    renderBestillingWorkspace();
    return;
  }
  var runtimeConfig = state.runtimeConfig;
  var token = getAccessToken();
  var path = buildPathFromTemplate(runtimeConfig.orderSubmitPathTemplate, orderId);
  var actionUrl = buildGasActionUrl(runtimeConfig.backendBaseUrl, 'submit-order-draft', { id: orderId });
  var pathUrl = buildEndpointUrl(runtimeConfig.backendBaseUrl, path);
  var result = await sendJsonWithRoutingFallback(actionUrl, pathUrl, 'POST', token, { orderId: orderId });
  if (!result.ok || !result.payload || result.payload.error) {
    state.bestilling.errorMessage = (result.payload && result.payload.error && result.payload.error.message) || 'Kunne ikke sende inn bestilling.';
    renderBestillingWorkspace();
    return;
  }
  state.bestilling.statusMessage = 'Bestilling sendt inn.';
  state.bestilling.draftId = '';
  state.bestilling.orderNumber = '';
  state.bestilling.lines = [];
  renderBestillingWorkspace();
}

function getOrdersListPathFromTemplate() {
  var template = String(state.runtimeConfig && state.runtimeConfig.orderDetailPathTemplate || '').trim();
  if (!template) {
    return '';
  }
  return template
    .replace(/\/:id$/, '')
    .replace(':id', '');
}

async function loadLagerOrderQueue() {
  state.lagerko.loadingOrders = true;
  state.lagerko.statusMessage = '';
  state.lagerko.errorMessage = '';
  renderLagerWorkspace();
  var token = getAccessToken();
  var statusFilter = ['SUBMITTED', 'PICKING', 'READY_FOR_PICKUP', 'DEVIATION', 'COMPLETED'].join(',');
  var listPath = getOrdersListPathFromTemplate();
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, listPath) + '?status=' + encodeURIComponent(statusFilter);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'orders', { status: statusFilter });
  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (handleAuthErrorStatus(result.status)) {
      state.lagerko.loadingOrders = false;
      renderState();
      return;
    }
    if (!result.ok || !result.payload || result.payload.error) {
      state.lagerko.orders = [];
      state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke hente ordrekø.');
      state.lagerko.loadingOrders = false;
      renderLagerWorkspace();
      return;
    }
    state.lagerko.orders = Array.isArray(result.payload.bestillinger) ? result.payload.bestillinger : [];
    state.lagerko.loadingOrders = false;
    if (state.lagerko.selectedOrderId) {
      var selectedExists = state.lagerko.orders.some(function (bestilling) {
        return String(bestilling && bestilling.id || '').trim() === state.lagerko.selectedOrderId;
      });
      if (!selectedExists) {
        state.lagerko.selectedOrderId = '';
        state.lagerko.selectedOrder = null;
      }
    }
    renderLagerWorkspace();
  } catch (_error) {
    state.lagerko.orders = [];
    state.lagerko.loadingOrders = false;
    state.lagerko.errorMessage = 'Nettverksfeil ved lasting av ordrekø.';
    renderLagerWorkspace();
  }
}

async function openLagerOrder(orderId) {
  var bestillingId = String(orderId || '').trim();
  if (!bestillingId) {
    return;
  }
  state.lagerko.selectedOrderId = bestillingId;
  state.lagerko.loadingDetail = true;
  state.lagerko.statusMessage = '';
  state.lagerko.errorMessage = '';
  state.lagerko.selectedBorrowerId = '';
  state.lagerko.selectedBorrowerName = '';
  state.lagerko.forfallDato = '';
  state.lagerko.overgangNotat = '';
  renderLagerWorkspace();
  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.orderDetailPathTemplate, bestillingId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'order-detail', { id: bestillingId });
  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (handleAuthErrorStatus(result.status)) {
      state.lagerko.loadingDetail = false;
      renderState();
      return;
    }
    if (!result.ok || !result.payload || result.payload.error) {
      state.lagerko.selectedOrder = null;
      state.lagerko.loadingDetail = false;
      state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke åpne bestilling.');
      renderLagerWorkspace();
      return;
    }
    state.lagerko.selectedOrder = result.payload.bestilling || null;
    state.lagerko.loadingDetail = false;
    renderLagerWorkspace();
  } catch (_error) {
    state.lagerko.selectedOrder = null;
    state.lagerko.loadingDetail = false;
    state.lagerko.errorMessage = 'Nettverksfeil ved åpning av bestilling.';
    renderLagerWorkspace();
  }
}

async function createLoansFromLagerOrder(orderId) {
  var cleanOrderId = String(orderId || '').trim();
  if (!cleanOrderId) return;
  state.lagerko.errorMessage = '';
  state.lagerko.statusMessage = '';

  if (!state.lagerko.selectedBorrowerId) {
    state.lagerko.errorMessage = 'Velg låntaker før du oppretter utlån.';
    renderLagerWorkspace();
    return;
  }

  var token = getAccessToken();
  var path = buildPathFromTemplate(state.runtimeConfig.orderToLoanPathTemplate, cleanOrderId);
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'create-loans-from-order', { id: cleanOrderId });
  var payload = {
    borrowerId: String(state.lagerko.selectedBorrowerId || '').trim(),
    forfallDato: String(state.lagerko.forfallDato || '').trim(),
    notat: String(state.lagerko.overgangNotat || '').trim()
  };
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, payload);
  if (handleAuthErrorStatus(result.status)) {
    renderState();
    return;
  }
  if (!result.ok || (result.payload && result.payload.error)) {
    state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke opprette utlån fra bestillingen.');
    renderLagerWorkspace();
    return;
  }

  var createdLoans = Array.isArray(result.payload && result.payload.createdLoans) ? result.payload.createdLoans : [];
  var message = createdLoans.length
    ? ('Opprettet ' + createdLoans.length + ' utlån fra bestillingen.')
    : 'Bestillingen er overført til utlån.';
  state.lagerko.selectedBorrowerId = '';
  state.lagerko.selectedBorrowerName = '';
  state.lagerko.forfallDato = '';
  state.lagerko.overgangNotat = '';
  await Promise.all([loadLagerOrderQueue(), openLagerOrder(cleanOrderId), loadLoans(), loadInventoryList({ autoLoadFirstDetail: false })]);
  state.lagerko.statusMessage = message;
  renderLagerWorkspace();
}

function resolveLagerSelectedOrderId() {
  var selectedOrderId = String(state.lagerko.selectedOrderId || '').trim();
  if (selectedOrderId) {
    return selectedOrderId;
  }
  var selectedOrder = state.lagerko.selectedOrder || null;
  return String(selectedOrder && selectedOrder.id || '').trim();
}

function readLagerLinePickedQty(lineId) {
  var cleanLineId = String(lineId || '').trim();
  if (!cleanLineId) {
    return NaN;
  }
  var inputEl = document.querySelector('[data-lager-line-pickedqty="' + cleanLineId + '"]');
  return parseInt(inputEl && inputEl.value, 10);
}

function readLagerLineDeviationReason(lineId) {
  var cleanLineId = String(lineId || '').trim();
  if (!cleanLineId) {
    return '';
  }
  var selectEl = document.querySelector('[data-lager-line-deviation-reason="' + cleanLineId + '"]');
  return String(selectEl && selectEl.value || '').trim();
}


function readLagerOrderComment(orderId) {
  var cleanOrderId = String(orderId || '').trim();
  if (!cleanOrderId) {
    return '';
  }
  var textareaEl = document.querySelector('[data-lager-order-comment="' + cleanOrderId + '"]');
  return String(textareaEl && textareaEl.value || '').trim();
}

async function refreshLagerOrderAfterWrite(orderId, successMessage) {
  state.lagerko.statusMessage = String(successMessage || '').trim();
  state.lagerko.errorMessage = '';
  await openLagerOrder(orderId);
  await loadLagerOrderQueue();
  state.lagerko.statusMessage = String(successMessage || '').trim();
  renderLagerWorkspace();
}

async function startLagerOrderPicking(orderId) {
  var cleanOrderId = String(orderId || '').trim();
  if (!cleanOrderId) {
    return;
  }
  var token = getAccessToken();
  var path = '/api/v1/orders/' + encodeURIComponent(cleanOrderId) + '/status';
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'order-status', { id: cleanOrderId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { status: 'PICKING' });
  if (!result.ok || !result.payload || result.payload.error) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke starte plukking.');
    renderLagerWorkspace();
    return;
  }
  await refreshLagerOrderAfterWrite(cleanOrderId, 'Plukking startet.');
}


async function markLagerOrderReadyForPickup(orderId) {
  var cleanOrderId = String(orderId || '').trim();
  if (!cleanOrderId) {
    return;
  }
  var token = getAccessToken();
  var lagerComment = readLagerOrderComment(cleanOrderId);
  var path = '/api/v1/orders/' + encodeURIComponent(cleanOrderId) + '/status';
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'order-status', { id: cleanOrderId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { status: 'READY_FOR_PICKUP', lagerComment: lagerComment });
  if (!result.ok || !result.payload || result.payload.error) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke markere bestillingen som klar for henting.');
    renderLagerWorkspace();
    return;
  }

  var epostVarsel = result.payload && result.payload.epostVarsel;
  var melding = 'Bestillingen er markert som klar for henting.';
  if (epostVarsel && epostVarsel.sent === false && epostVarsel.reason) {
    melding = melding + ' Varsel ikke sendt: ' + replaceBestillingStatusTokens(String(epostVarsel.reason));
  }
  await refreshLagerOrderAfterWrite(cleanOrderId, melding);
}

async function submitLagerLinePick(lineId) {
  var cleanLineId = String(lineId || '').trim();
  var orderId = resolveLagerSelectedOrderId();
  var pickedQty = readLagerLinePickedQty(cleanLineId);
  if (!orderId || !cleanLineId) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = 'Mangler bestilling eller linje.';
    renderLagerWorkspace();
    return;
  }
  if (isNaN(pickedQty) || pickedQty < 0) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = 'Plukket antall må være et tall som er 0 eller høyere.';
    renderLagerWorkspace();
    return;
  }
  var token = getAccessToken();
  var path = '/api/v1/orders/' + encodeURIComponent(orderId) + '/lines/' + encodeURIComponent(cleanLineId) + '/pick';
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'order-line-pick', { id: orderId, lineId: cleanLineId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { pickedQty: pickedQty });
  if (!result.ok || !result.payload || result.payload.error) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke registrere plukk.');
    renderLagerWorkspace();
    return;
  }
  await refreshLagerOrderAfterWrite(orderId, 'Plukk registrert.');
}

async function submitLagerLineDeviation(lineId) {
  var cleanLineId = String(lineId || '').trim();
  var orderId = resolveLagerSelectedOrderId();
  var actualQty = readLagerLinePickedQty(cleanLineId);
  var reason = readLagerLineDeviationReason(cleanLineId);
  if (!orderId || !cleanLineId) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = 'Mangler bestilling eller linje.';
    renderLagerWorkspace();
    return;
  }
  if (isNaN(actualQty) || actualQty < 0) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = 'Faktisk antall må være et tall som er 0 eller høyere.';
    renderLagerWorkspace();
    return;
  }
  if (!reason) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = 'Velg avviksårsak før avvik registreres.';
    renderLagerWorkspace();
    return;
  }
  var token = getAccessToken();
  var path = '/api/v1/orders/' + encodeURIComponent(orderId) + '/lines/' + encodeURIComponent(cleanLineId) + '/deviation';
  var url = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, path);
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'order-line-deviation', { id: orderId, lineId: cleanLineId });
  var result = await sendJsonWithRoutingFallback(actionUrl, url, 'POST', token, { actualQty: actualQty, reason: reason });
  if (!result.ok || !result.payload || result.payload.error) {
    state.lagerko.statusMessage = '';
    state.lagerko.errorMessage = lagerkoErrorMessage(result.payload, 'Kunne ikke registrere avvik.');
    renderLagerWorkspace();
    return;
  }
  await refreshLagerOrderAfterWrite(orderId, 'Avvik registrert.');
}

async function loadInventoryList(options) {
  const listOptions = options || {};
  const autoLoadFirstDetail = listOptions.autoLoadFirstDetail !== false;
  state.inventoryError = '';
  state.detailError = '';
  state.detailItem = null;
  state.auditEvents = [];
  state.selectedInventoryId = '';
  state.route = 'liste';
  state.inventoryDataState = 'loading';

  const token = getAccessToken();
  const listUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.inventoryListPath);
  const listActionUrl = buildGasActionUrl(
    state.runtimeConfig.backendBaseUrl,
    state.runtimeConfig.inventoryListAction || 'inventory'
  );
  var loadingTimeoutId = startGlobalLoading('inventory-list-load', 'Laster lagerliste…');

  try {
    const inventoryResult = await fetchJsonWithRoutingFallback(listUrl, token, listActionUrl);
    if (handleAuthErrorStatus(inventoryResult.status)) {
      return;
    }
    if (hasUnauthorizedPayload(inventoryResult)) {
      _handleDataUnauthorized();
      return;
    }

    if (!inventoryResult.ok || !inventoryResult.payload || !Array.isArray(inventoryResult.payload.data)) {
      state.inventory = [];
      state.inventoryDataState = 'error';
      state.inventoryError = resultErrorMessage(inventoryResult.payload, 'Kunne ikke lese lagervareliste fra API.');
      return;
    }

    state.inventory = inventoryResult.payload.data;
    state.inventoryDataState = state.inventory.length > 0 ? 'ready' : 'empty';

    if (state.inventory.length > 0 && autoLoadFirstDetail) {
      await loadInventoryDetail(state.inventory[0].id, {
        switchToDetail: false
      });
    }
  } catch (_error) {
    state.inventory = [];
    state.inventoryDataState = 'error';
    state.inventoryError = 'Nettverksfeil ved lasting av lagervareliste.';
  } finally {
    stopGlobalLoading('inventory-list-load', loadingTimeoutId);
  }
}

async function loadInventoryDetail(inventoryId, options) {
  const detailOptions = options || {};
  const shouldSwitchToDetail = detailOptions.switchToDetail !== false;
  const requestedAccordionSection = String(detailOptions.accordionSection || '').trim();
  state.detailError = '';
  state.detailAccordionOpenSection = requestedAccordionSection || DETAIL_ACCORDION_DEFAULT_SECTION;
  ensureDetailAccordionSection();
  const requestSequence = state.detailRequestSequence + 1;
  state.detailRequestSequence = requestSequence;
  state.detailLoading.base = true;
  state.detailLoading.documents = true;
  state.detailLoading.audit = true;
  state.detailLoading.lister = true;
  state.detailLister = [];
  state.detailListerFeil = '';
  state.detailListerLaster = true;
  state.detailPublicLinkStatus = null;

  const cachedDetail = readDetailCache(inventoryId);
  if (cachedDetail && cachedDetail.detailItem) {
    state.selectedInventoryId = inventoryId;
    state.detailItem = cachedDetail.detailItem;
    state.auditEvents = Array.isArray(cachedDetail.auditEvents) ? cachedDetail.auditEvents : [];
    state.detailLister = Array.isArray(cachedDetail.detailLister) ? cachedDetail.detailLister : [];
    state.detailListerFeil = String(cachedDetail.detailListerFeil || '').trim();
    state.detailLoading.documents = !cachedDetail.documentsLoaded;
    state.detailLoading.audit = !cachedDetail.auditLoaded;
    state.detailLoading.lister = !cachedDetail.listerLoaded;
    state.detailListerLaster = state.detailLoading.lister;
    if (shouldSwitchToDetail) {
      state.route = 'detalj';
      syncNavigationUrl(detailOptions.historyMode === 'push' ? 'push' : 'replace');
    }
    renderDetailWorkspaceState();
  } else {
    state.selectedInventoryId = inventoryId;
    state.detailItem = null;
    state.auditEvents = [];
    state.detailLister = [];
    state.detailListerFeil = '';
    state.detailListerLaster = true;
    if (shouldSwitchToDetail) {
      state.route = 'detalj';
      syncNavigationUrl(detailOptions.historyMode === 'push' ? 'push' : 'replace');
    }
    renderDetailWorkspaceState();
  }
  markInventoryFormEditMode(inventoryId, 'loadInventoryDetail-start');

  const token = getAccessToken();
  const detailPathBase = buildInventoryDetailPath(state.runtimeConfig.inventoryDetailPathTemplate, inventoryId);
  const detailPath = detailPathBase + (detailPathBase.indexOf('?') === -1 ? '?' : '&') + 'include=documents';
  const detailUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, detailPath);
  const detailActionUrl = buildGasActionUrl(
    state.runtimeConfig.backendBaseUrl,
    state.runtimeConfig.inventoryDetailAction || 'inventory',
    { id: inventoryId }
  );
  var loadingTimeoutId = startGlobalLoading('inventory-detail-load-' + inventoryId, 'Laster lagervaredetalj…', { blocking: false });

  try {
    const detailResult = await fetchJsonWithRoutingFallback(detailUrl, token, detailActionUrl);
    if (requestSequence !== state.detailRequestSequence) {
      return;
    }

    if (handleAuthErrorStatus(detailResult.status)) {
      renderState();
      return;
    }

    if (detailResult.status === 404) {
      state.detailLoading.base = false;
      state.detailLoading.documents = false;
      state.detailLoading.audit = false;
      state.detailLoading.lister = false;
      state.selectedInventoryId = inventoryId;
      state.detailItem = null;
      state.auditEvents = [];
      state.detailLister = [];
      state.detailListerLaster = false;
      state.detailError = 'Detalj for valgt inventar finnes ikke lenger.';
      if (shouldSwitchToDetail) {
        state.route = 'detalj';
        syncNavigationUrl(detailOptions.historyMode === 'push' ? 'push' : 'replace');
      }
      renderState();
      return;
    }

    if (!detailResult.ok || !detailResult.payload || !detailResult.payload.data) {
      state.detailLoading.base = false;
      state.detailLoading.documents = false;
      state.detailLoading.audit = false;
      state.detailLoading.lister = false;
      state.selectedInventoryId = inventoryId;
      state.detailItem = null;
      state.auditEvents = [];
      state.detailLister = [];
      state.detailListerLaster = false;
      state.detailError = resultErrorMessage(detailResult.payload, 'Kunne ikke lese lagervaredetalj fra API.');
      if (shouldSwitchToDetail) {
        state.route = 'detalj';
        syncNavigationUrl(detailOptions.historyMode === 'push' ? 'push' : 'replace');
      }
      renderState();
      return;
    }

    state.detailLoading.base = false;
    state.selectedInventoryId = inventoryId;
    state.detailItem = detailResult.payload.data;
    if (!Array.isArray(state.detailItem.vedlegg)) {
      state.detailItem.vedlegg = [];
      state.detailLoading.documents = true;
    } else {
      state.detailLoading.documents = false;
    }
    state.auditEvents = [];
    markInventoryFormEditMode(inventoryId, 'loadInventoryDetail-success');
    if (shouldSwitchToDetail) {
      state.route = 'detalj';
      syncNavigationUrl(detailOptions.historyMode === 'push' ? 'push' : 'replace');
    }
    renderDetailWorkspaceState();
    writeDetailCache(inventoryId, buildDetailCachePayload({
      documentsLoaded: !state.detailLoading.documents,
      auditLoaded: false,
      listerLoaded: false
    }));
    var detailContextId = String((state.detailItem && state.detailItem.id) || '').trim() || String(inventoryId || '').trim();
    void loadDetailPublicLinkStatus(detailContextId).then(function () {
      renderDetailPublicLinkStatus();
    });
    if (state.detailLoading.documents) {
      void loadInventoryDocuments(inventoryId, requestSequence);
    }
    if (state.detailLoading.audit) {
      void loadAuditLogForInventory(inventoryId, requestSequence);
    }
    if (state.detailLoading.lister) {
      void loadDetailListMemberships(inventoryId, requestSequence);
    }
  } catch (_error) {
    if (requestSequence !== state.detailRequestSequence) {
      return;
    }

    state.detailLoading.base = false;
    state.detailLoading.documents = false;
    state.detailLoading.audit = false;
    state.detailLoading.lister = false;
    state.selectedInventoryId = inventoryId;
    state.detailItem = null;
    state.auditEvents = [];
    state.detailLister = [];
    state.detailListerLaster = false;
    state.detailError = 'Nettverksfeil ved lasting av lagervaredetalj.';
    if (shouldSwitchToDetail) {
      state.route = 'detalj';
      syncNavigationUrl(detailOptions.historyMode === 'push' ? 'push' : 'replace');
    }
    renderState();
  } finally {
    stopGlobalLoading('inventory-detail-load-' + inventoryId, loadingTimeoutId);
  }
}

async function loadInventoryDocuments(inventoryId, requestSequence) {
  if (!state.detailItem || state.detailItem.id !== inventoryId) {
    state.detailLoading.documents = false;
    return;
  }

  const token = getAccessToken();
  const documentsPath = buildPathFromTemplate(state.runtimeConfig.inventoryDocumentsPathTemplate, inventoryId);
  const documentsUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, documentsPath);
  const documentsActionUrl = buildGasActionUrl(
    state.runtimeConfig.backendBaseUrl,
    state.runtimeConfig.inventoryDocumentsAction || 'inventory-documents',
    { id: inventoryId }
  );

  try {
    const documentsResult = await fetchJsonWithRoutingFallback(documentsUrl, token, documentsActionUrl);
    if (requestSequence !== state.detailRequestSequence || !state.detailItem || state.detailItem.id !== inventoryId) {
      return;
    }
    if (handleAuthErrorStatus(documentsResult.status)) {
      state.detailLoading.documents = false;
      renderDetailWorkspaceState();
      return;
    }
    if (!documentsResult.ok || !documentsResult.payload || !documentsResult.payload.data) {
      state.detailItem.vedlegg = [];
      state.detailLoading.documents = false;
      renderDetailWorkspaceState();
      return;
    }

    const rawDocuments = Array.isArray(documentsResult.payload.data.documents)
      ? documentsResult.payload.data.documents
      : [];
    state.detailItem.vedlegg = rawDocuments
      .map(normalizeDocumentRecord)
      .filter(function (dokument) {
        return !!dokument.id;
      });
    state.detailLoading.documents = false;
    writeDetailCache(inventoryId, buildDetailCachePayload({
      documentsLoaded: true
    }));
    renderDetailWorkspaceState();
  } catch (_error) {
    if (requestSequence !== state.detailRequestSequence || !state.detailItem || state.detailItem.id !== inventoryId) {
      return;
    }
    state.detailItem.vedlegg = [];
    state.detailLoading.documents = false;
    renderDetailWorkspaceState();
  }
}

async function loadAuditLogForInventory(inventoryId, requestSequence) {
  if (!state.detailItem || state.detailItem.id !== inventoryId) {
    state.detailLoading.audit = false;
    return;
  }

  const token = getAccessToken();
  const auditPath = buildAuditLogPath(state.runtimeConfig.auditLogPathTemplate, 'inventory', inventoryId);
  const auditUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, auditPath);

  try {
    const auditResult = await fetchJson(auditUrl, token);
    if (requestSequence !== state.detailRequestSequence || !state.detailItem || state.detailItem.id !== inventoryId) {
      return;
    }
    if (handleAuthErrorStatus(auditResult.status)) {
      state.detailLoading.audit = false;
      renderDetailWorkspaceState();
      return;
    }
    if (!auditResult.ok || !auditResult.payload || !auditResult.payload.data) {
      state.auditEvents = [];
      state.detailLoading.audit = false;
      renderDetailWorkspaceState();
      return;
    }

    state.auditEvents = Array.isArray(auditResult.payload.data.events)
      ? auditResult.payload.data.events
      : [];
    state.detailLoading.audit = false;
    writeDetailCache(inventoryId, buildDetailCachePayload({
      auditLoaded: true
    }));
    renderDetailWorkspaceState();
  } catch (_error) {
    if (requestSequence !== state.detailRequestSequence || !state.detailItem || state.detailItem.id !== inventoryId) {
      return;
    }
    state.auditEvents = [];
    state.detailLoading.audit = false;
    renderDetailWorkspaceState();
  }
}

async function loadDetailListMemberships(inventoryId, requestSequence) {
  if (!state.detailItem || state.detailItem.id !== inventoryId) {
    state.detailLoading.lister = false;
    state.detailListerLaster = false;
    return;
  }

  var token = getAccessToken();
  var baseUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.listsPath);
  var searchParams = new URLSearchParams();
  searchParams.set('itemId', inventoryId);
  var url = baseUrl + '?' + searchParams.toString();
  var actionUrl = buildGasActionUrl(state.runtimeConfig.backendBaseUrl, 'lists', { itemId: inventoryId });

  try {
    var result = await fetchJsonWithRoutingFallback(url, token, actionUrl);
    if (requestSequence !== state.detailRequestSequence || !state.detailItem || state.detailItem.id !== inventoryId) {
      return;
    }
    if (handleAuthErrorStatus(result.status)) {
      state.detailLoading.lister = false;
      state.detailListerLaster = false;
      renderDetailWorkspaceState();
      return;
    }
    if (hasUnauthorizedPayload(result)) {
      _handleDataUnauthorized();
      state.detailLoading.lister = false;
      state.detailListerLaster = false;
      return;
    }
    if (!result.ok || !result.payload || !result.payload.data || !Array.isArray(result.payload.data.lists)) {
      state.detailLister = [];
      state.detailListerFeil = resultErrorMessage(result.payload, 'Kunne ikke hente listetilknytninger.');
      state.detailLoading.lister = false;
      state.detailListerLaster = false;
      renderDetailWorkspaceState();
      return;
    }

    state.detailLister = result.payload.data.lists;
    state.detailListerFeil = '';
    state.detailLoading.lister = false;
    state.detailListerLaster = false;
    writeDetailCache(inventoryId, buildDetailCachePayload({
      listerLoaded: true
    }));
    renderDetailWorkspaceState();
  } catch (_error) {
    if (requestSequence !== state.detailRequestSequence || !state.detailItem || state.detailItem.id !== inventoryId) {
      return;
    }
    state.detailLister = [];
    state.detailListerFeil = 'Nettverksfeil ved lasting av listetilknytninger.';
    state.detailLoading.lister = false;
    state.detailListerLaster = false;
    renderDetailWorkspaceState();
  }
}

async function applyNavigationStateFromUrl() {
  var navState = parseNavigationStateFromUrl();
  var targetRoute = normalizeWorkspaceRoute(navState.route);
  if (targetRoute === 'admin' && !canAccessAdminWorkspace()) {
    targetRoute = 'liste';
  }
  if (targetRoute === 'lager' && !canAccessLagerWorkspace()) {
    targetRoute = 'liste';
  }
  if (targetRoute === 'detalj' && !navState.inventoryId) {
    targetRoute = 'liste';
  }

  if ((targetRoute === 'detalj' && navState.inventoryId) || (targetRoute === 'utlan' && navState.inventoryId) || (targetRoute === 'rediger' && navState.inventoryId)) {
    var selectedId = String(navState.inventoryId || '').trim();
    if (!selectedId) {
      state.route = 'liste';
      syncNavigationUrl('replace');
      return;
    }
    await loadInventoryDetail(selectedId, {
      switchToDetail: true,
      accordionSection: navState.section
    });
    if (!state.detailItem || String(state.detailItem.id || '').trim() !== selectedId) {
      state.route = 'liste';
      state.selectedInventoryId = '';
      state.detailItem = null;
      state.detailError = '';
      syncNavigationUrl('replace');
      return;
    }
    if (targetRoute !== 'detalj') {
      setWorkspace(targetRoute, { historyMode: 'replace' });
    }
    restoreNonCriticalViewStateForCurrentContext();
    if (targetRoute === 'detalj' && navState.section) {
      state.detailAccordionOpenSection = navState.section;
      ensureDetailAccordionSection();
    }
    renderState();
    return;
  }

  setWorkspace(targetRoute, { historyMode: 'replace' });
  if (targetRoute === 'bestilling') {
    try {
      await loadBestillingDraft();
    } catch (error) {
      state.bestilling.errorMessage = String((error && error.message) || 'Kunne ikke hente bestillingsutkast.');
    }
  }
  if (targetRoute === 'lager') {
    await loadLagerOrderQueue();
  }
  restoreNonCriticalViewStateForCurrentContext();
  renderState();
}

async function loadShellState() {
  const runtimeConfigResult = readRuntimeConfig();
  if (!runtimeConfigResult.ok) {
    state.phase = 'error';
    state.initError = runtimeConfigResult.message;
    renderState();
    return;
  }

  state.runtimeConfig = runtimeConfigResult.value;
  var offentligItemShareCode = getPublicItemShareCodeFromUrl();
  if (offentligItemShareCode) {
    var offentligItemListShareCode = getPublicItemListShareCodeFromUrl();
    state.offentligVareVisning.aktiv = true;
    state.route = 'offentligVare';
    state.phase = 'ready';
    state.initError = '';
    if (!offentligItemListShareCode) {
      state.offentligVareVisning.feil = 'Mangler gyldig offentlig listekontekst for varedetalj.';
      renderState();
      return;
    }
    renderState();
    await loadOffentligListe(offentligItemListShareCode);
    await loadOffentligVare(offentligItemShareCode, offentligItemListShareCode);
    renderState();
    return;
  }
  var navState = parseNavigationStateFromUrl();
  if (navState && navState.route === 'offentligVare') {
    state.offentligVareVisning.aktiv = true;
    state.route = 'offentligVare';
    state.phase = 'ready';
    state.initError = '';
    state.offentligVareVisning.feil = 'Mangler offentlig varekode og listekontekst i lenken.';
    renderState();
    return;
  }
  var offentligShareCode = getPublicShareCodeFromUrl();
  if (offentligShareCode) {
    state.offentligVisning.aktiv = true;
    state.route = 'offentligListe';
    state.phase = 'ready';
    state.initError = '';
    renderState();
    await loadOffentligListe(offentligShareCode);
    renderState();
    return;
  }

  if (state.runtimeConfig.authMode === 'auth0') {
    const callbackResult = handleAuthCallbackIfPresent();
    if (callbackResult && callbackResult.errorMessage) {
      state.auth.status = 'unauthenticated';
      state.auth.detail = callbackResult.errorMessage;
    }
  }

  const token = state.runtimeConfig.authMode === 'none' ? '' : getAccessToken();
  const healthToken = state.runtimeConfig.healthToken || '';
  const healthUrl = (function buildHealthUrl() {
    const baseHealthUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.healthPath);
    if (!healthToken) {
      return baseHealthUrl;
    }
    const url = new URL(baseHealthUrl, window.location.href);
    url.searchParams.set('healthToken', healthToken);
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(baseHealthUrl)) {
      return url.toString();
    }
    return url.pathname + url.search + url.hash;
  }());
  const healthActionUrl = buildGasActionUrl(
    state.runtimeConfig.backendBaseUrl,
    'health',
    healthToken ? { healthToken: healthToken } : undefined
  );
  const sessionUrl = buildEndpointUrl(state.runtimeConfig.backendBaseUrl, state.runtimeConfig.sessionPath);
  const sessionActionUrl = buildGasActionUrl(
    state.runtimeConfig.backendBaseUrl,
    state.runtimeConfig.sessionAction || 'session'
  );

  const healthPromise = (async function loadHealthInBackground() {
    try {
      // Ikke inkluder auth-token (header) for å unngå CORS preflight mot GAS
      // (GAS håndterer ikke OPTIONS preflight, jf. sendJson-kommentar).
      // healthToken er et URL-query-param (ikke header) og trigger ikke preflight.
      // healthActionUrl (?action=health) er fallback fordi GAS e.pathInfo kan være
      // upålitelig og gi HTML-svar uten CORS-headers (som kaster TypeError i nettleseren).
      const healthResult = await fetchJsonWithRoutingFallback(healthUrl, '', healthActionUrl);
      const healthPayload = healthResult.payload;
      const hasPayloadError = healthPayload && healthPayload.error;
      if (healthResult.ok && !hasPayloadError) {
        state.health = { ok: true, payload: healthPayload };
      } else {
        state.health = { ok: false, payload: healthPayload, offline: !healthResult.ok };
      }
    } catch (_error) {
      state.health = { ok: false, offline: true };
    }
  }());

  if (state.runtimeConfig.authMode === 'none') {
    state.auth = {
      status: 'authenticated',
      session: null,
      detail: '',
      bootstrapError: ''
    };
    setAccessToken('');
  } else {
    try {
      const sessionResult = await awaitWithTimeout(
        fetchJsonWithRoutingFallback(sessionUrl, token, sessionActionUrl),
        BOOTSTRAP_SESSION_TIMEOUT_MS,
        'session-timeout'
      );

      if (
        sessionResult.ok &&
        sessionResult.payload &&
        sessionResult.payload.data &&
        sessionResult.payload.data.session
      ) {
        state.auth = {
          status: 'authenticated',
          session: sessionResult.payload.data.session,
          detail: '',
          bootstrapError: ''
        };
      } else if (
        sessionResult.status === 401 ||
        sessionResult.status === 403 ||
        (sessionResult.payload && sessionResult.payload.error && sessionResult.payload.error.code === 'UNAUTHORIZED')
      ) {
        setAccessToken('');
        state.auth = {
          status: 'unauthenticated',
          session: null,
          detail: sessionResult.status === 403
            ? 'Innlogget bruker mangler nødvendig rolle.'
            : 'Mangler gyldig session. Logg inn på nytt.',
          bootstrapError: ''
        };
      } else if (
        sessionResult.ok &&
        sessionResult.payload &&
        sessionResult.payload.data &&
        !sessionResult.payload.data.session
      ) {
        var unexpectedSessionShapeMessage = buildEndpointDiagnosticMessage(
          '/api/v1/session',
          sessionUrl,
          sessionResult,
          'Session-endepunkt returnerte uventet JSON-format (mangler data.session).'
        );
        logBootstrapFailure('session', '/api/v1/session', sessionUrl, sessionResult, unexpectedSessionShapeMessage);
        state.auth = {
          status: 'unknown',
          session: null,
          detail: unexpectedSessionShapeMessage,
          bootstrapError: ''
        };
      } else {
        var sessionDiagnosticMessage = buildEndpointDiagnosticMessage(
          '/api/v1/session',
          sessionUrl,
          sessionResult,
          'Session-endepunkt svarte med uventet status.'
        );
        logBootstrapFailure('session', '/api/v1/session', sessionUrl, sessionResult, sessionDiagnosticMessage);
        state.auth = {
          status: 'unknown',
          session: null,
          detail: sessionDiagnosticMessage,
          bootstrapError: ''
        };
      }
    } catch (error) {
      console.error('[HUL][bootstrap][session] Uventet feil under session-bootstrap:', error);
      var sessionNetworkDiagnosticMessage = buildEndpointDiagnosticMessage(
        '/api/v1/session',
        sessionUrl,
        { fetchError: 'network' },
        'Kunne ikke lese auth-state fra backend.'
      );
      logBootstrapFailure('session', '/api/v1/session', sessionUrl, { fetchError: 'network' }, sessionNetworkDiagnosticMessage);
      state.auth = {
        status: 'unknown',
        session: null,
        detail: sessionNetworkDiagnosticMessage,
        bootstrapError: ''
      };
    }
  }

  state.phase = 'ready';
  state.initError = '';

  if (state.auth.status !== 'authenticated') {
    await healthPromise;
    if (!state.health || !state.health.ok) {
      state.phase = 'error';
      const backendErrorMsg = state.health &&
        state.health.payload &&
        state.health.payload.error &&
        typeof state.health.payload.error.message === 'string' &&
        state.health.payload.error.message;
      state.initError = (backendErrorMsg || state.auth.detail || 'Backend er utilgjengelig. Verifiser runtime-konfigurasjon og backend-status.')
        + ' Første feilede backend-kall: /api/v1/session.';
      logBootstrapFailure('bootstrap', '/api/v1/session', sessionUrl, null, state.initError);
    }
    renderState();
    return;
  }

  state.inventoryDataState = 'loading';
  renderState();
  await Promise.all([
    loadMasterdata(),
    loadInventoryList({ autoLoadFirstDetail: false }),
    healthPromise
  ]);

  if (!state.health || !state.health.ok) {
    const backendErrorMsg = state.health &&
      state.health.payload &&
      state.health.payload.error &&
      typeof state.health.payload.error.message === 'string' &&
      state.health.payload.error.message;
    state.inventoryError = backendErrorMsg || 'Backend-status kunne ikke bekreftes.';
  }
  var activeRole = state.auth && state.auth.session && state.auth.session.role
    ? String(state.auth.session.role).toLowerCase()
    : '';
  var canLoadLoans = state.runtimeConfig.authMode === 'none' || activeRole === 'admin' || activeRole === 'editor' || activeRole === 'superadmin';
  if (canLoadLoans) {
    void loadLoans().then(function () {
      renderLoanSection();
    });
    void loadBorrowers().then(function () {
      renderBorrowerRegistry();
    });
  } else {
    state.loans = [];
    state.borrowerRegistry.items = [];
  }
  await applyNavigationStateFromUrl();
  syncNavigationUrl('replace');
  renderState();
}

function bootstrapShell() {
  applyShellMarkup();
  startNumericInputEnhancer();
  bindEvents();
  // Sikring: dersom loadShellState() henger (f.eks. treg/manglende nettverksforbindelse),
  // tvinger vi appen over i feil-tilstand etter 10 sekunder slik at brukeren får beskjed.
  var _phaseTimer = window.setTimeout(function () {
    if (state.phase === 'loading') {
      state.phase = 'error';
      state.initError = 'Innlogging svarte ikke. Sjekk nettverkstilgang og last siden på nytt.';
      logBootstrapFailure('bootstrap-timeout', '/api/v1/session', '', { fetchError: 'timeout' }, state.initError);
      renderState();
    }
  }, BOOTSTRAP_PHASE_TIMEOUT_MS);
  try {
    renderState();
  } catch (error) {
    console.warn('renderState feilet under bootstrapShell, fortsetter med fallback-timer:', error);
  }
  void loadShellState().then(function () {
    window.clearTimeout(_phaseTimer);
  }, function (error) {
    window.clearTimeout(_phaseTimer);
    console.error('loadShellState feilet uventet:', error);
    state.phase = 'error';
    state.initError = 'Uventet feil under oppstart. Last siden på nytt.';
    renderState();
  });
}

// Når mockBackend er aktivert, kan det oppstå en race condition der app.js (defer) kjøres
// før mock-backend.js (dynamisk innsatt, async=false) har installert sin fetch-interceptor.
// Vent på hulMockBackendReady-eventet dersom interceptoren ikke er klar ennå.
// Merk: onerror på script-taggen (index.html) håndterer lastefeilen (404/nettverksfeil).
// Timeoutet under håndterer den sjeldne situasjonen der mock-backend.js laster,
// men krasjer internt slik at hulMockBackendReady aldri blir dispatchet.
void (async function waitForMockBackendOrStart() {
  var shouldContinue = false;
  try {
    shouldContinue = await ensureClientStateMatchesBuildId();
  } catch (error) {
    console.warn('[HUL] Klienttilstand-reset feilet, fortsetter kontrollert:', error);
    shouldContinue = true;
  }
  if (!shouldContinue) {
    return;
  }

  const cfg = window.__HUL_RUNTIME_CONFIG || window.__RUNTIME_CONFIG__;
  if (cfg && cfg.mockBackend === true && !window.__hulMockBackendReady) {
    var _started = false;
    function _startOnce() {
      if (_started) { return; }
      _started = true;
      bootstrapShell();
    }
    document.addEventListener('hulMockBackendReady', _startOnce, { once: true });
    window.setTimeout(function () {
      if (!window.__hulMockBackendReady) {
        console.warn('[HUL] hulMockBackendReady uteble – starter uten mock-backend-interceptor.');
      }
      _startOnce();
    }, 2000);
  } else {
    bootstrapShell();
  }
}());
