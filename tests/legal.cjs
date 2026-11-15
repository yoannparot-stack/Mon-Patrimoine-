const assert=require('node:assert/strict'),A=require('../legal-content.js');
assert.equal(A.ready(),false);assert.equal(A.config.publisherName,'Yoann Parot');assert(!A.missing().includes('Identité de l’éditeur'));assert(A.missing({...A.config,publisherName:''}).includes('Identité de l’éditeur'));assert(A.missing().includes('Suppression du compte et des données vérifiée'));
for(const id of ['terms','privacy','subscription']){const d=A.documents()[id],html=A.html(id);assert(d.sections.length>=5);assert(html.includes('Version préparatoire'));assert(html.includes(A.VERSION));assert(!html.includes('mailto:'));assert(html.includes(d.title));}
assert(A.documents().privacy.sections.some(s=>s.paragraphs.some(p=>p.includes('n’est pas encore opérationnel'))));
const config={...A.config,publisherName:'<script>alert(1)</script>'};assert(!A.html('terms',config).includes('<script>'));assert(A.html('terms',config).includes('&lt;script&gt;'));
assert.throws(()=>A.html('other'));assert.equal(A.ready({...A.config,approvedForPublication:true,deletionVerified:true}),false);
assert(A.missing({...A.config,supportEmail:'wrong'}).includes('Contact d’assistance et de confidentialité'));
assert(A.missing({...A.config,privacyUrl:'javascript:alert(1)'}).includes('Page publique de confidentialité'));
console.log('PASS legal drafts: confirmed publisher identity, deletion and publication blockers; no invented contact, safe HTML and canonical export');
assert(A.html('subscription').includes('39,99 €'));assert(A.html('subscription').includes('7,89 €'));assert(!A.html('subscription').includes('formule annuelle reste à confirmer'));
assert(A.documents().privacy.sections.some(s=>s.paragraphs.some(p=>p.includes('24 heures'))));

assert.equal(A.config.supportChannel,'email');
assert.equal(A.config.deletionMode,'manual-email');
assert.equal(A.config.postalAddress,'');assert.equal(A.config.phone,'');
assert(A.betaMissing().includes('Adresse professionnelle'));
assert(A.betaMissing().includes('Téléphone professionnel'));
const privacy=A.documents().privacy.sections.flatMap(s=>s.paragraphs).join(' ');
assert(privacy.includes('action du responsable'));
assert(!privacy.includes('tâche prévue toutes les 15 minutes'));
assert(!privacy.includes('avant confirmation du serveur'));
assert(A.documents().terms.sections.some(s=>s.title==='Assistance par e-mail'));
console.log('PASS mail-only support preserves legal blockers and manual deletion truthfulness');
