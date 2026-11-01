'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const c=require('../core.cjs'),catalog=require('../sources.json');
const now=Date.parse('2026-11-01T12:00:00Z'),today=new Date(now).toISOString();
const q={mode:'meuble',surface:30,rooms:1,family:'appartement',communeCode:'37261'};
const approved=id=>({id,label:'Agence de test '+id,state:'approved',enabled:true,hosts:['agency.example'],permission:{status:'approved',evidence:'Synthetic test permission, not a real publisher agreement',reviewedAt:'2026-10-31'}});
const row=(i,overrides={})=>({sourceId:'agency-a',url:'https://agency.example/letting/'+i,datePublished:'2026-10-30',observedAt:today,active:true,transaction:'rent',period:'month',currency:'EUR',mode:'meuble',lease:'long-term',shared:false,family:'appartement',communeCode:'37261',rooms:1,surface:30,rentHC:500+i*50,...overrides});
test('dated RSS inspection separates publication from observation and excludes stale rentals',()=>{
 const xml='<rss version="2.0"><channel><item><title>Location appartement meublée</title><link>https://agency.example/a</link><pubDate>2025-11-08</pubDate><description>Private contact not retained</description></item><item><title>Achat maison</title><pubDate>2026-10-30</pubDate></item><item><title>Location studio</title><pubDate>2026-10-31</pubDate></item><item><title>Location maison</title><pubDate>unknown</pubDate></item></channel></rss>';
 const s=c.inspectFeed(xml,now);assert.equal(s.items,4);assert.equal(s.recentRentalItems,1);assert.equal(s.invalidDates,1);assert.equal(s.rentalItems,3);assert(!JSON.stringify(s).includes('Private contact'));
 assert.equal(c.parseFeed(xml)[0].title,'Location appartement meublée');
 for(const x of ['<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///private">]><rss/>','<html>not a feed</html>','<rss><channel><item></channel></rss>'])assert.throws(()=>c.parseFeed(x));
 assert.throws(()=>c.parseFeed('a'.repeat(2000001)),/LARGE_XML/);
});
test('robots exclusions, specific agent groups, wildcard, query, precedence, case and equal-length allow',()=>{
 const text='User-agent: *\nDisallow: /api*\nDisallow: /private\nAllow: /private/public\nDisallow: /*?sort=*\n';
 assert(!c.robotsAllowed(text,'https://agency.example/api/list'));assert(c.robotsAllowed(text,'https://agency.example/rss.xml'));assert(c.robotsAllowed(text,'https://agency.example/private/public'));assert(!c.robotsAllowed(text,'https://agency.example/list?sort=price'));assert(c.robotsAllowed(text,'https://agency.example/Private'));
 const specific='User-agent: *\nDisallow: /\nUser-agent: ImmOptimaRental\nAllow: /rss.xml$\nDisallow: /rss.xml/private\n';
 assert(c.robotsAllowed(specific,'https://agency.example/rss.xml'));assert(!c.robotsAllowed(specific,'https://agency.example/rss.xml/private'));
 assert(c.robotsAllowed('User-agent: *\nDisallow: /rss\nAllow: /rss','https://agency.example/rss'));
 assert(!c.robotsAllowed('User-agent: ImmOptimaRental\nDisallow: /rss\nUser-agent: ImmOptimaRental\nAllow: /other','https://agency.example/rss'));
});
test('restricted and unreviewed sources cannot trigger network requests or feed a target',async()=>{
 let calls=0;for(const source of catalog.filter(s=>!s.assessmentAllowed)){const x=await c.inspectSource(source,{fetchImpl:()=>{calls++;throw Error()}});assert.equal(x.status,'not_fetched')}
 assert.equal(calls,0);assert(catalog.every(s=>!s.enabled),'no production source declared operational by a technical probe');
 const out=c.compare([row(0)],[],q,{now});assert.equal(out.target,null);assert.equal(out.rejected.UNKNOWN_SOURCE,1);
 const unapproved={...approved('agency-a'),enabled:false};assert.equal(c.compare([row(0)],[unapproved],q,{now}).rejected.SOURCE_NOT_APPROVED,1);
});
test('bounded genuine feed transport checks robots first and does not fetch a blocked feed',async()=>{
 const source={...approved('agency-a'),feedUrl:'https://agency.example/rss.xml',assessmentAllowed:true};const sent=[];
 const out=await c.inspectSource(source,{now,fetchImpl:async(url,options)=>{sent.push(url);assert.equal(options.redirect,'error');assert.match(options.headers['User-Agent'],/ImmOptimaRental/);return new Response(url.endsWith('/robots.txt')?'User-agent: *\nDisallow: /rss.xml':'not requested',{headers:{'content-type':'text/plain'}})}});
 assert.equal(out.status,'robots_disallowed');assert.equal(sent.length,1);
 await assert.rejects(c.readPublic('https://agency.example/rss',{fetchImpl:async()=>new Response('huge',{headers:{'content-type':'text/xml','content-length':'3000000'}})}),/RESPONSE_TOO_LARGE/);
});
test('anonymous feed audit uses only fixed publisher URLs, supports Latin-1 and reports stale rows honestly',async()=>{
 const source={...approved('agency-a'),feedUrl:'https://agency.example/rss.xml',assessmentAllowed:true};const urls=[];
 const x=await c.inspectSource(source,{now,fetchImpl:async url=>{urls.push(url);return new Response(url.endsWith('/robots.txt')?'User-agent: *\nDisallow:':'<rss><channel><item><title>Location studio</title><pubDate>2025-11-08</pubDate></item></channel></rss>',{headers:{'content-type':url.endsWith('/robots.txt')?'text/plain':'text/xml; charset=iso-8859-1'}})}});
 assert.equal(x.status,'no_recent_rentals');assert.equal(x.recentRentalItems,0);assert.deepEqual(urls,['https://agency.example/robots.txt','https://agency.example/rss.xml']);
});
test('HC median and cross-source deduplication, attribution, partial coverage and robust outlier rejection',()=>{
 const records=[row(0),row(1),row(2),row(100),row(0,{sourceId:'agency-b',url:'https://agency.example/repost'})],out=c.compare(records,[approved('agency-a'),approved('agency-b')],q,{now});
 assert.equal(out.count,3);assert.equal(out.target,550);assert.equal(out.low,500);assert.equal(out.high,600);assert.equal(out.rejected.DUPLICATE,1);assert.equal(out.rejected.OUTLIER,1);assert.equal(out.sourceCount,1);assert.equal(out.references[0].source,'Agence de test agency-a');assert(!out.references[0].fingerprint);
 const mixed=c.compare([row(0),row(1,{sourceId:'agency-b'}),row(2)],[approved('agency-a'),approved('agency-b')],q,{now});assert.equal(mixed.sourceCount,2);
});
test('unknown charges, mode, currency, term, status and locality never become a rent target',()=>{
 const variants=[{rentHC:null,rentCC:600},{charges:-20,rentCC:480},{rentHC:550,rentCC:900,charges:40},{mode:null},{lease:null},{shared:true},{currency:'USD'},{transaction:'sale'},{active:null},{period:'week'},{communeCode:'75056'},{rooms:2},{surface:9},{datePublished:'2025-10-01'},{datePublished:'2027-01-01'},{observedAt:'2026-10-01'},{url:'https://unreviewed.example/listing'}];
 for(const v of variants){const out=c.compare([row(0,v),row(1,v),row(2,v)],[approved('agency-a')],q,{now});assert.equal(out.count,0,JSON.stringify(v));assert.equal(out.target,null)}
 const cc=c.compare([row(0,{rentHC:null,rentCC:540,charges:40})],[approved('agency-a')],q,{now});assert.equal(cc.references[0].rentHC,500);assert.equal(cc.target,null,'one dwelling is insufficient');
});
test('HTTPS/source boundaries, URL canonicalization and strict property queries',()=>{
 assert.equal(c.canonical('https://agency.example/ad?utm_source=x&b=2&a=1#photo',['agency.example']),'https://agency.example/ad?a=1&b=2');
 for(const u of ['http://agency.example/ad','https://user:pass@agency.example/ad','https://agency.example:8443/ad','https://localhost/ad','javascript:alert(1)'])assert.equal(c.canonical(u,['agency.example']),'');
 for(const props of [{mode:'holiday'},{surface:null},{rooms:1.5},{communeCode:'bad'}])assert.throws(()=>c.compare([],[],{...q,...props},{now}),/INVALID_QUERY/);
 assert(Number.isNaN(c.publishedAt('2026-02-31')));assert(Number.isNaN(c.publishedAt('2026-13-01')));assert(Number.isNaN(c.publishedAt('2026-11-01Tinvalid')));assert.equal(c.publishedAt('2026-11-01T23:00:00Z'),Date.parse('2026-11-01T23:00:00Z'));assert.equal(c.compare([row(0,{datePublished:'2026-11-01T23:00:00Z'})],[approved('agency-a')],q,{now}).count,0);
});
test('complete free multi-source pipeline: HTTP, robots, live observation, partial failures and local matching',async()=>{
 const a={...approved('agency-a'),format:'immoptima-json-v1',feedUrl:'https://agency.example/a.json'},b={...approved('agency-b'),format:'immoptima-json-v1',feedUrl:'https://agency.example/b.json'},sent=[];
 const result=await c.collectApproved(q,[a,b,...catalog],{now,fetchImpl:async(url,opts)=>{
  sent.push(url);assert(!JSON.stringify(opts).includes('Authorization'));assert(!url.includes('37261'));
  if(url.endsWith('/robots.txt'))return new Response('User-agent: *\nDisallow:',{headers:{'content-type':'text/plain'}});
  if(url.endsWith('/b.json'))return new Response('offline',{status:503});
  return new Response(JSON.stringify({schemaVersion:1,records:[row(0),row(1),row(2),row(3,{communeCode:'75056'})]}),{headers:{'content-type':'application/json'}});
 }});
 assert.equal(result.target,550);assert.equal(result.consultedSources,1);assert.equal(result.rejected.NOT_COMPARABLE,1);assert.equal(result.sourceResults.find(x=>x.id==='agency-b').reason,'HTTP_503');assert.equal(result.sourceResults.find(x=>x.id==='pap').status,'not_approved');assert.equal(sent.length,4);
 assert(result.references.every(r=>r.observedAt===today));
});
