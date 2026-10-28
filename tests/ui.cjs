const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const fixture=require('./fixture.cjs');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync('index.html'))});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:393,height:851},deviceScaleFactor:2,isMobile:true,hasTouch:true}),errors=[],dialogs=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()});await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());
 await page.addInitScript(()=>localStorage.setItem('immoptima_welcome_v1','seen'));
 const url='http://127.0.0.1:'+server.address().port;await page.goto(url);await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>db.properties.length),0,'first launch stays empty');
 await page.getByRole('button',{name:'Biens',exact:true}).click();await page.locator('#addPropertyButton').click();assert(await page.locator('#propertyFormWrap form').isVisible());
 await page.evaluate(()=>showPage('dashboard'));const data=fixture();
 await page.evaluate(data=>{db=data;localStorage.setItem(KEY,JSON.stringify(db));localStorage.setItem('immoptima_dashboard_view_v1','graph');renderAll()},data);
 assert.equal(await page.locator('#igNet').textContent(),'124 500 €');
 fs.mkdirSync('qa-out/web',{recursive:true});const shot=async name=>{await page.waitForTimeout(120);await page.screenshot({path:'qa-out/web/'+name+'.png'});};await shot('01-dashboard');
 for(const [kind,name] of [['wealth','02-richesse'],['income','03-revenus'],['yield','04-performance'],['diagnostic','05-diagnostic']]){
 await page.locator('#dashboardGraph article').nth(['wealth','income','yield','diagnostic'].indexOf(kind)).click();
 assert(await page.locator('#ioAnalysisOverlay').isVisible());assert(await page.locator('#ioAnalysisBody svg.io-analysis-plot').isVisible());
 assert((await page.locator('#ioAnalysisTitle').textContent()).includes(({wealth:'Ma richesse',income:'Mes revenus',yield:'Ma performance',diagnostic:'Mon diagnostic'})[kind]));
 await shot(name);
 await page.locator('#ioAnalysisBody .io-premium-tabs button').nth(1).click();assert.equal(await page.locator('#ioAnalysisBody .io-premium-tabs button').nth(1).getAttribute('aria-pressed'),'true');
 const countBefore=await page.locator('#ioAnalysisBody svg circle').count();await page.locator('#ioAnalysisBody .io-analysis-legend button').first().click();assert((await page.locator('#ioAnalysisBody svg circle').count())<countBefore,'legend toggles data');
 await page.locator('#ioAnalysisBody .io-premium-periods button').first().click();assert.equal(await page.evaluate(()=>document.getElementById('ioAnalysisPeriod').value),'12');
 await page.locator('#ioAnalysisBody .io-premium-tabs button').last().click();assert(await page.locator('#ioAnalysisBody table').isVisible());
 await page.locator('#ioAnalysisOverlay [aria-label="Fermer l\'analyse"]').click();assert(await page.locator('#ioAnalysisOverlay').isHidden());
 }
 await page.evaluate(()=>{showPage('immobilier');immoptimaOpenPropertyDetail('qa-tours')});assert(await page.locator('#ioPropertyDetailOverlay').isVisible());await shot('06-bien');
 await page.locator('#ioPropertyDetailOverlay .io-premium-tabs').first().getByRole('button',{name:'Financement',exact:true}).click();assert((await page.locator('#ioPropertyDetailOverlay').textContent()).includes('450'));
 await page.locator('#ioPropertyDetailOverlay .io-premium-tabs').first().getByRole('button',{name:'Loyers',exact:true}).click();assert((await page.locator('#ioPropertyDetailOverlay').textContent()).includes('350'));
 await page.locator('#ioPropertyDetailOverlay .io-premium-tabs').first().getByRole('button',{name:'Détail',exact:true}).click();assert(await page.getByRole('button',{name:'Modifier le bien',exact:true}).isVisible());
 await page.evaluate(()=>immoptimaClosePropertyDetail());
 // Real DOM interactions: edit, persistence after reload, JSON export/import and invalid import rollback.
 await page.evaluate(()=>openPropertyForm('qa-tours'));await page.locator('#propertyFormWrap [name=rentHC]').fill('925');await page.locator('#propertyFormWrap form button.primary').click();
 assert.equal(await page.evaluate(()=>db.properties[0].rentHC),925);await page.reload();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>db.properties[0].rentHC),925);
 await page.evaluate(()=>{showPage('dashboard');immoptimaMore()});assert(await page.locator('#ioMore').isVisible());assert.equal(await page.locator('#ioMore .io-more-grid button').count(),11);await page.locator('#ioMore [aria-label="Fermer le menu"]').click();
 const downloadPromise=page.waitForEvent('download');await page.evaluate(()=>exportData('local'));const download=await downloadPromise;await download.saveAs('qa-out/backup-test.json');const backup=JSON.parse(fs.readFileSync('qa-out/backup-test.json'));assert.equal(backup.properties[0].rentHC,925);assert(backup.propertySnapshots.length);
 await page.evaluate(()=>db.properties[0].rentHC=10);await page.locator('#importFile').setInputFiles('qa-out/backup-test.json');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>db.properties[0].rentHC),925);assert(await page.evaluate(()=>!!localStorage.getItem('immoptima_pre_import_v1')));
 const before=await page.evaluate(()=>JSON.stringify(db));await page.locator('#importFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"properties":"wrong"}')});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>JSON.stringify(db)),before);assert(dialogs.some(d=>d.includes('invalide')));
 // Snapshot persistence, owner filtering, chart point interaction, no duplicate DOM IDs.
 await page.evaluate(()=>{showPage('dashboard');immoptimaHolderChange('SARL de famille')});assert.equal(await page.locator('#igNet').textContent(),'84 000 €');
 await page.evaluate(()=>{document.getElementById('ioHolderFilter').value='Tous';immoptimaOpenAnalysis('wealth')});await page.locator('#ioAnalysisBody svg g[role=button]').first().dispatchEvent('click');assert(!(await page.locator('#ioAnalysisBody .io-chart-tip').textContent()).includes('Touchez'));
 const dup=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((v,i)=>ids.indexOf(v)!==i)});assert.deepEqual(dup,[]);
 await page.evaluate(()=>immoptimaCloseAnalysis());
 for(const width of [320,360,393,430,800]){await page.setViewportSize({width,height:851});await page.evaluate(()=>{showPage('dashboard');renderAll()});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'dashboard overflow '+width);await page.evaluate(()=>immoptimaOpenAnalysis('income'));assert(await page.evaluate(()=>document.getElementById('ioAnalysisOverlay').scrollWidth<=innerWidth),'analysis overflow '+width);await page.evaluate(()=>immoptimaCloseAnalysis());}
 assert.deepEqual(errors,[],'browser runtime errors');
 fs.writeFileSync('qa-out/ui-results.json',JSON.stringify({passed:true,viewportTests:[320,360,393,430,800],screenshots:'Synthetic QA portfolio; real Chromium rendering',checks:['empty launch','all four analyses','tabs','periods','legends','property tabs','property edit','reload persistence','backup export','backup import','invalid import rollback','owner filter','point tooltip','unique IDs','responsive widths'],runtimeErrors:errors},null,2));
 console.log('PASS mobile browser UI, interactions, storage, backup round-trip and responsive layouts');await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
