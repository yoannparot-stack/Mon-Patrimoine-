'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {calculate,reference}=require('../bank-simulator.js');
const base={amount:100000,years:20,rate:3,insurance:.3,fees:1500};
const near=(a,b,t=.01)=>assert(Math.abs(a-b)<=t,`${a} != ${b}`);
test('annuity matches independent formula; complete schedule repays principal to the cent',()=>{
 const r=calculate(base),m=.03/12;
 near(r.payment,100000*m/(1-Math.pow(1+m,-240)));assert.equal(r.schedule.length,240);assert.equal(r.schedule.at(-1).balance,0);
 near(r.schedule.reduce((s,x)=>s+x.principal,0),100000);
 for(let i=0;i<240;i++){const row=r.schedule[i],before=i?r.schedule[i-1].balance:100000;near(row.interest,Math.round(before*m*100)/100,.00001);near(before-row.principal,row.balance,.00001);assert(row.balance>=0);}
 near(r.cost,r.interest+r.insuranceTotal+1500);near(r.total,100000+r.cost);assert.equal(r.insuranceMonthly,25);assert.equal(r.monthly,579.6);
});
test('zero interest and zero insurance; final instalment adjusts rounding',()=>{
 const r=calculate({...base,amount:1000,years:3,rate:0,insurance:0,fees:0});assert.equal(r.interest,0);assert.equal(r.total,1000);assert.equal(r.monthly,27.78);assert.equal(r.lastMonthly,27.7);assert.equal(r.schedule.at(-1).balance,0);
});
test('fees are paid upfront, do not change monthly payments; insurance on initial capital',()=>{
 const a=calculate(base),b=calculate({...base,fees:0}),c=calculate({...base,insurance:0});assert.equal(a.monthly,b.monthly);near(a.cost-b.cost,1500);near(a.total-b.total,1500);assert.equal(a.insuranceTotal,6000);near(a.cost-c.cost,6000);
});
test('longer duration reduces monthly payments and increases total interest at fixed rate',()=>{
 const a=calculate({...base,years:15}),b=calculate({...base,years:25});assert(a.monthly>b.monthly);assert(a.interest<b.interest);assert(a.cost<b.cost);
});
test('invalid and incomplete entries never produce apparently valid totals',()=>{
 for(const [k,values] of Object.entries({amount:[NaN,Infinity,0,-1,10000001],years:[0,36,1.001],rate:[NaN,-1,26],insurance:[-1,11],fees:[NaN,-1,100001]}))for(const v of values)assert.throws(()=>calculate({...base,[k]:v}),`${k}=${v}`);
});
test('boundaries remain finite and repay exactly; source is dated and never a personalised TAEG',()=>{
 for(const x of [{amount:100,years:35,rate:25,insurance:10,fees:100},{amount:10000000,years:35,rate:.00001,insurance:0,fees:0}]){const r=calculate(x);assert(Number.isFinite(r.cost));assert.equal(r.schedule.at(-1).balance,0);near(r.total,r.amount+r.cost);}
 assert.equal(reference.rate,3.32);assert.equal(reference.period,'août 2026');assert(reference.url.startsWith('https://www.banque-france.fr/'));assert.equal(reference.checked,'2026-11-02');
});
