const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const fs=require('fs');
const firebase=require('firebase/compat/app');
require('firebase/compat/firestore');
(async()=>{
 const env=await initializeTestEnvironment({
  projectId:'immoptima-rules-test',
  firestore:{rules:fs.readFileSync('cloud/firestore.rules','utf8'),host:'127.0.0.1',port:8089}
 });
 try{
  const owner=env.authenticatedContext('owner').firestore();
  const intruder=env.authenticatedContext('intruder').firestore();
  const anon=env.unauthenticatedContext().firestore();
  const path='users/owner/portfolios/current';
  const doc=owner.doc(path);
  const payload={settings:{holders:[]},properties:[],loans:[],assets:[]};
  const create={schemaVersion:1,revision:1,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),payload};
  await assertFails(anon.doc(path).get());
  await assertFails(intruder.doc(path).get());
  await assertSucceeds(doc.set(create));
  await assertSucceeds(doc.get());
  await assertFails(intruder.doc(path).set(create));
  await assertFails(doc.set({...create,revision:3}));
  await assertFails(doc.set({...create,schemaVersion:2}));
  await assertFails(doc.set({...create,unexpectedField:'blocked'}));
  await assertSucceeds(doc.set({...create,revision:2}));
  await assertFails(doc.delete());
  await assertFails(owner.doc('users/owner/portfolios/other').set(create));
  // Paid collection must never be enabled or its quotas reset by an APK client.
  for(const adminPath of ['rentalService/config','rentalAccess/owner','rentalQuota/global-2026-11-01','billingService/config','playPurchases/token-hash']){
   await env.withSecurityRulesDisabled(async context=>context.firestore().doc(adminPath).set({enabled:true,calls:4}));
   for(const client of [owner,intruder,anon]){
    await assertFails(client.doc(adminPath).get());
    await assertFails(client.doc(adminPath).set({enabled:true,calls:0}));
    await assertFails(client.doc(adminPath).delete());
   }
  }
  const trial=owner.doc('rentalTrials/owner'),probe=owner.doc('rentalTrials/owner/access/current');
  // Fresh reads avoid reusing the emulator watch stream's pre-activation request time.
  const trialProbe=()=>env.authenticatedContext('owner').firestore().doc('rentalTrials/owner/access/current').get({source:'server'});
  await assertFails(trialProbe());
  await assertFails(anon.doc('rentalTrials/owner').set({startedAt:firebase.firestore.FieldValue.serverTimestamp()}));
  await assertFails(intruder.doc('rentalTrials/owner').get());
  await assertFails(trial.set({startedAt:firebase.firestore.Timestamp.fromMillis(Date.now()+86400000)}));
  await assertFails(trial.set({startedAt:firebase.firestore.FieldValue.serverTimestamp(),owner:true}));
  await assertSucceeds(trial.set({startedAt:firebase.firestore.FieldValue.serverTimestamp()}));
  await assertSucceeds(trial.get());console.log('TRIAL activation confirmed', (await trial.get()).data().startedAt.toMillis());await assertSucceeds(trialProbe());
  await assertFails(trial.set({startedAt:firebase.firestore.FieldValue.serverTimestamp()}));
  await assertFails(trial.delete());await assertFails(probe.set({allowed:true}));
  await assertFails(intruder.doc('rentalTrials/owner/access/current').get());
  // The active trial never permits a multi-property cloud write.
  await assertFails(doc.set({...create,revision:3,payload:{...payload,properties:[{id:'one'},{id:'two'}]}}));
  for(const since of [Date.now()-90*86400000-1000,Date.now()+86400000]){
   await env.withSecurityRulesDisabled(async c=>c.firestore().doc('rentalTrials/owner').set({startedAt:firebase.firestore.Timestamp.fromMillis(since)}));
   await assertSucceeds(trial.get());await assertFails(trialProbe());
  }
  console.log('PASS 90-day account trial: explicit server timestamp, immutable activation, own-account reads, active server probe, expired/future denied, no multi entitlement');
  const accessPath='accountAccess/owner';
  const multi={...create,revision:3,payload:{...payload,properties:[{id:'one'},{id:'two'}]}};
  await assertFails(doc.set(multi));
  await assertFails(owner.doc(accessPath).set({owner:true}));
  await assertFails(intruder.doc(accessPath).get());
  const provision=async data=>env.withSecurityRulesDisabled(async c=>c.firestore().doc(accessPath).set(data));
  await provision({status:'active',expiresAt:firebase.firestore.Timestamp.fromMillis(Date.now()+3600000)});
  await assertSucceeds(owner.doc(accessPath).get());await assertSucceeds(doc.set(multi));
  await provision({status:'expired',expiresAt:firebase.firestore.Timestamp.fromMillis(Date.now()+3600000)});
  await assertFails(doc.set({...multi,revision:4}));await assertFails(owner.doc(accessPath).get());
  await provision({status:'active',expiresAt:firebase.firestore.Timestamp.fromMillis(Date.now()-1000)});
  await assertFails(doc.set({...multi,revision:4}));
  await provision({status:'active',expiresAt:'2099-01-01'});await assertFails(doc.set({...multi,revision:4}));
  await provision({owner:true});await assertSucceeds(doc.set({...multi,revision:4}));
  await assertFails(owner.doc(accessPath).update({owner:false}));await assertFails(owner.doc(accessPath).delete());
  console.log('PASS server access: free multi denied; active future entitlement and owner allowed; expired, cancelled, malformed and client forgery denied');
  console.log('PASS Firestore emulator: owner isolation, sequential revision, deletion guard');
  console.log('PASS Firestore emulator: rental service activation, entitlements and quota counters are admin-only');
 }finally{await env.cleanup()}
})().catch(e=>{console.error(e);process.exit(1)});
