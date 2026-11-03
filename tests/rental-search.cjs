'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const {db,geo}=require('./rental-model-fixture.cjs')(),p=db.properties[0];p.optimization.analysis=null;
 let supplierCalls=0;const ctx={console,URL,URLSearchParams,Map,Set,Date,Math,Number,JSON,AbortController,setTimeout,clearTimeout,db,window:{AndroidBridge:{immoptimaRentalCollect(){supplierCalls++;throw Error('Supplier must never be called by public analysis')}}},marketGeocode:async()=>({...geo,type:'street'}),ioToday:()=>new Date().toISOString().slice(0,10),ioDate:d=>new Date(d+'T00:00:00Z')};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('rental-local-data.js','utf8')+'\n'+fs.readFileSync('rental-optimization.js','utf8'),ctx);ctx.p=p;const run=s=>vm.runInContext(s,ctx);
 run("ioRentDataset=async family=>{if(family==='anil')throw Error('ANIL unavailable');return {resources:[{id:'test-oll',format:'csv',title:'Loyers 2025'}]}};ioRentTable=async()=>[{Type_habitat:'Appartement',agglomeration:'Agglomération de Tours',Data_year:2025,loyer_median:15,loyer_1_quartile:13,loyer_3_quartile:17.9,surface_moyenne:27,nombre_observations:2776,Zone_complementaire:null}]");
 assert.equal(await run('ioOptAnalyzeOne(p)'),true);assert.equal(run("ioOptEvidence(p,'nu').target"),360);assert.equal(run("ioOptEvidence(p,'meuble').target"),395);assert.equal(supplierCalls,0);assert.equal(p.rentHC,300);assert(p.optimization.analysis.errors.some(e=>e.includes('ANIL unavailable')));
 const priorDate=p.optimization.analysis.checkedAt;run("ioRentDataset=async()=>{throw Error('Offline')}");assert.equal(await run('ioOptAnalyzeOne(p)'),false);assert(p.optimization.analysis.sources.every(s=>s.retained));assert.equal(run("ioOptEvidence(p,'meuble').target"),null,'a failed refresh cannot turn retained data into a fresh target');assert.equal(supplierCalls,0);
 run("ioRentDataset=async()=>{p.surface=25;throw Error('Characteristics changed')}");await assert.rejects(()=>run('ioOptAnalyzeOne(p)'),/Caractéristiques modifiées/);assert.equal(run("ioOptEvidence(p,'nu').target"),null);
 console.log('PASS on-demand public search: OLL fallback without ANIL, no login or supplier call, outage retention, characteristics race and real rent preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
