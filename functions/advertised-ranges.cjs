'use strict';
// Descriptive ranges over facts already validated and deduplicated by adapters.
// No network, private contacts or model-based furnished premium.
function summarizeAdvertisedGroups(groups,surface){
 const median=a=>{const s=[...a].sort((a,b)=>a-b),i=Math.floor(s.length/2);return s.length?s.length%2?s[i]:(s[i-1]+s[i])/2:null};
 const quantile=(a,p)=>{const at=(a.length-1)*p,i=Math.floor(at);return a[i]+(a[Math.ceil(at)]-a[i])*(at-i)},round=v=>Math.round(v/5)*5;
 const ranges=groups.map(g=>{
  const middle=median(g.rows.map(r=>r.perM2)),mad=median(g.rows.map(r=>Math.abs(r.perM2-middle))),threshold=Math.max(middle*.3,3*mad);
  const rows=g.rows.filter(r=>Math.abs(r.perM2-middle)<=threshold),discarded=g.rows.length-rows.length;
  const values=rows.map(r=>r.perM2).sort((a,b)=>a-b),enough=rows.length>=3,dates=rows.map(r=>r.datePublished).sort(),domains=[...new Set(rows.map(r=>r.domain))].sort();
  const central=rows.length>=5,uncertainBundle=g.basis==='CC'&&g.bundle==='unknown';
  return {basis:g.basis,chargesScope:g.bundle,status:enough?'indicative':'insufficient',count:rows.length,sourceCount:domains.length,sourceDomains:domains,
   low:enough?round((central?quantile(values,.2):values[0])*surface):null,
   median:enough?round(median(values)*surface):null,
   high:enough?round((central?quantile(values,.8):values.at(-1))*surface):null,
   spread:central?'central_60_percent':'observed_min_max',
   evidenceLevel:!enough?'insufficient':rows.length<5||uncertainBundle?'limited':'indicative',
   period:dates.length?[dates[0],dates.at(-1)]:[],outliers:discarded,
   usableAsHCTarget:enough&&g.basis==='HC',
   caveat:uncertainBundle?'Périmètre des charges non précisé : repère CC limité.':g.bundle==='all-inclusive'?'Services inclus : ne pas comparer directement à un loyer HC.':'Loyers annoncés, pas loyers signés.',
   references:rows.map(({perM2,domain,...r})=>r)};
 });
 return ranges;
}
module.exports={summarizeAdvertisedGroups};
