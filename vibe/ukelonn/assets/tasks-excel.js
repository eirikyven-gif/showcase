(() => {
  const form = document.querySelector('[data-task-excel-import]');
  const message = document.querySelector('[data-excel-message]');

  const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[char]));

  const crc32 = bytes => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const makeWorkbook = tasks => {
    const columns = ['Navn', 'Betaling (kr)', 'Aktiv', 'Bilde kreves'];
    const rows = [columns, ...tasks.map(task => [
      task.name,
      (Number(task.payment_ore || 0) / 100).toFixed(2),
      task.active ? 'Ja' : 'Nei',
      task.requires_image ? 'Ja' : 'Nei',
    ])];
    const letters = ['A', 'B', 'C', 'D'];
    const sheet = '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
      + rows.map((row, r) => '<row r="' + (r + 1) + '">' + row.map((value, c) => '<c r="' + letters[c] + (r + 1) + '" t="inlineStr"><is><t>' + escapeXml(value) + '</t></is></c>').join('') + '</row>').join('')
      + '</sheetData></worksheet>';
    const encoder = new TextEncoder();
    const files = [
      ['[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
      ['_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml', '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Gjøremål" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
      ['xl/worksheets/sheet1.xml', sheet],
    ].map(([name, text]) => ({ name: encoder.encode(name), data: encoder.encode(text) }));
    const local = [];
    const central = [];
    let offset = 0;
    for (const file of files) {
      const crc = crc32(file.data);
      const localHeader = new Uint8Array(30 + file.name.length);
      const localView = new DataView(localHeader.buffer);
      localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true);
      localView.setUint32(14, crc, true); localView.setUint32(18, file.data.length, true);
      localView.setUint32(22, file.data.length, true); localView.setUint16(26, file.name.length, true);
      localHeader.set(file.name, 30);
      local.push(localHeader, file.data);
      const centralHeader = new Uint8Array(46 + file.name.length);
      const centralView = new DataView(centralHeader.buffer);
      centralView.setUint32(0, 0x02014b50, true); centralView.setUint16(4, 20, true);
      centralView.setUint16(6, 20, true); centralView.setUint32(16, crc, true);
      centralView.setUint32(20, file.data.length, true); centralView.setUint32(24, file.data.length, true);
      centralView.setUint16(28, file.name.length, true); centralView.setUint32(42, offset, true);
      centralHeader.set(file.name, 46);
      central.push(centralHeader);
      offset += localHeader.length + file.data.length;
    }
    const centralLength = central.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true); endView.setUint16(8, files.length, true);
    endView.setUint16(10, files.length, true); endView.setUint32(12, centralLength, true);
    endView.setUint32(16, offset, true);
    return new Blob([...local, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  document.querySelector('[data-task-excel-export]')?.addEventListener('click', event => {
    event.preventDefault();
    const blob = makeWorkbook(window.UkelonnDemo.exportTasks());
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ukelonn-gjoremal.xlsx';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  if (!form) return;

  const readZipFile = async (file, memberName) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer);
    let end = -1;
    for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65558); offset -= 1) {
      if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
    }
    if (end < 0) throw new Error('Filen ser ikke ut som en gyldig Excel-arbeidsbok.');
    const entries = view.getUint16(end + 10, true);
    let cursor = view.getUint32(end + 16, true);
    for (let i = 0; i < entries; i += 1) {
      if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Excel-filen kunne ikke leses.');
      const method = view.getUint16(cursor + 10, true);
      const compressedSize = view.getUint32(cursor + 20, true);
      const uncompressedSize = view.getUint32(cursor + 24, true);
      const nameLength = view.getUint16(cursor + 28, true);
      const extraLength = view.getUint16(cursor + 30, true);
      const commentLength = view.getUint16(cursor + 32, true);
      const localOffset = view.getUint32(cursor + 42, true);
      const name = new TextDecoder().decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
      if (name === memberName) {
        if (uncompressedSize > 10 * 1024 * 1024) throw new Error('Regnearket er større enn demoen tillater.');
        const localNameLength = view.getUint16(localOffset + 26, true);
        const localExtraLength = view.getUint16(localOffset + 28, true);
        const start = localOffset + 30 + localNameLength + localExtraLength;
        const compressed = bytes.subarray(start, start + compressedSize);
        if (method === 0) return new TextDecoder().decode(compressed);
        if (method !== 8 || typeof DecompressionStream !== 'function') throw new Error('Denne nettleseren støtter ikke lokal Excel-import.');
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return await new Response(stream).text();
      }
      cursor += 46 + nameLength + extraLength + commentLength;
    }
    return '';
  };

  const parseWorkbook = async file => {
    if (!file || file.size > 10 * 1024 * 1024) throw new Error('Velg en Excel-fil på maksimalt 10 MB.');
    const [sheet, sharedXml] = await Promise.all([
      readZipFile(file, 'xl/worksheets/sheet1.xml'),
      readZipFile(file, 'xl/sharedStrings.xml'),
    ]);
    if (!sheet) throw new Error('Arbeidsboken mangler det første regnearket.');
    const parser = new DOMParser();
    const sharedDoc = sharedXml ? parser.parseFromString(sharedXml, 'application/xml') : null;
    const shared = sharedDoc ? [...sharedDoc.getElementsByTagName('si')].map(item => [...item.getElementsByTagName('t')].map(node => node.textContent).join('')) : [];
    const doc = parser.parseFromString(sheet, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Regnearket inneholder ugyldig XML.');
    const rows = [...doc.getElementsByTagName('row')].map(row => {
      const values = {};
      for (const cell of row.getElementsByTagName('c')) {
        const column = cell.getAttribute('r').match(/^[A-Z]+/)?.[0];
        const value = cell.getElementsByTagName('v')[0]?.textContent || [...cell.getElementsByTagName('t')].map(t => t.textContent).join('');
        if (column) values[column] = cell.getAttribute('t') === 's' ? (shared[Number(value)] || '') : value;
      }
      return values;
    });
    const columnIndex = letters => [...letters].reduce((number, letter) => number * 26 + letter.charCodeAt(0) - 64, 0) - 1;
    const headers = Object.fromEntries(Object.entries(rows.shift() || {}).map(([letter, value]) => [columnIndex(letter), value.trim().toLocaleLowerCase('nb-NO')]));
    const findColumn = label => Number(Object.keys(headers).find(index => headers[index] === label) ?? -1);
    const expected = ['navn', 'betaling (kr)', 'aktiv', 'bilde kreves'];
    const actual = Object.keys(headers).sort((a, b) => Number(a) - Number(b)).map(index => headers[index]);
    if (actual.length !== expected.length || actual.some((header, index) => header !== expected[index])) {
      throw new Error('Excel-filen må ha kolonnene Navn, Betaling (kr), Aktiv og Bilde kreves i denne rekkefølgen.');
    }
    const col = index => { let result = ''; for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + ((n - 1) % 26)) + result; return result; };
    const imported = rows.map((row, index) => ({
      name: String(row.A || '').trim(),
      payment: String(row.B || '').trim().replace(',', '.'),
      active: /^(ja|true|1)$/i.test(String(row.C || '').trim()),
      requiresImage: /^(ja|true|1)$/i.test(String(row.D || '').trim()),
    }));
    if (!imported.length) throw new Error('Excel-filen må inneholde minst ett gjøremål.');
    const names = new Set();
    for (const [index, row] of imported.entries()) {
      const normalized = row.name.toLocaleLowerCase('nb-NO');
      if (!normalized || !Number.isFinite(Number(row.payment)) || Number(row.payment) < 0 || names.has(normalized)) {
        throw new Error('Ugyldig eller duplisert rad ' + (index + 2) + '.');
      }
      names.add(normalized);
    }
    return imported;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (message) { message.hidden = true; message.textContent = ''; }
    try {
      const rows = await parseWorkbook(form.querySelector('input[type="file"]')?.files?.[0]);
      const imported = window.UkelonnDemo.importTasks(rows);
      if (message) { message.textContent = `Importerte ${imported} syntetiske demo-gjøremål lokalt.`; message.hidden = false; }
      document.querySelector('[data-refresh-tasks]')?.click();
      form.reset();
    } catch (error) {
      if (message) { message.textContent = error.message || 'Excel-filen kunne ikke importeres.'; message.hidden = false; }
    }
  });
})();
