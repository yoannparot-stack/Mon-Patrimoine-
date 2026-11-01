'use strict';
// Operator-only, provider secret from environment. Output never includes the key.
const api=require('./cherchertrouver.cjs');
(async()=>{
 const key=process.env.IMMOPTIMA_CT_API_KEY;
 if(process.argv.includes('--collect')){
  if(process.env.IMMOPTIMA_CT_PROFESSIONAL_USE!=='confirmed')throw Object.assign(Error(),{code:'PROFESSIONAL_USE_NOT_CONFIRMED'});
  let input='';for await(const b of process.stdin){input+=b;if(input.length>2048)throw Error()}
  console.log(JSON.stringify(await api.collect(JSON.parse(input),{key,professionalUseConfirmed:true}),null,2));
 }else console.log(JSON.stringify(await api.probe(key),null,2));
})().catch(e=>{console.error(JSON.stringify({status:'not_activated',code:/^[A-Z_]+$/.test(e.code||'')?e.code:'SERVICE_UNAVAILABLE'}));process.exitCode=1});
