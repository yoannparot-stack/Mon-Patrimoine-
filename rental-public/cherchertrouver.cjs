'use strict';
// Documented API v1 adapter, https://cherchertrouver.immo/api/docs.
// This module runs ONLY on an operator/server. The API key must never enter an APK.
const {compare,canonical,validateQuery,publishedAt}=require('./core.cjs');
const DAY=86400000,ROOT='https://cherchertrouver.immo/api/v1';
const fail=code=>{throw Object.assign(new Error(code),{code})};
const plain=v=>String(v||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&euro;|&#8364;/gi,'€').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[\u00a0\u202f]/g,' ').toLowerCase().replace(/\s+/g,' ').trim();
const money=s=>Number(s.replace(/\s/g,'').replace(',','.'));
const AMOUNT='([0-9]+(?:[ \\u00a0\\u202f][0-9]{3})*(?:[,.][0-9]{1,2})?)\\s*(?:€|euros?)';
function uniqueAmounts(text,pattern){return [...new Set([...text.matchAll(new RegExp(pattern,'g'))].map(m=>money(m[1])).filter(Number.isFinite))]}
function rentEvidence(text){
 const t=plain(text);if(t.length>30000)fail('DESCRIPTION_TOO_LARGE');
 // Multiple conflicting amounts remain unknown; the API's generic `price`
 // is never silently treated as HC and absent charges never become zero.
 const hc=[...new Set([...uniqueAmounts(t,'loyer(?: mensuel)?(?: hors charges| hc)\\s*[:=]?\\s*'+AMOUNT),...uniqueAmounts(t,'loyer(?: mensuel)?(?: de)?\\s*[:=]?\\s*'+AMOUNT+'\\s*(?:hors charges|hc)\\b')])];
 const cc=[...new Set([...uniqueAmounts(t,'loyer(?: mensuel)?(?: charges comprises| cc)\\s*[:=]?\\s*'+AMOUNT),...uniqueAmounts(t,'loyer(?: mensuel)?(?: de)?\\s*[:=]?\\s*'+AMOUNT+'\\s*(?:charges comprises|cc)\\b')])];
 const charges=[...new Set([...uniqueAmounts(t,'(?:charges(?: mensuelles)?|provisions?(?: mensuelles?)? (?:pour|sur) charges)\\s*[:=]?\\s*'+AMOUNT),...uniqueAmounts(t,'dont\\s*'+AMOUNT+'\\s*(?:de )?(?:provisions? (?:pour|sur) )?charges\\b')])];
 // 'Loyer ... dont ... charges' makes the inclusion explicit without guessing.
 if(!cc.length&&charges.length===1&&/dont/.test(t))cc.push(...uniqueAmounts(t,'loyer(?: mensuel)?(?: de)?\\s*[:=]?\\s*'+AMOUNT));
 if(hc.length>1||cc.length>1||charges.length>1)fail('RENT_AMBIGUOUS');
 if(hc.length===1){if(cc.length&&charges.length&&Math.abs(cc[0]-charges[0]-hc[0])>.02)fail('CHARGES_INCONSISTENT');return {rentHC:hc[0],...(cc.length?{rentCC:cc[0]}:{}),...(charges.length?{charges:charges[0]}:{}),basis:'HC explicite'}}
 if(cc.length===1&&charges.length===1&&cc[0]>charges[0])return {rentCC:cc[0],charges:charges[0],basis:'CC moins charges explicites'};
 fail('HC_UNKNOWN');
}
function furnishing(text){
 let t=plain(text);const nu=/\b(?:non[ -]meuble[es]*|location nue|loue vide|appartement vide|maison vide)\b/.test(t);
 t=t.replace(/\bnon[ -]meuble[es]*\b/g,'');const furnished=/\bmeuble[es]*\b/.test(t);
 if(nu&&furnished)fail('FURNISHING_AMBIGUOUS');if(nu)return 'nu';if(furnished)return 'meuble';fail('FURNISHING_UNKNOWN');
}
async function jsonRequest(path,key,{fetchImpl=fetch}={}){
 if(!key||typeof key!=='string'||!key.startsWith('imk_'))fail('API_KEY_REQUIRED');
 let response;try{response=await fetchImpl(ROOT+path,{redirect:'error',headers:{'X-Api-Key':key,Accept:'application/json'},signal:AbortSignal.timeout(15000)})}catch{fail('PROVIDER_UNAVAILABLE')}
 if(!response.ok)fail(response.status===401?'API_KEY_INVALID':response.status===402?'QUOTA_REACHED':response.status===429?'RATE_LIMIT':'PROVIDER_UNAVAILABLE');
 if(!/application\/json/i.test(response.headers.get('content-type')||'')||Number(response.headers.get('content-length'))>2000000)fail('PROVIDER_SCHEMA');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{for(;;){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>2000000)fail('PROVIDER_SCHEMA');chunks.push(Buffer.from(r.value))}}finally{await reader.cancel().catch(()=>{})}
 let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{fail('PROVIDER_SCHEMA')}
 return {body,headers:response.headers};
}
async function probe(key,options={}){
 const {body}=await jsonRequest('/ping',key,options),q=body.quota_mois;
 // Do not turn a free pilot into a paid source when a different key is supplied.
 if(body.ok!==true||body.tier!=='free')fail('FREE_PLAN_REQUIRED');
 if(!q||!Number.isInteger(q.limit)||q.limit<1||q.limit>50||!Number.isInteger(q.remaining)||q.remaining<0||q.remaining>q.limit)fail('QUOTA_SCHEMA');
 return {provider:'cherchertrouver',tier:'free',limit:q.limit,remaining:q.remaining,accessFrom:body.annonces_from||null};
}
function searchPath(q,{now=Date.now(),pageSize=8}={}){
 if(!q||typeof q.city!=='string'||q.city.length<2||q.city.length>120||!/^\d{5}$/.test(q.postcode||''))fail('INVALID_QUERY');
 validateQuery({...q,mode:'nu'});
 const params={transaction:'location',type:q.family==='maison'?'Maison':'Appartement',ville:q.city,cp:q.postcode,surface_min:String(q.surface*.75),surface_max:String(q.surface*1.25),pieces_min:String(q.rooms),fresh:'true',updated_since:new Date(now-2*DAY).toISOString(),sort:'recent',page_size:String(Math.min(8,Math.max(1,Math.floor(pageSize))))};
 return '/annonces?'+new URLSearchParams(params);
}
function mapListing(x,{now=Date.now()}={}){
 if(!x||x.transaction_type!=='location'||x.nature!=null||x.price_to_verify!=null||!['Appartement','Maison'].includes(x.type))fail('NOT_STANDARD_RENTAL');
 const updated=Date.parse(x.updated_at),published=publishedAt(x.published_at);
 if(!Number.isFinite(updated)||updated>now+60000||now-updated>2*DAY)fail('PROVIDER_OBSERVATION_OLD');
 if(!Number.isFinite(published)||published>now||now-published>90*DAY)fail('PUBLICATION_OLD_OR_UNKNOWN');
 if(x.description_truncated!==false||typeof x.description!=='string'||x.description.length>20000)fail('DESCRIPTION_INCOMPLETE');
 const text=plain(x.title+' '+x.description+' '+(x.price_label||''));
 if(/\b(?:saisonnier[es]*|vacances|tourisme|colocation|colocataire|bail mobilite|bail etudiant|9 mois|par nuit|a la nuit|par semaine|courte duree)\b/.test(text))fail('SHORT_TERM_OR_SHARED');
 if(!/loyer mensuel|par mois|\/mois|longue duree|location annuelle|bail (?:de |d.)?(?:un an|1 an|trois ans|3 ans)|residence principale/.test(text))fail('MONTHLY_TERM_UNKNOWN');
 const mode=furnishing(text),rents=rentEvidence(x.description+' '+(x.legal_info||''));
 let url,host;try{url=x.external_url||x.link;host=new URL(url).hostname}catch{fail('SOURCE_URL_UNKNOWN')}
 if(!canonical(url,[host]))fail('SOURCE_URL_UNKNOWN');
 // Only facts needed for the calculation leave the adapter: no description,
 // photo, contacts or advertising text are returned or stored.
 return {sourceId:'ct:'+String(x.source||host).slice(0,100),url,datePublished:x.published_at,observedAt:new Date(now).toISOString(),active:true,transaction:'rent',period:'month',currency:'EUR',mode,lease:'long-term',shared:false,family:x.type==='Maison'?'maison':'appartement',communeCode:x.insee_code,rooms:x.rooms,surface:x.surface,...rents,providerObservedAt:new Date(updated).toISOString(),dedupKey:typeof x.dedup_key==='string'?x.dedup_key:null};
}
async function collect(q,{key,professionalUseConfirmed=false,fetchImpl=fetch,now=Date.now(),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}){
 if(professionalUseConfirmed!==true)fail('PROFESSIONAL_USE_NOT_CONFIRMED');
 searchPath(q,{now});const quota=await probe(key,{fetchImpl});
 // Keep two items of margin: the API blocks even known-ad refreshes at zero.
 const pageSize=Math.min(8,quota.remaining-2);if(pageSize<1)fail('QUOTA_REACHED');
 await wait(1100); // Published limit: one request per second, including /ping.
 const {body,headers}=await jsonRequest(searchPath(q,{now,pageSize}),key,{fetchImpl});
 if(!Array.isArray(body.items)||body.items.length>pageSize||body.degraded===true)fail(body.degraded?'SEARCH_DEGRADED':'PROVIDER_SCHEMA');
 const records=[],registry=new Map(),seenGroups=new Set(),rejected={};
 for(const raw of body.items){try{
  const r=mapListing(raw,{now});if(r.dedupKey&&seenGroups.has(r.dedupKey))fail('PROVIDER_DUPLICATE');if(r.dedupKey)seenGroups.add(r.dedupKey);
  const host=new URL(r.url).hostname;let source=registry.get(r.sourceId);
  if(!source){source={id:r.sourceId,label:'ChercherTrouver · '+String(raw.source||host).slice(0,100),state:'approved',enabled:true,hosts:[],permission:{status:'approved',evidence:'Operator confirms professional API use under provider CGV articles 2–3; minimum factual data, attribution and original links only',reviewedAt:new Date(now).toISOString().slice(0,10)}};registry.set(source.id,source)}
  if(!source.hosts.includes(host))source.hosts.push(host);records.push(r);
 }catch(e){const code=e.code||'MALFORMED_LISTING';rejected[code]=(rejected[code]||0)+1}}
 const sources=[...registry.values()],modes={};for(const mode of ['nu','meuble'])modes[mode]=compare(records.filter(r=>r.mode===mode),sources,{...q,mode},{now});
 const remaining=headers.get('X-Quota-Mois-Remaining');
 return {provider:'cherchertrouver',checkedAt:new Date(now).toISOString(),examined:body.items.length,partial:body.has_more===true,rejected,modes,quota:{...quota,remaining:remaining!==null&&/^\d+$/.test(remaining)?Number(remaining):null},coverage:'Petit échantillon de la commune et du code postal, annonces revues par le fournisseur depuis moins de 48 h. Disponibilité à vérifier. Pas de couverture exhaustive ni de garantie de loyers signés.'};
}
module.exports={probe,searchPath,rentEvidence,furnishing,mapListing,collect};
