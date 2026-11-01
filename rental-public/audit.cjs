'use strict';
// Explicit operator command. No background task, provider account or paid API.
const {inspectSource}=require('./core.cjs'),sources=require('./sources.json');
(async()=>{
 const checkedAt=new Date().toISOString(),results=[];
 // Deliberately sequential: one small assessment per publisher, no crawling.
 for(const source of sources)results.push(await inspectSource(source));
 console.log(JSON.stringify({checkedAt,scope:'Source assessment, not a market valuation',clientReady:false,activeSources:sources.filter(s=>s.enabled).length,results},null,2));
})().catch(()=>{console.error('Source assessment failed');process.exitCode=1});
