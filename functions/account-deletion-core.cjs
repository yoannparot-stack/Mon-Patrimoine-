'use strict';
const {createHash}=require('node:crypto');
const MAX_AUTH_AGE=300,RECEIPT_MS=86400000;
function recent(identity,now=Date.now()){const n=Number(identity?.auth_time);return typeof identity?.uid==='string'&&identity.uid.length>0&&identity.uid.length<=128&&!identity.uid.includes('/')&&Number.isFinite(n)&&n>0&&n*1000<=now+30000&&now-n*1000<=MAX_AUTH_AGE*1000}
// Only authenticated UID-derived paths, never caller-supplied paths or e-mail addresses.
async function erase(uid,{db,auth,stamp,now=Date.now}){
 if(typeof uid!=='string'||!uid||uid.includes('/')||uid.length>128)throw Error('INVALID_UID');
 const job=db.doc('accountDeletions/'+uid),snap=await job.get();if(!snap.exists||snap.data().status==='complete')return;
 try{
  try{await auth.updateUser(uid,{disabled:true});await auth.revokeRefreshTokens(uid)}catch(e){if(e.code!=='auth/user-not-found')throw e}
  await db.recursiveDelete(db.doc('users/'+uid));
  for(const collection of ['accountAccess','rentalAccess','rentalTrials'])await db.recursiveDelete(db.doc(collection+'/'+uid));
  // Query every purchase owned by the UID, including superseded/expired records.
  for(;;){const list=await db.collection('playPurchases').where('uid','==',uid).limit(200).get();if(list.empty)break;const batch=db.batch();for(const doc of list.docs)batch.delete(doc.ref);await batch.commit()}
  // Quota IDs are daily hashes, not queryable by UID. Only the rolling 3-day window is retained by this service.
  for(let i=0;i<4;i++){const day=new Date(now()-i*86400000).toISOString().slice(0,10),key=createHash('sha256').update(uid+day).digest('hex');await db.doc('rentalQuota/'+key).delete()}
  try{await auth.deleteUser(uid)}catch(e){if(e.code!=='auth/user-not-found')throw e}
  await job.set({status:'complete',completedAt:stamp(now()),purgeAfter:stamp(now()+RECEIPT_MS),updatedAt:stamp(now())});
 }catch(e){await job.set({status:'pending',updatedAt:stamp(now())},{merge:true});throw Error('DELETION_RETRY_REQUIRED')}
}
module.exports={recent,erase,MAX_AUTH_AGE,RECEIPT_MS};
