// Synthetic supplier fixture for regression tests and labelled QA captures.
// Never loaded by the application or used as live market evidence.
module.exports=async function advertisedFixture(p){
 const core=require('../functions/rental-core.cjs'),now=Date.now();
 const q={lat:47.39,lon:.68,surface:p.surface,rooms:1,family:'appartement',communeCode:'37261',city:'Tours',postcode:'37000'};
 const result=await core.collect(q,{token:'synthetic-only',now,fetchImpl:async u=>{
  const mode=u.searchParams.get('furnished')==='true'?'meuble':'nu';
  const hits=[0,1,2].map(i=>({id:mode+'-'+i,source:'AD',type:'APARTMENT',features:{geometry:{surface:p.surface,roomCount:1},descriptive:{description:'Location annuelle, bail de 1 an.',equipments:{FURNITURE:mode==='meuble'}}},marketing:{type:'RENT',active:true,...(mode==='nu'?{priceHC:470+i*20}:{priceCC:500+i*20}),publicationStartDate:new Date(now-86400000).toISOString()},address:{city:'Tours',zipCode:'37000',street:'Rue synthétique',streetNumber:String(i+1),location:{lat:47.39,lon:.68}},ads:[{url:'https://qa-market.example/'+mode+'/'+i}]}));
  return new Response(JSON.stringify({hits,total:hits.length}));
 }});
 for(const mode of ['nu','meuble']){
  for(const r of result.modes[mode].references)r.source='Données de test · qa-market.example';
  for(const g of result.modes[mode].advertised.ranges)for(const r of g.references)r.source='Données de test · qa-market.example';
 }
 return result;
};
