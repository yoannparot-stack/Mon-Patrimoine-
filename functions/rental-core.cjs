'use strict';
// Adapter based on yanport/yanport-api-doc: /properties, Property, Marketing,
// Features, Address and AdRef. Never infer HC from an ambiguous `price`.
const {createHash}=require('node:crypto');
const {summarizeAdvertisedGroups}=require('./advertised-ranges.cjs');
const DAY=86400000, PAGE=50, MAX_PAGES=2;
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
const median=a=>{a=[...a].sort((x,y)=>x-y);return a.length?(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2:null};
const round=v=>Math.round(v/5)*5;
function fail(code){const e=new Error(code);e.code=code;throw e}
function validateRequest(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).some(k=>!['lat','lon','surface','rooms','family','communeCode','city','postcode'].includes(k)))fail('INVALID_REQUEST');
 if(num(x.lat)===null||x.lat< -90||x.lat>90||num(x.lon)===null||x.lon< -180||x.lon>180||num(x.surface)===null||x.surface<9||x.surface>1000||!Number.isInteger(x.rooms)||x.rooms<1||x.rooms>20||!['appartement','maison'].includes(x.family)||!/^\d[A-Za-z\d]{4}$/.test(x.communeCode||'')||!/^\d{5}$/.test(x.postcode||'')||typeof x.city!=='string'||x.city.length<2||x.city.length>120)fail('INVALID_REQUEST');
 return {...x,city:x.city.trim()};
}
function requestKey(q){return createHash('sha256').update(JSON.stringify([q.lat,q.lon,q.surface,q.rooms,q.family,q.communeCode,norm(q.city),q.postcode])).digest('hex')}
function safeUrl(v){try{const u=new URL(v);if(String(v).length>500||u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||!u.hostname.includes('.')||/^[\d.]+$/.test(u.hostname))return '';u.hash='';for(const k of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(k))u.searchParams.delete(k);return u.href.length<=500?u.href:''}catch{return ''}}
function distance(a,b){const rad=Math.PI/180,dlat=(a.lat-b.lat)*rad,dlon=(a.lon-b.lon)*rad;return 6371000*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2)))}
function providerUrl(q,mode,offset,now){
 const u=new URL('https://api.yanport.com/properties');
 const p={source:'AD',active:'true',marketingTypes:'RENT',propertyTypes:q.family==='maison'?'HOUSE':'APARTMENT',furnished:String(mode==='meuble'),zipCodes:q.postcode,surfaceMin:String(q.surface*.75),surfaceMax:String(q.surface*1.25),roomCounts:String(q.rooms),publicationDateMin:new Date(now-90*DAY).toISOString().slice(0,10),sort:`address.location:geo:${q.lat}:${q.lon}`,from:String(offset),size:String(PAGE)};
 u.search=new URLSearchParams(p).toString();return u;
}
function normalizeProperty(x,q,mode,now,{allowCCOnly=false}={}){
 const m=x.marketing||{},g=x.features?.geometry||{},d=x.features?.descriptive||{},a=x.address||{},f=d.equipments?.FURNITURE;
 if(x.source!=='AD'||m.type!=='RENT'||m.active!==true)fail('inactive_or_not_rental');
 if(x.type!==(q.family==='maison'?'HOUSE':'APARTMENT')||f!==(mode==='meuble'))fail('type_or_furniture_unknown');
 const text=String(d.description||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/saisonnier|vacances|touris|courte duree|par nuit|a la nuit|par semaine|colocation|colocataire|bail mobilite|bail etudiant|9 mois/.test(text))fail('short_term_or_shared');
 if(!/longue duree|location annuelle|a l.annee|bail (?:de )?(?:un an|1 an|trois ans|3 ans)|loi (?:du )?(?:6 juillet )?1989/.test(text))fail('lease_duration_unknown');
 if(norm(a.city)!==norm(q.city)||a.zipCode!==q.postcode||!a.location||num(a.location.lat)===null||num(a.location.lon)===null||Math.abs(a.location.lat)>90||Math.abs(a.location.lon)>180)fail('localisation_unknown_or_other_city');
 const dist=distance(q,a.location);if(dist>3000)fail('outside_radius');
 if(num(g.surface)===null||g.surface<q.surface*.75||g.surface>q.surface*1.25||g.roomCount!==q.rooms)fail('size_or_rooms');
 const stamp=Date.parse(m.publicationStartDate),date=Number.isFinite(stamp)?new Date(stamp).toISOString().slice(0,10):'';
 if(!date||stamp>now+DAY||now-stamp>90*DAY)fail('date_unknown_or_old');
 let hc=num(m.priceHC),basis='HC explicite';
 if(hc===null&&num(m.priceCC)!==null&&num(m.rentalExpenses)!==null&&m.rentalExpenses>=0){hc=m.priceCC-m.rentalExpenses;basis='CC moins charges explicites'}
 const cc=num(m.priceCC),expenses=num(m.rentalExpenses);
 if(expenses!==null&&expenses<0||cc!==null&&(cc<=0||cc>20000)||hc!==null&&(hc<=0||hc>20000))fail('inconsistent_charges');
 if(hc===null&&(!allowCCOnly||cc===null))fail('charges_or_hc_unknown');
 if(cc!==null&&hc!==null&&hc>cc||cc!==null&&expenses!==null&&expenses>=cc)fail('inconsistent_charges');
 if(cc!==null&&expenses!==null&&hc!==null&&Math.abs(cc-expenses-hc)>.02)fail('inconsistent_charges');
 const urls=[...new Set((Array.isArray(x.ads)?x.ads.slice(0,20):[]).map(v=>safeUrl(v.url)).filter(Boolean))].sort();
 if(!urls.length||typeof x.id!=='string'||!x.id||x.id.length>100)fail('source_unknown');
 const address=a.street&&a.streetNumber?norm(a.streetNumber+' '+a.street):`${Math.round(a.location.lat*5000)},${Math.round(a.location.lon*5000)}`;
 const fingerprint=createHash('sha256').update([norm(a.city),address,g.roomCount,Math.round(g.surface*2),hc===null?'CC':'HC',round(hc??cc)].join('|')).digest('hex');
 return {id:'yanport:'+x.id,aggregateId:String(x.aggregatePropertyId||x.id),fingerprint,mode,source:'Yanport · '+new URL(urls[0]).hostname,url:urls[0],urls,date,...(hc!==null?{rentHC:hc}:{}),...(cc!==null?{rentCC:cc}:{}),chargesScope:/tout (?:compris|inclus)/.test(text)?'all-inclusive':'unknown',surface:g.surface,rooms:g.roomCount,communeCode:q.communeCode,family:q.family,distanceM:Math.round(dist),basis:hc===null?'CC explicite':basis,provenance:'provider',verified:false};
}
function advertised(rows,q,mode,now){
 const groups=new Map();
 for(const r of rows){const offers=[];if(num(r.rentHC)!==null)offers.push({basis:'HC',bundle:'excluding-charges',amount:r.rentHC});if(num(r.rentCC)!==null)offers.push({basis:'CC',bundle:r.chargesScope,amount:r.rentCC});
  for(const offer of offers){const key=offer.basis+':'+offer.bundle;if(!groups.has(key))groups.set(key,{...offer,rows:[]});groups.get(key).rows.push({url:r.url,source:r.source,sourceId:'yanport',propertyId:r.aggregateId,domain:new URL(r.url).hostname.replace(/^www\./,''),mode:r.mode,family:r.family,communeCode:r.communeCode,rooms:r.rooms,distanceM:r.distanceM,surface:r.surface,amount:offer.amount,perM2:offer.amount/r.surface,datePublished:r.date,observedAt:new Date(now).toISOString()});}
 }
 const ranges=summarizeAdvertisedGroups([...groups.values()],q.surface);
 return {checkedAt:new Date(now).toISOString(),mode,examined:rows.length,status:ranges.some(g=>g.status==='indicative')?'indicative':'insufficient',ranges,countsNotAdditive:true};
}
function summarize(rows,q){
 if(rows.length<3)return {target:null,low:null,high:null,count:rows.length,confidence:'insufficient'};
 const pp=rows.map(r=>r.rentHC/r.surface).sort((a,b)=>a-b),at=p=>pp[Math.floor((pp.length-1)*p)];
 return {target:round(median(pp)*q.surface),low:round(at(.25)*q.surface),high:round(at(.75)*q.surface),count:rows.length,confidence:rows.length>=10?'supported':'limited'};
}
async function collect(q,{token,fetchImpl=fetch,now=Date.now()}={}){
 validateRequest(q);if(!token)fail('NOT_CONFIGURED');
 const result={version:1,provider:'yanport',requestKey:requestKey(q),checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+DAY).toISOString(),radiusM:3000,maxAgeDays:90,modes:{},disclaimer:'Loyers annoncés HC, pas loyers signés. Couverture fournisseur limitée ; échantillon non exhaustif.'};
 for(const mode of ['nu','meuble']){
  let raw=[],truncated=false;
  for(let page=0;page<MAX_PAGES;page++){
   let r;try{r=await fetchImpl(providerUrl(q,mode,page*PAGE,now),{headers:{Authorization:'Bearer '+token,Accept:'application/json'},redirect:'error',signal:AbortSignal.timeout(12000)})}catch{fail('PROVIDER_UNAVAILABLE')}
   if(!r.ok)fail(r.status===429?'PROVIDER_RATE_LIMIT':r.status===401||r.status===403?'PROVIDER_AUTH':'PROVIDER_UNAVAILABLE');
   if(Number(r.headers?.get('content-length'))>2000000)fail('PROVIDER_SCHEMA');
   const reader=r.body?.getReader();let text='';
   if(reader){let size=0;const decoder=new TextDecoder();for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2000000){await reader.cancel();fail('PROVIDER_SCHEMA')}text+=decoder.decode(value,{stream:true})}text+=decoder.decode()}else text=await r.text();
   let body;try{body=JSON.parse(text)}catch{fail('PROVIDER_SCHEMA')}
   if(!Array.isArray(body.hits)||body.hits.length>PAGE||!Number.isFinite(body.total)||body.total<0)fail('PROVIDER_SCHEMA');
   raw.push(...body.hits);truncated=body.total>raw.length;
   if(!truncated||!body.hits.length)break;
  }
  const rejected={},seen=new Set(),rows=[];
  for(const x of raw){try{const r=normalizeProperty(x,q,mode,now,{allowCCOnly:true}),keys=[r.id,'aggregate:'+r.aggregateId,'fingerprint:'+r.fingerprint,...r.urls];const duplicate=keys.some(k=>seen.has(k));keys.forEach(k=>seen.add(k));if(duplicate)fail('duplicate');rows.push(r)}catch(e){const k=e.code||'malformed';rejected[k]=(rejected[k]||0)+1}}
  const hcRows=rows.filter(r=>num(r.rentHC)!==null),center=median(hcRows.map(r=>r.rentHC/r.surface)),mad=median(hcRows.map(r=>Math.abs(r.rentHC/r.surface-center))),threshold=Math.max(center*.3,3*(mad||0));
  const retained=hcRows.filter(r=>Math.abs(r.rentHC/r.surface-center)<=threshold);if(hcRows.length!==retained.length)rejected.outlier=hcRows.length-retained.length;
  result.modes[mode]={...summarize(retained,q),advertised:advertised(rows,q,mode,now),references:retained.map(({fingerprint,aggregateId,...r})=>({...r,urls:r.urls.slice(0,2)})),examined:raw.length,rejected,truncated,period:retained.length?[...retained.map(r=>r.date)].sort().filter((_,i,a)=>i===0||i===a.length-1):[]};
 }
 return result;
}
module.exports={validateRequest,requestKey,providerUrl,normalizeProperty,summarize,collect,MAX_CALLS:2*MAX_PAGES};
