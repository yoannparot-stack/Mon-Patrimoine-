'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),api=require('../cherchertrouver.cjs');
const now=Date.parse('2026-11-01T12:00:00Z'),key='imk_synthetic_test_only',q={city:'Tours',postcode:'37000',communeCode:'37261',surface:30,rooms:1,family:'appartement'};
const json=(x,headers={})=>new Response(JSON.stringify(x),{headers:{'content-type':'application/json',...headers}});
const ping=(remaining=50)=>({ok:true,tier:'free',annonces_from:'2026-10-01',quota_mois:{limit:50,remaining}});
function listing(i,mode='meuble'){
 const rent=500+i*50;return {source:'agency-test',reference:String(i),title:'Studio '+(mode==='nu'?'non meublé':'meublé'),type:'Appartement',transaction_type:'location',nature:null,price:rent+40,price_to_verify:null,surface:30,rooms:1,insee_code:'37261',description_truncated:false,description:'Location annuelle. Loyer mensuel : '+(rent+40)+' € charges comprises dont 40 € de provisions pour charges.',external_url:'https://agency.example/annonce/'+i,published_at:'2026-10-30T12:00:00+01:00',updated_at:'2026-11-01T09:00:00+01:00',dedup_key:'property-'+i};
}
test('HC/CC evidence parser handles French amounts, included charges and explicit zero without inventing charges',()=>{
 assert.equal(api.rentEvidence('Loyer mensuel hors charges : 1 050,50 €').rentHC,1050.5);
 assert.equal(api.rentEvidence('Loyer : 550 € HC').rentHC,550);
 assert.deepEqual(api.rentEvidence('Loyer mensuel : 600 € charges comprises dont 40 € de provisions sur charges.'),{rentCC:600,charges:40,basis:'CC moins charges explicites'});
 assert.deepEqual(api.rentEvidence('Loyer de 580 € dont 30 € de charges.'),{rentCC:580,charges:30,basis:'CC moins charges explicites'});
 assert.equal(api.rentEvidence('Loyer CC : 550 € charges mensuelles : 0 €').charges,0);
 for(const text of ['550 € par mois','Loyer 550 € charges comprises','Charges annuelles 1200 €','Loyer HC : 500 € puis loyer HC : 700 €','Loyer HC : 500 € Loyer CC : 900 € charges : 40 €'])assert.throws(()=>api.rentEvidence(text));
});
test('furnished and bare are explicit; negation and ambiguity do not become a furnished premium',()=>{
 assert.equal(api.furnishing('Studio non meublé'),'nu');assert.equal(api.furnishing('Location nue'),'nu');assert.equal(api.furnishing('Studio meublé'),'meuble');
 assert.throws(()=>api.furnishing('Studio avec cuisine équipée'));assert.throws(()=>api.furnishing('Meublé en titre, non meublé dans le texte'));
});
test('CC-only evidence is opt-in, does not invent HC and does not relax contradictory data',()=>{
 assert.throws(()=>api.rentEvidence('Loyer mensuel : 550 € charges comprises'),/HC_UNKNOWN/);
 assert.deepEqual(api.rentEvidence('Loyer mensuel : 550 € charges comprises',{allowCCOnly:true}),{rentCC:550,basis:'CC explicite',chargesScope:'unknown'});
 assert.equal(api.rentEvidence('Loyer CC : 550 €. Tout inclus.',{allowCCOnly:true}).chargesScope,'all-inclusive');
 for(const text of ['550 € par mois','Loyer CC : 550 € ou loyer CC : 650 €','Loyer HC : 500 € Loyer CC : 900 € charges : 40 €'])assert.throws(()=>api.rentEvidence(text,{allowCCOnly:true}));
});
test('provider CC-only advertisements yield a separate first-opinion range, never an HC target',async()=>{
 const items=[0,1,2].map(i=>({...listing(i),description:'Location annuelle. Loyer mensuel : '+(500+i*20)+' € charges comprises.'}));
 const x=await api.collect(q,{key,professionalUseConfirmed:true,now,wait:async()=>{},fetchImpl:async url=>url.endsWith('/ping')?json(ping()):json({items,has_more:false})});
 assert.equal(x.modes.meuble.target,null);assert.equal(x.modes.meuble.count,0);
 const g=x.modes.meuble.advertised.ranges[0];assert.equal(g.basis,'CC');assert.equal(g.median,520);assert.equal(g.usableAsHCTarget,false);
 assert.equal(x.modes.nu.advertised.status,'insufficient');assert(!JSON.stringify(x).includes('Location annuelle'));
});
test('documented filtered search, small sample and no unsupported furnished/source filter',()=>{
 const u=new URL('https://cherchertrouver.immo/api/v1'+api.searchPath(q,{now,pageSize:200}));
 assert.equal(u.searchParams.get('transaction'),'location');assert.equal(u.searchParams.get('ville'),'Tours');assert.equal(u.searchParams.get('page_size'),'8');assert.equal(u.searchParams.get('fresh'),'true');assert.equal(u.searchParams.get('updated_since'),'2026-10-30T12:00:00.000Z');assert(!u.searchParams.has('furnished'));assert(!u.searchParams.has('sources'));
 assert.throws(()=>api.searchPath({...q,city:''},{now}),/INVALID_QUERY/);
});
test('free API gate: zero cost ping, no network without key/professional confirmation, no paid tier accepted',async()=>{
 let calls=0;const fetchImpl=async()=>{calls++;return json(ping())};
 await assert.rejects(api.collect(q,{key,fetchImpl}),/PROFESSIONAL_USE_NOT_CONFIRMED/);assert.equal(calls,0);
 await assert.rejects(api.probe('',{fetchImpl}),/API_KEY_REQUIRED/);assert.equal(calls,0);
 const out=await api.probe(key,{fetchImpl});assert.equal(out.remaining,50);assert(!JSON.stringify(out).includes(key));
 await assert.rejects(api.probe(key,{fetchImpl:async()=>json({...ping(),tier:'paid'})}),/FREE_PLAN_REQUIRED/);
 await assert.rejects(api.collect(q,{key,professionalUseConfirmed:true,fetchImpl:async()=>json(ping(2))}),/QUOTA_REACHED/);
});
test('actual adapter contract chain: one small page for both modes, HC targets, dedup and separate publisher timestamp',async()=>{
 const calls=[];const records=[...Array.from({length:3},(_,i)=>listing(i)),...Array.from({length:3},(_,i)=>listing(i+3,'nu'))];
 records.push({...records[0],external_url:'https://agency.example/repost'});
 const out=await api.collect(q,{key,professionalUseConfirmed:true,now,wait:async ms=>assert(ms>=1000),fetchImpl:async(url,opts)=>{calls.push(url);assert.equal(opts.headers['X-Api-Key'],key);assert.equal(opts.redirect,'error');return url.endsWith('/ping')?json(ping()):json({items:records,has_more:true},{'X-Quota-Mois-Remaining':'43'})}});
 assert.equal(calls.length,2);assert(calls[0].endsWith('/ping'));assert.equal(out.modes.meuble.target,550);assert.equal(out.modes.nu.target,700);assert.equal(out.rejected.PROVIDER_DUPLICATE,1);assert.equal(out.quota.remaining,43);assert(out.partial);assert.equal(out.modes.meuble.references[0].providerObservedAt,'2026-11-01T08:00:00.000Z');
 const returned=JSON.stringify(out);for(const sensitive of [key,'Location annuelle','description','seller_contact','images'])assert(!returned.includes(sensitive));
 assert.equal(api.mapListing(listing(0),{now}).providerObservedAt,'2026-11-01T08:00:00.000Z');
});
test('stale, ambiguous, seasonal, truncated and wrong-segment listings are rejected',()=>{
 for(const change of [{updated_at:'2026-10-20'},{published_at:'2025-01-01'},{nature:'saisonnier'},{price_to_verify:{}},{transaction_type:'vente'},{description_truncated:true},{description:'Loyer mensuel : 550 € charges comprises'},{description:'Loyer mensuel : 550 € HC. Bail mobilité.'}])assert.throws(()=>api.mapListing({...listing(0),...change},{now}),JSON.stringify(change));
});
test('quota, invalid key, rate limit, malformed and degraded replies never trigger retry/pagination or payment',async()=>{
 for(const [status,code] of [[401,'API_KEY_INVALID'],[402,'QUOTA_REACHED'],[429,'RATE_LIMIT'],[503,'PROVIDER_UNAVAILABLE']])await assert.rejects(api.probe(key,{fetchImpl:async()=>new Response('',{status})}),new RegExp(code));
 let calls=0;await assert.rejects(api.collect(q,{key,professionalUseConfirmed:true,now,wait:async()=>{},fetchImpl:async url=>{calls++;return url.endsWith('/ping')?json(ping()):json({items:[],degraded:true})}}),/SEARCH_DEGRADED/);assert.equal(calls,2);
});
