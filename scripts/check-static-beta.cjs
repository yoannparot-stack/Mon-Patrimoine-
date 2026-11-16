'use strict';
// Exercise the package generator only; never deploy, authenticate, or send mail.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'immoptima-static-beta-'));
const script=path.join(root,'scripts/prepare-beta-account.cjs');
function run(out){return spawnSync(process.execPath,[script,out],{cwd:root,encoding:'utf8'})}
function snapshot(dir){return Object.fromEntries(fs.readdirSync(dir).sort().map(name=>[name,fs.readFileSync(path.join(dir,name),'utf8')]))}
try{
 const out=path.join(temp,'prepared'),result=run(out);
 assert.equal(result.status,0,result.stderr);
 const files=Object.keys(snapshot(out));
 assert.deepEqual(files,['account.css','assistance.html','brand-icon.svg','firebase-preview.json','index.html','privacy.html','review-readiness.json','subscription.html','suppression-beta.html','terms.html']);
 const cfg=JSON.parse(fs.readFileSync(path.join(out,'firebase-preview.json'),'utf8'));
 assert.equal(cfg.hosting.public,'.');assert.equal(cfg.hosting.site,'immoptima-6af3b');
 assert.equal(cfg.functions,undefined);assert.equal(cfg.hosting.rewrites,undefined);
 assert(cfg.hosting.ignore.includes('review-readiness.json'));
 const readiness=JSON.parse(fs.readFileSync(path.join(out,'review-readiness.json'),'utf8'));
 assert.equal(readiness.deployed,false);assert.equal(readiness.operationalDeletion,false);
 assert.equal(readiness.automaticServicesEnabled,false);assert(readiness.missing.length>0);
 const index=fs.readFileSync(path.join(out,'index.html'),'utf8');
 assert(index.includes('href="suppression-beta.html"'));
 assert(!index.includes('supprimer-mon-compte.html'));
 for(const name of files.filter(name=>name.endsWith('.html'))){
  const html=fs.readFileSync(path.join(out,name),'utf8');
  assert(!/<(?:script|form|input)\b/i.test(html),'Unexpected active service in '+name);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const target=match[1];if(/^(?:https?:|mailto:|#)/.test(target))continue;
   const resolved=path.resolve(out,target.split('#')[0]);
   assert(resolved.startsWith(out+path.sep),'Escaping link in '+name);
   assert(fs.existsSync(resolved),'Missing local target '+target+' in '+name);
  }
 }
 const moved=path.join(temp,'moved');fs.renameSync(out,moved);
 const movedCfg=JSON.parse(fs.readFileSync(path.join(moved,'firebase-preview.json'),'utf8'));
 assert.equal(path.resolve(moved,movedCfg.hosting.public),moved);
 const before=snapshot(moved),repeat=run(moved);
 assert.notEqual(repeat.status,0);assert.match(repeat.stderr,/Output must be empty/);
 assert.deepEqual(snapshot(moved),before,'Existing package changed after refusal');
 const stale=path.join(temp,'stale');fs.mkdirSync(stale);fs.writeFileSync(path.join(stale,'deletion-page.js'),'stale automatic flow');
 assert.notEqual(run(stale).status,0);assert.deepEqual(fs.readdirSync(stale),['deletion-page.js']);
 assert.equal(fs.readFileSync(path.join(stale,'deletion-page.js'),'utf8'),'stale automatic flow');
 const alias=path.join(temp,'public-alias');fs.symlinkSync(path.join(root,'public-account'),alias,'dir');
 assert.notEqual(run(path.join(alias,'must-not-create')).status,0);
 assert(!fs.existsSync(path.join(root,'public-account','must-not-create')));
 const empty=path.join(temp,'empty');fs.mkdirSync(empty);assert.equal(run(empty).status,0);
 console.log('PASS static beta: portable package, complete local links, no automatic services, stale output refused and sources preserved');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
