const assert=require('node:assert/strict'),C=require('../client-experience'),R=require('../property-readiness'),fixture=require('./fixture.cjs');
const p={id:'p',name:'Studio fictif',holder:'Nom propre',type:'Appartement',address:'Adresse fictive',surface:25,rooms:1,acquisitionDate:'2020-01-01',purchase:80000,notary:6000,works:0,furniture:0,otherCost:0,retainedValue:100000,rentHC:600,recoverable:30,ownerCharges:20,tax:600,pno:12.5,otherMonthly:0,occupancy:100,dpe:'D',guidanceCreditMode:'none'};p.guidanceEnteredFields=Object.keys(p);
assert.equal(C.nextAction(p),null);assert.equal(C.nextAction(null).kind,'new');
for(const [key,stage]of [['address',0],['surface',0],['rooms',0],['purchase',1],['retainedValue',1],['pno',2],['dpe',2]]){const x=structuredClone(p);x.guidanceEnteredFields=x.guidanceEnteredFields.filter(k=>k!==key);const a=C.nextAction(x);assert.equal(a.key,key);assert.equal(a.stage,stage);assert.equal(a.id,'p')}
assert.equal(C.nextAction({...p,guidanceCreditMode:''}).stage,3);
assert.equal(C.nextAction({...p,guidanceCreditMode:'has'}).kind,'loan');
const loan={id:'loan1',propertyId:'p',initial:80000,years:20,rate:0,insuranceRate:0,payment:400,paymentOverride:true,startDate:'2020-01-01',remaining:50000};
assert.equal(C.nextAction({...p,guidanceCreditMode:'has'},[loan]),null);
const a=C.nextAction(p,[{...loan,remaining:''}]);assert.equal(a.loanId,'loan1');assert.equal(a.stage,1);assert.equal(a.key,'remaining');
const other={...loan,propertyId:'other'};assert.equal(C.nextAction({...p,guidanceCreditMode:'has'},[other]).loanId,undefined);
const parking={...p,type:'Parking / Box',dpe:'',rooms:''};assert.equal(C.nextAction(parking),null);
const before=JSON.stringify({p,loan});C.nextAction(p,[loan]);assert.equal(JSON.stringify({p,loan}),before,'planning never changes financial data');
const f=fixture();assert(f.properties.every(p=>C.nextAction(p,f.loans)===null),'legacy complete financial data does not get a new mandatory tour');
console.log('PASS client guidance: next useful field, exact stage, loan edit linkage, zeros, nonhousing, legacy and data immutability');
