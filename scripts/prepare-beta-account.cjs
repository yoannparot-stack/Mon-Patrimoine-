'use strict';
// Produce a static review package only. No deployment, function, login, or deletion.
const fs=require('node:fs'),path=require('node:path'),A=require('../legal-content.js');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(root,'beta-account-prepared'));
if(out===root||root.startsWith(out+path.sep)||out===path.join(root,'public-account'))throw Error('Output must be a separate review directory');
fs.mkdirSync(out,{recursive:true});
for(const id of ['terms','privacy','subscription'])fs.writeFileSync(path.join(out,id+'.html'),A.html(id));
for(const name of ['index.html','account.css','brand-icon.svg','suppression-beta.html'])fs.copyFileSync(path.join(root,'public-account',name),path.join(out,name));
fs.writeFileSync(path.join(out,'index.html'),fs.readFileSync(path.join(out,'index.html'),'utf8').replace('supprimer-mon-compte.html','suppression-beta.html'));
const readiness={version:A.VERSION,publisher:A.config.publisherName,mode:'manual-request-preview',deployed:false,operationalDeletion:false,automaticServicesEnabled:false,requiresFinalManualPolicy:true,missing:A.betaMissing()};
fs.writeFileSync(path.join(out,'review-readiness.json'),JSON.stringify(readiness,null,2)+'\n');
const config={hosting:{site:'immoptima-6af3b',public:out,ignore:['firebase*.json','**/.*','**/node_modules/**'],headers:[{source:'**',headers:[{key:'Cache-Control',value:'no-store'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Frame-Options',value:'DENY'}]}]}};
fs.writeFileSync(path.join(out,'firebase-preview.json'),JSON.stringify(config,null,2)+'\n');
console.log('Static review package prepared; not deployed. Manual deletion is not yet operational.');
