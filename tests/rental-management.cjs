'use strict';
const assert=require('node:assert/strict'),a=require('../rental-management');
const base={month:'2026-01',rent:'500',charges:'35',paid:'535',paymentDate:'2026-01-05',confirmed:true};
const identity={ownerName:'Bailleur',ownerAddress:'Adresse bailleur',tenantName:'Locataire',address:'Logement'};
assert.equal(a.cents('1,01'),101);assert.throws(()=>a.cents('-1'));assert.throws(()=>a.cents('1.001'));assert.throws(()=>a.cents('Infinity'));
assert.equal(a.payment(base).type,'quittance');assert.equal(a.payment({...base,paid:250}).type,'recu');assert.equal(a.payment({...base,paid:0,confirmed:false}).type,'none');
assert.equal(a.payment({...base,paid:534.99}).balance,.01);assert.equal(a.receipt({...base,paid:600},identity).excess,65);assert.equal(a.receipt(base,identity).due,535);
assert.throws(()=>a.payment({...base,confirmed:false}),/Confirmez/);assert.throws(()=>a.payment({...base,paymentDate:'2026-02-30'}));assert.throws(()=>a.payment({...base,paymentDate:'2099-01-01'}),/future/);assert.throws(()=>a.payment({...base,month:'2026-13'}));
assert.throws(()=>a.receipt({...base,paid:0},identity),/Aucun/);assert.throws(()=>a.receipt(base,{}),/Complétez/);assert.throws(()=>a.receipt(base,identity,'2026-01-01'),/incohérente/);
assert.equal(a.receipt({...base,paid:10},identity).title,'Reçu de paiement partiel');
assert.equal(a.regularization({year:2026,mode:'provisions',provisions:600,actual:550}).balance,-50);assert.equal(a.regularization({year:2026,mode:'provisions',provisions:600,actual:620}).balance,20);assert.throws(()=>a.regularization({year:2026,mode:'forfait',provisions:600,actual:650}),/forfait/);
assert.deepEqual(a.missingIdentity({...identity,ownerAddress:' ',tenantName:''}).map(f=>f.key),['ownerAddress','tenantName']);
try{a.receipt(base,{...identity,tenantName:''});assert.fail('Missing tenant must block')}catch(e){assert.deepEqual(e.fields,[{key:'tenantName',label:'Nom du locataire',tab:'dossier'}])}
try{a.payment({...base,paid:'wrong'});assert.fail('Invalid amount must block')}catch(e){assert.equal(e.fields[0].key,'paid')}
const before=JSON.stringify(base);a.receipt(base,identity);assert.equal(JSON.stringify(base),before);const d=a.dossier({documents:{dpe:'available',insurance:'fake'},mode:'meuble',inventory:[true]});assert.equal(d.documents.insurance,'missing');assert.equal(d.documents.dpe,'available');assert.equal(d.inventory.length,11);assert.equal(d.inventory.filter(Boolean).length,1);assert.equal(a.DOCUMENTS.some(([k])=>k==='localRules'),false);
console.log('PASS rental management: exact cents, full/partial/absent payment, identity, real payment confirmation, invalid dates, overpayment, provisions versus forfait, dossier and inventory, no mutations');
