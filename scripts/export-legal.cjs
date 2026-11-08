// Generates static drafts from the exact same version used inside the APK.
const fs=require('node:fs'),path=require('node:path'),A=require('../legal-content.js');
const out=path.resolve(process.argv[2]||'legal-pages');fs.mkdirSync(out,{recursive:true});
for(const id of Object.keys(A.documents()))fs.writeFileSync(path.join(out,id+'.html'),A.html(id));
fs.writeFileSync(path.join(out,'publication-readiness.json'),JSON.stringify({version:A.VERSION,ready:A.ready(),missing:A.missing()},null,2));
console.log('Legal drafts exported. Publication ready: '+A.ready()+'. Missing items: '+A.missing().length);
