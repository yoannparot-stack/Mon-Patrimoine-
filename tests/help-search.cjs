const assert=require('node:assert/strict'),H=require('../help-search.js');
for(const [query,id]of [['crédit','credit'],['emprunt','credit'],['mensualité','credit'],['quittance','receipt'],['ÉPARGNE','savings'],['livret','savings'],['assurance vie','savings'],['PDF banque','bank'],['changer de téléphone','restore'],['sauvegarde Drive','backup'],['IRL','irl'],['résilier','premium']])assert(H.search(query).some(a=>a.id===id),query);
assert.equal(H.search('qzxw inconnu').length,0);assert.equal(H.search('').length,4);assert.equal(new Set(H.actions.map(a=>a.id)).size,H.actions.length);
console.log('PASS local help: accents, synonyms, multiword queries, unknown words, defaults and unique destinations');
