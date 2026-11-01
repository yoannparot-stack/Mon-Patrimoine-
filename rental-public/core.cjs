'use strict';
const {DOMParser}=require('@xmldom/xmldom');
const {createHash}=require('node:crypto');
const DAY=86400000,MAX_BYTES=2000000,MAX_ITEMS=1000;
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const digest=v=>createHash('sha256').update(v).digest('hex');
const error=code=>{throw Object.assign(new Error(code),{code})};
const finite=v=>typeof v==='number'&&Number.isFinite(v);
function canonical(v,hosts){
 let u;try{u=new URL(v)}catch{return ''}
 if(u.protocol!=='https:'||u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.includes(':')||/^[\d.]+$/.test(u.hostname)||u.username||u.password||u.port||u.href.length>1500||!hosts.includes(u.hostname))return '';
 u.hash='';for(const k of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(k))u.searchParams.delete(k);u.searchParams.sort();return u.href;
}
function publishedAt(v){
 const s=normalize(v),iso=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:t\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:z|[+-]\d{2}:\d{2}))?$/);
 if(iso){const [y,m,d]=iso.slice(1).map(Number),t=Date.UTC(y,m-1,d),x=new Date(t);return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d?(s.includes('t')?Date.parse(String(v)):t):NaN}
 if(/^\d{4}-/.test(s))return NaN;const t=Date.parse(String(v));return Number.isFinite(t)?t:NaN;
}
function parseFeed(xml){
 if(typeof xml!=='string'||Buffer.byteLength(xml)>MAX_BYTES||/<!\s*(?:DOCTYPE|ENTITY)/i.test(xml))error('UNSAFE_OR_LARGE_XML');
 let broken=false;const doc=new DOMParser({onError:()=>{broken=true}}).parseFromString(xml,'application/xml');
 if(broken||!doc?.documentElement||doc.documentElement.localName!=='rss')error('INVALID_RSS');
 const channels=[...doc.documentElement.childNodes].filter(x=>x.nodeType===1&&x.localName==='channel');
 if(channels.length!==1)error('INVALID_RSS');
 const items=[...channels[0].childNodes].filter(x=>x.nodeType===1&&x.localName==='item');if(items.length>MAX_ITEMS)error('TOO_MANY_ITEMS');
 return items.map(item=>{const take=name=>[...item.childNodes].find(x=>x.nodeType===1&&x.localName===name)?.textContent||'';return {title:take('title').slice(0,500),url:take('link').trim(),datePublished:take('pubDate'),text:take('description').slice(0,20000)}});
}
// This inspection never turns a fetched-at timestamp into a publication date,
// and never logs descriptions, contacts or full advertisement payloads.
function inspectFeed(xml,now=Date.now()){
 const rows=parseFeed(xml);let recent=0,rental=0,recentRental=0,invalidDate=0;const dates=[];
 for(const r of rows){const stamp=publishedAt(r.datePublished),isRecent=Number.isFinite(stamp)&&stamp<=now&&now-stamp<=90*DAY;
  if(!Number.isFinite(stamp))invalidDate++;else dates.push(new Date(stamp).toISOString().slice(0,10));
  const title=normalize(r.title),body=normalize(r.text),isRental=/\b(?:location|a louer|louer)\b/.test(title)&&/\b(?:appartement|appartements|studio|studios|maison|maisons|logement|villa)\b/.test(title+' '+body)&&!/\b(?:achat|a vendre|vente|rencontre|coquine?|chiot|offre de pret)\b/.test(title);
  if(isRecent)recent++;if(isRental)rental++;if(isRecent&&isRental)recentRental++;
 }
 dates.sort();return {items:rows.length,recentItems:recent,rentalItems:rental,recentRentalItems:recentRental,invalidDates:invalidDate,publicationPeriod:dates.length?[dates[0],dates.at(-1)]:[]};
}
function robotsAllowed(text,url,agent='ImmOptimaRental'){
 if(typeof text!=='string'||Buffer.byteLength(text)>512000)error('ROBOTS_INVALID');
 const groups=[];let current=null,hasRule=false;
 for(const raw of text.split(/\r\n|\n|\r/)){
  const m=raw.replace(/#.*/,'').match(/^\s*([a-z-]+)\s*:\s*(.*?)\s*$/i);if(!m)continue;
  const key=m[1].toLowerCase(),v=m[2];
  if(key==='user-agent'){if(!current||hasRule){current={agents:[],rules:[]};groups.push(current);hasRule=false}current.agents.push(v.toLowerCase())}
  else if(current&&['allow','disallow'].includes(key)){hasRule=true;if(v)current.rules.push({allow:key==='allow',pattern:v})}
 }
 let selected=groups.filter(g=>g.agents.includes(agent.toLowerCase()));if(!selected.length)selected=groups.filter(g=>g.agents.includes('*'));
 const u=new URL(url),path=u.pathname+u.search,matches=[];
 for(const g of selected)for(const r of g.rules){
  if(!r.pattern.startsWith('/'))continue;
  const end=r.pattern.endsWith('$'),p=end?r.pattern.slice(0,-1):r.pattern;
  const regex='^'+p.split('*').map(x=>x.replace(/[.+?^${}()|[\]\\]/g,'\\$&')).join('.*')+(end?'$':'');
  if(new RegExp(regex).test(path))matches.push({...r,specificity:Buffer.byteLength(p.replace(/\*/g,''))});
 }
 matches.sort((a,b)=>b.specificity-a.specificity||Number(b.allow)-Number(a.allow));return !matches.length||matches[0].allow;
}
async function readPublic(url,{fetchImpl=fetch,maxBytes=MAX_BYTES,json=false}={}){
 const response=await fetchImpl(url,{redirect:'error',headers:{'User-Agent':'ImmOptimaRental/1.0 (public rental feed quality assessment)','Accept':json?'application/json':'application/rss+xml,application/xml,text/xml,text/plain'},signal:AbortSignal.timeout(15000)});
 if(response.status!==200)error('HTTP_'+response.status);
 if(Number(response.headers.get('content-length'))>maxBytes)error('RESPONSE_TOO_LARGE');
 const type=response.headers.get('content-type')||'';if(!(json?/application\/json/i.test(type):/xml|text\/plain/i.test(type)))error('CONTENT_TYPE');
 const reader=response.body.getReader();let size=0,chunks=[];
 try{for(;;){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>maxBytes)error('RESPONSE_TOO_LARGE');chunks.push(r.value)}}finally{await reader.cancel().catch(()=>{})}
 const bytes=Buffer.concat(chunks.map(x=>Buffer.from(x))),head=bytes.subarray(0,180).toString('ascii'),charset=(type.match(/charset\s*=\s*["']?([^;"'\s]+)/i)?.[1]||head.match(/encoding=["']([^"']+)/i)?.[1]||'utf-8').toLowerCase();
 if(!['utf-8','utf8','iso-8859-1','windows-1252'].includes(charset))error('CHARSET');
 return new TextDecoder(charset).decode(bytes);
}
async function inspectSource(source,{fetchImpl=fetch,now=Date.now()}={}){
 const base={id:source.id,label:source.label,checkedAt:new Date(now).toISOString(),clientEnabled:source.enabled===true};
 if(source.assessmentAllowed!==true||!source.feedUrl||!canonical(source.feedUrl,source.hosts||[]))return {...base,status:'not_fetched',reason:source.reason};
 try{
  const robots=await readPublic(new URL('/robots.txt',source.feedUrl).href,{fetchImpl,maxBytes:512000});
  if(!robotsAllowed(robots,source.feedUrl))return {...base,status:'robots_disallowed'};
  const text=await readPublic(source.feedUrl,{fetchImpl}),stats=inspectFeed(text,now);
  return {...base,status:stats.recentRentalItems?'candidate_requires_validation':'no_recent_rentals',...stats};
 }catch(e){return {...base,status:'unavailable',reason:/^[A-Z_0-9]+$/.test(e.code||'')?e.code:'NETWORK_OR_PARSE_ERROR'}}
}
function validateQuery(q){
 if(!q||!['nu','meuble'].includes(q.mode)||!finite(q.surface)||q.surface<9||q.surface>1000||!Number.isInteger(q.rooms)||q.rooms<1||q.rooms>20||!['appartement','maison'].includes(q.family)||!/^\d[A-Z\d]{4}$/.test(q.communeCode||''))error('INVALID_QUERY');return q;
}
function normalizeComparable(x,source,q,now){
 if(!x||source.state!=='approved'||source.enabled!==true||source.permission?.status!=='approved'||!source.permission.evidence||!Number.isFinite(publishedAt(source.permission.reviewedAt)))error('SOURCE_NOT_APPROVED');
 const url=canonical(x.url,source.hosts||[]);if(!url)error('INVALID_URL');
 if(x.active!==true||x.transaction!=='rent'||x.period!=='month'||x.currency!=='EUR')error('NOT_MONTHLY_ACTIVE_RENTAL');
 if(x.mode!==q.mode||x.lease!=='long-term'||x.shared!==false||x.family!==q.family)error('MODE_OR_LEASE_UNKNOWN');
 if(x.communeCode!==q.communeCode||x.rooms!==q.rooms||!finite(x.surface)||x.surface<q.surface*.75||x.surface>q.surface*1.25)error('NOT_COMPARABLE');
 const stamp=publishedAt(x.datePublished),observed=Date.parse(x.observedAt);if(!Number.isFinite(stamp)||stamp>now||now-stamp>90*DAY)error('OLD_OR_UNKNOWN_PUBLICATION');
 if(!Number.isFinite(observed)||observed>now+60000||now-observed>DAY)error('OBSERVATION_NOT_CURRENT');
 let hc=finite(x.rentHC)?x.rentHC:null,basis='HC explicite';
 if(hc===null&&finite(x.rentCC)&&finite(x.charges)&&x.charges>=0){hc=x.rentCC-x.charges;basis='CC moins charges explicites'}
 if(hc===null||hc<=0||hc>20000)error('HC_UNKNOWN');
 if(finite(x.rentCC)&&finite(x.charges)&&(x.charges<0||Math.abs(x.rentCC-x.charges-hc)>.02))error('CHARGES_INCONSISTENT');
 // Conservative fallback merges identical rent/surface/room/commune profiles.
 // It may undercount separate dwellings; it never claims verified uniqueness.
 const fingerprint=digest(JSON.stringify([q.mode,q.communeCode,x.rooms,Math.round(x.surface*2),Math.round(hc/5)]));
 return {sourceId:source.id,source:source.label,url,mode:x.mode,family:x.family,communeCode:x.communeCode,rooms:x.rooms,surface:x.surface,rentHC:Math.round(hc*100)/100,basis,datePublished:new Date(stamp).toISOString().slice(0,10),observedAt:new Date(observed).toISOString(),fingerprint};
}
function compare(records,sources,q,{now=Date.now()}={}){
 validateQuery(q);if(!Array.isArray(records)||records.length>1000)error('TOO_MANY_RECORDS');
 const registry=new Map(sources.map(s=>[s.id,s])),seen=new Set(),rejected={},rows=[];
 for(const x of records){try{const source=registry.get(x?.sourceId);if(!source)error('UNKNOWN_SOURCE');const r=normalizeComparable(x,source,q,now),keys=[r.url,r.fingerprint],duplicate=keys.some(k=>seen.has(k));keys.forEach(k=>seen.add(k));if(duplicate)error('DUPLICATE');rows.push(r)}catch(e){const reason=e.code||'INVALID_RECORD';rejected[reason]=(rejected[reason]||0)+1}}
 const median=values=>{const a=[...values].sort((a,b)=>a-b),i=Math.floor(a.length/2);return a.length?a.length%2?a[i]:(a[i-1]+a[i])/2:null};
 const center=median(rows.map(r=>r.rentHC/r.surface)),mad=median(rows.map(r=>Math.abs(r.rentHC/r.surface-center))),threshold=Math.max((center||0)*.3,3*(mad||0));
 const retained=rows.filter(r=>Math.abs(r.rentHC/r.surface-center)<=threshold);if(rows.length!==retained.length)rejected.OUTLIER=rows.length-retained.length;
 const pp=retained.map(r=>r.rentHC/r.surface).sort((a,b)=>a-b),enough=pp.length>=3,round=v=>Math.round(v/5)*5;
 return {checkedAt:new Date(now).toISOString(),status:enough?'indicative':'insufficient',count:retained.length,sourceCount:new Set(retained.map(r=>r.sourceId)).size,target:enough?round(median(pp)*q.surface):null,low:enough?round(pp[0]*q.surface):null,high:enough?round(pp.at(-1)*q.surface):null,rejected,references:retained.map(({fingerprint,...r})=>r),locationScope:'commune',basis:'Loyers annoncés HC, pas loyers signés',coverage:'Sources activées seulement, échantillon non exhaustif'};
}
async function collectApproved(q,sources,{fetchImpl=fetch,now=Date.now()}={}){
 validateQuery(q);const records=[],sourceResults=[];
 for(const source of sources){
  if(source.state!=='approved'||source.enabled!==true||source.permission?.status!=='approved'||!source.permission.evidence||!Number.isFinite(publishedAt(source.permission.reviewedAt))){sourceResults.push({id:source.id,status:'not_approved'});continue}
  if(source.format!=='immoptima-json-v1'||!canonical(source.feedUrl,source.hosts||[])){sourceResults.push({id:source.id,status:'adapter_unavailable'});continue}
  try{
   const robots=await readPublic(new URL('/robots.txt',source.feedUrl).href,{fetchImpl,maxBytes:512000});
   if(!robotsAllowed(robots,source.feedUrl))error('ROBOTS_DISALLOWED');
   const text=await readPublic(source.feedUrl,{fetchImpl,json:true}),body=JSON.parse(text);
   if(body.schemaVersion!==1||!Array.isArray(body.records)||body.records.length>1000||records.length+body.records.length>1000)error('FEED_SCHEMA');
   // Observation is the time we actually fetched this approved live publisher
   // feed. Original publication dates are preserved and checked separately.
   records.push(...body.records.map(r=>({...r,sourceId:source.id,observedAt:new Date(now).toISOString()})));
   sourceResults.push({id:source.id,status:'consulted',items:body.records.length});
  }catch(e){sourceResults.push({id:source.id,status:'unavailable',reason:/^[A-Z_0-9]+$/.test(e.code||'')?e.code:'NETWORK_OR_PARSE_ERROR'})}
 }
 return {...compare(records,sources,q,{now}),sourceResults,consultedSources:sourceResults.filter(s=>s.status==='consulted').length};
}
module.exports={parseFeed,inspectFeed,inspectSource,robotsAllowed,readPublic,publishedAt,canonical,compare,validateQuery,collectApproved};
