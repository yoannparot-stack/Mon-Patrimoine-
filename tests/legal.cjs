const assert=require('node:assert/strict'),A=require('../legal-content.js');
assert.equal(A.ready(),false);assert(A.missing().includes('Identité de l’éditeur'));assert(A.missing().includes('Suppression du compte et des données vérifiée'));
for(const id of ['terms','privacy','subscription']){const d=A.documents()[id],html=A.html(id);assert(d.sections.length>=5);assert(html.includes('Version préparatoire'));assert(html.includes(A.VERSION));assert(!html.includes('mailto:'));assert(html.includes(d.title));}
assert(A.documents().privacy.sections.some(s=>s.paragraphs.some(p=>p.includes('n’est pas encore opérationnel'))));
const config={...A.config,publisherName:'<script>alert(1)</script>'};assert(!A.html('terms',config).includes('<script>'));assert(A.html('terms',config).includes('&lt;script&gt;'));
assert.throws(()=>A.html('other'));assert.equal(A.ready({...A.config,approvedForPublication:true,deletionVerified:true}),false);
assert(A.missing({...A.config,supportEmail:'wrong'}).includes('Contact d’assistance et de confidentialité'));
assert(A.missing({...A.config,privacyUrl:'javascript:alert(1)'}).includes('Page publique de confidentialité'));
console.log('PASS legal drafts: missing identity, deletion and publication blockers; no invented contact, safe HTML and canonical export');
