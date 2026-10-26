const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const fs=require('fs');
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
  const create={schemaVersion:1,revision:1,updatedAt:require('firebase/firestore').serverTimestamp(),payload};
  await assertFails(anon.doc(path).get());
  await assertFails(intruder.doc(path).get());
  await assertSucceeds(doc.set(create));
  await assertSucceeds(doc.get());
  await assertFails(intruder.doc(path).set(create));
  await assertFails(doc.set({...create,revision:3}));
  await assertSucceeds(doc.set({...create,revision:2}));
  await assertFails(doc.delete());
  await assertFails(owner.doc('users/owner/portfolios/other').set(create));
  console.log('PASS Firestore emulator: owner isolation, sequential revision, deletion guard');
 }finally{await env.cleanup()}
})().catch(e=>{console.error(e);process.exit(1)});
