const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const baseUrl = process.env.HUL_BASE_URL || 'http://127.0.0.1:8766';
const chromePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
(async () => {
 const browser = await chromium.launch({headless:true,executablePath:chromePath,args:['--no-sandbox']});
 for (const testWidth of [320,390,768,1440]) {
 const context = await browser.newContext({viewport:{width:testWidth,height:1000}});
 const page = await context.newPage(); const errors=[]; const offOrigin=[];
 page.setDefaultTimeout(5000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(new URL(r.url()).origin!==baseUrl) offOrigin.push(r.url())});
 await page.route(url=>url.href.startsWith(baseUrl + '/vibe/hul-lagerstyring/'),async r=>{const x=await r.fetch();const body=(await x.text()).replaceAll('__APP_JS_VERSION__','dev-local').replaceAll('__RUNTIME_CONFIG_VERSION__','dev-local');await r.fulfill({response:x,body});});
 await page.goto(baseUrl + '/vibe/hul-lagerstyring/',{waitUntil:'networkidle'}); await page.waitForTimeout(500);
 const ws=async id=>assert.equal(await page.locator(`[data-smoke-workspace="${id}"]`).isVisible(),true,`workspace ${id} visible`);
 const checkNames=async()=>{const bad=await page.locator('button:visible,input:visible,select:visible,textarea:visible').evaluateAll(els=>els.filter(el=>{if(el.disabled)return false;return !(el.getAttribute('aria-label')||el.getAttribute('title')||el.innerText||(el.id&&document.querySelector(`label[for="${CSS.escape(el.id)}"]`))||el.closest('label'))}).map(el=>el.outerHTML.slice(0,120)));assert.deepEqual(bad,[],`visible controls are named at ${testWidth}px`)};
 const openItem=async label=>{await page.getByRole('button',{name:new RegExp(label)}).click();await page.waitForTimeout(200);await ws('detaljgruppe');};
 const addCurrent=async()=>{await page.locator('[data-detail-add-to-order]').click();await page.waitForTimeout(200);};
 const db=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('HUL_MOCK_DB_v1')));
 const visitQueue=async()=>{await page.locator('#hamburger-button').click();await page.getByRole('button',{name:'Lagerkø'}).click();await page.waitForTimeout(350);await ws('lager');};
 // Create draft from the real item detail UI, add a second item, edit quantity, remove the second line.
 await openItem('Drikkeflaske 500 ml'); await addCurrent();
 await page.getByRole('button',{name:'Til lagerliste'}).click(); await page.waitForTimeout(200); await ws('liste');
 await openItem('HUL-løpstrøye strl. S'); await addCurrent();
 await page.locator('#order-cart-button').click(); await page.waitForTimeout(250); await ws('bestilling'); await checkNames();
 let cart=await db(); let order=cart.orders.at(-1); assert.equal(order.status,'DRAFT'); assert.equal(cart.orderLines.filter(l=>l.orderId===order.id).length,2);
 const first=cart.orderLines.find(l=>l.orderId===order.id), second=cart.orderLines.find(l=>l.orderId===order.id&&l.id!==first.id);
 await page.locator(`[data-order-line-qty="${first.id}"]`).fill('3'); await page.locator(`[data-order-line-qty="${first.id}"]`).dispatchEvent('change'); await page.waitForTimeout(200);
 await page.locator(`[data-order-line-remove="${second.id}"]`).click(); await page.waitForTimeout(200);
 cart=await db(); assert.equal(cart.orderLines.filter(l=>l.orderId===order.id).length,1); assert.equal(cart.orderLines.find(l=>l.id===first.id).requestedQty,3);
 await page.locator('#order-submit-button').click(); await page.waitForTimeout(300); assert.equal((await db()).orders.find(o=>o.id===order.id).status,'SUBMITTED');
 // Refresh preserves submitted order and then show it in queue/detail.
 await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(300); assert.equal((await db()).orders.find(o=>o.id===order.id).status,'SUBMITTED'); await visitQueue();
 assert.ok((await page.locator('#lager-order-list').innerText()).includes(order.orderNumber)); await checkNames(); await page.locator(`[data-open-lager-order="${order.id}"]`).click(); await page.waitForTimeout(250);
 let line=(await db()).orderLines.find(l=>l.orderId===order.id); await checkNames();
 await page.locator(`[data-lager-order-start-picking="${order.id}"]`).click(); await page.waitForTimeout(250);
 await page.locator(`[data-lager-line-pickedqty="${line.id}"]`).fill('2'); await page.locator(`[data-lager-line-pick="${line.id}"]`).click(); await page.waitForTimeout(250);
 await page.locator(`[data-lager-line-pickedqty="${line.id}"]`).fill('2'); await page.locator(`[data-lager-line-deviation-reason="${line.id}"]`).selectOption('skadet_vare'); await page.locator(`[data-lager-line-deviation="${line.id}"]`).click(); await page.waitForTimeout(250);
 assert.equal((await db()).orders.find(o=>o.id===order.id).status,'DEVIATION'); assert.equal((await db()).orderLines.find(l=>l.id===line.id).lineStatus,'DEVIATION');
 // Independent order for the source-valid PICKING -> READY_FOR_PICKUP -> loan path.
 await page.getByRole('button',{name:'Lagerliste'}).click().catch(async()=>{await page.locator('#hamburger-button').click();await page.getByRole('button',{name:'Lagerliste'}).click()}); await page.waitForTimeout(200); await ws('liste');
 await openItem('HUL-løpstrøye strl. M'); await addCurrent(); await page.locator('#order-cart-button').click(); await page.waitForTimeout(250);
 cart=await db(); let readyOrder=cart.orders.at(-1); let readyLine=cart.orderLines.find(l=>l.orderId===readyOrder.id); assert.equal(readyOrder.status,'DRAFT');
 await page.locator('#order-submit-button').click(); await page.waitForTimeout(250); await visitQueue(); await page.locator(`[data-open-lager-order="${readyOrder.id}"]`).click(); await page.waitForTimeout(250);
 await page.locator(`[data-lager-order-start-picking="${readyOrder.id}"]`).click(); await page.waitForTimeout(200);
 await page.locator(`[data-lager-line-pickedqty="${readyLine.id}"]`).fill('1'); await page.locator(`[data-lager-line-pick="${readyLine.id}"]`).click(); await page.waitForTimeout(200);
 await page.locator(`[data-lager-order-ready="${readyOrder.id}"]`).click(); await page.waitForTimeout(250); assert.equal((await db()).orders.find(o=>o.id===readyOrder.id).status,'READY_FOR_PICKUP');
 await page.locator(`[data-lager-order-loan-borrower="${readyOrder.id}"]`).selectOption('DEMO-LAANER-01'); await page.locator(`[data-lager-order-create-loans="${readyOrder.id}"]`).click(); await page.waitForTimeout(450);
 assert.equal((await db()).orders.find(o=>o.id===readyOrder.id).status,'COMPLETED'); assert.equal((await db()).loans.length,1);
 // Visible reset removes scenario data; app reloads with clean synthetic seed.
 page.once('dialog',d=>d.accept()); await page.getByRole('button',{name:'Nullstill demo'}).click(); await page.waitForTimeout(450);
 cart=await db(); assert.equal(cart.orders.length,0); assert.equal(cart.loans.length,0);
 // Test responsive widths, visible focus and accessible names for all live controls.
 await page.setViewportSize({width:testWidth,height:1000}); const scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth); assert.ok(scrollWidth<=testWidth,`no horizontal overflow at ${testWidth}`);
 await page.keyboard.press('Tab'); const focus=await page.evaluate(()=>({tag:document.activeElement.tagName,name:document.activeElement.getAttribute('aria-label')||document.activeElement.innerText||document.activeElement.getAttribute('title'),outline:getComputedStyle(document.activeElement).outlineStyle,ring:getComputedStyle(document.activeElement).boxShadow})); assert.ok(focus.name,'keyboard focus target has an accessible name'); assert.notEqual(focus.ring,'none','keyboard focus is visible');
 const unlabeled=await page.locator('button:visible,input:visible,select:visible,textarea:visible').evaluateAll(els=>els.filter(el=>{if(el.disabled)return false;return !(el.getAttribute('aria-label')||el.getAttribute('title')||el.innerText||(el.id&&document.querySelector(`label[for="${CSS.escape(el.id)}"]`))||el.closest('label'))}).map(el=>el.outerHTML.slice(0,120)));
 assert.deepEqual(unlabeled,[],'visible interactive controls have accessible names');
 console.log(JSON.stringify({width:testWidth,workflow:'draft/add/update/remove/submit/queue/detail/pick/deviation + ready/loan transfer',reload:'state preserved',reset:'scenario data cleared',scrollWidth,keyboardFocus:focus,unlabeled,offOriginRequests:offOrigin,pageErrors:errors}));
 assert.deepEqual(errors,[]); assert.deepEqual(offOrigin,[]); await context.close(); }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
