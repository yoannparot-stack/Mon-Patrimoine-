'use strict';
const assert=require('node:assert/strict'),{report}=require('./publication-preflight.cjs');
for(const scope of ['beta','commercial']){const r=report(scope);assert.equal(r.legalComplete,false);assert.equal(r.status,'blocked');assert.equal(r.mayPublish,false);assert.equal(r.purchasesEnabled,false);assert(r.missing.includes('Durées de conservation'));assert(r.missing.includes('Page publique de confidentialité'));assert(r.missing.includes('Suppression du compte et des données vérifiée'));assert(r.operationalChecks.length>=4)}
assert(report('commercial').missing.includes('Identification professionnelle'));assert(!report('beta').missing.includes('Identification professionnelle'));assert.throws(()=>report('unknown'));
console.log('PASS publication remains blocked: unknown legal fields and operational checks are not certified by source tests');
