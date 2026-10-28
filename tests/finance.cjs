const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(source);
const fixture=require('./fixture.cjs');
function fn(name,end){const start=source.indexOf('function '+name+'(');assert(start>=0,name);const stop=end?source.indexOf(end,start):source.indexOf('\nfunction ',start+1);return source.slice(start,stop)}
const context={db:fixture(),Date,Set,Map,Number,Math,console,document:{getElementById:id=>({value:id==='ioHolderFilter'?'Tous':'all'})}};
vm.createContext(context);
vm.runInContext("const IO_CONFIG={wealth:{keys:['net']},income:{keys:['rent','charges','cashNet']},yield:{keys:['grossYield','netYield']},diagnostic:{keys:['debt']}};"+[
fn('propertyCost'),fn('monthlyLoanPayment'),fn('loanInsurance'),fn('loanPrincipalPayment'),fn('principalRepaid'),fn('totals','\nconst OPT_DEFAULT'),fn('totalsFor'),fn('propertyLoans'),fn('cashflowGross'),fn('cashflowNet'),fn('ioToday'),fn('ioAnnualGrowth'),fn('ioDate'),fn('ioCutoff'),fn('ioOwnerCharges'),fn('ioRelatedLoans'),fn('immoptimaEstimatedLoanBalance'),fn('ioEstimatedRows'),fn('ioGetSeries'),fn('ioProjectionRows'),fn('bankPrintNumber'),fn('bankEditableNumber'),fn('esc'),"function id(){return 'qa-bankloan'}",fn('updateBankCredit'),"function save(){}","function dashboardProperties(){return db.properties}"
].join('\n'),context);
const run=s=>vm.runInContext(s,context),near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const t=run('totalsFor(db.properties)');near(t.net,124500);near(t.gross,230000);near(t.debt,105500);near(t.principal,49000);near(t.rent,1550);near(t.charges,200);near(t.payments,770);near(t.cashNet,580);near(t.grossYield,18600/275000*100);near(t.netYield,16200/275000*100);
near(run('cashflowNet(db.properties[0])'),350);near(run('cashflowGross(db.properties[0])'),800);
run('db.properties[0].recoverable=10000');near(run('totalsFor(db.properties).cashNet'),580);near(run('totals().cashNet'),580);
near(run('totalsFor([db.properties[0]]).net'),84000);near(run('totalsFor([db.properties[0]]).netYield'),7.68);
near(run('monthlyLoanPayment({initial:120000,years:10,rate:0})'),1000);near(run('monthlyLoanPayment({initial:120000,years:10,rate:0,insuranceAmount:20})'),1020);near(run('monthlyLoanPayment({initial:120000,years:10,rate:0,payment:1111,insuranceAmount:20})'),1111);
near(run('monthlyLoanPayment({initial:100000,years:20,rate:3})'),554.597597854);
near(run("immoptimaEstimatedLoanBalance({initial:120000,years:10,rate:0,startDate:'2010-01-15'},new Date('2015-01-15T12:00:00'))"),60000);
near(run("immoptimaEstimatedLoanBalance({initial:120000,years:10,rate:0,startDate:'2010-01-15'},new Date('2020-01-15T12:00:00'))"),0);
near(run("immoptimaEstimatedLoanBalance({initial:120000,years:10,rate:0,startDate:'2010-01-15'},new Date('2009-01-15T12:00:00'))"),0);
assert.equal(run("immoptimaEstimatedLoanBalance({initial:120000,years:10,rate:0},new Date())"),null);
assert.equal(run("ioDate('2024-02-31')"),null);
const old=run('JSON.stringify(db.dashboardSnapshots)');let series=run("ioGetSeries('wealth')");assert.equal(series.estimated,false);assert.equal(series.points[0].date,'2016-03-15');assert.equal(series.points.at(-1).net,124500);assert.equal(run('JSON.stringify(db.dashboardSnapshots)'),old);
run("db.dashboardSnapshots.push({...db.dashboardSnapshots[0],net:41000})");assert.equal(run("ioGetSeries('wealth').points[0].net"),41000,'duplicate dates deduplicated');
run('db.dashboardSnapshots=[]');assert(run("ioGetSeries('wealth').estimated"));assert.equal(run("ioGetSeries('wealth').points.at(-1).net"),124500);
run('db.properties[0].acquisitionDate=""');assert.equal(run("ioGetSeries('wealth').points.length"),1,'no invented curve when dates missing');
run('db.properties[0].rentHC=0;db.properties[1].rentHC=0');assert(run('totalsFor(db.properties).cashNet')<0,'negative cashflow retained');assert(run('totalsFor(db.properties).netYield')<0,'negative net yield retained');
assert.equal(run('totalsFor([]).net'),0);assert.equal(run('totalsFor([]).netYield'),0);
assert(run('bankEditableNumber(1234.56,"")').includes('value="1234.56"'),'bank thousands and decimals');
near(run('monthlyLoanPayment({initial:120000,years:10,rate:0,payment:0,paymentOverride:true})'),0);
context.db={settings:{},properties:[],assets:[],otherDebt:500,loans:[{id:'a',propertyId:'p',initial:120000,remaining:100000,years:10,rate:3,payment:1050,insuranceAmount:50}]};
const forecast=run('ioProjectionRows({years:2})');let balance=100000;for(let m=0;m<24;m++){balance=Math.max(0,balance*1.0025-1000);if(m===11)near(forecast[1].debt,balance+500)}near(forecast[2].debt,balance+500);assert(forecast[1].debt-forecast[2].debt>forecast[0].debt-forecast[1].debt,'principal increases with amortization');
near(run('ioProjectionRows({years:1,future:10000})[1].debt'),forecast[1].debt+10000);
context.db.properties=[{id:'p'}];context.db.loans.push({id:'b',propertyId:'p',payment:200});run('updateBankCredit("p",500)');near(run('db.loans.reduce((s,l)=>s+monthlyLoanPayment(l),0)'),500);run('updateBankCredit("p",0)');near(run('db.loans.reduce((s,l)=>s+monthlyLoanPayment(l),0)'),0);
console.log('PASS financial identities, recoverable neutrality, yields, scope, loan annuity/insurance, zero interest, dated amortization, real history preservation, date deduplication, insufficient history and negative/zero cases');

assert.equal(run("ioAnnualGrowth([{date:'2026-10-27',net:45000},{date:'2026-10-28',net:50000}],'net',50000,'2026-10-28')"),null,'one-day gain is not annualized');
assert.equal(run("ioAnnualGrowth([{date:'2026-10-01',net:45000},{date:'2026-10-28',net:50000}],'net',50000,'2026-10-28')"),null,'one-month gain is not annualized');
assert.equal(run("ioAnnualGrowth([{date:'2025-10-29',net:45000},{date:'2026-10-28',net:50000}],'net',50000,'2026-10-28')"),null,'less than one calendar year');
near(run("ioAnnualGrowth([{date:'2022-10-28',net:100},{date:'2026-10-28',net:146.41}],'net',146.41,'2026-10-28')"),10);
assert.equal(run("ioAnnualGrowth([{date:'2020-01-01',net:0},{date:'2026-10-28',net:50000}],'net',50000,'2026-10-28')"),null,'zero base is undefined');
assert.equal(run("ioAnnualGrowth([{date:'2020-01-01',net:-100},{date:'2026-10-28',net:50000}],'net',50000,'2026-10-28')"),null,'negative base is undefined');
console.log('PASS annual growth: short history suppressed, valid multi-year result, zero/negative base');
