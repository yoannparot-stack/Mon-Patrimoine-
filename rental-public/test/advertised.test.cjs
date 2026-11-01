'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {compareAdvertised,compare,collectApproved}=require('../core.cjs');
const now=Date.parse('2026-11-01T12:00:00Z'),observedAt=new Date(now).toISOString();
const q={mode:'meuble',surface:20,rooms:1,family:'appartement',communeCode:'37261'};
const source=id=>({id,label:'Test '+id,state:'approved',enabled:true,hosts:['agency.example','other.example'],permission:{status:'approved',evidence:'Synthetic fixture only; no real publisher approval',reviewedAt:'2026-11-01'}});
const row=(i,extra={})=>({sourceId:'a',url:'https://agency.example/'+i,datePublished:'2026-10-30',observedAt,active:true,transaction:'rent',period:'month',currency:'EUR',mode:'meuble',lease:'long-term',shared:false,family:'appartement',communeCode:'37261',rooms:1,surface:20,rentCC:500+i*20,...extra});
const run=(rows,sources=[source('a')])=>compareAdvertised(rows,sources,q,{now});
test('explicit CC without a charge breakdown produces a labelled CC range and no HC target',()=>{
 const rows=[row(0),row(1),row(2)],x=run(rows),g=x.ranges[0];
 assert.equal(x.status,'indicative');assert.equal(g.basis,'CC');assert.equal(g.chargesScope,'unknown');assert.equal(g.evidenceLevel,'limited');
 assert.deepEqual([g.low,g.median,g.high],[500,520,540]);assert.equal(g.usableAsHCTarget,false);
 assert.equal(compare(rows,[source('a')],q,{now}).target,null,'the financial HC engine still rejects unknown charges');
 assert(!Object.hasOwn(g.references[0],'rentHC'));
});
test('HC, recoverable CC, all-inclusive CC and unknown bundles never mix',()=>{
 const rows=[0,1,2].flatMap(i=>[
  row(i,{rentHC:440+i*20,rentCC:480+i*20,charges:40,chargesScope:'recoverable'}),
  row(i+10,{rentCC:650+i*20,chargesScope:'all-inclusive'}),
  row(i+20,{rentCC:550+i*20})
 ]),x=run(rows),group=(basis,scope)=>x.ranges.find(g=>g.basis===basis&&g.chargesScope===scope);
 assert.equal(x.ranges.length,4);assert.equal(group('HC','excluding-charges').median,460);
 assert.equal(group('CC','recoverable').median,500);assert.equal(group('CC','all-inclusive').median,670);
 assert.equal(group('CC','unknown').median,570);assert.equal(x.countsNotAdditive,true);
 assert(x.ranges.filter(g=>g.usableAsHCTarget).every(g=>g.basis==='HC'));
});
test('CC minus explicit charges is allowed, absent charges are not zero, and contradictions are rejected',()=>{
 const a=run([row(0,{charges:40})]);assert.equal(a.ranges.find(g=>g.basis==='HC').references[0].amount,460);
 const zero=run([row(0,{charges:0})]);assert.equal(zero.ranges.find(g=>g.basis==='HC').references[0].amount,500);
 for(const v of [{charges:''},{charges:-1},{charges:500},{rentHC:600},{rentHC:460,charges:20},{rentCC:'500'},{rentCC:NaN},{chargesScope:'invented'}]){
  const x=run([row(0,v)]);assert.equal(x.ranges.length,0,JSON.stringify(v));assert.equal(Object.values(x.rejected).reduce((a,b)=>a+b,0),1);
 }
 assert.equal(run([row(0,{rentCC:null})]).ranges.length,0);
 assert.equal(compare([row(0,{rentHC:600,rentCC:500})],[source('a')],q,{now}).target,null);
 assert.equal(compare([row(0,{rentHC:600,rentCC:500})],[source('a')],q,{now}).count,0,'a known HC amount cannot exceed the known CC amount');
});
test('duplicates do not create three references or several independent sources',()=>{
 const x=run([row(0),row(0,{sourceId:'b',url:'https://other.example/repost'}),row(0,{url:'https://agency.example/0?utm_source=other'})],[source('a'),source('b')]);
 assert.equal(x.ranges[0].count,1);assert.equal(x.ranges[0].status,'insufficient');assert.equal(x.ranges[0].median,null);
 const sameHost=run([row(0),row(1,{sourceId:'b'}),row(2)],[source('a'),source('b')]);assert.equal(sameHost.ranges[0].sourceCount,1);
 const twoHosts=run([row(0),row(1,{url:'https://other.example/1'}),row(2)]);assert.equal(twoHosts.ranges[0].sourceCount,2);
});
test('wrong segment, search-only snippets, stale observations and forbidden sources cannot create a range',()=>{
 for(const v of [{mode:'nu'},{family:'maison'},{surface:30},{rooms:2},{communeCode:'75056'},{active:null},{lease:'holiday'},{shared:true},{period:'week'},{currency:'USD'},{observedAt:null},{observedAt:'2026-10-25'},{datePublished:'2026-02-31'},{url:'https://leboncoin.fr/ad/locations/123'}]){
  assert.equal(run([row(0,v),row(1,v),row(2,v)]).ranges.length,0,JSON.stringify(v));
 }
 for(const s of [{...source('a'),enabled:false},{...source('a'),state:'restricted'},{...source('a'),permission:null}])assert.equal(run([row(0),row(1),row(2)],[s]).ranges.length,0);
});
test('outliers are removed before checking sample size; projection uses rent per square metre',()=>{
 const x=run([row(0,{rentCC:500}),row(1,{rentCC:520}),row(2,{rentCC:1500})]);
 assert.equal(x.ranges[0].outliers,1);assert.equal(x.ranges[0].count,2);assert.equal(x.ranges[0].median,null);
 const projected=run([row(0,{surface:16,rentCC:400}),row(1,{surface:20,rentCC:520}),row(2,{surface:24,rentCC:648})]);
 assert.deepEqual([projected.ranges[0].low,projected.ranges[0].median,projected.ranges[0].high],[500,520,540]);
 const central=run([0,1,2,3,4].map(i=>row(i)));assert.equal(central.ranges[0].spread,'central_60_percent');
 assert.deepEqual([central.ranges[0].low,central.ranges[0].median,central.ranges[0].high],[515,540,565]);
 assert.equal(central.ranges[0].evidenceLevel,'limited','unknown service bundles remain a limited benchmark');
});
test('only calculation facts leave the snapshot; inputs remain unchanged',()=>{
 const rows=[row(0,{description:'private content',phone:'private phone',email:'private email',pictures:['private image']}),row(1),row(2)],before=JSON.stringify(rows),x=run(rows);
 assert.equal(JSON.stringify(rows),before);assert(!JSON.stringify(x).includes('private'));
 assert.equal(x.checkedAt,observedAt);assert.deepEqual(x.ranges[0].period,['2026-10-30','2026-10-30']);
 assert.equal(run([]).status,'insufficient');assert.throws(()=>run(Array(1001).fill(row(0))),/TOO_MANY_RECORDS/);
});
test('approved-feed collection returns the CC snapshot while preserving an unavailable HC target',async()=>{
 const s={...source('a'),format:'immoptima-json-v1',feedUrl:'https://agency.example/feed.json'};
 const x=await collectApproved(q,[s],{now,fetchImpl:async url=>new Response(url.endsWith('robots.txt')?'User-agent: *\nDisallow:':JSON.stringify({schemaVersion:1,records:[row(0),row(1),row(2)]}),{headers:{'content-type':url.endsWith('robots.txt')?'text/plain':'application/json'}})});
 assert.equal(x.target,null);assert.equal(x.advertised.status,'indicative');assert.equal(x.advertised.ranges[0].median,520);
 assert.equal(x.consultedSources,1);assert.equal(x.advertised.ranges[0].usableAsHCTarget,false);
});
