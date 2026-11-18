'use strict';
// Run against the prepared beta, using only fictitious identities and mocked native replies.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
(async()=>{let browser,server;try{
 const root=path.resolve(process.argv[2]||'beta-prepared');server=http.createServer((req,res)=>{const name=req.url.split('?')[0].slice(1)||'index.html';if(!/^[a-zA-Z0-9.-]+$/.test(name)||!fs.existsSync(path.join(root,name))){res.writeHead(404);return res.end()}res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.json')?'application/json':'text/html');res.end(fs.readFileSync(path.join(root,name)))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.IMMOPTIMA_CHROMIUM||undefined});const page=await browser.newPage({viewport:{width:393,height:851}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());await page.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 await page.goto(base);await page.locator('[data-entry-free]').click();await page.evaluate(()=>{
  db={...structuredClone(empty),settings:{...empty.settings,holders:['Bailleur fictif'],owner:true,premium:true},properties:[{id:'client-one',name:'Logement fictif',holder:'Bailleur fictif',rentHC:650,recoverable:30}],loans:[],assets:[]};
  immoptimaAuthState={status:'signed_in',uid:'client-a'};window.auditAccess={allowed:false,owner:false,expiresAt:0};window.auditTrial={allowed:false,code:'NOT_STARTED',startedAt:0};window.auditStarts=0;window.auditBuys=0;
  window.AndroidBridge={immoptimaAccessCheck(requestId){const uid=immoptimaAuthState.uid;queueMicrotask(()=>immoptimaNativeAccessResult({requestId,uid,...auditAccess}))},immoptimaRentalTrial(requestId,start){if(start)auditStarts++;const uid=immoptimaAuthState.uid;queueMicrotask(()=>immoptimaNativeRentalTrialResult({requestId,uid,...auditTrial}))},immoptimaPlayBilling(requestId,action){if(action==='buy')auditBuys++;const uid=immoptimaAuthState.uid;queueMicrotask(()=>immoptimaNativeBillingResult({requestId,uid,code:'NOT_CONFIGURED'}))}};
  localStorage.setItem('immoptima_solo_trial_v1:signed_in:client-a',JSON.stringify({allowed:true,startedAt:Date.now()}));renderAll();showPage('parametres');
 });
 const before=await page.evaluate(()=>JSON.stringify(db));assert.equal(await page.evaluate(()=>IMMOPTIMA_BUILD_CHANNEL),'beta');
 assert.equal(await page.evaluate(()=>ioAccessAuthorize(db)),true);assert.equal(await page.evaluate(()=>ioAccessAuthorize({...db,properties:[{},{}]},{silent:true})),false);
 assert.equal(await page.evaluate(()=>ioSoloAuthorize('annual','client-one')),false,'forged local preferences cannot activate trial or premium');assert.equal(await page.evaluate(()=>auditStarts),0);
 for(const state of [{allowed:true,owner:false,expiresAt:Date.now()-1000},{allowed:true,owner:'true',expiresAt:0},{allowed:true,expiresAt:String(Date.now()+86400000)},{allowed:'true',expiresAt:Date.now()+86400000}]){
  await page.evaluate(s=>{auditAccess=s},state);assert.equal(await page.evaluate(()=>ioAccessAuthorize(db,{premium:true,silent:true})),false,'incoherent subscription reply');
 }
 await page.evaluate(()=>{auditAccess={allowed:false,expiresAt:0,owner:false}});
 for(const state of [{allowed:true,code:'ACTIVE',startedAt:Date.now()-91*86400000},{allowed:true,code:'ACTIVE',startedAt:Date.now()+86400000},{allowed:true,code:'ACTIVE',startedAt:0},{allowed:true,code:'EXPIRED',startedAt:Date.now()-1000}]){
  await page.evaluate(s=>{auditTrial=s},state);assert.equal(await page.evaluate(()=>ioSoloAuthorize('annual','client-one')),false,'incoherent trial reply');
 }
 await page.evaluate(()=>{auditTrial={allowed:true,code:'ACTIVE',startedAt:Date.now()-1000}});assert.equal(await page.evaluate(()=>ioSoloAuthorize('annual','client-one')),true);
 await page.evaluate(()=>{db.properties.push({id:'client-two'})});assert.equal(await page.evaluate(()=>ioSoloAuthorize('annual','client-one')),false,'mono trial never grants multiple properties');await page.evaluate(()=>{db.properties.pop();auditAccess={allowed:true,owner:false,expiresAt:Date.now()+86400000}});assert.equal(await page.evaluate(()=>ioSoloAuthorize('annual','client-one')),true);
 await page.evaluate(()=>{auditAccess={allowed:true,owner:true,expiresAt:0}});assert.equal(await page.evaluate(()=>ioAccessAuthorize({...db,properties:[{},{}]},{silent:true})),true,'verified owner remains supported');
 await page.evaluate(()=>{auditAccess={allowed:false,owner:false,expiresAt:0};auditTrial={allowed:false,code:'NOT_STARTED',startedAt:0};immoptimaAuthState.uid='client-b'});assert.equal(await page.evaluate(()=>ioSoloAuthorize('annual','client-one')),false,'account change inherits no prior trial');
 await page.evaluate(()=>{immoptimaHandleBack();ioBillingOpen()});assert.equal(await page.evaluate(()=>auditBuys),0,'viewing offers cannot initiate a purchase');assert.equal(await page.locator('[data-billing-continue]').isVisible(),false);
 assert.equal(await page.evaluate(()=>JSON.stringify(db)),before,'denials and checks preserve the portfolio');assert.equal(await page.evaluate(()=>auditStarts),0);assert.deepEqual(errors,[]);
 fs.mkdirSync('qa-out/beta',{recursive:true});fs.writeFileSync('qa-out/beta/commercial-audit.json',JSON.stringify({passed:true,channel:'beta',data:'Fictitious portfolio; mocked native replies; no real account, purchase or cloud writes',checks:['free single property','forged local preferences refused','expired/malformed subscription denied','expired/future/missing/inconsistent trial denied','valid mono trial allowed','trial cannot enable multi','active subscription allowed','verified owner preserved','account isolation','no automatic trial or purchase','portfolio unchanged'],runtimeErrors:errors},null,2));
 console.log('PASS prepared client audit: genuine rights only, 90-day boundaries, no automatic activation/purchase, preserved data');
}finally{await browser?.close();if(server)await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exit(1)});
