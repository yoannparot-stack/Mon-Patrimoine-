/* Run only from an administrator environment. Never embed credentials or a UID in the APK. */
'use strict';
const uid=process.argv[2];if(!uid||uid.length>128||uid.includes('/'))throw Error('Usage: node scripts/grant-owner.cjs <verified Firebase UID>');
const req=require('node:module').createRequire(require('node:path').resolve(__dirname,'../functions/package.json'));
const {initializeApp,applicationDefault}=req('firebase-admin/app');
const {getFirestore,FieldValue}=req('firebase-admin/firestore');
initializeApp({credential:applicationDefault()});
getFirestore().doc('accountAccess/'+uid).set({owner:true,updatedAt:FieldValue.serverTimestamp()},{merge:true}).then(()=>console.log('Owner access provisioned')).catch(e=>{console.error(e.message);process.exit(1)});
