'use strict';
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict'),fixture=require('./fixture.cjs');
const {chromium}=require('playwright');
(async()=>{let browser,server;try{
 server=http.createServer((req,res)=>{const name=req.url.split('?')[0].slice(1);if(name.endsWith('.js')&&fs.existsSync(name)){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(name))}else{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync('index.html'))}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:393,height:851}});
 const errors=[],prompts=[];let accept=false;page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{prompts.push(d.message());if(accept)await d.accept();else await d.dismiss()});
 await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 await page.addInitScript(()=>{localStorage.setItem('immoptima_entry_v1','discovery');localStorage.setItem('immoptima_welcome_v1','seen');localStorage.setItem('immoptima_tutorial_v1','later')});
 await page.goto(base);
 await page.evaluate(f=>{
  db=f;window.qaOriginalSave=save;ioAccessAuthorize=async()=>true;window.ioSoloAuthorize=async()=>true;
  const p=db.properties[0],full={ownerName:'Bailleur fictif',ownerAddress:'Adresse fictive bailleur',tenantName:'Locataire fictif',address:'Adresse fictive logement',mode:'meuble'};
  window.qaFull=full;const payment={month:'2026-10',rent:505,charges:35,paid:540,paymentDate:'2026-10-05',confirmed:true,method:'Virement'};
  p.rentalManagement={dossier:{...full,ownerAddress:''},payments:[{...payment,identity:{...full,ownerAddress:''}},{...payment,month:'2026-09',paymentDate:'2026-09-05',identity:{...full,tenantName:'Ancien locataire fictif'}}]};
  renderAll();showPage('immobilier');
 },fixture());
 const stable=await page.evaluate(()=>JSON.stringify({other:db.properties[1],loans:db.loans}));
 await page.evaluate(()=>ioRentalManagementOpen('qa-tours','payments'));
 await page.locator('[data-rm-document="2026-10"]').click();
 assert.equal(await page.locator('#rmStatus [data-rm-go]').count(),1);
 await page.locator('#rmStatus [data-rm-go="ownerAddress"]').click();
 assert.equal(await page.locator('[data-rm-tab=dossier]').getAttribute('aria-selected'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'ownerAddress');
 await page.locator('#rmDossierForm [name=ownerAddress]').fill('Adresse fictive bailleur');
 await page.locator('#rmDossierForm button[type=submit]').click();
 await page.locator('[data-rm-tab=payments]').click();
 const before=await page.evaluate(()=>JSON.stringify(db.properties[0].rentalManagement.payments));
 // Declining a repair leaves both the payment and its identity unchanged.
 await page.locator('[data-rm-document="2026-10"]').click();
 assert.equal(await page.evaluate(()=>JSON.stringify(db.properties[0].rentalManagement.payments)),before);
 assert(await page.locator('#rmPreview').isHidden());
 assert(prompts.at(-1).includes('Vérifiez qu’elles correspondent au locataire de cette période'));
 // Storage failure cannot display a receipt or claim the repair was saved.
 accept=true;await page.evaluate(()=>{save=()=>{throw Error('Stockage fictif indisponible')}});
 await page.locator('[data-rm-document="2026-10"]').click();
 assert((await page.locator('#rmStatus').innerText()).includes('Stockage fictif indisponible'));
 assert.equal(await page.evaluate(()=>JSON.stringify(db.properties[0].rentalManagement.payments)),before);
 assert(await page.locator('#rmPreview').isHidden());
 await page.evaluate(()=>{save=qaOriginalSave});
 await page.locator('[data-rm-document="2026-10"]').click();
 await page.waitForFunction(()=>document.querySelector('#rmPreview')?.textContent.includes('Quittance de loyer'));
 const records=await page.evaluate(()=>db.properties[0].rentalManagement.payments);
 const original=JSON.parse(before);assert.deepEqual({...records[0],identity:original[0].identity},original[0]);
 assert.deepEqual(records[0].identity,await page.evaluate(()=>db.properties[0].rentalManagement.dossier));
 assert.deepEqual(records[1],original[1]);
 assert.equal(await page.evaluate(()=>JSON.stringify({other:db.properties[1],loans:db.loans})),stable);
 assert((await page.locator('#rmPreview').innerText()).includes('540,00'));
 fs.mkdirSync('qa-out/web',{recursive:true});await page.screenshot({path:'qa-out/web/90-quittance-coordonnees-completees.png'});
 // Historical complete identities survive a change to the current tenant.
 const promptCount=prompts.length;await page.locator('[data-rm-document="2026-09"]').click();
 assert((await page.locator('#rmPreview').innerText()).includes('Ancien locataire fictif'));
 assert.equal(prompts.length,promptCount);
 // Native text and PDF use that same prepared document.
 await page.evaluate(()=>{window.qaText=null;window.qaPrinted=false;window.AndroidBridge={saveFile(text,name,mime){qaText={text,name,mime}},printRentalDocument(){qaPrinted=true}}});
 await page.locator('[data-rm-text]').click();
 assert((await page.evaluate(()=>qaText.text)).includes('Ancien locataire fictif'));
 await page.locator('[data-rm-pdf]').click();await page.waitForFunction(()=>qaPrinted===true);
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 // Payment errors navigate to their exact field without dropping unsaved entries.
 await page.locator('#rmPaymentForm [name=paid]').fill('540');
 await page.locator('#rmPaymentForm button[type=submit]').click();
 await page.locator('#rmStatus [data-rm-go=paymentDate]').click();
 assert.equal(await page.evaluate(()=>document.activeElement.name),'paymentDate');
 assert.equal(await page.locator('#rmPaymentForm [name=paid]').inputValue(),'540');
 await page.locator('#rmStatus [data-rm-go=confirmed]').click();
 assert.equal(await page.evaluate(()=>document.activeElement.name),'confirmed');
 for(const width of [320,393,430]){await page.setViewportSize({width,height:851});assert(await page.locator('#ioRentalManagement').evaluate(e=>e.scrollWidth<=e.clientWidth+1))}
 // Error text identifies only missing dossier fields, and survives repeated navigation.
 await page.evaluate(()=>{document.querySelector('#rmPaymentForm').dispatchEvent(new Event('reset'));});
 accept=true;await page.locator('[data-rm-tab=dossier]').click();
 await page.locator('#rmDossierForm [name=tenantName]').fill('');
 await page.locator('#rmDossierForm button[type=submit]').click();
 await page.evaluate(()=>{db.properties[0].rentalManagement.payments[0].identity.tenantName=''});
 await page.locator('[data-rm-tab=payments]').click();
 await page.locator('[data-rm-document="2026-10"]').click();
 assert.equal(await page.locator('#rmStatus [data-rm-go]').count(),1);
 await page.locator('#rmStatus [data-rm-go=tenantName]').click();
 assert.equal(await page.evaluate(()=>document.activeElement.name),'tenantName');
 assert.deepEqual(errors,[]);
 fs.writeFileSync('qa-out/receipts-results.json',JSON.stringify({passed:true,checks:['incomplete saved identity reproduced','exact missing-field link and focused dossier input','cancel preserves records','failed storage rolls back and blocks preview','confirmed repair changes identity for one payment only','other properties and loan data preserved','complete historical identity preserved','native text and PDF bridge use prepared identity','payment errors focus exact inputs and preserve values','mobile widths 320/393/430'],data:'Synthetic identities only; no real email, tenant or cloud account'},null,2));
 console.log('PASS receipt repair, identity history, actionable missing fields, storage rollback, text and PDF bridges');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exit(1)});
