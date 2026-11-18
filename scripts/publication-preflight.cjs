'use strict';
// Read-only completeness report, never a deployment or operational certification.
const fs=require('node:fs'),L=require('../legal-content.js');
function report(scope='beta'){
 if(!['beta','commercial'].includes(scope))throw Error('Use beta or commercial');
 const missing=scope==='beta'?L.betaMissing():L.missing();
 return {scope,legalVersion:L.VERSION,legalComplete:missing.length===0,missing,status:missing.length?'blocked':'legal_complete_operations_still_to_verify',mayPublish:false,operationalChecks:['real Google client login and unique trial','real cloud backup and second-device restore','real disposable-account deletion and old-session denial','public HTTPS URLs and exact store declarations',...(scope==='commercial'?['merchant/account identity and applicable business terms','deployed purchase verification and real Google license tests']:[])],purchasesEnabled:JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../billing/play-billing.json'))).enabled,limitations:'Local source completeness only; no live Google/Firebase account, URL, contract or deletion is certified.'};
}
module.exports={report};
if(require.main===module){try{const r=report(process.argv[2]||'beta');console.log(JSON.stringify(r,null,2));process.exitCode=r.legalComplete?0:1}catch(e){console.error(e.message);process.exitCode=2}}
