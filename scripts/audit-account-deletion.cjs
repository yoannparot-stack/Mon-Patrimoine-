'use strict';
// Read-only operator audit. Never grants access, writes a document or deletes an account.
const {createHash}=require('node:crypto');
const TARGET_PROJECT='immoptima-6af3b';
function validateUid(uid){if(typeof uid!=='string'||!uid||uid.length>128||/[\x00-\x20\x7f/]/.test(uid)||uid==='.'||uid==='..')throw Error('INVALID_UID')}
async function audit({db,auth,uid,now=Date.now(),maxDocuments=500}){
 validateUid(uid);if(!Number.isSafeInteger(maxDocuments)||maxDocuments<1||maxDocuments>2000)throw Error('INVALID_BUDGET');
 let visited=0;const counts={},limitations=['Current database and Authentication only; provider logs, managed backups, local files, Drive and Play records are outside this audit.','Old-session denial and identity/request verification require separate real tests.','Quota hashes cover the current UTC day and three preceding days; older retained hashes are not certified absent.'];
 async function walk(ref){if(++visited>maxDocuments)throw Error('AUDIT_BUDGET_EXCEEDED');let n=(await ref.get()).exists?1:0;
  // listDocuments includes missing parent documents with existing subcollections.
  for(const col of await ref.listCollections())for(const child of await col.listDocuments())n+=await walk(child);
  return n;
 }
 let authExists=true;try{await auth.getUser(uid)}catch(e){if(e.code==='auth/user-not-found')authExists=false;else throw Error('AUTH_CHECK_FAILED')}
 for(const name of ['users','accountAccess','rentalAccess','rentalTrials'])counts[name]=await walk(db.doc(name+'/'+uid));
 const purchases=await db.collection('playPurchases').where('uid','==',uid).limit(1).get();
 let recentQuotaPresent=false;for(let i=0;i<4;i++){const day=new Date(now-i*86400000).toISOString().slice(0,10),key=createHash('sha256').update(uid+day).digest('hex');if((await db.doc('rentalQuota/'+key).get()).exists)recentQuotaPresent=true}
 const marker=await db.doc('accountDeletions/'+uid).get(),job=marker.exists?marker.data():{},completeMarker=marker.exists&&job.status==='complete';
 const residual=authExists||Object.values(counts).some(n=>n>0)||!purchases.empty||recentQuotaPresent;
 return {mode:'read_only',checkedAt:new Date(now).toISOString(),status:residual?'RESIDUAL_DATA_FOUND':completeMarker?'NO_RESIDUAL_IN_CHECKED_SCOPE':'INCONCLUSIVE_NO_COMPLETION_MARKER',authenticationAccountPresent:authExists,documentsPresent:counts,linkedPurchasePresent:!purchases.empty,recentQuotaPresent,completionMarkerPresent:completeMarker,oldSessionsVerified:false,readyForPublication:false,limitations};
}
function args(argv){const opts={};for(let i=0;i<argv.length;i++){const key=argv[i];if(!['--project','--uid'].includes(key)||opts[key]!==undefined||!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Use --project immoptima-6af3b --uid <exact verified UID>');opts[key]=argv[++i]}
 if(opts['--project']!==TARGET_PROJECT)throw Error('PROJECT_CONFIRMATION_REQUIRED');validateUid(opts['--uid']);return {projectId:opts['--project'],uid:opts['--uid']};}
module.exports={audit,args,TARGET_PROJECT};
if(require.main===module){(async()=>{const o=args(process.argv.slice(2)),req=require('node:module').createRequire(require('node:path').resolve(__dirname,'../functions/package.json'));
 const {initializeApp,applicationDefault}=req('firebase-admin/app'),{getFirestore}=req('firebase-admin/firestore'),{getAuth}=req('firebase-admin/auth');
 const app=initializeApp({projectId:o.projectId,credential:applicationDefault()});const r=await audit({db:getFirestore(app),auth:getAuth(app),uid:o.uid});console.log(JSON.stringify(r,null,2));process.exitCode=r.status==='NO_RESIDUAL_IN_CHECKED_SCOPE'?0:1;
 })().catch(()=>{console.error('AUDIT_NOT_COMPLETED: verify arguments, approved administrator access and audit budget. No deletion was performed.');process.exitCode=2})}
