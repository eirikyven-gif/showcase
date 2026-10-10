(() => {
  const form = document.querySelector('[data-task-excel-import]');
  if (!form) return;
  const message = document.querySelector('[data-excel-message]');

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
    const nameColumn = findColumn('navn');
    const paymentColumn = findColumn('betaling (kr)');
    const imageColumn = findColumn('bilde kreves');
    if (nameColumn < 0 || paymentColumn < 0) throw new Error('Excel-malen må ha kolonnene «Navn» og «Betaling (kr)».');
    const col = index => { let result = ''; for (let n = index + 1; n; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + ((n - 1) % 26)) + result; return result; };
    return rows.map(row => ({ name: row[col(nameColumn)] || '', payment: row[col(paymentColumn)] || '', requiresImage: imageColumn < 0 ? '' : row[col(imageColumn)] || '' }));
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
