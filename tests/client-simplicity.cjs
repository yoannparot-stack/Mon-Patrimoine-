const assert=require('node:assert/strict'),S=require('../client-simplicity.js'),fixture=require('./fixture.cjs');
const f=fixture(),payment=l=>l.payment;f.assets=[{category:'Livret A',value:2464}];
const before=JSON.stringify(f),b=S.balance(f,payment);
assert.equal(b.runway,3.2);assert.equal(b.ltv,105500/230000*100);assert.equal(b.coverage,1350/770);assert.equal(JSON.stringify(f),before);
assert(S.matches({name:'Étage supérieur',address:'Rue Édouard Vaillant'},'edouard'));assert(S.matches({name:'Studio',address:'Tours'},' tours '));assert(!S.matches({name:'Studio',address:'Tours'},'<script>'));
for(const key of ['remaining','payment']){const x=structuredClone(f);x.loans[0][key]='';x.loans[0].guidanceEnteredFields=Object.keys(x.loans[0]).filter(k=>k!==key);if(key==='remaining')assert.equal(S.balance(x,payment).ltv,null);else{delete x.loans[0].initial;assert.equal(S.balance(x,payment).coverage,null)}}
const incomplete=structuredClone(f);incomplete.properties[0].guidanceEnteredFields=['name','holder'];assert.equal(S.balance(incomplete,payment).coverage,null);assert.equal(S.balance(incomplete,payment).ltv,null);
const noCredit=structuredClone(f);noCredit.loans=[];noCredit.properties.forEach(p=>p.guidanceCreditMode='none');assert.equal(S.balance(noCredit,payment).noCredit,true);assert.equal(S.balance(noCredit,payment).ltv,0);
noCredit.properties[0].guidanceCreditMode='';assert.equal(S.balance(noCredit,payment).monthly,null);
assert.equal(S.balance({...f,assets:[]},payment).runway,null);assert.equal(S.balance({...f,assets:[{category:'Livret A',value:0}]},payment).runway,0);assert.equal(S.balance({...f,assets:[{category:'Livret A',value:''}]},payment).runway,null);
const unlinked=structuredClone(f);unlinked.loans[0].propertyId='';assert.equal(S.balance(unlinked,payment).coverage,null);assert.equal(S.balance(unlinked,payment).ltv,null);
const debt=structuredClone(f);debt.otherDebt=99999;assert.equal(S.balance(debt,payment).ltv,b.ltv,'other household debt is not silently included in real-estate ratio');
console.log('PASS balance: missing values, real zero, credit status, scope, ratios and immutable inputs; accent-insensitive search');
