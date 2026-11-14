'use strict';
const {onRequest}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');
const {initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {createHash}=require('node:crypto');
const core=require('./rental-core.cjs');
initializeApp();const vendorToken=defineSecret('YANPORT_TOKEN');
// No listing, address, client income or secret is stored in quotas or logs.
exports.rentalComparables=onRequest({region:'europe-west1',secrets:[vendorToken],timeoutSeconds:60,memory:'256MiB',maxInstances:2,cors:false},async(req,res)=>{
 res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
 if(req.method!=='POST')return res.status(405).json({code:'METHOD_NOT_ALLOWED'});
 if(!req.is('application/json')||Buffer.byteLength(JSON.stringify(req.body||{}))>2048)return res.status(400).json({code:'INVALID_REQUEST'});
 let identity,q;
 try{const match=String(req.headers.authorization||'').match(/^Bearer (\S+)$/);if(!match)throw Error();identity=await getAuth().verifyIdToken(match[1],true)}catch{return res.status(401).json({code:'AUTH_REQUIRED'})}
 try{q=core.validateRequest(req.body)}catch{return res.status(400).json({code:'INVALID_REQUEST'})}
 const db=getFirestore(),uid=identity.uid,settings=await db.doc('rentalService/config').get().catch(()=>null);
 if(!settings?.exists||settings.data().enabled!==true||!vendorToken.value())return res.status(503).json({code:'NOT_CONFIGURED'});
 const cfg=settings.data(),access=await db.doc('rentalAccess/'+uid).get().catch(()=>null);
 if(!access?.exists||access.data().enabled!==true)return res.status(403).json({code:'ACCESS_REQUIRED'});
 const day=new Date().toISOString().slice(0,10),userRef=db.doc('rentalQuota/'+createHash('sha256').update(uid+day).digest('hex')),globalRef=db.doc('rentalQuota/global-'+day);
 try{
  await db.runTransaction(async tx=>{
   const [u,g,deleting]=await Promise.all([tx.get(userRef),tx.get(globalRef),tx.get(db.doc('accountDeletions/'+uid))]);if(deleting.exists)throw Object.assign(Error(),{code:'DELETING'});const user=u.data()||{},global=g.data()||{},now=Date.now();
   const limit=Math.max(0,Math.min(1000,Number(cfg.dailyProviderCalls)||0)),perUser=Math.max(0,Math.min(20,Number(cfg.dailyCollectionsPerUser)||0));
   if(user.lockUntil>now)throw Object.assign(Error(),{code:'BUSY'});
   if((user.collections||0)>=perUser||(global.calls||0)+core.MAX_CALLS>limit)throw Object.assign(Error(),{code:'QUOTA'});
   const expiresAt=Timestamp.fromMillis(now+3*86400000);
   tx.set(userRef,{collections:(user.collections||0)+1,lockUntil:now+65000,expiresAt});
   tx.set(globalRef,{calls:(global.calls||0)+core.MAX_CALLS,expiresAt});
  });
 }catch(e){return res.status(429).json({code:['BUSY','QUOTA'].includes(e.code)?e.code:'SERVICE_UNAVAILABLE'})}
 try{return res.status(200).json(await core.collect(q,{token:vendorToken.value()}))}
 catch(e){return res.status(502).json({code:['PROVIDER_AUTH','PROVIDER_RATE_LIMIT','PROVIDER_SCHEMA','PROVIDER_UNAVAILABLE'].includes(e.code)?e.code:'SERVICE_UNAVAILABLE'})}
 finally{await userRef.update({lockUntil:0}).catch(()=>{})}
});

// Disabled by billingService/config until Play Console and server access are configured.
Object.assign(exports,require('./play-billing.cjs'));

// Account deletion endpoints remain disabled until deployment and publisher review.
Object.assign(exports,require('./account-deletion.cjs'));
