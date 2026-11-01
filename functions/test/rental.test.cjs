'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../rental-core.cjs');
const now=Date.parse('2026-11-01T12:00:00Z');
const q={lat:47.39,lon:.68,surface:30,rooms:1,family:'appartement',communeCode:'37261',city:'Tours',postcode:'37000'};
function listing(id,mode='meuble',rent=550){return {id,source:'AD',type:'APARTMENT',features:{geometry:{surface:30,roomCount:1},descriptive:{description:'Location annuelle, bail de 1 an.',equipments:{FURNITURE:mode==='meuble'}}},marketing:{type:'RENT',active:true,priceHC:rent,publicationStartDate:'2026-10-10T12:00:00Z'},address:{city:'Tours',zipCode:'37000',street:'rue des Tests',streetNumber:id,location:{lat:47.39,lon:.68}},ads:[{url:'https://annonces.example/bien/'+id}]}}
test('strict property request; no arbitrary URL, loan, owner or null coordinates',()=>{
 assert.deepEqual(core.validateRequest(q),q);
 for(const x of [{...q,endpoint:'https://elsewhere.example'},{...q,rentHC:500},{...q,lat:null},{...q,rooms:1.5},{...q,surface:0},{...q,postcode:'x'}])assert.throws(()=>core.validateRequest(x),/INVALID_REQUEST/);
 const u=core.providerUrl(q,'meuble',50,now);assert.equal(u.origin,'https://api.yanport.com');assert.equal(u.pathname,'/properties');assert.equal(u.searchParams.get('marketingTypes'),'RENT');assert.equal(u.searchParams.get('furnished'),'true');assert.equal(u.searchParams.get('from'),'50');assert.equal(u.searchParams.get('zipCodes'),'37000');assert.equal(u.searchParams.get('publicationDateMin'),'2026-08-03');
});
test('explicit furnished status, long lease, known HC, recent matching dwelling only',()=>{
 assert.equal(core.normalizeProperty(listing('a'),q,'meuble',now).rentHC,550);
 const cc=listing('cc');delete cc.marketing.priceHC;cc.marketing.priceCC=600;cc.marketing.rentalExpenses=40;
 assert.equal(core.normalizeProperty(cc,q,'meuble',now).rentHC,560);
 delete cc.marketing.rentalExpenses;assert.throws(()=>core.normalizeProperty(cc,q,'meuble',now),/charges_or_hc_unknown/);
 const cases=[x=>delete x.features.descriptive.equipments.FURNITURE,x=>x.features.descriptive.description='Location saisonnière à la nuit',x=>x.features.descriptive.description='Beau logement disponible',x=>x.address.city='Amboise',x=>x.address.location.lat=47.8,x=>x.features.geometry.roomCount=2,x=>x.features.geometry.surface=45,x=>x.marketing.publicationStartDate='2025-10-01',x=>x.marketing.publicationStartDate='2026-12-01',x=>x.marketing.active=false,x=>x.ads=[{url:'javascript:alert(1)'}],x=>{x.marketing.priceCC=800;x.marketing.rentalExpenses=30}];
 for(const mutate of cases){const x=listing('reject');mutate(x);assert.throws(()=>core.normalizeProperty(x,q,'meuble',now))}
});
test('real adapter contract: two modes, HC median, cross-post dedup, outliers, provenance',async()=>{
 const calls=[];const result=await core.collect(q,{token:'server-only',now,fetchImpl:async(u,opts)=>{
  calls.push([u,opts]);const mode=u.searchParams.get('furnished')==='true'?'meuble':'nu';
  const hits=[listing('a',mode,500),listing('b',mode,550),listing('c',mode,600),listing('z',mode,5000)];
  const duplicate=structuredClone(hits[0]);duplicate.id='crosspost';duplicate.ads=[{url:'https://another.example/ad/1'}];hits.push(duplicate);
  return new Response(JSON.stringify({hits,total:hits.length}),{headers:{'Content-Type':'application/json'}});
 }});
 assert.equal(calls.length,2);assert.equal(calls[0][1].headers.Authorization,'Bearer server-only');assert.equal(calls[0][1].redirect,'error');
 for(const mode of ['nu','meuble']){const m=result.modes[mode];assert.equal(m.count,3);assert.equal(m.target,550);assert.equal(m.low,500);assert.equal(m.high,550);assert.equal(m.rejected.duplicate,1);assert.equal(m.rejected.outlier,1);assert.equal(m.references[0].verified,false);assert.equal(m.references[0].provenance,'provider');assert.equal(m.references[0].fingerprint,undefined)}
 assert(!JSON.stringify(result).includes('server-only'));assert.equal(result.expiresAt,'2026-11-02T12:00:00.000Z');
});
test('caps paid calls and pagination; no silent retries or invented success',async()=>{
 let calls=0;const result=await core.collect(q,{token:'x',now,fetchImpl:async u=>{calls++;const mode=u.searchParams.get('furnished')==='true'?'meuble':'nu';return new Response(JSON.stringify({total:1000,hits:Array.from({length:50},(_,i)=>listing(String(Number(u.searchParams.get('from'))+i),mode))}))}});
 assert.equal(calls,core.MAX_CALLS);assert(result.modes.meuble.truncated);
 for(const status of [401,403,429,500])await assert.rejects(core.collect(q,{token:'x',now,fetchImpl:async()=>new Response('',{status})}),/PROVIDER_/);
 await assert.rejects(core.collect(q,{token:'x',now,fetchImpl:async()=>new Response('{"unexpected":true}')}),/PROVIDER_SCHEMA/);
 await assert.rejects(core.collect(q,{token:'x',now,fetchImpl:async()=>{throw Error('secret must not leak')}}),/PROVIDER_UNAVAILABLE/);
 await assert.rejects(core.collect(q,{now}),/NOT_CONFIGURED/);
 assert.equal(core.summarize([core.normalizeProperty(listing('a'),q,'meuble',now)],q).target,null);
});
test('CC-only supplier results reach the descriptive snapshot without entering HC financial references',async()=>{
 const x=await core.collect(q,{token:'test-only',now,fetchImpl:async u=>{
  const mode=u.searchParams.get('furnished')==='true'?'meuble':'nu';
  const hits=[0,1,2].map(i=>{const a=listing('cc-'+i,mode);delete a.marketing.priceHC;a.marketing.priceCC=500+i*20;return a});
  return new Response(JSON.stringify({total:hits.length,hits}));
 }});
 for(const mode of ['nu','meuble']){
  assert.equal(x.modes[mode].target,null);assert.equal(x.modes[mode].references.length,0);
  const range=x.modes[mode].advertised.ranges[0];assert.equal(range.basis,'CC');assert.equal(range.median,520);assert.equal(range.usableAsHCTarget,false);
  assert(range.references.every(r=>r.mode===mode&&r.communeCode==='37261'&&r.propertyId&&r.distanceM===0));
 }
 const bad=listing('bad');bad.marketing.priceCC=500;assert.throws(()=>core.normalizeProperty(bad,q,'meuble',now),/inconsistent_charges/);
});
module.exports={listing,q,now};
