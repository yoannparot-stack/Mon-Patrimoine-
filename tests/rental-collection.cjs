const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),fixture=require('./rental-fixture.cjs');
const code=fs.readFileSync('rental-optimization.js','utf8');
function setup(){const p=fixture().properties[0];p.optimization.references=[];const ctx={URL,URLSearchParams,Map,Set,Date,Math,Number,JSON,console,AbortController,setTimeout,clearTimeout,window:{},db:{properties:[p]},immoptimaAuthState:{status:'signed_in',uid:'qa-account'},ioToday:()=>new Date().toISOString().slice(0,10),ioDate:d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')?new Date(d+'T00:00:00Z'):null,marketGeocode:async()=>({lat:47.39,lon:.68,city:'Tours',citycode:'37261',postcode:'37000',score:.9})};vm.createContext(ctx);vm.runInContext(code,ctx);ctx.p=p;return {ctx,p,run:s=>vm.runInContext(s,ctx)}}
function response(p){const mode=md=>({examined:3,rejected:{},period:[new Date().toISOString().slice(0,10)],references:[500,550,600].map((rent,i)=>({id:'yanport:'+md+i,mode:md,source:'Yanport · annonces.example',url:'https://annonces.example/'+md+i,urls:['https://annonces.example/'+md+i],date:new Date().toISOString().slice(0,10),rentHC:rent,surface:p.surface,rooms:1,communeCode:'37261',family:'appartement',distanceM:100,basis:'HC explicite',provenance:'provider',verified:false}))});return {version:1,provider:'yanport',checkedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString(),modes:{nu:mode('nu'),meuble:mode('meuble')}}}
(async()=>{
 let {ctx,p,run}=setup(),sent;
 const data=response(p),before=p.rentHC;
 ctx.window.AndroidBridge={immoptimaRentalCollect:(requestId,q)=>{sent=JSON.parse(q);ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa-account',result:data})}};
 assert.equal(await run('ioOptCollect(p)'),true);assert.deepEqual(Object.keys(sent).sort(),['lat','lon','surface','rooms','family','communeCode','city','postcode'].sort());
 assert.equal(run("ioOptEvidence(p,'meuble').target"),550);assert.equal(run("ioOptEvidence(p,'nu').count"),3);assert.equal(p.rentHC,before);assert.equal(p.optimization.references.length,0);
 ctx.p=JSON.parse(JSON.stringify(p));assert.equal(run("ioOptEvidence(p,'meuble').target"),550,'whole backup round-trip keeps automatic references');ctx.p=p;
 const old=JSON.stringify(p.optimization.collection);
 ctx.window.AndroidBridge.immoptimaRentalCollect=(requestId)=>ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa-account',result:{code:'NOT_CONFIGURED'}});
 assert.equal(await run('ioOptCollect(p)'),false);assert.equal(JSON.stringify(p.optimization.collection),old,'failure retains prior result without refreshing date');assert(p.optimization.collectionError.message.includes('non activée'));
 run('p.surface+=1');assert.equal(run("ioOptEvidence(p,'meuble').target"),null);run('p.surface-=1');
 run("immoptimaAuthState.uid='different'");assert.equal(run("ioOptEvidence(p,'meuble').target"),null);run("immoptimaAuthState.uid='qa-account'");
 run("p.optimization.collection.expiresAt='2020-01-01'");assert.equal(run("ioOptEvidence(p,'meuble').target"),null);
 ({ctx,p,run}=setup());ctx.window.AndroidBridge={immoptimaRentalCollect:(requestId)=>{ctx.immoptimaAuthState.uid='another';ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa-account',result:response(p)})}};
 assert.equal(await run('ioOptCollect(p)'),false);assert(!p.optimization.collection,'account switch discards response');assert(!p.optimization.collectionError,'old-account callback cannot write into new account');
 ({ctx,p,run}=setup());ctx.window.AndroidBridge={immoptimaRentalCollect:(requestId)=>{const x=response(p);x.modes.meuble.references[0].communeCode='75056';ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa-account',result:x})}};
 assert.equal(await run('ioOptCollect(p)'),false);assert(!p.optimization.collection,'wrong segment rejects whole response atomically');
 ({ctx,p,run}=setup());ctx.window.AndroidBridge={immoptimaRentalCollect:(requestId)=>{const x=response(p);x.modes.nu.examined='<img src=x>';ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa-account',result:x})}};
 assert.equal(await run('ioOptCollect(p)'),false);assert(!p.optimization.collection,'malformed response is rejected');
 ({ctx,p,run}=setup());assert.equal(await run('ioOptCollect(p)'),false);assert(p.optimization.collectionError.message.includes('Android'));
 console.log('PASS automatic collection client: native callback, privacy, both targets, backup, failure retention, expiry, characteristics, account switch, schema and wrong segment rejection');
})().catch(e=>{console.error(e);process.exitCode=1});
