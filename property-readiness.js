(function(root,factory){const a=factory();if(typeof module==='object'&&module.exports)module.exports=a;else root.ImmOptimaReadiness=a})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const labels={name:'Nom du bien',holder:'Détenteur',type:'Type de bien',address:'Adresse complète',surface:'Surface',rooms:'Nombre de pièces',acquisitionDate:'Date d’acquisition',purchase:'Prix d’achat',notary:'Frais de notaire',works:'Travaux',furniture:'Mobilier',otherCost:'Autres coûts',retainedValue:'Valeur retenue',rentHC:'Loyer hors charges',recoverable:'Provisions locatives',ownerCharges:'Charges non récupérables',tax:'Taxe foncière annuelle',pno:'Assurance propriétaire',otherMonthly:'Autres dépenses mensuelles',occupancy:'Occupation',dpe:'DPE',guidanceCreditMode:'Situation du crédit',propertyId:'Bien lié',initial:'Montant emprunté',remaining:'Capital restant dû',years:'Durée du crédit',rate:'Taux',startDate:'Date de début du crédit',insuranceRate:'Assurance du crédit'};
 const groups={market:['address','type','surface'],rentComparison:['address','type','surface','rooms','dpe'],yield:['purchase','notary','works','furniture','otherCost','rentHC','ownerCharges','tax','pno','otherMonthly'],curves:['acquisitionDate','purchase','retainedValue'],cash:['rentHC','ownerCharges','tax','pno','otherMonthly']};
 const required=[...new Set(['name','holder','type','address','surface','rooms','dpe','acquisitionDate','retainedValue','recoverable','occupancy',...groups.yield])];
 const positive=new Set(['surface','rooms','purchase','retainedValue','initial','years']);
 function filled(p,key){if(Array.isArray(p.guidanceEnteredFields)&&!p.guidanceEnteredFields.includes(key))return false;const v=p[key];if(v===null||v===undefined||String(v).trim()==='')return false;if(key==='holder')return !['À attribuer','À définir'].includes(v);if(key==='dpe')return /^[A-G]$/i.test(String(v).trim());if(/Date$/.test(key)){const d=new Date(String(v)+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v}if(['name','holder','type','address','guidanceCreditMode','propertyId'].includes(key))return true;return Number.isFinite(Number(v))&&(positive.has(key)?Number(v)>0:Number(v)>=0)}
 function missing(p,keys){return keys.filter(k=>!filled(p,k))}
 function assess(p,loans=[]){const linked=loans.filter(l=>l.propertyId===p.id),credit=linked.length?'has':p.guidanceCreditMode||'unknown';const out={};for(const [k,keys]of Object.entries(groups))out[k]=missing(p,keys);
 if(!/appartement|maison|studio|^T\d|^F\d/i.test(p.type||''))out.rentComparison=['type'];
 if(credit==='unknown')out.cash.push('guidanceCreditMode');
 if(credit==='has'&&!linked.length){out.cash.push('credit');out.curves.push('credit')}
 for(const l of linked){if(!(Number(l.payment)>0)&&missing(l,['initial','years','rate']).length)out.cash.push('credit');if(missing(l,['initial','years','rate','remaining','startDate']).length)out.curves.push('credit');if(!filled(l,'insuranceAmount')&&!filled(l,'insuranceRate'))out.cash.push('insuranceRate')}
 if(credit==='unknown')out.curves.push('guidanceCreditMode');
 for(const k of Object.keys(out))out[k]=[...new Set(out[k])];return {missing:out,ready:Object.fromEntries(Object.entries(out).map(([k,v])=>[k,!v.length])),credit};}
 return Object.freeze({labels,groups,required,filled,missing,assess});
});
