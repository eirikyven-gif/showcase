/**
 * HUL Lagerstyring – in-browser mock backend
 *
 * Intercepter window.fetch når runtime-config har mockBackend: true.
 * All data lagres i localStorage under nøkkelen HUL_MOCK_DB_v1.
 * Seed-data (8 lagervarer + standardmasterdata) opprettes ved første besøk.
 *
 * I produksjon: sett mockBackend: false (eller utelat feltet) i runtime-config.js
 * og pek backendBaseUrl mot den ekte GAS-webapp-URL-en. Da er denne filen ufarlig –
 * IIFE returnerer tidlig uten å wrappe window.fetch eller skrive til konsollen.
 */
(function installHulMockBackend() {
  'use strict';

  // Tidlig retur dersom mockBackend ikke er aktivert – ingen sideeffekter i produksjon.
  var runtimeConfig = window.__HUL_RUNTIME_CONFIG || {};
  if (runtimeConfig.mockBackend !== true) {
    return;
  }

  var STORAGE_KEY = 'HUL_MOCK_DB_v1';

  var SEED_MASTERDATA = {
    status: [
      { id: 'status-tilgjengelig', value: 'Tilgjengelig', isActive: true, sortOrder: 10, colorToken: 'success' },
      { id: 'status-utlaant', value: 'Utlånt', isActive: true, sortOrder: 20, colorToken: 'warning' },
      { id: 'status-lav-beholdning', value: 'Lav beholdning', isActive: true, sortOrder: 30, colorToken: 'warning' },
      { id: 'status-ikke-tilgjengelig', value: 'Ikke tilgjengelig', isActive: true, sortOrder: 40, colorToken: 'neutral' },
      { id: 'status-til-reparasjon', value: 'Til reparasjon', isActive: true, sortOrder: 50, colorToken: 'danger' }
    ],
    tilstand: [
      { id: 'tilstand-ny', value: 'Ny', isActive: true, sortOrder: 10, colorToken: 'success' },
      { id: 'tilstand-meget-god', value: 'Meget god', isActive: true, sortOrder: 20, colorToken: 'success' },
      { id: 'tilstand-god', value: 'God', isActive: true, sortOrder: 30, colorToken: 'success' },
      { id: 'tilstand-slitt', value: 'Slitt', isActive: true, sortOrder: 40, colorToken: 'warning' },
      { id: 'tilstand-skadet', value: 'Skadet', isActive: true, sortOrder: 50, colorToken: 'danger' }
    ],
    kategori: ['Bekledning', 'Utstyr', 'Nødutstyr', 'Elektronikk', 'Rekvisita', 'Annet'],
    plassering: ['Hylle A1', 'Hylle A2', 'Hylle B1', 'Hylle B2', 'Hylle B3', 'Skap C1', 'Skap C2', 'Lageret bak'],
    arrangement: ['Hell Ultra 2024', 'Ultra X 2024', 'Kortbane 2025']
  };

  var SEED_ITEMS = [
    {
      id: 'TROJE-S', navn: 'HUL-løpstrøye strl. S', kategori: 'Bekledning',
      plassering: 'Hylle A1', status: 'Tilgjengelig', tilstand: 'Ny',
      beholdning: 15, arrangementer: ['Hell Ultra 2024'], aktiv: true
    },
    {
      id: 'TROJE-M', navn: 'HUL-løpstrøye strl. M', kategori: 'Bekledning',
      plassering: 'Hylle A1', status: 'Tilgjengelig', tilstand: 'God',
      beholdning: 20, arrangementer: ['Hell Ultra 2024'], aktiv: true
    },
    {
      id: 'TROJE-L', navn: 'HUL-løpstrøye strl. L', kategori: 'Bekledning',
      plassering: 'Hylle A2', status: 'Lav beholdning', tilstand: 'God',
      beholdning: 3, arrangementer: [], aktiv: true
    },
    {
      id: 'FLASKE-01', navn: 'Drikkeflaske 500 ml', kategori: 'Utstyr',
      plassering: 'Hylle B1', status: 'Tilgjengelig', tilstand: 'God',
      beholdning: 45, arrangementer: ['Hell Ultra 2024', 'Ultra X 2024'], aktiv: true
    },
    {
      id: 'TELT-01', navn: 'Nødshelter 2-person', kategori: 'Nødutstyr',
      plassering: 'Skap C1', status: 'Tilgjengelig', tilstand: 'Ny',
      beholdning: 8, arrangementer: [], aktiv: true
    },
    {
      id: 'RADIO-01', navn: 'Sambandsradio', kategori: 'Elektronikk',
      plassering: 'Skap C2', status: 'Utlånt', tilstand: 'God',
      beholdning: 4, arrangementer: ['Hell Ultra 2024'], aktiv: true
    },
    {
      id: 'BANNER-01', navn: 'Startbanner', kategori: 'Rekvisita',
      plassering: 'Lageret bak', status: 'Tilgjengelig', tilstand: 'Slitt',
      beholdning: 2, arrangementer: ['Hell Ultra 2024'], aktiv: true
    },
    {
      id: 'MEDKIT-01', navn: 'Førstehjelpspose', kategori: 'Nødutstyr',
      plassering: 'Hylle B3', status: 'Tilgjengelig', tilstand: 'Ny',
      beholdning: 12, arrangementer: [], aktiv: true
    }
  ];

  /* -----------------------------------------------------------------------
   * Databasehjelp (localStorage)
   * --------------------------------------------------------------------- */

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeColorToken(value) {
    var token = String(value || '').trim().toLowerCase();
    var allowed = {
      'success': 'success',
      'grønn': 'success',
      'gronn': 'success',
      'warning': 'warning',
      'gul': 'warning',
      'oransje': 'warning',
      'orange': 'warning',
      'danger': 'danger',
      'rød': 'danger',
      'rod': 'danger',
      'neutral': 'neutral',
      'grå': 'neutral',
      'gra': 'neutral'
    };
    return allowed[token] || '';
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9æøå]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeMasterdataEntries(type, sourceList) {
    var list = Array.isArray(sourceList) ? sourceList : [];
    return list.map(function (entry, index) {
      if (entry && typeof entry === 'object') {
        var valueObj = String(entry.value || entry.verdi || '').trim();
        if (!valueObj) {
          return null;
        }
        var idObj = String(entry.id || '').trim();
        if (!idObj) {
          idObj = type + '-' + slugify(valueObj || ('verdi-' + (index + 1)));
        }
        return {
          id: idObj,
          value: valueObj,
          isActive: entry.isActive !== false && entry.aktiv !== false,
          sortOrder: Number(entry.sortOrder != null ? entry.sortOrder : entry.sortering) || 99,
          colorToken: normalizeColorToken(entry.colorToken || entry.farge)
        };
      }
      var value = String(entry || '').trim();
      if (!value) {
        return null;
      }
      return {
        id: type + '-' + slugify(value || ('verdi-' + (index + 1))),
        value: value,
        isActive: true,
        sortOrder: 99,
        colorToken: ''
      };
    }).filter(function (entry) { return !!entry; });
  }

  function normalizeMasterdataDb(masterdata) {
    var source = masterdata && typeof masterdata === 'object' ? masterdata : {};
    var normalized = deepClone(SEED_MASTERDATA);
    Object.keys(normalized).forEach(function (type) {
      normalized[type] = normalizeMasterdataEntries(type, source[type] || normalized[type]);
    });
    return normalized;
  }

  function loadDb() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (_e) {}
    return null;
  }

  function saveDb(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (_e) {}
  }

  function getDb() {
    var db = loadDb();
    if (!db) {
      var seedNow = nowIso();
      var seedListId = 'LIST-' + String(Date.now());
      var seedShareCode = 'LISTE' + String(Math.floor(Math.random() * 90000) + 10000);
      db = {
        items: deepClone(SEED_ITEMS),
        lists: [
          {
            id: seedListId,
            navn: 'Standardliste',
            beskrivelse: 'Eksempelliste for frontendflyt',
            shareCode: seedShareCode,
            opprettet: seedNow,
            oppdatert: seedNow
          }
        ],
        listItems: [
          { listId: seedListId, itemId: 'TROJE-S', opprettet: seedNow },
          { listId: seedListId, itemId: 'FLASKE-01', opprettet: seedNow }
        ],
        loans: [],
        documents: {},
        auditLog: [],
        masterdata: deepClone(SEED_MASTERDATA),
        idCounter: 1000
      };
      db.masterdata = normalizeMasterdataDb(db.masterdata);
      saveDb(db);
    } else if (!db.masterdata || typeof db.masterdata !== 'object') {
      db.masterdata = normalizeMasterdataDb({});
      saveDb(db);
    } else {
      db.masterdata = normalizeMasterdataDb(db.masterdata);
      if (!Array.isArray(db.lists)) {
        db.lists = [];
      }
      if (!Array.isArray(db.listItems)) {
        db.listItems = [];
      }
      saveDb(db);
    }
    return db;
  }

  function nextId(db) {
    db.idCounter = (db.idCounter || 1000) + 1;
    return 'ID-' + db.idCounter;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function todayStr() {
    return nowIso().slice(0, 10);
  }

  function addAuditEvent(db, objektType, objektId, handling, nyttVerdi) {
    db.auditLog.push({
      id: nextId(db),
      objektType: objektType,
      objektId: objektId,
      handling: handling,
      bruker: 'demo-bruker',
      tidsstempel: nowIso(),
      nyttVerdi: nyttVerdi !== undefined ? nyttVerdi : null
    });
  }

  /* -----------------------------------------------------------------------
   * Mock HTTP-respons-fabrikk
   * --------------------------------------------------------------------- */

  function mockOk(data, status) {
    var code = status || 200;
    var body = { ok: true, data: data };
    var bodyStr = JSON.stringify(body);
    return {
      ok: true,
      status: code,
      json: function () { return Promise.resolve(body); },
      text: function () { return Promise.resolve(bodyStr); },
      headers: { get: function () { return null; } }
    };
  }

  function mockErr(code, message, status) {
    var httpStatus = status || 400;
    var body = { ok: false, error: { code: code, message: message } };
    var bodyStr = JSON.stringify(body);
    return {
      ok: false,
      status: httpStatus,
      json: function () { return Promise.resolve(body); },
      text: function () { return Promise.resolve(bodyStr); },
      headers: { get: function () { return null; } }
    };
  }

  /* -----------------------------------------------------------------------
   * CSV-hjelp
   * --------------------------------------------------------------------- */

  /**
   * Parser ett fullstendig CSV-dokument med RFC 4180-støtte inkludert linjeskift
   * inne i siterte felt. Returnerer en 2D-array av strenger (rader × celler).
   * Tomme rader (kun whitespace) filtreres bort.
   */
  function parseCsvDocument(text) {
    var rows = [];
    var row = [];
    var cell = '';
    var inQuotes = false;

    function pushCell() {
      row.push(cell);
      cell = '';
    }

    function pushRow() {
      pushCell();
      rows.push(row);
      row = [];
    }

    for (var i = 0, len = text.length; i < len; i++) {
      var ch = text.charAt(i);
      if (ch === '"') {
        if (inQuotes && text.charAt(i + 1) === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        pushCell();
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && text.charAt(i + 1) === '\n') {
          i++;
        }
        pushRow();
      } else {
        cell += ch;
      }
    }
    // Siste rad (uten avsluttende linjeskift)
    if (cell.length || row.length) {
      pushRow();
    }

    return rows.filter(function (r) {
      return r.some(function (value) { return String(value || '').trim() !== ''; });
    });
  }

  /**
   * Parser én CSV-rad med støtte for RFC 4180: anførselstegn rundt felter som
   * inneholder komma, anførselstegn (doble anførselstegn = escaped).
   * For fullstendig CSV med multiline-felt, bruk parseCsvDocument i stedet.
   */
  function parseCsvRow(source) {
    var values = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < source.length; i++) {
      var ch = source.charAt(i);
      if (ch === '"') {
        if (inQuotes && source.charAt(i + 1) === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }
      current += ch;
    }
    values.push(current);
    return values;
  }

  /**
   * Formaterer én CSV-celle for eksport:
   * innpakker alltid i anførselstegn, dobler interne anførselstegn og
   * normaliserer linjeskift til mellomrom slik at hver post forblir på én CSV-rad.
   * (RFC 4180 tillater linjeskift inne i siterte felt, men for eksport er én rad
   * per vare mer praktisk og kompatibelt med enkle CSV-lesere.)
   */
  function csvCell(val) {
    var str = String(val == null ? '' : val);
    // Normaliser CRLF/LF til mellomrom så feltet forblir én linje
    str = str.replace(/\r?\n/g, ' ');
    return '"' + str.replace(/"/g, '""') + '"';
  }

  /* -----------------------------------------------------------------------
   * Minimal XLSX-generator (ZIP stored, ingen komprimering)
   * Genererer et gyldig .xlsx-dokument fra en 2D-array (rader × celler).
   * Returnerer base64-kodet streng klar for nedlasting.
   * --------------------------------------------------------------------- */

  function buildXlsxBase64(sheetData) {
    function xmlEsc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function colRef(ci) {
      if (ci < 26) return String.fromCharCode(65 + ci);
      return String.fromCharCode(64 + Math.floor(ci / 26)) + String.fromCharCode(65 + (ci % 26));
    }

    var sheetRows = (sheetData || []).map(function (row, ri) {
      var cells = (row || []).map(function (cell, ci) {
        return '<c r="' + colRef(ci) + (ri + 1) + '" t="inlineStr"><is><t>' + xmlEsc(cell) + '</t></is></c>';
      });
      return '<row r="' + (ri + 1) + '">' + cells.join('') + '</row>';
    });

    var xmlFiles = [
      {
        name: '[Content_Types].xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '</Types>'
      },
      {
        name: '_rels/.rels',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>'
      },
      {
        name: 'xl/workbook.xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>' +
          '</workbook>'
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '</Relationships>'
      },
      {
        name: 'xl/worksheets/sheet1.xml',
        data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
          '<sheetData>' + sheetRows.join('') + '</sheetData>' +
          '</worksheet>'
      }
    ];

    var crcTable = (function () {
      var t = new Uint32Array(256);
      for (var i = 0; i < 256; i++) {
        var c = i;
        for (var k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c >>> 0;
      }
      return t;
    })();

    function crc32(bytes) {
      var c = 0xFFFFFFFF;
      for (var i = 0; i < bytes.length; i++) c = (c >>> 8) ^ crcTable[(c ^ bytes[i]) & 0xFF];
      return (c ^ 0xFFFFFFFF) >>> 0;
    }

    function strToU8(str) {
      var b = new Uint8Array(str.length);
      for (var i = 0; i < str.length; i++) b[i] = str.charCodeAt(i) & 0xFF;
      return b;
    }

    function concatU8(arrays) {
      var total = 0;
      for (var i = 0; i < arrays.length; i++) total += arrays[i].length;
      var out = new Uint8Array(total);
      var pos = 0;
      for (var i = 0; i < arrays.length; i++) { out.set(arrays[i], pos); pos += arrays[i].length; }
      return out;
    }

    var localParts = [];
    var cdParts = [];
    var localOffset = 0;

    for (var fi = 0; fi < xmlFiles.length; fi++) {
      var nameBytes = strToU8(xmlFiles[fi].name);
      var dataBytes = strToU8(xmlFiles[fi].data);
      var crc = crc32(dataBytes);
      var sz = dataBytes.length;
      var nl = nameBytes.length;

      var lh = new Uint8Array(30 + nl);
      var lv = new DataView(lh.buffer);
      lv.setUint32(0, 0x04034B50, true);
      lv.setUint16(4, 0x14, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0x0021, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, sz, true);
      lv.setUint32(22, sz, true);
      lv.setUint16(26, nl, true);
      lv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      localParts.push(lh, dataBytes);

      var cd = new Uint8Array(46 + nl);
      var cv = new DataView(cd.buffer);
      cv.setUint32(0, 0x02014B50, true);
      cv.setUint16(4, 0x14, true);
      cv.setUint16(6, 0x14, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0x0021, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, sz, true);
      cv.setUint32(24, sz, true);
      cv.setUint16(28, nl, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, localOffset, true);
      cd.set(nameBytes, 46);
      cdParts.push(cd);

      localOffset += 30 + nl + sz;
    }

    var localData = concatU8(localParts);
    var cdData = concatU8(cdParts);

    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054B50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, xmlFiles.length, true);
    ev.setUint16(10, xmlFiles.length, true);
    ev.setUint32(12, cdData.length, true);
    ev.setUint32(16, localData.length, true);
    ev.setUint16(20, 0, true);

    var zipBytes = concatU8([localData, cdData, eocd]);

    var binary = '';
    for (var bi = 0; bi < zipBytes.length; bi++) binary += String.fromCharCode(zipBytes[bi]);
    return window.btoa(binary);
  }

  /* -----------------------------------------------------------------------
   * URL-parsing
   * --------------------------------------------------------------------- */

  function parseMockUrl(url) {
    var str = String(url || '');
    // Fjern mock-protokoll + host slik at dette aldri blir en nettverksadresse.
    var withoutOrigin = str.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/?]+/i, '').replace(/^\//, '');
    var qIdx = withoutOrigin.indexOf('?');
    var pathPart = qIdx !== -1 ? withoutOrigin.slice(0, qIdx) : withoutOrigin;
    var queryPart = qIdx !== -1 ? withoutOrigin.slice(qIdx + 1) : '';
    // Fjern avsluttende skråstrek
    pathPart = pathPart.replace(/\/$/, '');
    return { path: pathPart, params: new URLSearchParams(queryPart) };
  }

  /* -----------------------------------------------------------------------
   * GET-handler
   * --------------------------------------------------------------------- */

  function handleGet(path, params) {
    var db = getDb();

    /* Health – støtter både path-basert (/api/v1/health) og action-basert (?action=health) */
    if (path === 'api/v1/health' || params.get('action') === 'health') {
      return mockOk({ service: 'hul-mock-backend', version: 'mock-1.0.0', backendVersion: 'mock-1.0.0', status: 'ok' });
    }

    /* Session – ikke brukt ved authMode:none, men håndteres defensivt */
    if (path === 'api/v1/session') {
      return mockErr('UNAUTHORIZED', 'Ikke innlogget (mock, authMode: none).');
    }

    if (path === 'api/v1/lists') {
      var summaries = (db.lists || []).map(function (liste) {
        var count = (db.listItems || []).filter(function (entry) { return entry.listId === liste.id; }).length;
        return {
          id: liste.id,
          navn: liste.navn,
          beskrivelse: liste.beskrivelse,
          shareCode: liste.shareCode,
          opprettet: liste.opprettet,
          oppdatert: liste.oppdatert,
          itemCount: count
        };
      });
      return mockOk({ lists: summaries });
    }

    var listDetailM = path.match(/^api\/v1\/lists\/([^/]+)$/);
    if (listDetailM) {
      var listId = decodeURIComponent(listDetailM[1]);
      var list = (db.lists || []).find(function (entry) { return entry.id === listId; });
      if (!list) {
        return mockErr('NOT_FOUND', 'Listen ble ikke funnet.', 404);
      }
      var items = (db.listItems || [])
        .filter(function (entry) { return entry.listId === list.id; })
        .map(function (entry) {
          return (db.items || []).find(function (item) { return item.id === entry.itemId; }) || null;
        })
        .filter(function (item) { return !!item; });
      return mockOk({
        list: {
          id: list.id,
          navn: list.navn,
          beskrivelse: list.beskrivelse,
          shareCode: list.shareCode,
          opprettet: list.opprettet,
          oppdatert: list.oppdatert,
          itemCount: items.length,
          items: items
        }
      });
    }

    var publicListM = path.match(/^api\/v1\/public\/lists\/([^/]+)$/);
    if (publicListM) {
      var shareCode = decodeURIComponent(publicListM[1]);
      var publicList = (db.lists || []).find(function (entry) { return entry.shareCode === shareCode; });
      if (!publicList) {
        return mockErr('NOT_FOUND', 'Listen ble ikke funnet for oppgitt delingskode.', 404);
      }
      var publicItems = (db.listItems || [])
        .filter(function (entry) { return entry.listId === publicList.id; })
        .map(function (entry) {
          return (db.items || []).find(function (item) { return item.id === entry.itemId; }) || null;
        })
        .filter(function (item) { return !!item; })
        .map(function (item) {
          return {
            navn: item.navn,
            kategori: item.kategori,
            status: item.status,
            beholdning: item.beholdning
          };
        });
      return mockOk({
        list: {
          navn: publicList.navn,
          beskrivelse: publicList.beskrivelse,
          shareCode: publicList.shareCode,
          itemCount: publicItems.length,
          items: publicItems
        }
      });
    }
    var publicItemM = path.match(/^api\/v1\/public\/items\/([^/]+)$/);
    if (publicItemM) {
      var itemShareCode = decodeURIComponent(publicItemM[1]);
      var publicLinks = db.publicItemLinks || {};
      var itemIdFromCode = publicLinks[itemShareCode];
      if (!itemIdFromCode) {
        return mockErr('NOT_FOUND', 'Produktlenken ble ikke funnet eller er tilbakekalt.', 404);
      }
      var publicItem = (db.items || []).find(function (entry) { return entry.id === itemIdFromCode; });
      if (!publicItem) {
        return mockErr('NOT_FOUND', 'Lagervaren knyttet til produktlenken ble ikke funnet.', 404);
      }
      var publicDocs = db.documents[itemIdFromCode] || [];
      return mockOk({
        item: {
          itemId: publicItem.id,
          shareCode: itemShareCode,
          navn: publicItem.navn,
          status: publicItem.status,
          tilstand: publicItem.tilstand,
          kategori: publicItem.kategori,
          beskrivelse: publicItem.beskrivelse || '',
          vedlegg: publicDocs
        }
      });
    }

    /* Inventory-liste */
    if (path === 'api/v1/inventory') {
      var activeItems = db.items.filter(function (i) { return i.aktiv !== false; });
      return mockOk(activeItems);
    }

    /* Inventory-detalj */
    var invDetailM = path.match(/^api\/v1\/inventory\/([^/]+)$/);
    if (invDetailM) {
      var detailId = decodeURIComponent(invDetailM[1]);
      var detailItem = null;
      for (var di = 0; di < db.items.length; di++) {
        if (db.items[di].id === detailId) { detailItem = db.items[di]; break; }
      }
      if (!detailItem || detailItem.aktiv === false) {
        return mockErr('NOT_FOUND', 'Lagervare ikke funnet.', 404);
      }
      return mockOk(detailItem);
    }
    var publicLinkStatusM = path.match(/^api\/v1\/inventory\/([^/]+)\/public-link$/);
    if (publicLinkStatusM) {
      var publicLinkItemId = decodeURIComponent(publicLinkStatusM[1]);
      var linksByItem = db.publicItemLinkByItem || {};
      var shareCodeByItem = linksByItem[publicLinkItemId] || '';
      return mockOk({
        link: {
          itemId: publicLinkItemId,
          hasLink: !!shareCodeByItem,
          active: !!shareCodeByItem,
          shareCode: shareCodeByItem
        }
      });
    }

    /* Dokumentliste for lagervare */
    var invDocsM = path.match(/^api\/v1\/inventory\/([^/]+)\/documents$/);
    if (invDocsM) {
      var docsItemId = decodeURIComponent(invDocsM[1]);
      return mockOk({ documents: db.documents[docsItemId] || [] });
    }

    /* Utlånsliste */
    if (path === 'api/v1/loans') {
      var activeLoans = db.loans.filter(function (l) { return !l.returDato; });
      return mockOk(activeLoans);
    }

    /* Forfallssjekk for utlån */
    var loanOverdueM = path.match(/^api\/v1\/loans\/([^/]+)\/overdue$/);
    if (loanOverdueM) {
      var overdueLoanId = decodeURIComponent(loanOverdueM[1]);
      var overdueLoan = null;
      for (var li = 0; li < db.loans.length; li++) {
        if (db.loans[li].id === overdueLoanId) { overdueLoan = db.loans[li]; break; }
      }
      if (!overdueLoan) {
        return mockErr('NOT_FOUND', 'Utlån ikke funnet.', 404);
      }
      var isForfalt = !!(overdueLoan.forfallDato && !overdueLoan.returDato &&
        new Date(overdueLoan.forfallDato) < new Date());
      return mockOk({ isForfalt: isForfalt });
    }

    /* Revisjonslogg */
    if (path.indexOf('api/v1/audit-log') === 0) {
      var objektType = params.get('objektType') || '';
      var objektId = params.get('objektId') || '';
      var events = db.auditLog
        .filter(function (ev) {
          return ev.objektType === objektType && ev.objektId === objektId;
        })
        .slice(-50)
        .reverse();
      return mockOk({ events: events });
    }

    /* Masterdata */
    if (path === 'api/v1/masterdata') {
      // Returnerer rå streng-arrays; normalizeMasterdataPayload() i app.js håndterer det
      return mockOk(db.masterdata);
    }

    /* XLSX importmal */
    if (path === 'api/v1/import/inventory/template' || params.get('action') === 'import-template-inventory') {
      var templateSheetData = [
        ['id', 'navn', 'kategori', 'plassering', 'status', 'tilstand', 'beholdning', 'arrangementer'],
        ['', '', '', '', '', '', '0', '']
      ];
      var templateBase64 = buildXlsxBase64(templateSheetData);
      return mockOk({
        fileBase64: templateBase64,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'inventory-importmal-v1.xlsx'
      });
    }

    /* XLSX-eksport */
    if (path === 'api/v1/export/inventory' || params.get('action') === 'export-inventory-xlsx') {
      var exportItems = db.items.filter(function (i) { return i.aktiv !== false; });
      var exportHeaders = ['id', 'navn', 'kategori', 'plassering', 'status', 'tilstand', 'beholdning', 'arrangementer'];
      var exportRows = exportItems.map(function (item) {
        return [
          item.id, item.navn, item.kategori, item.plassering,
          item.status, item.tilstand, String(item.beholdning == null ? 0 : item.beholdning),
          Array.isArray(item.arrangementer) ? item.arrangementer.join(';') : ''
        ];
      });
      var exportSheetData = [exportHeaders].concat(exportRows);
      var exportBase64 = buildXlsxBase64(exportSheetData);
      return mockOk({
        fileBase64: exportBase64,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'inventory-eksport.xlsx'
      });
    }

    return mockErr('NOT_FOUND', 'Endepunkt ikke funnet: ' + path, 404);
  }

  /* -----------------------------------------------------------------------
   * POST-handler
   * --------------------------------------------------------------------- */

  function handlePost(path, body) {
    var db = getDb();

    if (path === 'api/v1/lists') {
      var newName = String(body.navn || '').trim();
      if (!newName) {
        return mockErr('VALIDATION_ERROR', 'Navn på liste er påkrevd.', 400);
      }
      var listId = nextId(db);
      var now = nowIso();
      var createdList = {
        id: listId,
        navn: newName,
        beskrivelse: String(body.beskrivelse || '').trim(),
        shareCode: 'LISTE' + String(Math.floor(Math.random() * 90000) + 10000),
        opprettet: now,
        oppdatert: now
      };
      db.lists.push(createdList);
      saveDb(db);
      return mockOk({ listResult: { list: createdList } }, 201);
    }

    var listWriteM = path.match(/^api\/v1\/lists\/([^/]+)$/);
    if (listWriteM) {
      var editListId = decodeURIComponent(listWriteM[1]);
      var editList = (db.lists || []).find(function (entry) { return entry.id === editListId; });
      if (!editList) {
        return mockErr('NOT_FOUND', 'Listen ble ikke funnet.', 404);
      }
      var method = String(body._method || '').toUpperCase();
      if (method === 'DELETE') {
        db.lists = db.lists.filter(function (entry) { return entry.id !== editListId; });
        db.listItems = (db.listItems || []).filter(function (entry) { return entry.listId !== editListId; });
        saveDb(db);
        return mockOk({ listResult: { removed: true } });
      }
      if (method === 'PUT') {
        editList.navn = String(body.navn || editList.navn).trim();
        editList.beskrivelse = String(body.beskrivelse || '').trim();
        editList.oppdatert = nowIso();
        saveDb(db);
        return mockOk({ listResult: { list: editList } });
      }
    }

    var listItemM = path.match(/^api\/v1\/lists\/([^/]+)\/items$/);
    if (listItemM) {
      var listIdForItem = decodeURIComponent(listItemM[1]);
      var methodForItem = String(body._method || '').toUpperCase();
      var targetItemId = String(body.itemId || '').trim();
      if (!targetItemId) {
        return mockErr('VALIDATION_ERROR', 'itemId er påkrevd.', 400);
      }
      if (methodForItem === 'DELETE') {
        db.listItems = (db.listItems || []).filter(function (entry) {
          return !(entry.listId === listIdForItem && entry.itemId === targetItemId);
        });
      } else {
        var exists = (db.listItems || []).some(function (entry) {
          return entry.listId === listIdForItem && entry.itemId === targetItemId;
        });
        if (!exists) {
          db.listItems.push({ listId: listIdForItem, itemId: targetItemId, opprettet: nowIso() });
        }
      }
      saveDb(db);
      return mockOk({ listResult: { updated: true } });
    }
    var publicLinkWriteM = path.match(/^api\/v1\/inventory\/([^/]+)\/public-link$/);
    if (publicLinkWriteM) {
      var publicLinkWriteItemId = decodeURIComponent(publicLinkWriteM[1]);
      db.publicItemLinks = db.publicItemLinks || {};
      db.publicItemLinkByItem = db.publicItemLinkByItem || {};
      var methodPublicLink = String(body._method || '').toUpperCase();
      if (methodPublicLink === 'DELETE') {
        var oldCode = db.publicItemLinkByItem[publicLinkWriteItemId];
        if (oldCode) {
          delete db.publicItemLinks[oldCode];
        }
        delete db.publicItemLinkByItem[publicLinkWriteItemId];
        saveDb(db);
        return mockOk({ link: { itemId: publicLinkWriteItemId, hasLink: false, active: false, shareCode: '' } });
      }
      if (methodPublicLink === 'PUT') {
        var previousCode = db.publicItemLinkByItem[publicLinkWriteItemId];
        if (previousCode) {
          delete db.publicItemLinks[previousCode];
        }
      }
      var existingCode = db.publicItemLinkByItem[publicLinkWriteItemId];
      var ensuredCode = existingCode || ('VARE-' + String(Math.floor(Math.random() * 90000) + 10000));
      db.publicItemLinks[ensuredCode] = publicLinkWriteItemId;
      db.publicItemLinkByItem[publicLinkWriteItemId] = ensuredCode;
      addAuditEvent(db, 'inventory', publicLinkWriteItemId, methodPublicLink === 'PUT' ? 'Offentlig lenke regenerert' : 'Offentlig lenke opprettet', { shareCode: ensuredCode });
      saveDb(db);
      return mockOk({ link: { itemId: publicLinkWriteItemId, hasLink: true, active: true, shareCode: ensuredCode } });
    }

    /* Auth-login – authMode:none kaller ikke dette, men defensivt */
    if (path === 'api/v1/auth/login') {
      return mockErr('UNAUTHORIZED', 'Mock-backend: bruk authMode: none.', 401);
    }

    /* Auth-logout */
    if (path === 'api/v1/auth/logout') {
      return mockOk({ loggedOut: true });
    }

    /* Opprett lagervare */
    if (path === 'api/v1/inventory') {
      if (!body.id || !body.navn) {
        return mockErr('VALIDATION_ERROR', 'id og navn er påkrevd.', 400);
      }
      var existingItem = null;
      for (var ei = 0; ei < db.items.length; ei++) {
        if (db.items[ei].id === body.id) { existingItem = db.items[ei]; break; }
      }
      if (existingItem) {
        return mockErr('CONFLICT', 'Lagervare med denne ID-en finnes allerede.', 409);
      }
      var newItem = {
        id: String(body.id).trim(),
        navn: String(body.navn || '').trim(),
        kategori: String(body.kategori || '').trim(),
        plassering: String(body.plassering || '').trim(),
        status: String(body.status || 'Tilgjengelig').trim(),
        tilstand: String(body.tilstand || 'God').trim(),
        beholdning: Number(body.beholdning) || 0,
        arrangementer: Array.isArray(body.arrangementer) ? body.arrangementer : [],
        aktiv: true
      };
      db.items.push(newItem);
      addAuditEvent(db, 'inventory', newItem.id, 'Opprettet', newItem);
      saveDb(db);
      return mockOk(newItem, 201);
    }

    /* Oppdater lagervare (PUT via POST med _method) */
    var invUpdateM = path.match(/^api\/v1\/inventory\/([^/]+)$/);
    if (invUpdateM && String(body._method || '').toUpperCase() === 'PUT') {
      var updateId = decodeURIComponent(invUpdateM[1]);
      var updateIdx = -1;
      for (var ui = 0; ui < db.items.length; ui++) {
        if (db.items[ui].id === updateId) { updateIdx = ui; break; }
      }
      if (updateIdx === -1) {
        return mockErr('NOT_FOUND', 'Lagervare ikke funnet.', 404);
      }
      var existing = db.items[updateIdx];
      var updatedItem = {
        id: existing.id,
        navn: body.navn !== undefined ? String(body.navn).trim() : existing.navn,
        kategori: body.kategori !== undefined ? String(body.kategori).trim() : existing.kategori,
        plassering: body.plassering !== undefined ? String(body.plassering).trim() : existing.plassering,
        status: body.status !== undefined ? String(body.status).trim() : existing.status,
        tilstand: body.tilstand !== undefined ? String(body.tilstand).trim() : existing.tilstand,
        beholdning: body.beholdning !== undefined ? Number(body.beholdning) || 0 : existing.beholdning,
        arrangementer: Array.isArray(body.arrangementer) ? body.arrangementer : existing.arrangementer,
        aktiv: existing.aktiv
      };
      db.items[updateIdx] = updatedItem;
      addAuditEvent(db, 'inventory', updateId, 'Oppdatert', updatedItem);
      saveDb(db);
      return mockOk(updatedItem);
    }

    /* Deaktiver (soft-delete) */
    var softDelM = path.match(/^api\/v1\/inventory\/([^/]+)\/soft-delete$/);
    if (softDelM) {
      var softDelId = decodeURIComponent(softDelM[1]);
      var softDelIdx = -1;
      for (var si = 0; si < db.items.length; si++) {
        if (db.items[si].id === softDelId) { softDelIdx = si; break; }
      }
      if (softDelIdx === -1) {
        return mockErr('NOT_FOUND', 'Lagervare ikke funnet.', 404);
      }
      db.items[softDelIdx].aktiv = false;
      db.items[softDelIdx].status = 'Ikke tilgjengelig';
      addAuditEvent(db, 'inventory', softDelId, 'Deaktivert', null);
      saveDb(db);
      return mockOk({ deactivated: true });
    }

    /* Slett permanent (hard-delete) */
    var hardDelM = path.match(/^api\/v1\/inventory\/([^/]+)\/hard-delete$/);
    if (hardDelM) {
      var hardDelId = decodeURIComponent(hardDelM[1]);
      db.items = db.items.filter(function (i) { return i.id !== hardDelId; });
      addAuditEvent(db, 'inventory', hardDelId, 'Slettet permanent', null);
      saveDb(db);
      return mockOk({ deleted: true });
    }

    /* Last opp dokument */
    var uploadM = path.match(/^api\/v1\/inventory\/([^/]+)\/documents$/);
    if (uploadM) {
      var uploadItemId = decodeURIComponent(uploadM[1]);
      if (!db.documents[uploadItemId]) {
        db.documents[uploadItemId] = [];
      }
      var docId = nextId(db);
      var mimeType = String(body.mimeType || '').toLowerCase();
      var erBilde = mimeType.indexOf('image/') === 0;
      var newDoc = {
        id: docId,
        dokumentId: docId,
        tittel: String(body.tittel || body.filnavn || docId).trim(),
        filnavn: String(body.filnavn || docId).trim(),
        mimeType: mimeType,
        driveUrl: '#',
        erBilde: erBilde,
        sortering: Number(body.sortering) || 0,
        lastetOppDato: nowIso()
      };
      db.documents[uploadItemId].push(newDoc);
      addAuditEvent(db, 'inventory', uploadItemId, 'Dokument lastet opp: ' + newDoc.filnavn, { dokumentId: docId });
      saveDb(db);
      return mockOk(newDoc, 201);
    }

    /* Slett dokument (DELETE via POST med _method) */
    var deleteDocM = path.match(/^api\/v1\/documents\/([^/]+)$/);
    if (deleteDocM && String(body._method || '').toUpperCase() === 'DELETE') {
      var deleteDocId = decodeURIComponent(deleteDocM[1]);
      Object.keys(db.documents).forEach(function (itemId) {
        db.documents[itemId] = db.documents[itemId].filter(function (d) {
          return d.id !== deleteDocId;
        });
      });
      saveDb(db);
      return mockOk({ deleted: true });
    }

    /* Opprett utlån */
    if (path === 'api/v1/loans') {
      if (!body.itemId || !body.laaner) {
        return mockErr('VALIDATION_ERROR', 'itemId og laaner er påkrevd.', 400);
      }
      var loanItemId = String(body.itemId).trim();
      var loanItemIdx = -1;
      for (var lii = 0; lii < db.items.length; lii++) {
        if (db.items[lii].id === loanItemId) { loanItemIdx = lii; break; }
      }
      if (loanItemIdx === -1 || db.items[loanItemIdx].aktiv === false) {
        return mockErr('NOT_FOUND', 'Lagervare ikke funnet.', 404);
      }
      var loanItem = db.items[loanItemIdx];
      if (typeof loanItem.beholdning === 'number' && loanItem.beholdning <= 0) {
        return mockErr('VALIDATION_ERROR', 'Beholdningen er 0 – kan ikke registrere utlån.', 400);
      }
      var newLoan = {
        id: nextId(db),
        itemId: loanItemId,
        laaner: String(body.laaner).trim(),
        utlanDato: todayStr(),
        forfallDato: String(body.forfallDato || '').trim(),
        notat: String(body.notat || '').trim(),
        returDato: null
      };
      db.loans.push(newLoan);
      if (typeof loanItem.beholdning === 'number') {
        loanItem.beholdning = Math.max(0, loanItem.beholdning - 1);
      }
      loanItem.status = 'Utlånt';
      addAuditEvent(db, 'inventory', newLoan.itemId, 'Utlånt til ' + newLoan.laaner, { loanId: newLoan.id });
      saveDb(db);
      return mockOk(newLoan, 201);
    }

    /* Registrer retur (felles hjelper for return og deviation) */
    function registerLoanReturn(loanId, returMerknad, avvik) {
      var lIdx = -1;
      for (var rli = 0; rli < db.loans.length; rli++) {
        if (db.loans[rli].id === loanId) { lIdx = rli; break; }
      }
      if (lIdx === -1) {
        return mockErr('NOT_FOUND', 'Utlån ikke funnet.', 404);
      }
      var returnLoan = db.loans[lIdx];
      if (returnLoan.returDato) {
        return mockErr('VALIDATION_ERROR', 'Utlån er allerede registrert som returnert.', 400);
      }

      var retItemIdx = -1;
      for (var rii = 0; rii < db.items.length; rii++) {
        if (db.items[rii].id === returnLoan.itemId) { retItemIdx = rii; break; }
      }

      returnLoan.returDato = todayStr();
      returnLoan.returMerknad = String(returMerknad || '').trim();
      if (avvik !== undefined) {
        returnLoan.avvik = String(avvik || '').trim();
      }

      if (retItemIdx !== -1) {
        var retItem = db.items[retItemIdx];
        if (typeof retItem.beholdning === 'number') {
          retItem.beholdning += 1;
        }
        var harAndreAktiveLan = false;
        for (var ali = 0; ali < db.loans.length; ali++) {
          if (
            db.loans[ali].itemId === returnLoan.itemId &&
            db.loans[ali].id !== loanId &&
            !db.loans[ali].returDato
          ) {
            harAndreAktiveLan = true;
            break;
          }
        }
        retItem.status = harAndreAktiveLan ? 'Utlånt' : 'Tilgjengelig';
      }

      var handling = avvik !== undefined && String(avvik || '').trim()
        ? 'Retur med avvik: ' + returnLoan.avvik
        : 'Retur registrert';
      addAuditEvent(db, 'inventory', returnLoan.itemId, handling, { loanId: loanId });
      saveDb(db);
      return mockOk(returnLoan);
    }

    var returnM = path.match(/^api\/v1\/loans\/([^/]+)\/return$/);
    if (returnM) {
      return registerLoanReturn(decodeURIComponent(returnM[1]), body.returMerknad);
    }

    /* Registrer retur med avvik */
    var deviationM = path.match(/^api\/v1\/loans\/([^/]+)\/deviation$/);
    if (deviationM) {
      return registerLoanReturn(decodeURIComponent(deviationM[1]), body.returMerknad, body.avvik);
    }

    /* Bulk statusoppdatering */
    if (path === 'api/v1/bulk/status-update') {
      var itemIds = Array.isArray(body.itemIds) ? body.itemIds : [];
      var newStatus = String(body.status || '').trim();
      if (!newStatus || !itemIds.length) {
        return mockErr('VALIDATION_ERROR', 'itemIds og status er påkrevd.', 400);
      }
      var updatedCount = 0;
      itemIds.forEach(function (id) {
        for (var bi = 0; bi < db.items.length; bi++) {
          if (db.items[bi].id === id) {
            db.items[bi].status = newStatus;
            addAuditEvent(db, 'inventory', id, 'Bulk-statusoppdatering: ' + newStatus, { status: newStatus });
            updatedCount++;
            break;
          }
        }
      });
      saveDb(db);
      return mockOk({ updated: updatedCount });
    }

    /* Import av inventory (CSV eller JSON) */
    if (path === 'api/v1/import/inventory') {
      var importData = String(body.data || '');
      var importFormat = String(body.format || 'csv').toLowerCase();
      var created = 0, updated = 0, rejected = 0;
      var importErrors = [];
      var importRows = [];

      try {
        if (importFormat === 'json') {
          var parsed = JSON.parse(importData);
          importRows = Array.isArray(parsed) ? parsed : [];
        } else {
          var csvDocRows = parseCsvDocument(importData);
          if (csvDocRows.length > 1) {
            var csvHeaders = csvDocRows[0];
            importRows = csvDocRows.slice(1).map(function (cells) {
              var row = {};
              csvHeaders.forEach(function (h, idx) {
                var headerKey = String(h).trim();
                var cellValue = cells[idx] !== undefined ? String(cells[idx]).trim() : '';
                row[headerKey] = cellValue;
              });
              return row;
            });
          }
        }
      } catch (e) {
        return mockErr('VALIDATION_ERROR', 'Kunne ikke parse importfil: ' + (e.message || e), 400);
      }

      importRows.forEach(function (row, idx) {
        if (!row.id || !row.navn) {
          rejected++;
          importErrors.push({ row: idx + 2, message: 'Mangler påkrevd felt: id eller navn' });
          return;
        }
        var existingImportIdx = -1;
        for (var ii = 0; ii < db.items.length; ii++) {
          if (db.items[ii].id === row.id) { existingImportIdx = ii; break; }
        }
        var importItem = {
          id: String(row.id).trim(),
          navn: String(row.navn || '').trim(),
          kategori: String(row.kategori || '').trim(),
          plassering: String(row.plassering || '').trim(),
          status: String(row.status || 'Tilgjengelig').trim(),
          tilstand: String(row.tilstand || 'God').trim(),
          beholdning: Number(row.beholdning) || 0,
          arrangementer: row.arrangementer
            ? String(row.arrangementer).split(';').map(function (a) { return a.trim(); }).filter(Boolean)
            : [],
          aktiv: true
        };
        if (existingImportIdx === -1) {
          db.items.push(importItem);
          created++;
        } else {
          db.items[existingImportIdx] = importItem;
          updated++;
        }
      });
      saveDb(db);
      return mockOk({ created: created, updated: updated, rejected: rejected, errors: importErrors });
    }

    /* Opprett masterdata-verdi */
    var mdTypeM = path.match(/^api\/v1\/masterdata\/([^/]+)$/);
    if (mdTypeM) {
      var mdType = decodeURIComponent(mdTypeM[1]);
      var mdNewValue = String(body.value || '').trim();
      if (!mdNewValue) {
        return mockErr('VALIDATION_ERROR', 'Verdi kan ikke være tom.', 400);
      }
      if (!db.masterdata[mdType]) {
        db.masterdata[mdType] = [];
      }
      db.masterdata[mdType] = normalizeMasterdataEntries(mdType, db.masterdata[mdType]);
      var hasDuplicate = db.masterdata[mdType].some(function (entry) {
        return String(entry.value || '').toLowerCase() === mdNewValue.toLowerCase();
      });
      if (!hasDuplicate) {
        var mdSortOrder = Number(body.sortOrder);
        if (isNaN(mdSortOrder)) {
          mdSortOrder = 99;
        }
        var mdEntry = {
          id: String(body.id || '').trim() || (mdType + '-' + slugify(mdNewValue)),
          value: mdNewValue,
          isActive: body.isActive !== false,
          sortOrder: mdSortOrder,
          colorToken: normalizeColorToken(body.colorToken)
        };
        db.masterdata[mdType].push(mdEntry);
        saveDb(db);
        return mockOk({ type: mdType, entry: deepClone(mdEntry) });
      }
      return mockOk({ type: mdType, value: mdNewValue, duplicate: true });
    }

    /* Oppdater eller slett masterdata-verdi */
    var mdTypeIdM = path.match(/^api\/v1\/masterdata\/([^/]+)\/([^/]+)$/);
    if (mdTypeIdM) {
      var mdUpdateType = decodeURIComponent(mdTypeIdM[1]);
      var mdPrevId = decodeURIComponent(mdTypeIdM[2]);
      var mdMethod = String(body._method || '').toUpperCase();

      if (mdMethod === 'PUT') {
        var mdNextValue = String(body.value || '').trim();
        if (!mdNextValue) {
          return mockErr('VALIDATION_ERROR', 'Verdi kan ikke være tom.', 400);
        }
        if (!db.masterdata[mdUpdateType]) {
          return mockErr('NOT_FOUND', 'Masterdata-type ikke funnet.', 404);
        }
        db.masterdata[mdUpdateType] = normalizeMasterdataEntries(mdUpdateType, db.masterdata[mdUpdateType]);
        var mdPrevIdx = -1;
        for (var mdi = 0; mdi < db.masterdata[mdUpdateType].length; mdi++) {
          if (String(db.masterdata[mdUpdateType][mdi].id || '') === mdPrevId) {
            mdPrevIdx = mdi;
            break;
          }
        }
        if (mdPrevIdx === -1) {
          return mockErr('NOT_FOUND', 'Masterdata-verdi ikke funnet.', 404);
        }
        db.masterdata[mdUpdateType][mdPrevIdx].value = mdNextValue;
        if (body.sortOrder !== undefined) {
          var mdUpdatedSortOrder = Number(body.sortOrder);
          if (!isNaN(mdUpdatedSortOrder)) {
            db.masterdata[mdUpdateType][mdPrevIdx].sortOrder = mdUpdatedSortOrder;
          }
        }
        if (body.isActive !== undefined) {
          db.masterdata[mdUpdateType][mdPrevIdx].isActive = body.isActive !== false;
        }
        if (body.colorToken !== undefined) {
          db.masterdata[mdUpdateType][mdPrevIdx].colorToken = normalizeColorToken(body.colorToken);
        }
        saveDb(db);
        return mockOk({ type: mdUpdateType, entry: deepClone(db.masterdata[mdUpdateType][mdPrevIdx]) });
      }

      if (mdMethod === 'DELETE') {
        if (db.masterdata[mdUpdateType]) {
          db.masterdata[mdUpdateType] = normalizeMasterdataEntries(mdUpdateType, db.masterdata[mdUpdateType]);
          db.masterdata[mdUpdateType] = db.masterdata[mdUpdateType].map(function (entry) {
            if (String(entry.id || '') === mdPrevId) {
              entry.isActive = false;
            }
            return entry;
          });
          saveDb(db);
        }
        return mockOk({ deleted: true });
      }

      return mockErr('VALIDATION_ERROR', 'Ukjent metode-override. Bruk _method: PUT eller DELETE.', 400);
    }

    return mockErr('NOT_FOUND', 'Endepunkt ikke funnet: ' + path, 404);
  }

  /* -----------------------------------------------------------------------
   * fetch-interceptor
   * --------------------------------------------------------------------- */

  function shouldIntercept(url) {
    var config = window.__HUL_RUNTIME_CONFIG;
    if (!config || !config.mockBackend) {
      return false;
    }
    var base = String(config.backendBaseUrl || '').replace(/\/$/, '');
    if (!base) {
      return false;
    }
    return String(url || '').indexOf(base) === 0;
  }

  var _realFetch = window.fetch;

  window.fetch = function hulMockFetch(url, options) {
    if (!shouldIntercept(url)) {
      return _realFetch.apply(this, arguments);
    }

    var method = String((options && options.method) || 'GET').toUpperCase();
    var parsed = parseMockUrl(url);

    var body = {};
    if (method === 'POST' && options && options.body) {
      try {
        body = JSON.parse(options.body);
      } catch (_e) {
        body = {};
      }
    }

    var result;
    try {
      if (method === 'GET') {
        result = handleGet(parsed.path, parsed.params);
      } else if (method === 'POST') {
        result = handlePost(parsed.path, body);
      } else {
        result = mockErr('METHOD_NOT_ALLOWED', 'Metode ikke støttet: ' + method + '.', 405);
      }
    } catch (e) {
      result = mockErr('INTERNAL_ERROR', 'Mock-backend intern feil: ' + (e && e.message ? e.message : String(e)), 500);
    }

    return Promise.resolve(result);
  };

  /* -----------------------------------------------------------------------
   * Offentlig API for debugging og reset
   * --------------------------------------------------------------------- */

  window.__HUL_MOCK_BACKEND__ = {
    /** Hent hele databasen slik den er i localStorage (for debugging). */
    getDb: getDb,
    /** Nullstill til seed-data (sletter all lokal data). */
    reset: function () {
      localStorage.removeItem(STORAGE_KEY);
      /* eslint-disable no-console */
      console.info('[HUL Mock Backend] Database nullstilt til seed-data. Last siden på nytt.');
    }
  };

  /* eslint-disable no-console */
  console.info(
    '[HUL Mock Backend] Installert. Data lagres i localStorage («' + STORAGE_KEY + '»). ' +
    'Åpne konsollen og skriv __HUL_MOCK_BACKEND__.reset() for å tilbakestille til seed-data.'
  );

  // Signal til app.js om at fetch-interceptoren er klar (løser race condition mellom
  // dynamisk innsatt mock-backend.js og defer-lastet app.js).
  window.__hulMockBackendReady = true;
  document.dispatchEvent(new CustomEvent('hulMockBackendReady'));
})();
