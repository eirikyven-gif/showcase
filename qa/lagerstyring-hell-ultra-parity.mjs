import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { deflateRawSync } from 'node:zlib';
import net from 'node:net';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const crc32 = (bytes) => { let c = -1; for (const byte of bytes) { c ^= byte; for (let bit = 0; bit < 8; bit++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0); } return (c ^ -1) >>> 0; };
function sharedStringXlsx(rows, { dataDescriptor = false, dateStyle = false } = {}) {
  const strings = [...new Set(rows.flat().filter((value) => typeof value === 'string' && value !== ''))];
  const index = new Map(strings.map((value, i) => [value, i]));
  const column = (number) => { let label = ''; while (number) { number--; label = String.fromCharCode(65 + number % 26) + label; number = Math.floor(number / 26); } return label; };
  const xml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
  const sheet = `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, r) => `<row r="${r + 1}">${row.map((value, c) => value === '' ? '' : typeof value === 'number' ? `<c r="${column(c + 1)}${r + 1}" ${dateStyle && r === 1 && c === 7 ? 's="1" ' : ''}t="n"><v>${value}</v></c>` : `<c r="${column(c + 1)}${r + 1}" t="s"><v>${index.get(value)}</v></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
  const files = {
    '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="DATA" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>${dateStyle ? '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' : ''}</Relationships>`,
    'xl/sharedStrings.xml': `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">${strings.map((value) => `<si><t>${xml(value)}</t></si>`).join('')}</sst>`,
    'xl/worksheets/sheet1.xml': sheet,
    ...(dateStyle ? { 'xl/styles.xml': '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="yyyy-mm-dd"/></numFmts><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>' } : {}),
  };
  const local = []; const central = []; let offset = 0;
  for (const [name, source] of Object.entries(files)) {
    const nameBytes = Buffer.from(name); const body = Buffer.from(source); const compressed = deflateRawSync(body); const crc = crc32(body);
    const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(dataDescriptor ? 8 : 0, 6); header.writeUInt16LE(8, 8); header.writeUInt32LE(dataDescriptor ? 0 : crc, 14); header.writeUInt32LE(dataDescriptor ? 0 : compressed.length, 18); header.writeUInt32LE(dataDescriptor ? 0 : body.length, 22); header.writeUInt16LE(nameBytes.length, 26);
    const descriptor = Buffer.alloc(dataDescriptor ? 16 : 0); if (dataDescriptor) { descriptor.writeUInt32LE(0x08074b50, 0); descriptor.writeUInt32LE(crc, 4); descriptor.writeUInt32LE(compressed.length, 8); descriptor.writeUInt32LE(body.length, 12); }
    local.push(header, nameBytes, compressed, ...(dataDescriptor ? [descriptor] : []));
    const entry = Buffer.alloc(46); entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(8, 8); entry.writeUInt16LE(8, 10); entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(body.length, 24); entry.writeUInt16LE(nameBytes.length, 28); entry.writeUInt32LE(offset, 42);
    central.push(entry, nameBytes); offset += header.length + nameBytes.length + compressed.length + descriptor.length;
  }
  const directory = Buffer.concat(central); const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}
function corruptCentralCrc(input, entryName = 'xl/worksheets/sheet1.xml') {
  const bytes = Buffer.from(input); const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let eocd = -1;
  for (let p = Math.max(0, bytes.length - 65557); p + 22 <= bytes.length; p++) if (view.getUint32(p, true) === 0x06054b50) eocd = p;
  assert.notEqual(eocd, -1); let cursor = view.getUint32(eocd + 16, true);
  for (let n = 0; n < view.getUint16(eocd + 10, true); n++) {
    const nameLength = view.getUint16(cursor + 28, true); const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString();
    if (name === entryName) { view.setUint32(cursor + 16, view.getUint32(cursor + 16, true) ^ 1, true); return bytes; }
    cursor += 46 + nameLength + view.getUint16(cursor + 30, true) + view.getUint16(cursor + 32, true);
  }
  throw new Error(`missing ZIP entry ${entryName}`);
}

async function auditAccessibleSurface(page) {
  const surface = await page.evaluate(() => {
    const visible = (element) => !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    const controls = [...document.querySelectorAll('button,a,input,select,textarea,[role="tab"],[role="option"]')].filter(visible).map((element) => ({tag:element.tagName, role:element.getAttribute('role'), name:element.getAttribute('aria-label')||element.getAttribute('aria-labelledby')?.split(/\s+/).map((id)=>document.getElementById(id)?.innerText||'').join(' ')||element.labels?.[0]?.innerText?.trim()||element.getAttribute('title')||element.innerText?.trim()||element.value||element.getAttribute('alt')||''}));
    const rgb=(value)=>{const m=value.match(/[\d.]+/g);return m?m.slice(0,3).map(Number):null};
    const luminance=(channels)=>{const c=channels.map(x=>{x/=255;return x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
    const contrast=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){if(!node.textContent.trim())continue;const element=node.parentElement;if(!visible(element)||getComputedStyle(element).visibility==='hidden')continue;let bg=null,ancestor=element;while(ancestor){const color=getComputedStyle(ancestor).backgroundColor,channels=rgb(color);if(channels&&Number(color.match(/rgba?\([^)]*[,\/ ]+([\d.]+)\s*\)$/)?.[1]??1)>0.99){bg=channels;break}ancestor=ancestor.parentElement}const fg=rgb(getComputedStyle(element).color);if(!bg||!fg)continue;const a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);if(ratio<4.5)contrast.push({text:node.textContent.trim().slice(0,70),ratio:Number(ratio.toFixed(2)),fg:getComputedStyle(element).color,bg:getComputedStyle(ancestor||element).backgroundColor})}
    const missingScope=[...document.querySelectorAll('table thead th,table tbody th')].filter((th)=>!th.hasAttribute('scope')).map((th)=>th.innerText.trim());
    return {landmarks:['main','header','nav','footer'].map(s=>[s,document.querySelectorAll(s).length]),unnamed:controls.filter(c=>!c.name),missingScope,contrast};
  });
  assert.deepEqual(surface.landmarks.map(([name,count])=>name==='nav'?count>=1:count===1),[true,true,true,true]);
  assert.deepEqual(surface.unnamed,[]);
  assert.deepEqual(surface.missingScope,[]);
  assert.deepEqual(surface.contrast,[]);
  return surface;
}

const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => { const value = probe.address().port; probe.close(() => resolve(value)); });
});
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: process.cwd(), stdio: 'ignore' });
let browser;
try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await fetch(`http://127.0.0.1:${port}/vibe/lagerstyring-hell-ultra/`);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  page.setDefaultTimeout(4000);
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => console.log('request failed', request.url(), request.failure()?.errorText));
  page.on('console', (message) => { if (message.type() === 'log') console.log('browser:', message.text()); });
  await page.goto(`http://127.0.0.1:${port}/vibe/lagerstyring-hell-ultra/`);
  await page.waitForFunction(() => document.body.dataset.role === 'visitor');

  await page.locator('#role').selectOption('manager');
  await page.evaluate(() => { if (!location.hash.includes('/admin/')) location.hash = '#/admin/dashboard'; });
  await page.locator('#adminNav').waitFor({ state: 'visible' });
  await page.locator('#adminNav').click();
  await page.getByRole('link', { name: 'Lagervarer', exact: true }).click();
  await page.locator('#newItem').click();
  await page.locator('[name="name"]').fill('Syntetisk paritetstest');
  await page.locator('[name="quantity"]').fill('-1');
  await page.locator('#itemForm').dispatchEvent('submit');
  assert.match(await page.locator('#toast').innerText(),/Antall må være et heltall/);
  await page.locator('[name="quantity"]').fill('1.5');
  await page.locator('#itemForm').dispatchEvent('submit');
  assert.match(await page.locator('#toast').innerText(),/Antall må være et heltall/);
  await page.locator('[name="quantity"]').fill('1');
  await page.locator('[name="value"]').fill('-1');
  await page.locator('#itemForm').dispatchEvent('submit');
  assert.match(await page.locator('#toast').innerText(),/Verdi må være et tall/);
  await page.locator('[name="value"]').fill('0');
  assert.equal(await page.locator('[name="postStatus"]').inputValue(), 'draft');
  await page.locator('[name="postStatus"]').selectOption('draft');
  await page.locator('#itemForm button[type="submit"]').click();
  await page.locator('#invPostStatus').waitFor();
  await page.waitForTimeout(100);
  await page.locator('#invPostStatus').selectOption('draft');
  await page.getByRole('link', { name: 'Syntetisk paritetstest' }).click();
  await page.locator('[name="postStatus"]').selectOption('publish');
  await page.locator('#itemForm button[type="submit"]').click();
  await page.waitForTimeout(100);
  await page.locator('#invPostStatus').selectOption('publish');
  const itemRow = page.locator('tr').filter({ hasText: 'Syntetisk paritetstest' });
  await itemRow.getByRole('button', { name: 'Flytt til papirkurven' }).click();
  await page.locator('dialog.confirm-dialog[open] button[value="yes"]').click();
  await page.waitForTimeout(100);
  await page.locator('#invPostStatus').selectOption('trash');
  await page.waitForFunction(() => document.querySelector('#invRows')?.innerText.includes('Syntetisk paritetstest'));
  assert.equal(await page.locator('#invRows tr').count(), 2);
  await page.locator('tr').filter({ hasText: 'Syntetisk paritetstest' }).getByRole('button', { name: 'Gjenopprett' }).click();
  await page.locator('#invPostStatus').selectOption('draft');
  await page.getByRole('link', { name: 'Syntetisk paritetstest' }).click();
  await page.locator('[name="postStatus"]').selectOption('publish');
  await page.locator('#itemForm button[type="submit"]').click();
  await page.waitForTimeout(100);
  await page.locator('#invPostStatus').selectOption('publish');
  await page.locator('tr').filter({ hasText: 'Syntetisk paritetstest' }).getByRole('button', { name: 'Flytt til papirkurven' }).click();
  await page.locator('dialog.confirm-dialog[open] button[value="yes"]').click();
  await page.waitForTimeout(100);
  await page.locator('#invPostStatus').selectOption('trash');
  await page.locator('tr').filter({ hasText: 'Syntetisk paritetstest' }).getByRole('button', { name: 'Slett permanent' }).click();
  await page.locator('dialog.confirm-dialog[open] button[value="yes"]').click();
  await page.waitForTimeout(100);
  await page.locator('#invPostStatus').selectOption('all');
  await page.waitForFunction(() => !document.querySelector('#invRows')?.innerText.includes('Syntetisk paritetstest'));
  assert.equal(await page.locator('#invRows tr').filter({hasText:'Syntetisk paritetstest'}).count(), 0);

  await page.locator('#invPostStatus').selectOption('publish');
  const firstInventoryRow = page.locator('#invRows tbody tr').filter({ hasText: 'Hodelykt X2' });
  await firstInventoryRow.locator('[data-quick-field="status"]').selectOption('arkivert');
  await firstInventoryRow.getByRole('button', { name: 'Avbryt hurtigredigering' }).click();
  assert.equal(await firstInventoryRow.locator('td:nth-child(4) span').innerText(), 'Tilgjengelig');
  await page.locator('#invSort').selectOption('hul_status');
  const sortedStatuses = await page.locator('#invRows tbody tr td:nth-child(4) span').allInnerTexts();
  assert.deepEqual(sortedStatuses, [...sortedStatuses].sort((a, b) => a.localeCompare(b, 'no')));
  await page.getByRole('link', { name: 'Hodelykt X2' }).click();
  await page.locator('[data-assigned-term="category"][value="Sikkerhet"]').check();
  await page.locator('#itemForm button[type="submit"]').click();
  await page.waitForTimeout(100);
  assert.match(await page.locator('#invRows tbody tr').filter({ hasText: 'Hodelykt X2' }).locator('td:nth-child(6)').innerText(), /Sikkerhet/);
  await page.reload();
  await page.waitForFunction(() => document.body.dataset.role === 'visitor');
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 390));
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => document.activeElement !== document.body));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#role').selectOption('manager');
  await page.evaluate(() => { if (!location.hash.includes('/admin/')) location.hash = '#/admin/dashboard'; });
  await page.locator('#adminNav').waitFor({ state: 'visible' });

  await page.getByRole('link', { name: 'Testdata' }).click();
  await page.getByRole('heading', { name: 'Testdata', exact: true }).waitFor();
  assert.match(await page.locator('#app').innerText(), /0 testvare/);
  await page.locator('#createTest').click();
  await page.waitForTimeout(100);
  assert.match(await page.locator('#app').innerText(), /10 testvare/);
  await page.locator('#createExtended').click();
  await page.waitForTimeout(100);
  assert.match(await page.locator('#app').innerText(), /12 testvare/);
  await page.getByRole('link', { name: 'Pakker', exact: true }).click();
  await page.locator('#newPackage [name="name"]').fill('Syntetisk utlånsfilter');
  await page.locator('#newPackage').getByRole('button', { name: 'Opprett pakke' }).click();
  await page.locator('#app tbody tr').filter({hasText:'Syntetisk utlånsfilter'}).getByRole('button',{name:'Rediger'}).click();
  await page.locator('#packageSearch').fill('Eksempelvare 3');
  await page.locator('#packageChoices [role=option]').first().waitFor();
  assert.equal(await page.locator('#packageChoices [role=option]').first().isDisabled(),true,'loaned items cannot be added to a package');
  await page.locator('#closePackageEdit').click();
  await page.getByRole('link', { name: 'Låntakere', exact: true }).click();
  await page.getByRole('heading', { name: 'Låntakere / Leietakere' }).waitFor();
  await page.locator('#app tbody').getByText('Eksempel-låntaker 01', { exact: true }).waitFor();
  const activeBorrower = page.locator('#app tbody tr').filter({ hasText: 'Eksempel-låntaker 01' });
  assert.equal(await activeBorrower.count(), 1);
  await activeBorrower.locator('[data-delete-borrower]').click();
  assert.match(await page.locator('#toast').innerText(), /aktivt utlån/);
  assert.equal(await activeBorrower.count(), 1, 'borrower with active loans must remain');
  await activeBorrower.locator('[data-edit-borrower]').click();
  await page.locator('#borrowerForm').locator('[name="name"]').fill('Syntetisk resetnavn');
  await page.locator('#borrowerForm button[type="reset"]').click();
  assert.equal(await page.locator('#borrowerForm [name="name"]').inputValue(), '');
  await page.waitForFunction(() => document.querySelector('#borrowerForm button[type=submit]')?.innerText === 'Legg til låntaker');
  await page.getByRole('link', { name: 'Utlån', exact: true }).click();
  await page.getByRole('heading', { name: 'Utlån', exact: true }).waitFor();
  assert.match(await page.locator('#app').innerText(), /Aktive samlelån \(4\)/);
  assert.match(await page.locator('#app').innerText(), /Eksempel-låntaker/);
  await page.getByRole('link', { name: 'Lister', exact: true }).click();
  await page.getByRole('heading', { name: 'Lister', exact: true }).waitFor();
  assert.match(await page.locator('#app').innerText(), /\[TESTDATA\] Syntetisk arrangementsutstyr/);
  await page.getByRole('link', { name: 'Testdata', exact: true }).click();
  await page.getByRole('heading', { name: 'Testdata', exact: true }).waitFor();
  await page.locator('#deleteTest').click();
  await page.locator('dialog.confirm-dialog[open] button[value="yes"]').click();
  await page.waitForTimeout(100);
  assert.match(await page.locator('#app').innerText(), /0 testvare/);
  await page.getByRole('link', { name: 'Utlån', exact: true }).click();
  await page.getByRole('heading', { name: 'Utlån', exact: true }).waitFor();
  assert.match(await page.locator('#app').innerText(), /Aktive samlelån \(1\)/);
  assert.doesNotMatch(await page.locator('#app').innerText(), /Eksempel-låntaker/);
  await page.locator('#loanForm select[name="borrower"]').selectOption('b1');
  const loanSearch=page.locator('#loanSearch');
  await loanSearch.fill('Førstehjelpssekk');
  await page.locator('[data-loan-result="forstehjelpssekk"]').waitFor();
  assert.equal(await page.locator('[data-loan-result="forstehjelpssekk"]').isDisabled(),true,'source search disables items whose status is utlant');
  await loanSearch.fill('Hodelykt');
  await page.waitForTimeout(50);
  await page.locator('[data-loan-result="hodelykt-x2"]').click();
  await loanSearch.fill('Hodelykt');
  assert.equal(await page.locator('[data-loan-result="hodelykt-x2"]').count(),0,'selected items disappear from the result list to prevent duplicates');
  await page.locator('[data-remove-loan-item="hodelykt-x2"]').click();
  await loanSearch.fill('Hodelykt');
  await page.locator('[data-loan-result="hodelykt-x2"]').click();
  await loanSearch.fill('Merkebånd');
  await page.locator('[data-loan-result="merkingstape"]').click();
  await page.locator('#loanForm input[name="date"]').fill('2026-10-10');
  await page.locator('#loanForm input[name="planned"]').fill('2026-10-09');
  await page.locator('#loanForm button.primary').click();
  // Source accepts a planned date before the loan date; its date inputs have no min relationship.
  assert.match(await page.locator('#app').innerText(), /Aktive samlelån \(2\)/);
  const multiItemLoan = page.locator('#app tbody tr').filter({ hasText: 'Hodelykt X2' }).filter({ hasText: 'Merkebånd, rull' });
  assert.equal(await multiItemLoan.count(), 1);
  await multiItemLoan.locator('[data-return-loan]').click();
  await page.getByRole('dialog', { name: 'Registrer retur' }).locator('[name="returnDate"]').fill('2026-10-12');
  await page.getByRole('dialog', { name: 'Registrer retur' }).locator('[name="receivedBy"]').fill('Demoansvarlig B');
  await page.getByRole('dialog', { name: 'Registrer retur' }).locator('[name="returnNote"]').fill('Syntetisk returkontroll');
  await page.getByRole('dialog', { name: 'Registrer retur' }).getByRole('button', { name: 'Registrer retur' }).click();
  await page.locator('#loanFilter').selectOption('aktiv');
  for (const row of await page.locator('.panel').filter({has:page.locator('#loanFilter')}).locator('tbody tr').all()) assert.match(await row.innerText(), /Aktiv/);
  await page.locator('#loanFilter').selectOption('tilbakelevert');
  for (const row of await page.locator('.panel').filter({has:page.locator('#loanFilter')}).locator('tbody tr').all()) assert.match(await row.innerText(), /Tilbakelevert/);
  await page.locator('#loanFilter').selectOption('');
  // The source group endpoint allows published non-loaned items even when their metadata status is archived.
  await page.locator('#loanForm select[name="borrower"]').selectOption('b2');
  await page.locator('#loanSearch').fill('Pannelykt reservebatteri');
  await page.locator('[data-loan-result="pannelykt-reserve"]').waitFor();
  await page.locator('[data-loan-result="pannelykt-reserve"]').click();
  await page.locator('#loanForm [name="skipList"]').check();
  await page.locator('#loanForm button.primary').click();
  await page.waitForTimeout(100);
  assert.match(await page.locator('#app').innerText(), /Aktive samlelån \(2\)/);
  await page.locator('#loanSearch').fill('pannelykt');
  assert.equal(await page.locator('[data-loan-result="pannelykt-reserve"]').isDisabled(),true,'an item now marked utlant is disabled after loan creation');
  await page.locator('#loanSearch').fill('');
  await page.getByRole('link', { name: 'Lister', exact: true }).click();
  await page.getByRole('heading', { name: 'Lister', exact: true }).waitFor();
  const generatedLoanList=page.locator('#app tbody tr').filter({hasText:'Utlån ·'});
  if(await generatedLoanList.count())assert.equal(await generatedLoanList.locator('[data-delete-list]').count(),0,'loan-generated lists are protected from deletion');
  assert.doesNotMatch(await page.locator('#app').innerText(), /\[TESTDATA\] Syntetisk arrangementsutstyr/);

  // Invalid submissions must not leave a new synthetic borrower behind.
  await page.getByRole('link', { name: 'Utlån', exact: true }).click();
  await page.locator('#loanForm #newBorrowerToggle').click();
  await page.locator('#loanForm [name="newBorrower"]').fill('Syntetisk ikkeopprettet');
  await page.locator('#loanForm [name="date"]').fill('2026-10-11');
  await page.locator('#loanForm button.primary').click();
  assert.match(await page.locator('#toast').innerText(), /minst én lagervare/);
  await page.getByRole('link', { name: 'Låntakere', exact: true }).click();
  assert.equal(await page.locator('#app').getByText('Syntetisk ikkeopprettet', { exact: true }).count(), 0);
  await page.getByRole('link', { name: 'Utlån', exact: true }).click();
  const existingLoan = page.locator('[data-edit-loan]').first();
  await existingLoan.click();
  const loanEdit = page.locator('#loanEdit');
  const loanDate = await loanEdit.locator('[name="date"]').inputValue();
  await loanEdit.locator('[name="planned"]').fill('2000-01-01');
  await loanEdit.getByRole('button', { name: 'Lagre', exact: true }).click();
  await page.waitForFunction(() => !document.querySelector('#loanEdit'));
  assert.match(await page.locator('#app').innerText(), /2000-01-01/);

  const legacyReturn = page.locator('[data-return-legacy="LEGACY-04"]');
  await legacyReturn.click();
  const returnDialog = page.getByRole('dialog', { name: 'Registrer retur' });
  await returnDialog.locator('[name="returnDate"]').fill('2026-10-11');
  await returnDialog.locator('[name="receivedBy"]').fill('Demoansvarlig A');
  await returnDialog.locator('[name="returnNote"]').fill('Syntetisk utstyrsavvik');
  await returnDialog.getByRole('button', { name: 'Registrer retur' }).click();
  assert.match(await page.locator('#app').innerText(), /Historikk · eldre enkeltlån[\s\S]*LEGACY-04[\s\S]*Syntetisk utstyrsavvik/);
  await page.evaluate(() => { location.hash='#/item/sambandsradio'; });
  await page.getByRole('heading', { name: 'Sambandsradio R4' }).waitFor();
  assert.match(await page.locator('#app').innerText(), /2026-10-11/);
  assert.doesNotMatch(await page.locator('#app').innerText(), /Syntetisk utstyrsavvik/, 'internal return notes remain private in public history');

  // Inventory filters, each source sortable column, and all quick-edit fields.
  await page.getByRole('link', { name: 'Administrasjon', exact: true }).click();
  await page.getByRole('link', { name: 'Lagervarer', exact: true }).click();
  await page.locator('#invPostStatus').selectOption('publish');
  await page.locator('#invCategory').selectOption({ label: 'Sikkerhet' });
  assert.ok(await page.locator('#invRows tbody tr').count() > 0);
  for (const row of await page.locator('#invRows tbody tr').all()) assert.match(await row.locator('td:nth-child(6)').innerText(), /Sikkerhet/);
  await page.locator('#invCategory').selectOption('');
  const targetRow = page.locator('#invRows tbody tr').filter({ hasText: 'Hodelykt X2' });
  const oldCondition = await targetRow.locator('td:nth-child(5) span').innerText();
  await targetRow.locator('[data-quick-field="condition"]').selectOption('slitt');
  await targetRow.locator('[data-quick-field="responsible"]').selectOption('Demoansvarlig B');
  await targetRow.getByRole('button', { name: 'Avbryt hurtigredigering' }).click();
  assert.equal(await targetRow.locator('td:nth-child(5) span').innerText(), oldCondition);
  await targetRow.locator('[data-quick-field="condition"]').selectOption('slitt');
  await targetRow.locator('[data-quick-field="responsible"]').selectOption('Demoansvarlig B');
  await targetRow.getByRole('button', { name: 'Lagre hurtigredigering' }).click();
  assert.match(await page.locator('#invRows tbody tr').filter({ hasText: 'Hodelykt X2' }).innerText(), /slitt.*Demoansvarlig B/s);
  for (const [sort, column] of [['hul_condition', 5], ['hul_intern_id', 3]]) {
    await page.locator('#invSort').selectOption(sort);
    const values = await page.locator(`#invRows tbody tr td:nth-child(${column})`).allInnerTexts();
    assert.deepEqual(values, [...values].sort((a,b) => a.localeCompare(b, 'no')));
  }
  await page.locator('#invStatus').selectOption('tilgjengelig');
  for (const row of await page.locator('#invRows tbody tr').all()) assert.match(await row.locator('td:nth-child(4)').innerText(), /Tilgjengelig/);
  await page.locator('#invStatus').selectOption('');
  await page.locator('#invLocation').selectOption({ label: 'Utstyrsbod · Hylle A2' });
  for (const row of await page.locator('#invRows tbody tr').all()) assert.match(await row.locator('td:nth-child(7)').innerText(), /Utstyrsbod · Hylle A2/);
  await page.locator('#invLocation').selectOption('');

  // Taxonomy search, duplicate/self-parent validation, and keyboard reachable CRUD controls.
  await page.getByRole('link', { name: 'Kategorier / plasseringer / løp', exact: true }).click();
  const categoryForm = page.locator('[data-term-form="category"]');
  await categoryForm.locator('[name="name"]').fill('QA-kategori');
  await categoryForm.locator('[name="parent"]').selectOption({ label: 'Sikkerhet' });
  await categoryForm.getByRole('button', { name: 'Legg til' }).click();
  assert.equal(await page.locator('[data-term-row="category"][data-term-name="qa-kategori"]').count(), 1);
  const categorySearch = page.locator('[data-term-search="category"]');
  await categorySearch.fill('QA-');
  assert.equal(await page.locator('[data-term-row="category"]:visible').count(), 1);
  await categorySearch.fill('');
  await page.locator('[data-term-form="category"] [name="name"]').fill('qa-kategori');
  await page.locator('[data-term-form="category"]').getByRole('button', { name: 'Legg til' }).click();
  assert.match(await page.locator('#toast').innerText(), /finnes allerede/);
  await page.locator('[data-term-row="category"][data-term-name="qa-kategori"]').getByRole('button',{name:'Gi nytt navn'}).click();
  const renameDialog=page.getByRole('dialog',{name:'Gi term nytt navn'});
  assert.equal(await renameDialog.locator('input[name="value"]').evaluate(el => document.activeElement === el),true,'text dialog moves focus to its input');
  await renameDialog.locator('input[name="value"]').fill('QA-kategori endret');
  await renameDialog.getByRole('button',{name:'Lagre'}).click();
  await page.locator('[data-term-row="category"][data-term-name="qa-kategori endret"]').waitFor();
  assert.equal(await page.locator('[data-term-row="category"][data-term-name="qa-kategori endret"]').count(),1);
  await page.keyboard.press('Tab');
  assert.notEqual(await page.evaluate(() => document.activeElement), await page.locator('body').elementHandle());

  // Source-compatible package typeahead supports no-match, loaned/duplicate blocking, and keyboard selection.
  await page.getByRole('link', { name: 'Pakker', exact: true }).click();
  await page.locator('#newPackage [name="name"]').fill('Syntetisk tastaturpakke');
  await page.locator('#newPackage').getByRole('button', { name: 'Opprett pakke' }).click();
  await page.locator('#app tbody tr').filter({ hasText: 'Syntetisk tastaturpakke' }).getByRole('button', { name: 'Rediger' }).click();
  const packageSearch = page.locator('#packageSearch');
  await packageSearch.fill('ingen-slik-vare');
  assert.match(await page.locator('#packageSearchStatus').innerText(), /Ingen varer funnet/);
  await packageSearch.fill('Hodelykt');
  await page.locator('#packageChoices [role="option"]:not(:disabled)').first().waitFor();
  await packageSearch.press('ArrowDown');
  await packageSearch.press('Enter');
  assert.match(await page.locator('#app').innerText(), /Varer i pakken \(1\)/);
  await packageSearch.fill('Hodelykt');
  await page.locator('#packageChoices [role="option"]').first().waitFor();
  assert.equal(await page.locator('#packageChoices [role="option"]').first().isDisabled(), true, 'duplicate package items are disabled');
  await page.locator('#closePackageEdit').click();
  await page.locator('#app tbody tr').filter({ hasText: 'Syntetisk tastaturpakke' }).getByRole('button', { name: 'Opprett liste' }).click();
  const packageDialog = page.getByRole('dialog', { name: 'Opprett liste fra pakke' });
  await packageDialog.press('Escape');
  assert.equal(await packageDialog.isVisible(), false);
  await page.locator('#app tbody tr').filter({ hasText: 'Syntetisk tastaturpakke' }).getByRole('button', { name: 'Opprett liste' }).click();
  await page.getByRole('dialog', { name: 'Opprett liste fra pakke' }).getByRole('button', { name: 'Opprett liste' }).click();
  assert.equal(await page.locator('#packageListUrl').isVisible(), true);
  assert.match(await page.locator('#packageListUrl').inputValue(), /#\/list\//);
  await page.locator('#closePackageListResult').click();

  // Date boundary matches the source's datetime interpretation at local midnight.
  await page.getByRole('link', { name: 'Lister', exact: true }).click();
  await page.locator('#newList [name="name"]').fill('QA utløpsgrense');
  await page.locator('#newList').getByRole('button', { name: 'Opprett liste' }).click();
  const expiryListRow=page.locator('#app tbody tr').filter({hasText:'QA utløpsgrense'});
  await expiryListRow.locator('[data-delete-list]').focus(); await page.keyboard.press('Enter');
  const deleteDialog=page.getByRole('dialog',{name:'Bekreft handling'}); await deleteDialog.waitFor(); await page.keyboard.press('Escape');
  assert.equal(await expiryListRow.count(),1,'Escape cancels list deletion');
  await expiryListRow.getByRole('button', { name: 'Rediger' }).click();
  await page.locator('#listExpiry').fill('2031-01-02');
  const localListId = new URL(await page.locator('#listUrl').inputValue()).hash.split('/').at(-1);
  await page.locator('#saveExpiry').click();
  await page.evaluate(() => { Date.now = () => new Date(2031, 0, 1, 23, 59, 59, 999).getTime(); location.hash='#/'; });
  await page.waitForFunction(() => location.hash === '#/');
  await page.evaluate((id) => { location.hash=`#/list/${id}`; }, localListId);
  assert.doesNotMatch(await page.locator('#app').innerText(), /har utløpt/);
  await page.evaluate(() => { Date.now = () => new Date(2031, 0, 2, 0, 0, 0, 0).getTime(); location.hash='#/'; });
  await page.waitForFunction(() => location.hash === '#/');
  await page.evaluate((id) => { location.hash=`#/list/${id}`; }, localListId);
  await page.getByText('Denne listen har utløpt og er ikke lenger tilgjengelig.').waitFor();
  assert.match(await page.locator('#app').innerText(), /har utløpt/);

  // Import compressed XLSX with sparse cells and shared strings; reject corrupt archives without mutation.
  await page.evaluate(() => { Date.now = Date.now.bind(Date); });
  await page.locator('#role').selectOption('manager');
  await page.locator('#adminNav').click();
  await page.getByRole('link', { name: 'Import / Eksport', exact: true }).click();
  const upload = page.locator('#xlsxFile');
  const headings = ['intern_id','update_key','navn','kategori','plassering','lop','status','antall','tilstand','ansvarlig','verdi','notat'];
  const importedRow = ['QA-XLSX-ID','','QA delt streng','Sikkerhet','','','tilgjengelig','3','','','12.5','syntetisk notat'];
  await upload.setInputFiles({ name: 'shared-strings-deflate.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: sharedStringXlsx([headings, importedRow]) });
  await page.getByRole('heading', { name: /Forhåndsvisning/ }).waitFor();
  assert.match(await page.locator('#importPreview').innerText(), /QA delt streng/);
  assert.match(await page.locator('#importPreview').innerText(), /syntetisk notat/);
  await page.locator('#cancelImport').click();
  const broken = Buffer.from('not a zip archive');
  await upload.setInputFiles({ name: 'broken.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: broken });
  assert.match(await page.getByRole('alert').innerText(), /ZIP-indeksen mangler/);

  // Focused WCAG 2.1 AA semantic, contrast, keyboard and screen-reader tree checks.
  await page.goto(`http://127.0.0.1:${port}/vibe/lagerstyring-hell-ultra/`);
  await auditAccessibleSurface(page);
  await page.locator('#role').selectOption('manager');
  await page.evaluate(() => { location.hash='#/admin/inventory/new'; });
  await page.getByRole('tablist', { name: 'Vareegenskaper' }).waitFor();
  await auditAccessibleSurface(page);
  const tabs=page.getByRole('tablist').getByRole('tab');
  await tabs.first().focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
  const ax = await page.context().newCDPSession(page);
  const tree = await ax.send('Accessibility.getFullAXTree');
  assert.ok(tree.nodes.some((node) => node.role?.value === 'main'), 'main landmark appears in browser accessibility tree');
  assert.ok(tree.nodes.some((node) => node.role?.value === 'navigation'), 'navigation landmark appears in browser accessibility tree');
  assert.ok(tree.nodes.some((node) => node.role?.value === 'tablist'), 'editor tabs appear as a tablist to assistive technology');
  assert.ok(tree.nodes.some((node) => node.role?.value === 'tab'), 'editor tabs expose tab semantics');
  await ax.detach();

  // Image, PDF and non-PDF attachment actions are synthetic, local, and inspectable.
  await page.evaluate(() => { location.hash='#/item/hodelykt-x2'; });
  await page.getByRole('heading', { name: 'Hodelykt X2' }).waitFor();
  await auditAccessibleSurface(page);
  const imageLink=page.getByRole('link', { name: 'Åpne bilde' });
  assert.equal(await imageLink.getAttribute('target'),'_blank');
  assert.match(await imageLink.getAttribute('rel'),/noopener/);
  const imagePopupPromise=page.waitForEvent('popup'); await imageLink.click();
  const imagePopup=await imagePopupPromise; await imagePopup.waitForLoadState();
  assert.match(imagePopup.url(),/^blob:http:\/\//);
  assert.equal(await imagePopup.evaluate(() => document.contentType),'image/svg+xml');
  assert.equal(await imagePopup.evaluate(() => document.contentType),'image/svg+xml'); await imagePopup.close();
  await page.evaluate(() => { location.hash='#/item/forstehjelpssekk'; });
  await page.getByRole('heading', { name: 'Førstehjelpssekk' }).waitFor();
  await page.getByRole('button', { name: 'Forhåndsvis PDF' }).click();
  const mediaDialog=page.getByRole('dialog', { name: 'Eksempelvedlegg' });
  await mediaDialog.waitFor(); assert.ok(await mediaDialog.locator('iframe[title="Eksempelvedlegg"]').count());
  await page.keyboard.press('Escape'); assert.equal(await mediaDialog.isVisible(),false);
  await page.evaluate(() => { location.hash='#/admin/inventory/edit/hodelykt-x2'; });
  await page.locator('[data-editor-tab=media]').click();
  await page.locator('#mediaFiles').setInputFiles({name:'synthetic.txt',mimeType:'text/plain',buffer:Buffer.from('Syntetisk vedleggsinnhold')});
  await page.locator('[data-media-visible="1"]').check();
  await page.evaluate(() => { location.hash='#/item/hodelykt-x2'; });
  await page.getByRole('heading', { name: 'Hodelykt X2' }).waitFor();
  const documentLink=page.getByRole('link', { name: 'Åpne vedlegg' });
  assert.equal(await documentLink.getAttribute('target'),'_blank');
  const documentPopupPromise=page.waitForEvent('popup'); await documentLink.click();
  const documentPopup=await documentPopupPromise; await documentPopup.waitForLoadState();
  assert.ok((await documentPopup.evaluate(() => document.body.innerText)).includes('Syntetisk vedleggsinnhold'));
  await documentPopup.close();
  assert.deepEqual(pageErrors, []);
  console.log('PASS: lifecycle, inventory filters/sort/quick edit, taxonomy search/validation, borrower safeguards/reset, multi-item and legacy loan history/returns, keyboard package search/dialog, expiry midnight boundary, compressed shared-string XLSX plus corrupt ZIP, image/PDF/document targets, 390px layout, focused contrast/labels/table scope/landmarks/keyboard/AX tree; no browser errors');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
