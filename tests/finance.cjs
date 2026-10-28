const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('index.html','utf8'),source=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(source);
const fixture=require('./fixture.cjs');
function fn(name,end){const start=source.indexOf('function '+name+'(');assert(start>=0,name);const stop=end?source.indexOf(end,start):source.indexOf('\nfunction ',start+1);return source.slice(start,stop)}
const context={db:fixture(),Date,Set,Map,Number,Math,console,document:{getElementById:id=>({value:id==='ioHolderFilter'?'Tous':'all'})}};
vm.createContext(context);
vm.runInContext("const IO_CONFIG={wealth:{keys:['net']},income:{keys:['rent','charges','cashNet']},yield:{keys:['grossYield','netYield']},diagnostic:{keys:['debt']}};"+[
fn('propertyCost'),fn('monthlyLoanPayment'),fn('principalRepaid'),fn('totals','\nconst OPT_DEFAULT'),fn('totalsFor'),fn('propertyLoans'),fn('cashflowGross'),fn('cashflowNet'),fn('ioToday'),fn('ioDate'),fn('ioCutoff'),fn('ioOwnerCharges'),fn('ioRelatedLoans'),fn('immoptimaEstimatedLoanBalance'),fn('ioEstimatedRows'),fn('ioGetSeries'),"function dashboardProperties(){return db.properties}"
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
console.log('PASS financial identities, recoverable neutrality, yields, scope, loan annuity/insurance, zero interest, dated amortization, real history preservation, date deduplication, insufficient history and negative/zero cases');
