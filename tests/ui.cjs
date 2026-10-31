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
 await page.evaluate(()=>installDemoData());assert.equal(await page.evaluate(()=>db.properties.length),1);await page.evaluate(()=>removeDemoData());assert.equal(await page.evaluate(()=>db.properties.length),0);assert(await page.evaluate(()=>!db.dashboardSnapshots.some(x=>x.demo==='immoptima_demo_v1')));
 await page.getByRole('button',{name:'Biens',exact:true}).click();await page.locator('#addPropertyButton').click();assert(await page.locator('#propertyFormWrap form').isVisible());
 await page.evaluate(()=>showPage('dashboard'));const data=fixture();
 await page.evaluate(data=>{db=data;localStorage.setItem(KEY,JSON.stringify(db));localStorage.setItem('immoptima_dashboard_view_v1','graph');renderAll()},data);
 assert.equal(await page.locator('#igNet').textContent(),'124 500 €');
 fs.mkdirSync('qa-out/web',{recursive:true});const shot=async name=>{await page.waitForTimeout(120);await page.screenshot({path:'qa-out/web/'+name+'.png'});};await shot('01-dashboard');
 // Validated list B: consecutive property cards, compact notice, live actions and all metrics retained.
 await page.getByRole('button',{name:'Biens',exact:true}).click();
 assert.equal(await page.locator('#ioPropertyCount').textContent(),'2 biens');
 assert.equal(await page.locator('#properties .io-property-card').count(),2);
 assert.equal(await page.locator('#immobilier .io-discovery').getAttribute('open'),null);
 await page.locator('#immobilier .io-discovery summary').click();assert(await page.locator('#immobilier .io-discovery p').isVisible());await page.locator('#immobilier .io-discovery summary').click();
 const firstCard=page.locator('#properties .io-property-card').first();
 assert((await firstCard.locator('.io-list-cash').textContent()).includes('350'));assert((await firstCard.locator('.io-list-wealth').textContent()).includes('84'));
 await firstCard.locator('.io-property-indicators summary').click();assert((await firstCard.locator('dl').textContent()).includes('125'));await firstCard.locator('.io-property-indicators summary').click();
 await firstCard.locator('.io-property-menu summary').click();await firstCard.getByRole('button',{name:'Modifier',exact:true}).click();assert.equal(await page.locator('#propertyFormWrap input[name=name]').inputValue(),'Appartement – Tours Centre');await page.locator('#propertyFormWrap').getByRole('button',{name:'Fermer',exact:true}).click();
 await firstCard.locator('.io-property-menu summary').click();assert(await page.evaluate(()=>immoptimaHandleBack()));assert.equal(await firstCard.locator('.io-property-menu').getAttribute('open'),null);assert(await page.locator('#immobilier').isVisible());
 await firstCard.getByRole('button',{name:'Voir le bien',exact:false}).click();assert(await page.locator('#ioPropertyDetailOverlay').isVisible());await page.evaluate(()=>immoptimaClosePropertyDetail());
 await page.evaluate(()=>{db.properties.push({...db.properties[1],id:'qa-list-third',name:'Studio · Validation liste',address:'Tours',surface:22});renderProperties()});
 await page.setViewportSize({width:393,height:851});await page.evaluate(()=>window.scrollTo(0,0));await shot('10-biens-liste-b');
 const cardsLayout=await page.locator('#properties .io-property-card').evaluateAll(cards=>cards.map(c=>({height:c.getBoundingClientRect().height,bottom:c.getBoundingClientRect().bottom})));
 assert(cardsLayout[0].height<300,'property card remains compact');assert(cardsLayout[1].bottom<790,'two complete property cards on a normal phone');
 for(const width of [320,360,393,430,800]){await page.setViewportSize({width,height:851});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'property list horizontal overflow '+width)}
 // A long imported name/address and an apostrophe in ID remain safe and readable.
 await page.evaluate(()=>{Object.assign(db.properties[2],{id:"qa-list-'quoted",name:'Appartement très long avec nom et adresse à vérifier '.repeat(3),holder:'Détenteur dont le nom est long',address:'Rue de validation très longue '.repeat(4),retainedValue:123456789012});renderProperties()});
 await page.setViewportSize({width:320,height:740});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'long property fields cannot widen the page');
 const thirdCard=page.locator('#properties .io-property-card').nth(2);await thirdCard.getByRole('button',{name:'Voir le bien',exact:false}).click();assert(await page.locator('#ioPropertyDetailOverlay').isVisible());await page.evaluate(()=>immoptimaClosePropertyDetail());
 await thirdCard.locator('.io-property-menu summary').click();await thirdCard.getByRole('button',{name:'Supprimer',exact:true}).click();assert.equal(await page.locator('#ioPropertyCount').textContent(),'2 biens');
 await page.setViewportSize({width:393,height:851});await page.evaluate(data=>{db=data;renderAll();showPage('dashboard')},data);
 for(const [kind,name] of [['wealth','02-richesse'],['income','03-revenus'],['yield','04-performance'],['diagnostic','05-diagnostic']]){
 await page.locator('#dashboardGraph article').nth(['wealth','income','yield','diagnostic'].indexOf(kind)).click();
 assert(await page.locator('#ioAnalysisOverlay').isVisible());assert(await page.locator('#ioAnalysisBody svg.io-analysis-plot').isVisible());
 assert((await page.locator('#ioAnalysisTitle').textContent()).includes(({wealth:'Mon patrimoine net',income:'Mes revenus',yield:'Ma performance',diagnostic:'Mon diagnostic'})[kind]));
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
 await page.locator('#ioPropertyDetailOverlay .io-premium-tabs').first().getByRole('button',{name:'Récap',exact:true}).click();assert(await page.getByRole('button',{name:'Modifier le bien',exact:true}).isVisible());
 await page.evaluate(()=>immoptimaClosePropertyDetail());
 // Upload a real image through the file chooser, then retain it through edit/reload/export/import.
 await page.evaluate(()=>immoptimaOpenPropertyDetail('qa-tours'));const chooserPromise=page.waitForEvent('filechooser');await page.locator('.io-property-photo').click();const chooser=await chooserPromise;await chooser.setFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64')});await page.waitForFunction(()=>db.properties[0].photo?.startsWith('data:image/jpeg'));assert(await page.locator('.io-property-photo img').isVisible());await page.evaluate(()=>immoptimaClosePropertyDetail());
 // Real DOM interactions: edit, persistence after reload, JSON export/import and invalid import rollback.
 await page.evaluate(()=>openPropertyForm('qa-tours'));await page.locator('#propertyFormWrap [name=rentHC]').fill('925');await page.locator('#propertyFormWrap form button.primary').click();
 assert.equal(await page.evaluate(()=>db.properties[0].rentHC),925);await page.reload();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>db.properties[0].rentHC),925);assert(await page.evaluate(()=>db.properties[0].photo.startsWith('data:image/jpeg')));
 await page.evaluate(()=>{showPage('dashboard');immoptimaMore()});assert(await page.locator('#ioMore').isVisible());assert.equal(await page.locator('#ioMore .io-more-grid button').count(),10);await page.locator('#ioMore [aria-label="Fermer le menu"]').click();
 const downloadPromise=page.waitForEvent('download');await page.evaluate(()=>exportData('local'));const download=await downloadPromise;await download.saveAs('qa-out/backup-test.json');const backup=JSON.parse(fs.readFileSync('qa-out/backup-test.json'));assert.equal(backup.properties[0].rentHC,925);assert(backup.propertySnapshots.length);
 await page.evaluate(()=>db.properties[0].rentHC=10);await page.locator('#importFile').setInputFiles('qa-out/backup-test.json');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>db.properties[0].rentHC),925);assert(await page.evaluate(()=>!!localStorage.getItem('immoptima_pre_import_v1')));
 const before=await page.evaluate(()=>JSON.stringify(db));await page.locator('#importFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"properties":"wrong"}')});await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>JSON.stringify(db)),before);assert(dialogs.some(d=>d.includes('invalide')));
 // Bank export and print layout use real numbers, including thousands and cents.
 await page.evaluate(()=>{showPage('banque');renderBankSummary()});assert.equal(await page.locator('#bankTableBody tr').first().locator('td').nth(8).locator('input').inputValue(),'11100');
 const csvPromise=page.waitForEvent('download');await page.evaluate(()=>exportBankCSV());const csv=await csvPromise;await csv.saveAs('qa-out/bank-test.csv');assert(fs.readFileSync('qa-out/bank-test.csv','utf8').includes('11100'));
 await page.emulateMedia({media:'print'});assert(await page.locator('#bankTableBody input').first().isHidden());await page.pdf({path:'qa-out/bank-print-test.pdf',landscape:true,format:'A4'});await page.emulateMedia({media:'screen'});
 // Bank C: real editing, monthly/annual links, collapsed viewport, long lists, no horizontal table.
 assert(await page.locator('#bankMobile').isVisible());assert(await page.locator('#banque .bank-print-document').isHidden());
 const bankCard=()=>page.locator('#bankMobile .io-bank-property').first();
 await bankCard().locator('summary').click();await bankCard().getByRole('button',{name:'Modifier les données',exact:true}).click();
 const bankInput=name=>page.locator('#bankMobile .io-bank-editor [name='+name+']');
 await bankInput('rentHC').fill('1000');await bankInput('rentHC').blur();assert.equal(await bankInput('annualHC').inputValue(),'12000');
 await bankInput('recoverable').fill('50');await bankInput('recoverable').blur();assert.equal(await bankInput('cc').inputValue(),'1050');
 await bankInput('annualHC').fill('11100');await bankInput('annualHC').blur();assert.equal(await bankInput('rentHC').inputValue(),'925');
 await bankInput('cc').fill('1000');await bankInput('cc').blur();assert.equal(await bankInput('recoverable').inputValue(),'75');
 await bankInput('annualCC').fill('12600');await bankInput('annualCC').blur();assert.equal(await bankInput('recoverable').inputValue(),'125');
 await bankInput('credit').fill('0');await page.locator('#bankMobile .io-bank-editor').getByRole('button',{name:'Enregistrer',exact:true}).click();assert.equal(await page.evaluate(()=>propertyLoanPayment(db.properties[0])),0);assert.equal(await page.evaluate(()=>db.properties[0].recoverable),125);
 assert.equal(await bankCard().evaluate(card=>card.open),true,'saving preserves the expanded bank card');
 // Metadata-only edits do not override an automatically calculated loan payment.
 await page.evaluate(()=>{db.loans[0].payment=0;db.loans[0].paymentOverride=false;renderBankSummary()});
 await bankCard().getByRole('button',{name:'Modifier les données',exact:true}).click();await bankInput('name').fill('Appartement bancaire modifié');await page.locator('#bankMobile .io-bank-editor').getByRole('button',{name:'Enregistrer',exact:true}).click();assert.equal(await page.evaluate(()=>db.loans[0].paymentOverride),false);
 await page.reload();await page.waitForTimeout(250);await page.evaluate(()=>showPage('banque'));assert.equal(await page.evaluate(()=>db.properties[0].name),'Appartement bancaire modifié');
 await page.evaluate(data=>{db=data;ioBankOpenId=null;ioBankEditorId=null;ioBankHelpOpen=false;renderAll();showPage('banque')},fixture());
 for(const [width,height] of [[320,568],[360,640],[393,740],[412,780],[430,932]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  const geometry=await page.evaluate(()=>{const nav=document.getElementById('nav').getBoundingClientRect(),help=document.querySelector('#bankMobile .io-bank-help summary').getBoundingClientRect(),total=document.querySelector('#bankMobile .io-bank-total').getBoundingClientRect();return {width:document.documentElement.scrollWidth,height:innerHeight,scroll:document.documentElement.scrollHeight,helpTop:help.top,helpBottom:help.bottom,totalBottom:total.bottom,navTop:nav.top}});
  assert(geometry.width<=width,'bank horizontal overflow '+JSON.stringify(geometry));assert(geometry.scroll<=height+1,'bank summary fits one page '+JSON.stringify(geometry));assert(geometry.helpBottom<=geometry.navTop&&geometry.totalBottom<=geometry.navTop,'bank help and totals above nav');
  await bankCard().locator('summary').click();await page.waitForTimeout(80);assert(await bankCard().locator('.io-bank-breakdown').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'expanded bank card width');await bankCard().locator('summary').click();
  await page.locator('#bankMobile .io-bank-help summary').click();await page.waitForTimeout(80);assert(await page.locator('#bankMobile .io-bank-help p').first().isVisible());await page.locator('#bankMobile .io-bank-help summary').click();
 }
 await page.setViewportSize({width:393,height:851});await page.evaluate(()=>window.scrollTo(0,0));await shot('12-banque-c-replie');await bankCard().locator('summary').click();await page.waitForTimeout(120);assert(await page.evaluate(()=>Math.abs(window.scrollY)<2),'opening first bank card preserves the top of the page '+JSON.stringify(await page.evaluate(()=>({y:scrollY,card:document.querySelector('.io-bank-property').getBoundingClientRect().top}))));await shot('13-banque-c-ouvert');await bankCard().locator('summary').click();
 // 11-property portfolio and a long imported ID/name: the list scrolls vertically inside the closed summary.
 await page.evaluate(()=>{const base=db.properties[0];db.properties=Array.from({length:11},(_,i)=>({...base,id:'bank-many-'+i,name:'Appartement '+(i+1)}));db.properties[10].id="bank-quoted-'";db.properties[10].name='Appartement au nom très long '.repeat(5);renderBankSummary()});await page.waitForTimeout(100);
 assert(await page.evaluate(()=>{const list=document.querySelector('.io-bank-list');return document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth&&list.scrollHeight>list.clientHeight}),'large bank portfolio uses vertical list');
 const lastBank=page.locator('#bankMobile .io-bank-property').last();await lastBank.locator('summary').click();await lastBank.getByRole('button',{name:'Modifier les données',exact:true}).click();assert.equal(await page.locator('#bankMobile .io-bank-editor').getAttribute('data-property-id'),"bank-quoted-'");await page.locator('#bankMobile .io-bank-editor').getByRole('button',{name:'Annuler',exact:true}).click();
 // Export still includes every property, regardless of collapsed state or vertical position.
 const manyCsvPromise=page.waitForEvent('download');await page.evaluate(()=>exportBankCSV());const manyCsv=await manyCsvPromise;await manyCsv.saveAs('qa-out/bank-11-properties.csv');assert(fs.readFileSync('qa-out/bank-11-properties.csv','utf8').includes('Appartement 10'));
 await page.emulateMedia({media:'print'});assert(await page.locator('#bankMobile').isHidden());assert(await page.locator('#banque .bank-print-document').isHidden());assert(await page.locator('#bankPdfReport').isVisible());assert.equal(await page.locator('#bankTableBody tr').count(),12);await page.pdf({path:'qa-out/bank-11-properties.pdf',landscape:true,format:'A4'});await page.emulateMedia({media:'screen'});
 await page.evaluate(()=>{db.properties=[];db.loans=[];ioBankOpenId=null;ioBankEditorId=null;ioBankHelpOpen=false;renderAll();showPage('banque')});await page.waitForTimeout(100);assert(await page.locator('#bankMobile .empty').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth),'empty bank fits');
 await page.evaluate(data=>{db=data;ioBankOpenId=null;ioBankEditorId=null;ioBankHelpOpen=false;renderAll();showPage('banque')},fixture());
 // Snapshot persistence, owner filtering, chart point interaction, no duplicate DOM IDs.
 await page.evaluate(()=>{showPage('dashboard');immoptimaHolderChange('SARL de famille')});assert.equal(await page.locator('#igNet').textContent(),'84 000 €');
 await page.evaluate(()=>{document.getElementById('ioHolderFilter').value='Tous';immoptimaOpenAnalysis('wealth')});await page.locator('#ioAnalysisBody svg g[role=button]').first().dispatchEvent('click');assert(!(await page.locator('#ioAnalysisBody .io-chart-tip').textContent()).includes('Touchez'));
 const dup=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((v,i)=>ids.indexOf(v)!==i)});assert.deepEqual(dup,[]);
 await page.evaluate(()=>immoptimaCloseAnalysis());
 for(const width of [320,360,393,430,800]){await page.setViewportSize({width,height:851});await page.evaluate(()=>{showPage('dashboard');renderAll()});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'dashboard overflow '+width);await page.evaluate(()=>immoptimaOpenAnalysis('income'));assert(await page.evaluate(()=>document.getElementById('ioAnalysisOverlay').scrollWidth<=innerWidth),'analysis overflow '+width);await page.evaluate(()=>immoptimaCloseAnalysis());}
 // All four cards and the navigation must fit on ONE screen, including a short phone.
 for(const [width,height] of [[320,568],[360,640],[393,740],[412,780],[430,932]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{showPage('dashboard');renderAll()});await page.waitForTimeout(100);
  const geometry=await page.evaluate(()=>{const nav=document.getElementById('nav').getBoundingClientRect();const tiles=[...document.querySelectorAll('#dashboardGraph article')];return {height:innerHeight,scrollHeight:document.documentElement.scrollHeight,navTop:nav.top,tiles:tiles.map(t=>({top:t.getBoundingClientRect().top,bottom:t.getBoundingClientRect().bottom,content:[...t.querySelectorAll('.io-tile-title,.io-caption,.io-hero,.io-delta')].map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}))}))}});
  assert(geometry.scrollHeight<=height+1,'dashboard vertical overflow '+width+'x'+height+': '+JSON.stringify(geometry));
  for(const tile of geometry.tiles){assert(tile.bottom<=geometry.navTop+1,'tile hidden under nav');for(const content of tile.content)assert(content.top>=tile.top-1&&content.bottom<=tile.bottom+1,'card text clipped '+width+'x'+height+': '+JSON.stringify(tile));}
 }
 await page.setViewportSize({width:393,height:740});await page.waitForTimeout(100);await shot('08-dashboard-une-page');
 // Regression from the user's screenshot: +5000 / +11.1% in one day, no annualized explosion.
 await page.setViewportSize({width:393,height:851});await page.evaluate(()=>{
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const date=yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');
  db.properties=[{id:'short',name:'Bien de validation',retainedValue:90000,currentValue:90000,rentHC:500,holder:'Validation'}];db.loans=[{id:'short-loan',propertyId:'short',remaining:40000,initial:45000,payment:200}];db.dashboardSnapshots=[{date,holder:'Tous',net:45000,debt:45000,gross:90000}];db.propertySnapshots=[];
  document.getElementById('ioHolderFilter').value='Tous';document.getElementById('dashboardHolder').value='Tous';renderDashboard();immoptimaOpenAnalysis('wealth');
 });
 assert.equal(await page.locator('#ioAnalysisBody .io-footer-stats > div').nth(2).locator('b').textContent(),'—');
 assert((await page.locator('#ioAnalysisBody .io-footer-stats > div').nth(1).textContent()).includes('11,1'));
 assert(await page.evaluate(()=>document.getElementById('ioAnalysisOverlay').scrollWidth<=innerWidth),'short-history percentage must not widen screen');
 await shot('07-richesse-historique-court');
 // Every analysis, not only the dashboard: closed help stays on the first screen.
 await page.evaluate(data=>{db=data;renderAll();showPage('dashboard')},fixture());
 for(const [width,height] of [[320,568],[360,640],[393,740],[412,780],[430,932]]){
  await page.setViewportSize({width,height});
  for(const kind of ['wealth','income','yield','diagnostic']){
   await page.evaluate(kind=>immoptimaOpenAnalysis(kind),kind);await page.waitForTimeout(120);
   const geometry=await page.evaluate(()=>{const o=document.getElementById('ioAnalysisOverlay'),h=o.querySelector('details summary'),r=h.getBoundingClientRect(),header=o.querySelector('.io-analysis-header').getBoundingClientRect(),plot=o.querySelector('svg.io-analysis-plot')?.getBoundingClientRect();return {height:o.clientHeight,scroll:o.scrollHeight,scrollTop:o.scrollTop,helpTop:r.top,helpBottom:r.bottom,headerTop:header.top,plotHeight:plot?.height,width:o.scrollWidth}});
   assert(geometry.scroll<=geometry.height+1,'analysis scroll while help closed '+kind+' '+width+'x'+height+': '+JSON.stringify(geometry));
   assert(geometry.headerTop>=0&&geometry.helpBottom<=height&&geometry.helpTop>=0,'header and help visible '+kind);
   assert(geometry.plotHeight>=70,'graph remains readable '+kind+' '+JSON.stringify(geometry));assert(geometry.width<=width,'no horizontal overflow');
   await page.locator('#ioAnalysisBody details summary').click();await page.waitForTimeout(100);
   assert(await page.evaluate(()=>document.getElementById('ioAnalysisOverlay').scrollHeight>document.getElementById('ioAnalysisOverlay').clientHeight+20),'help expands scrollable page '+kind);
   await page.evaluate(()=>{const o=document.getElementById('ioAnalysisOverlay');o.scrollTop=o.scrollHeight});
   await page.locator('#ioAnalysisBody details summary').click();await page.waitForTimeout(100);
   assert(await page.evaluate(()=>{const o=document.getElementById('ioAnalysisOverlay');return o.scrollTop===0&&o.scrollHeight<=o.clientHeight+1}),'closing help restores first viewport '+kind);
   await page.evaluate(()=>immoptimaCloseAnalysis());
  }
 }
 await page.setViewportSize({width:393,height:740});
 for(const kind of ['wealth','income','yield','diagnostic']){await page.evaluate(kind=>immoptimaOpenAnalysis(kind),kind);await page.waitForTimeout(120);await shot('09-'+kind+'-une-page');await page.evaluate(()=>immoptimaCloseAnalysis());}
 // Property mockup A: all four tabs fit, with only calculations help expanding the page.
 await page.evaluate(data=>{db=data;renderAll();showPage('immobilier')},fixture());
 for(const [width,height] of [[320,568],[360,640],[393,740],[412,780],[430,932]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>immoptimaOpenPropertyDetail('qa-tours'));
  for(let tab=0;tab<4;tab++){
   await page.evaluate(tab=>ioPropertyTab(tab),tab);await page.waitForTimeout(120);
   const geometry=await page.evaluate(()=>{const o=document.getElementById('ioPropertyDetailOverlay'),r=o.querySelector('.io-property-help summary').getBoundingClientRect(),photo=o.querySelector('.io-property-photo').getBoundingClientRect(),plot=o.querySelector('svg')?.getBoundingClientRect();return {width:o.scrollWidth,height:o.clientHeight,scroll:o.scrollHeight,helpBottom:r.bottom,helpTop:r.top,photoHeight:photo.height,chartHeight:o.querySelector('.io-property-chart svg')?.getBoundingClientRect().height}});
   assert(geometry.scroll<=geometry.height+1,'property tab scroll '+tab+' '+width+'x'+height+': '+JSON.stringify(geometry));
   assert(geometry.helpTop>=0&&geometry.helpBottom<=height,'property calculations help visible');assert(geometry.width<=width,'property width');
   assert(geometry.photoHeight<=90,'photo stays discreet');if(tab!==3)assert(geometry.chartHeight>=70,'property chart remains readable '+JSON.stringify(geometry));
   await page.locator('#ioPropertyDetailOverlay .io-property-help summary').click();await page.waitForTimeout(100);
   assert(await page.evaluate(()=>{const o=document.getElementById('ioPropertyDetailOverlay');return o.scrollHeight>o.clientHeight+20}),'property help expands tab '+tab);
   await page.locator('#ioPropertyDetailOverlay .io-property-help summary').click();await page.waitForTimeout(100);
   assert(await page.evaluate(()=>{const o=document.getElementById('ioPropertyDetailOverlay');return o.scrollTop===0&&o.scrollHeight<=o.clientHeight+1}),'property help closes to one screen');
  }
  await page.evaluate(()=>immoptimaClosePropertyDetail());
 }
 await page.setViewportSize({width:393,height:851});await page.evaluate(()=>immoptimaOpenPropertyDetail('qa-tours'));await page.waitForTimeout(150);await shot('11-bien-maquette-a');
 await page.locator('#ioPropertyDetailOverlay .io-property-chart g[role=button]').first().click();assert(!(await page.locator('#ioPropertyDetailOverlay .io-chart-tip').textContent()).includes('Touchez'));
 for(let i=0;i<6;i++){await page.evaluate(i=>ioPropertyPeriodChoice(i),i);await page.waitForTimeout(80);assert.equal(await page.locator('#ioPropertyDetailOverlay .io-premium-periods button[aria-pressed=true]').count(),1)}
 for(let i=0;i<5;i++){await page.evaluate(i=>ioPropertyCurveTab(i),i);await page.waitForTimeout(80);assert.equal(await page.locator('#ioPropertyDetailOverlay .io-premium-tabs').nth(1).locator('button[aria-pressed=true]').count(),1)}
 await page.evaluate(()=>{ioPropertyTab(1)});await page.locator('#ioPropertyDetailOverlay .io-property-help summary').click();await page.locator('#ioPropertyDetailOverlay .io-comparison').getByRole('button',{name:'Modifier',exact:true}).click();assert(await page.locator('#loanFormWrap form').isVisible());await page.locator('#loanFormWrap').getByRole('button',{name:'Fermer',exact:true}).click();
 // Empty/undated/negative cases keep the help visible and do not invent curves.
 await page.evaluate(()=>{db.properties=[{id:'qa-empty-property',name:'Bien sans dates',holder:'Détenteur',retainedValue:90000,rentHC:0,ownerCharges:120}];db.loans=[];db.propertySnapshots=[];immoptimaOpenPropertyDetail('qa-empty-property')});await page.waitForTimeout(120);assert(await page.locator('#ioPropertyDetailOverlay .io-analysis-empty').isVisible());assert(await page.evaluate(()=>{const o=document.getElementById('ioPropertyDetailOverlay');return o.scrollHeight<=o.clientHeight+1}));await page.evaluate(()=>immoptimaClosePropertyDetail());
 await page.evaluate(data=>{db=data;renderAll();showPage('dashboard')},fixture());
 assert((await page.locator('#dashboardGraph .io-tile-title').first().textContent()).includes('MON PATRIMOINE NET'));
 await page.evaluate(()=>immoptimaOpenAnalysis('wealth'));assert((await page.locator('#ioAnalysisTitle').textContent()).includes('Mon patrimoine net'));assert(await page.getByRole('button',{name:'Récap',exact:true}).isVisible());await page.evaluate(()=>immoptimaCloseAnalysis());
 // Banque / Financement is now the sole loan-management destination; old links redirect safely.
 await page.evaluate(data=>{db=data;ioBankOpenId=null;ioBankHelpOpen=false;renderAll();showPage('financement')},fixture());
 assert(await page.locator('#banque').isVisible());assert(await page.locator('#financement').isHidden());assert.equal(await page.evaluate(()=>pages.some(p=>p[0]==='financement')),false);
 assert(await page.locator('#bankFinancing').evaluate(el=>el.open));
 await page.locator('#bankFinancing').getByRole('button',{name:'+ Ajouter un crédit',exact:true}).click();
 const loanField=name=>page.locator('#loanFormWrap [name='+name+']');
 await loanField('propertyId').selectOption('qa-tours');await loanField('bank').fill('Banque validation intégrée');await loanField('initial').fill('20000');await loanField('remaining').fill('15000');await loanField('years').fill('10');await loanField('rate').fill('1.9');await loanField('insuranceAmount').fill('6');await loanField('payment').fill('100');await loanField('startDate').fill('2022-01-01');
 await page.locator('#loanFormWrap form').getByRole('button',{name:'Ajouter le crédit',exact:true}).click();
 assert.equal(await page.evaluate(()=>db.loans.length),3);assert.equal(await page.evaluate(()=>propertyLoanPayment(db.properties[0])),550);
 const newLoan=await page.evaluate(()=>db.loans.find(l=>l.bank==='Banque validation intégrée').id);
 await page.locator('#loans [data-loan-id="'+newLoan+'"]').getByRole('button',{name:'Modifier',exact:true}).click();await loanField('remaining').fill('14000');await loanField('rate').fill('0');await loanField('payment').fill('105');await page.locator('#loanFormWrap form').getByRole('button',{name:'Enregistrer les modifications',exact:true}).click();assert.equal(await page.evaluate(()=>db.loans.find(l=>l.bank==='Banque validation intégrée').rate),0);assert.equal(await page.evaluate(()=>propertyLoanPayment(db.properties[0])),555);
 await page.locator('#bankFinancing').getByRole('button',{name:'+ Ajouter un crédit',exact:true}).click();await loanField('bank').fill('Crédit non rattaché validation');await loanField('initial').fill('1000');await loanField('remaining').fill('800');await loanField('payment').fill('50');await page.locator('#loanFormWrap form').getByRole('button',{name:'Ajouter le crédit',exact:true}).click();
 assert.equal(await page.evaluate(()=>db.loans.length),4);assert.equal(await page.evaluate(()=>totalsFor(db.properties).payments),875);
 await page.evaluate(()=>ioBuildBankReport('detail'));assert((await page.locator('#bankPdfReport').textContent()).includes('Crédit non rattaché'));assert((await page.locator('#bankPdfReport').textContent()).includes('600,00'));
 await page.reload();await page.waitForTimeout(250);await page.evaluate(()=>showPage('financement'));assert.equal(await page.evaluate(()=>db.loans.length),4);assert.equal(await page.evaluate(()=>propertyLoanPayment(db.properties[0])),555);
 await page.locator('#loans [data-loan-id="'+newLoan+'"]').getByRole('button',{name:'Supprimer',exact:true}).click();assert.equal(await page.evaluate(()=>db.loans.length),3);assert.equal(await page.evaluate(()=>propertyLoanPayment(db.properties[0])),450);
 await page.evaluate(data=>{db=data;ioBankOpenId=null;ioBankHelpOpen=false;renderAll();showPage('banque');document.getElementById('bankFinancing').open=false},fixture());
 await page.setViewportSize({width:393,height:851});await page.waitForTimeout(120);await shot('14-banque-financement-regroupe');await page.locator('#bankFinancing summary').click();await page.locator('#bankFinancing').scrollIntoViewIfNeeded();await shot('15-financements-integres');await page.locator('#bankFinancing summary').click();
 // Export choices invoke the same native/browser print entry point with the requested sections.
 await page.evaluate(()=>{db.properties.forEach(p=>p.demo='qa-report');window.__printed=0;window.print=()=>window.__printed++});
 for(const [mode,label] of [['summary','Synthèse · les chiffres essentiels'],['detail','Détail · biens, charges et prêts'],['both','Synthèse + détail']]){
  await page.locator('#bankMobile .io-bank-export').getByRole('button',{name:'Imprimer / PDF',exact:false}).click();assert(await page.getByRole('dialog',{name:'Choisir le contenu du PDF'}).isVisible());
  await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(180);assert.equal(await page.locator('#bankPdfReport').getAttribute('data-mode'),mode);
  await page.emulateMedia({media:'print'});assert(await page.locator('#bankPdfReport').isVisible());assert.equal(await page.locator('#bankPdfReport .report-summary').count(),mode==='detail'?0:1);assert.equal(await page.locator('#bankPdfReport .report-detail').count(),mode==='summary'?0:1);
  await page.pdf({path:'qa-out/bank-new-'+mode+'.pdf',landscape:true,format:'A4'});await page.emulateMedia({media:'screen'});
 }
 assert.equal(await page.evaluate(()=>window.__printed),3);
 // Missing data produces NR rather than a fictional zero or computed cash flow.
 await page.evaluate(()=>{db.properties=[{id:'missing',name:'Bien incomplet',rentHC:490,recoverable:35}];db.loans=[];ioBuildBankReport('both')});assert((await page.locator('#bankPdfReport').textContent()).includes('NR'));assert.equal(await page.evaluate(()=>bankReportCharges(db.properties[0])),null);
 await page.evaluate(data=>{db=data;renderAll();showPage('dashboard')},fixture());
 assert.deepEqual(errors,[],'browser runtime errors');
 fs.writeFileSync('qa-out/ui-results.json',JSON.stringify({passed:true,viewportTests:[320,360,393,430,800],screenshots:'Synthetic QA portfolio; real Chromium rendering',checks:['bank C editing and bidirectional amounts','bank C five one-screen viewports','bank 11-property list and full exports','empty launch','all four analyses','tabs','periods','legends','property tabs','property edit','photo upload and persistence','bank CSV','bank print layout','reload persistence','backup export','backup import','invalid import rollback','owner filter','point tooltip','unique IDs','responsive widths','four analyses fit with closed help','help expands and closing restores viewport'],runtimeErrors:errors},null,2));
 console.log('PASS mobile browser UI, interactions, storage, backup round-trip and responsive layouts');await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
