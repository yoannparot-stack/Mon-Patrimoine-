'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'immoptima-client-'));
const run=(script,out)=>cp.spawnSync('python3',[path.join(root,'scripts',script),out],{cwd:root,encoding:'utf8'});
const snapshot=dir=>Object.fromEntries(fs.readdirSync(dir).sort().map(name=>[name,fs.readFileSync(path.join(dir,name),'utf8')]));
const personal=fs.readFileSync(path.join(root,'index.html'),'utf8');
try{
 for(const channel of ['commercial','beta']){
  const script='prepare-'+channel+'.py',out=path.join(temp,channel),result=run(script,out);
  assert.equal(result.status,0,result.stderr);const built=snapshot(out),manifest=JSON.parse(built['client-build.json']);
  assert.equal(manifest.channel,channel);assert.equal(manifest.personalBypass,false);assert.equal(manifest.purchasesEnabled,false);
  for(const [name,hash]of Object.entries(manifest.assets)){assert.equal(crypto.createHash('sha256').update(built[name]).digest('hex'),hash,name);if(/\.js$|\.html$/.test(name))assert(!built[name].includes('personal-test'),name)}
  for(const config of ['play-billing.json','account-deletion.json'])assert.equal(JSON.parse(built[config]).enabled,false);
  assert(built['index.html'].includes("const IMMOPTIMA_BUILD_CHANNEL='"+channel+"';"));
  if(channel==='beta')assert.equal(JSON.parse(built['beta-build.json']).versionCode,56);
  fs.writeFileSync(path.join(out,'stale-personal.js'),'personal bypass must never survive');const before=snapshot(out);
  assert.notEqual(run(script,out).status,0);assert.deepEqual(snapshot(out),before,'refused output must be preserved');
  assert.notEqual(run(script,root).status,0);assert.notEqual(run(script,path.join(root,'public-account','must-not-create')).status,0);
  const alias=path.join(temp,channel+'-source-alias');fs.symlinkSync(path.join(root,'public-account'),alias,'dir');assert.notEqual(run(script,path.join(alias,'must-not-create')).status,0);
  assert(!fs.existsSync(path.join(root,'public-account','must-not-create')));
 }
 assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),personal);
 console.log('PASS isolated commercial/beta preparation: no personal marker, exact asset hashes, disabled services, stale output refusal and source/symlink protection');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
