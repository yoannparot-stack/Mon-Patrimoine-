'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const q={lat:47.39,lon:.68,surface:30,rooms:1,family:'appartement',communeCode:'37261',city:'Tours',postcode:'37000'};
function harness({enabled=true,access=true,quota=0,auth=true,limit=8,locked=false}={}){
 const writes=[],reads=[],collections=[];let charged=false;
 const doc=path=>({path,get:async()=>{reads.push(path);return {exists:true,data:()=>path==='rentalService/config'?{enabled,dailyProviderCalls:limit,dailyCollectionsPerUser:2}:path.startsWith('rentalAccess/')?{enabled:access}:path.includes('global-')?{calls:quota}:{lockUntil:locked?Date.now()+60000:0,collections:0}}},update:async v=>writes.push([path,v])});
 const db={doc,runTransaction:async fn=>fn({get:r=>r.get(),set:(r,v)=>writes.push([r.path,v])})};
 const modules={'./play-billing.cjs':{},'firebase-functions/v2/https':{onRequest:(_,handler)=>handler},'firebase-functions/params':{defineSecret:()=>({value:()=>'not-exposed'})},'firebase-admin/app':{initializeApp(){}},'firebase-admin/auth':{getAuth:()=>({verifyIdToken:async(token,revoked)=>{assert(revoked);if(!auth||token!=='id-token')throw Error();return {uid:'uid-123'}}})},'firebase-admin/firestore':{getFirestore:()=>db,Timestamp:{fromMillis:v=>v}},'./rental-core.cjs':{...require('../rental-core.cjs'),collect:async(q,o)=>{charged=true;collections.push(q);return {version:1}}}};
 const ctx={require:n=>modules[n]||require(n),exports:{},Buffer,Date};vm.runInNewContext(fs.readFileSync(require.resolve('../index.js'),'utf8'),ctx);
 return {call:async(body=q,headers={authorization:'Bearer id-token'},method='POST')=>{const res={statusCode:200,set(){},status(n){this.statusCode=n;return this},json(body){this.body=body;return this}};await ctx.exports.rentalComparables({body,headers,method,is:t=>t==='application/json'},res);return res},writes,reads,collections,get charged(){return charged}};
}
test('authentication, entitlement and activation gates block provider calls',async()=>{
 for(const [opts,status,code] of [[{auth:false},401,'AUTH_REQUIRED'],[{enabled:false},503,'NOT_CONFIGURED'],[{access:false},403,'ACCESS_REQUIRED'],[{limit:0},429,'QUOTA'],[{quota:8},429,'QUOTA'],[{locked:true},429,'BUSY']]){const h=harness(opts),r=await h.call();assert.equal(r.statusCode,status);assert.equal(r.body.code,code);assert.equal(h.charged,false)}
 const h=harness();assert.equal((await h.call({...q,loan:1})).statusCode,400);assert.equal((await h.call(q,{},'GET')).statusCode,405);assert.equal(h.charged,false);
});
test('reserve bounded global budget before provider; release lock; no client data persisted',async()=>{
 const h=harness(),r=await h.call();assert.equal(r.statusCode,200);assert(h.charged);assert.equal(h.collections.length,1);
 assert(h.writes.some(([p,v])=>p.includes('global-')&&v.calls===4));assert(h.writes.some(([,v])=>v.lockUntil===0));
 const persisted=JSON.stringify(h.writes);for(const value of ['47.39','id-token','not-exposed','Tours','uid-123'])assert(!persisted.includes(value));
});
