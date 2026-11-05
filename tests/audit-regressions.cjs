const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),R=require('../property-readiness');
const source=fs.readFileSync('index.html','utf8');function fn(name){const a=source.indexOf('function '+name+'(');assert(a>=0,name);const b=source.indexOf('\nfunction ',a+1);return source.slice(a,b)}
const ctx={ImmOptimaReadiness:R,structuredClone,id:()=> 'audit-loan',save(){},db:{properties:[],loans:[]}};vm.createContext(ctx);vm.runInContext(['loanInsurance','monthlyLoanPayment','ioMarkEntered','bankReportKnown','bankValueHC','bankCharges','ioValidatePortfolio','propertyLoans','ioPropertyDisplayState','updateBankCredit','ioMarketSyncBusy'].map(fn).join('\n'),ctx);const run=s=>vm.runInContext(s,ctx);
assert.equal(run('loanInsurance({initial:100000,insuranceRate:.5,insuranceAmount:0,insuranceAmountOverride:true})'),0);
assert.equal(run('monthlyLoanPayment({initial:120000,years:10,rate:0,insuranceRate:.5,insuranceAmount:0,insuranceAmountOverride:true})'),1000);
assert(run('loanInsurance({initial:100000,insuranceRate:.5,insuranceAmount:0})')>40,'legacy default zero still uses rate');
assert.equal(run("loanInsurance({initial:100000,insuranceRate:.5,insuranceAmount:0,guidanceEnteredFields:['insuranceAmount']})"),0);
assert.equal(run('monthlyLoanPayment({initial:120000,years:-1,rate:3})'),0);
assert.equal(run('monthlyLoanPayment({initial:120000,years:20,rate:-2})'),0);
assert.equal(run("bankValueHC({rentHC:0,guidanceEnteredFields:[]})"),null);assert.equal(run("bankValueHC({rentHC:0,guidanceEnteredFields:['rentHC']})"),0);
assert.equal(run('bankCharges({recoverable:0})'),0);
run("p={rentHC:500,guidanceEnteredFields:['name']};ioMarkEntered(p,['rentHC'])");assert.equal(run("bankValueHC(p)"),500);
const base={settings:{holders:[]},properties:[{id:'p',name:'Fictif'}],loans:[],assets:[]};ctx.input=base;assert.equal(run('ioValidatePortfolio(input)'),base);
for(const change of [x=>x.properties.push({...x.properties[0]}),x=>x.properties[0].rentHC='Infinity',x=>x.properties[0].surface=-10,x=>x.properties[0].sources=[null],x=>x.properties[0].optimization={references:[null]},x=>x.loans.push(null),x=>x.assets.push({id:'a',value:{}})]){const bad=structuredClone(base);change(bad);ctx.bad=bad;assert.throws(()=>run('ioValidatePortfolio(bad)'));assert.deepEqual(base,{settings:{holders:[]},properties:[{id:'p',name:'Fictif'}],loans:[],assets:[]})}
ctx.input=require('./fixture.cjs')();assert.doesNotThrow(()=>run('ioValidatePortfolio(input)'));
const property={id:'p',type:'Appartement',rentHC:600,ownerCharges:0,tax:0,pno:0,otherMonthly:0};
assert(R.assess(property,[{propertyId:'p',payment:0,paymentOverride:true}]).ready.cash,'known inclusive monthly total needs no separate insurance');
assert(R.assess(property,[{propertyId:'p',payment:400}]).ready.cash);
assert.equal(R.assess({id:'p',type:'Parking / Box',surface:12,address:'Adresse fictive'}).ready.market,false);
ctx.db={properties:[],loans:[]};ctx.p={...property,guidanceEnteredFields:['name','holder'],retainedValue:0};const state=run('ioPropertyDisplayState(p)');assert.equal(state.cash,false);assert.equal(state.value,false);
ctx.db={properties:[{...property,guidanceEnteredFields:Object.keys(property)}],loans:[]};run("updateBankCredit('p',400)");assert.equal(ctx.db.loans[0].remaining,0);assert(!ctx.db.loans[0].guidanceEnteredFields.includes('remaining'));assert.equal(run('ioPropertyDisplayState(db.properties[0]).debt'),false);
ctx.ioMarketAllBusy=false;ctx.ioMarketBusy=new Set();const unsupported={dataset:{marketSupported:'false'}},supported={dataset:{marketSupported:'true'}};ctx.document={querySelectorAll:()=>[unsupported,supported],getElementById:()=>({setAttribute(){}})};run('ioMarketSyncBusy()');assert.equal(unsupported.disabled,true);assert.equal(supported.disabled,false);ctx.ioMarketAllBusy=true;run('ioMarketSyncBusy()');assert.equal(supported.disabled,true);
console.log('PASS audit regressions: explicit zero insurance, inclusive instalments, negative inputs, incomplete fields, bank metadata, malformed imports and real demo compatibility');
