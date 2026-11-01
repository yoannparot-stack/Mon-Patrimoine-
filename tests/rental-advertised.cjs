'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const fixture=require('./rental-fixture.cjs'),advertisedFixture=require('./rental-advertised-fixture.cjs');
const code=fs.readFileSync('rental-optimization.js','utf8');
function setup(){const p=fixture().properties[0];p.optimization.references=[];
 const ctx={URL,URLSearchParams,Map,Set,Date,Math,Number,JSON,console,AbortController,setTimeout,clearTimeout,window:{},db:{properties:[p]},immoptimaAuthState:{status:'signed_in',uid:'qa'},ioToday:()=>new Date().toISOString().slice(0,10),ioDate:d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!Number.isNaN(Date.parse(d))?new Date(d+'T00:00:00Z'):null,marketGeocode:async()=>({lat:47.39,lon:.68,city:'Tours',citycode:'37261',postcode:'37000',score:.9}),esc:v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),euro:v=>v+' €',dateFR:v=>v};
 vm.createContext(ctx);vm.runInContext(code,ctx);ctx.p=p;return {p,ctx,run:s=>vm.runInContext(s,ctx)};
}
(async()=>{
 let {p,ctx,run}=setup(),result=await advertisedFixture(p);ctx.window.AndroidBridge={immoptimaRentalCollect:requestId=>ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa',result})};
 const rent=p.rentHC;assert.equal(await run('ioOptCollect(p)'),true);
 assert.equal(run("ioOptObservedRange(p,'meuble').basis"),'CC');assert.equal(run("ioOptObservedRange(p,'meuble').median"),520);
 assert.equal(run("ioOptScenario(p,'meuble').target"),null);assert.equal(run("ioOptScenario(p,'meuble').net"),null);assert.equal(p.rentHC,rent);
 assert.equal(run("ioOptObservedRange(p,'nu').basis"),'HC');assert.equal(run("ioOptScenario(p,'nu').target"),490);
 assert(run("ioOptAdvertisedHtml(p,'meuble')").includes('Charges inconnues'));assert(run("ioOptRangeCaption(ioOptObservedRange(p,'meuble'))").includes('3 références'));
 ctx.p=JSON.parse(JSON.stringify(p));assert.equal(run("ioOptObservedRange(p,'meuble').median"),520,'backup roundtrip keeps CC snapshot');ctx.p=p;
 run("immoptimaAuthState.uid='other'");assert.equal(run("ioOptObservedRange(p,'meuble')"),null);assert.equal(run("ioOptAdvertisedHtml(p,'meuble')"),'');run("immoptimaAuthState.uid='qa'");
 run('p.surface+=1');assert.equal(run("ioOptObservedRange(p,'meuble')"),null);run('p.surface-=1');
 run("p.optimization.collection.expiresAt='2020-01-01'");assert.equal(run("ioOptObservedRange(p,'meuble')"),null);
 for(const mutate of [g=>g.low=999,g=>g.count=99,g=>g.sourceCount=99,g=>g.references[0].communeCode='75056',g=>g.references[0].mode='nu',g=>g.references[0].propertyId=g.references[1].propertyId,g=>g.references[0].distanceM=5000,g=>g.references[0].observedAt='2020-01-01',g=>g.references[0].url='https://user:secret@qa-market.example/x',g=>g.period=['2020-01-01'],g=>g.usableAsHCTarget=true]){
  ({p,ctx,run}=setup());result=await advertisedFixture(p);mutate(result.modes.meuble.advertised.ranges[0]);ctx.window.AndroidBridge={immoptimaRentalCollect:requestId=>ctx.window.immoptimaNativeRentalResult({requestId,uid:'qa',result})};
  assert.equal(await run('ioOptCollect(p)'),false,'malformed/incorrect-segment ranges are rejected atomically');assert(!p.optimization.collection);
 }
 console.log('PASS advertised ranges: real server-to-client contract on synthetic data, CC isolation, HC target, reference links, backup, expiry, owner isolation and malformed/incorrect-segment rejection');
})().catch(e=>{console.error(e);process.exitCode=1});
