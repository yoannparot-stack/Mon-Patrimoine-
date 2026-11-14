'use strict';
const {onRequest}=require('firebase-functions/v2/https');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const C=require('./account-deletion-core.cjs');
const options={region:'europe-west1',timeoutSeconds:300,maxInstances:2};
async function erase(uid){return C.erase(uid,{db:getFirestore(),auth:getAuth(),stamp:Timestamp.fromMillis})}
exports.accountDeletion=onRequest({...options,cors:false},async(req,res)=>{
 res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({code:'METHOD_NOT_ALLOWED'});
 const db=getFirestore(),auth=getAuth();let identity,token;
 try{const m=String(req.headers.authorization||'').match(/^Bearer (\S+)$/);if(!m)throw Error();token=m[1];identity=await auth.verifyIdToken(token,false)}catch{return res.status(401).json({code:'AUTH_REQUIRED'})}
 if(typeof identity.uid!=='string'||!identity.uid||identity.uid.includes('/')||identity.uid.length>128)return res.status(401).json({code:'AUTH_REQUIRED'});
 const ref=db.doc('accountDeletions/'+identity.uid);
 try{
  if(req.method==='GET'){const snap=await ref.get();return res.json({code:!snap.exists?'NOT_REQUESTED':snap.data().status==='complete'?'COMPLETE':'PENDING'})}
  if(!req.is('application/json')||JSON.stringify(req.body||{}).length>256||Object.keys(req.body||{}).some(k=>!['confirmation'].includes(k))||req.body?.confirmation!=='SUPPRIMER')return res.status(400).json({code:'CONFIRMATION_REQUIRED'});
  // Existing requests can only be read, never reset or redirected, even if this token was revoked by the deletion worker.
  const old=await ref.get();if(old.exists)return res.status(202).json({code:old.data().status==='complete'?'COMPLETE':'PENDING'});
  await auth.verifyIdToken(token,true);if(!C.recent(identity))return res.status(401).json({code:'REAUTH_REQUIRED'});
  const cfg=await db.doc('deletionService/config').get();if(!cfg.exists||cfg.data().enabled!==true)return res.status(503).json({code:'NOT_CONFIGURED'});
  await ref.create({status:'pending',requestedAt:Timestamp.now(),updatedAt:Timestamp.now()}).catch(e=>{if(e.code!==6&&e.code!=='already-exists')throw e});
  return res.status(202).json({code:'PENDING'});
 }catch{return res.status(503).json({code:'SERVICE_UNAVAILABLE'})}
});
exports.processAccountDeletion=onDocumentCreated({...options,document:'accountDeletions/{uid}',retry:true},async event=>{await erase(event.params.uid)});
exports.retryAccountDeletions=onSchedule({...options,schedule:'every 15 minutes',maxInstances:1},async()=>{
 const db=getFirestore();for(const job of (await db.collection('accountDeletions').where('status','==','pending').limit(20).get()).docs)try{await erase(job.id)}catch{/* Retry remains queued; no user data or tokens in logs. */}
 // Keep the completed marker for 24h so already-issued ID tokens cannot recreate deleted data.
 for(const job of (await db.collection('accountDeletions').where('purgeAfter','<=',Timestamp.now()).limit(100).get()).docs)if(job.data().status==='complete')await job.ref.delete();
 // Purge expired quota counters, including old hashed user counters that cannot be queried by UID.
 for(const doc of (await db.collection('rentalQuota').where('expiresAt','<=',Timestamp.now()).limit(200).get()).docs)await doc.ref.delete();
});
