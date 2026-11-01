'use strict';
const {collectApproved}=require('./core.cjs'),sources=require('./sources.json');
// Query JSON on stdin. No provider account, secret or Firebase dependency.
(async()=>{
 let text='';for await(const chunk of process.stdin){text+=chunk;if(Buffer.byteLength(text)>2048)throw Error('INVALID_QUERY')}
 const result=await collectApproved(JSON.parse(text),sources);
 console.log(JSON.stringify(result,null,2));
})().catch(()=>{console.error('Collecte impossible : requête invalide ou service indisponible.');process.exitCode=1});
