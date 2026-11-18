'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto'),{audit,args}=require('./audit-account-deletion.cjs');
function harness(initial={},authExists=false){const docs=new Map(Object.entries(initial)),reads=[];
 const ref=path=>({path,get:async()=>{reads.push(path);return {exists:docs.has(path),data:()=>docs.get(path)}},listCollections:async()=>{const names=[...new Set([...docs.keys()].filter(p=>p.startsWith(path+'/')).map(p=>p.slice(path.length+1).split('/')[0]))];return names.map(n=>col(path+'/'+n))}});
 function col(path){
  return {
   listDocuments:async()=>[...new Set([...docs.keys()].filter(p=>p.startsWith(path+'/')).map(p=>p.slice(path.length+1).split('/')[0]))].map(n=>ref(path+'/'+n)),
   where(field,op,value){
    assert.equal(op,'==');
    return {
     limit(n) {
      return {
       async get() {
        const matches=[...docs].filter(([p,v])=>p.startsWith(path+'/')&&p.split('/').length===2&&v[field]===value).slice(0,n);
        return {empty:matches.length===0};
       }
      };
     }
    };
   }
  };
 }

 // No write/delete methods are exposed by this harness.
 return {docs,reads,db:{doc:ref,collection:col},auth:{getUser:async()=>{if(!authExists)throw Object.assign(Error(),{code:'auth/user-not-found'})}}};}
const now=Date.UTC(2026,10,18,20);
test('requires exact project and UID; destructive/unknown flags are refused',()=>{assert.deepEqual(args(['--project','immoptima-6af3b','--uid','alice']),{projectId:'immoptima-6af3b',uid:'alice'});for(const a of [[],['--project','other','--uid','alice'],['--project','immoptima-6af3b','--uid','../bob'],['--project','immoptima-6af3b','--uid','alice','--delete']])assert.throws(()=>args(a))});
test('finds nested residual data even when parent documents are absent; does not read another account',async()=>{const h=harness({'users/alice/portfolios/missing/photos/one':{secret:'private'},'users/bob/portfolios/current':{},'accountDeletions/alice':{status:'complete'}});const before=JSON.stringify([...h.docs]);const r=await audit({...h,uid:'alice',now});assert.equal(r.status,'RESIDUAL_DATA_FOUND');assert.equal(r.documentsPresent.users,1);assert(!h.reads.some(p=>p.includes('bob')));assert.equal(JSON.stringify([...h.docs]),before);assert(!JSON.stringify(r).includes('private'))});
test('absence alone never certifies completion or old-session denial',async()=>{const r=await audit({...harness(),uid:'alice',now});assert.equal(r.status,'INCONCLUSIVE_NO_COMPLETION_MARKER');assert.equal(r.readyForPublication,false);assert.equal(r.oldSessionsVerified,false)});
test('detects Authentication, indirect purchases, recent quota and retained trial descendants',async()=>{const day=new Date(now).toISOString().slice(0,10),key=createHash('sha256').update('alice'+day).digest('hex');const h=harness({'accountDeletions/alice':{status:'complete'},'playPurchases/token':{uid:'alice',purchaseToken:'secret'},['rentalQuota/'+key]:{},'rentalTrials/alice/access/current':{}},true);const r=await audit({...h,uid:'alice',now});assert(r.authenticationAccountPresent&&r.linkedPurchasePresent&&r.recentQuotaPresent);assert.equal(r.documentsPresent.rentalTrials,1);assert.equal(r.status,'RESIDUAL_DATA_FOUND');assert(!JSON.stringify(r).includes('secret'))});
test('complete scoped result keeps external/provider and session limitations',async()=>{const h=harness({'accountDeletions/alice':{status:'complete'},'users/bob/portfolios/current':{},'playPurchases/other':{uid:'bob'}});const r=await audit({...h,uid:'alice',now});assert.equal(r.status,'NO_RESIDUAL_IN_CHECKED_SCOPE');assert.equal(r.readyForPublication,false);assert(r.limitations.length>=3)});
test('budget exhaustion and backend errors fail instead of reporting a clean account',async()=>{await assert.rejects(audit({...harness(),uid:'alice',now,maxDocuments:1}),/BUDGET/);const h=harness();h.auth.getUser=async()=>{throw Object.assign(Error(),{code:'permission-denied'})};await assert.rejects(audit({...h,uid:'alice',now}),/AUTH_CHECK_FAILED/)});
