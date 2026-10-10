(function initHulRuntimeConfig() {
  if (typeof window === 'undefined') {
    return;
  }

  // Frontend deploy-workflow skriver miljøspesifikk runtime-konfig på one.com.
  // backendBaseUrl skal settes i deploy-miljø, ikke hardkodes i repo.
  //
  // Lokal utviklingsmodus: backendBaseUrl peker mot hul-mock.local og mockBackend=true
  // aktiverer in-browser mock-backend (mock-backend.js) som intercepter fetch-kall.
  // I produksjon: sett backendBaseUrl til GAS-webapp-URL og mockBackend: false (eller utelat feltet).
  window.__HUL_RUNTIME_CONFIG = {
    frontendVersion: '0.0.3-dev',
    frontendBuildNumber: 'local-dev',
    frontendLastDeployAt: '',
    appBuildId: 'dev-local',
    backendBaseUrl: 'https://hul-mock.local',
    mockBackend: true,
    healthPath: '/api/v1/health',
    sessionPath: '/api/v1/session',
    // authMode: 'credentials' bruker innebygd GAS-session (brukernavn/passord via authLoginPath/authLogoutPath).
    // authMode: 'auth0' krever auth0Domain, auth0ClientId, auth0Audience.
    // authMode: 'none' deaktiverer innlogging (åpen tilgang, kun for utvikling).
    authMode: 'none',
    // authLoginPath og authLogoutPath brukes av authMode 'credentials'.
    authLoginPath: '/api/v1/auth/login',
    authLogoutPath: '/api/v1/auth/logout',
    inventoryListPath: '/api/v1/inventory',
    inventoryDetailPathTemplate: '/api/v1/inventory/:id',
    inventoryDocumentsPathTemplate: '/api/v1/inventory/:id/documents',
    documentDeletePathTemplate: '/api/v1/documents/:id',
    loanListPath: '/api/v1/loans',
    loanDetailPathTemplate: '/api/v1/loans/:id',
    loanReturnPathTemplate: '/api/v1/loans/:id/return',
    loanOverduePathTemplate: '/api/v1/loans/:id/overdue',
    loanDeviationPathTemplate: '/api/v1/loans/:id/deviation',
    inventoryAvailabilityPath: '/api/v1/inventory/availability',
    inventoryHistoryPath: '/api/v1/inventory/history',
    adminInventoryAdjustPath: '/api/v1/admin/inventory/adjust',
    borrowerListPath: '/api/v1/borrowers',
    borrowerDetailPathTemplate: '/api/v1/borrowers/:id',
    loanCaseListPath: '/api/v1/loan-cases',
    loanCaseDetailPathTemplate: '/api/v1/loan-cases/:id',
    loanCaseHistoryPathTemplate: '/api/v1/loan-cases/:id/history',
    auditLogPathTemplate: '/api/v1/audit-log?objektType=:objektType&objektId=:objektId',
    exportInventoryPath: '/api/v1/export/inventory',
    importInventoryPath: '/api/v1/import/inventory',
    bulkStatusUpdatePath: '/api/v1/bulk/status-update',
    masterdataPath: '/api/v1/masterdata',
    masterdataTypePathTemplate: '/api/v1/masterdata/:type',
    masterdataTypeIdPathTemplate: '/api/v1/masterdata/:type/:id',
    listsPath: '/api/v1/lists',
    listDetailPathTemplate: '/api/v1/lists/:id',
    listItemsPathTemplate: '/api/v1/lists/:id/items',
    ordersDraftPath: '/api/v1/orders/draft',
    orderDetailPathTemplate: '/api/v1/orders/:id',
    orderLinesPathTemplate: '/api/v1/orders/:id/lines',
    orderSubmitPathTemplate: '/api/v1/orders/:id/submit',
    orderToLoanPathTemplate: '/api/v1/orders/:id/loan',
    publicListPathTemplate: '/api/v1/public/lists/:shareCode',
    publicItemPathTemplate: '/api/v1/public/items/:shareCode',
    inventoryPublicLinkPathTemplate: '/api/v1/inventory/:id/public-link',
    healthToken: '',
    apiRoutingMode: 'path',
    sessionAction: 'session',
    inventoryListAction: 'inventory',
    inventoryDetailAction: 'inventory',
    inventoryDocumentsAction: 'inventory-documents',
    // Sett Auth0-feltene når authMode byttes til 'auth0'.
    auth0Domain: '',
    auth0ClientId: '',
    auth0Audience: '',
    auth0Scope: 'openid profile email',
    auth0RedirectUri: '',
    auth0LogoutReturnTo: ''
  };
})();
