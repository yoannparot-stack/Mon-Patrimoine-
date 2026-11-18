'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),A=require('../solo-landlord.js');
const source=fs.readFileSync('solo-landlord.js','utf8'),start=source.indexOf(' root.immoptimaNativeRentalTrialResult='),end=source.indexOf(' root.ioSoloCheckAccount=',start);
assert(start>=0&&end>start);const callback=source.slice(start,end),now=Date.now();
function response(event,uid='client-test'){
 let value=null;const ctx={root:{ioAccountRefresh(){}},A,Date,clearTimeout,trialInfo:null,pending:new Map(),immoptimaAuthState:{status:'signed_in',uid}};
 ctx.pending.set('request-test',{uid:'client-test',resolve:r=>value=r});vm.createContext(ctx);vm.runInContext(callback,ctx);ctx.root.immoptimaNativeRentalTrialResult({requestId:'request-test',uid:'client-test',...event});return {value,stored:ctx.root.ioSoloAccountTrial()};
}
const valid={allowed:true,code:'ACTIVE',startedAt:now-1000};assert.equal(response(valid).value.allowed,true);
for(const patch of [{startedAt:now-91*86400000},{startedAt:now+86400000},{startedAt:0},{startedAt:String(now-1000)},{startedAt:null},{allowed:'true'},{code:'EXPIRED'},{code:'UNAVAILABLE'}])assert.equal(response({...valid,...patch}).value.allowed,false,'inconsistent trial must be denied '+JSON.stringify(patch));
assert.equal(response(valid,'another-client').value.code,'ACCOUNT_CHANGED');assert.equal(response({...valid,uid:'other'}).value.code,'ACCOUNT_CHANGED');assert.equal(response(valid,'another-client').stored,null);
assert.equal(response({allowed:false,code:'NOT_STARTED',startedAt:0}).value.allowed,false);
assert.equal(response({...valid,requestId:'unrelated'}).value,null);
console.log('PASS trial callback: genuine active response, expired/future/missing/string dates, boolean/code consistency, request and account isolation');
