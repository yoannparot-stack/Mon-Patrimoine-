'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
const policy=require('../access-policy');const now=100000;
for(const [access,expected] of [[{},false],[{owner:true},true],[{owner:'true'},false],[{status:'active',expiresAt:now+1},true],[{status:'active',expiresAt:now},false],[{status:'expired',expiresAt:now+1},false],[{status:'active',expiresAt:'2099'},false]]){assert.equal(policy.decide(11,access,now),expected);assert(policy.decide(1,access,now))}
const html=fs.readFileSync('index.html','utf8'),slice=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));
function env(channel='commercial',allowed=false){
 const data={settings:{holders:[]},properties:[{id:'existing'}],loans:[],assets:[]},store=new Map(),alerts=[];
 const ctx={console,crypto,structuredClone,TextEncoder,TextDecoder,Uint8Array,atob,setTimeout,clearTimeout,alert:m=>alerts.push(m),confirm:()=>true,db:structuredClone(data),empty:structuredClone(data),KEY:'test',IMMOPTIMA_SYNC_META_KEY:'meta',DEFAULT_HOLDERS:[],immoptimaAuthState:{status:'signed_in',uid:'a'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},normalizeHolder:p=>p,immoptimaSyncMarkDirty(){},renderAll(){},document:{getElementById(){return null},createElement(){return {style:{},setAttribute(){}}},body:{appendChild(){}}},immoptimaCloudState:{},immoptimaCloudUpdateStatus(){},immoptimaSyncMeta:()=>({dirty:false}),navigator:{onLine:true}};
 ctx.window=ctx;ctx.AndroidBridge={immoptimaAccessCheck(requestId){queueMicrotask(()=>ctx.immoptimaNativeAccessResult({requestId,uid:'a',allowed,expiresAt:Date.now()+3600000}))}};
 ctx.FileReader=class{readAsText(f){this.result=f.text;ctx.pendingRead=this.onload()}};
 vm.createContext(ctx);vm.runInContext(slice('function ioValidatePortfolio(', 'function normalizeHolder('),ctx);vm.runInContext("const IMMOPTIMA_BUILD_CHANNEL='"+channel+"';"+slice('const ioAccessPending=new Map();','const DEFAULT_HOLDERS='),ctx);
 for(const [a,b] of [['async function immoptimaRecoverBeforeRestore(){','async function immoptimaRestoreFromDriveBase64'],['async function immoptimaRestoreFromDriveBase64','function listPrivateDriveBackups'],['function importData(e){','function installDemoData']]){
  let source=slice(a,b);if(a.startsWith('function importData'))source=source.split('\n')[0];vm.runInContext(source,ctx);
 }
 vm.runInContext(slice('window.immoptimaNativeCloudResult=async function(event){',"window.addEventListener('online'"),ctx);
 return {ctx,store,data,alerts};
}
(async()=>{
 const backup=n=>({settings:{owner:true,premium:true,plan:'premium'},properties:Array.from({length:n},(_,i)=>({id:'p'+i})),loans:[],assets:[],subscription:{active:true},owner:true});
 for(const [channel,allowed,expected] of [['commercial',false,false],['commercial',true,true],['personal-test',false,true]])for(const route of ['file','drive','recovery','cloud']){
  const {ctx,store,data}=env(channel,allowed),candidate=backup(11);store.set('test',JSON.stringify(data));
  if(route==='file'){ctx.importData({target:{files:[{size:200,text:JSON.stringify(candidate)}],value:'x'}});await ctx.pendingRead}
  if(route==='drive')await ctx.immoptimaRestoreFromDriveBase64(Buffer.from(JSON.stringify(candidate)).toString('base64'));
  if(route==='recovery'){store.set('immoptima_pre_restore_v1',JSON.stringify(candidate));await ctx.immoptimaRecoverBeforeRestore()}
  if(route==='cloud')await ctx.immoptimaNativeCloudResult({uid:'a',event:'snapshot',data:JSON.stringify({revision:1,payload:candidate})});
  assert.equal(ctx.db.properties.length,expected?11:1,channel+' '+route);
  if(!expected)assert.equal(store.get('test'),JSON.stringify(data),'denied operation leaves persisted portfolio unchanged');
 }
 const e=env();e.ctx.AndroidBridge=null;assert(await e.ctx.ioAccessAuthorize(backup(1)));assert.equal(await e.ctx.ioAccessAuthorize(backup(2)),false);
 const race=env();let request;race.ctx.AndroidBridge.immoptimaAccessCheck=id=>request=id;const result=race.ctx.ioAccessAuthorize(backup(3));race.ctx.immoptimaAuthState.uid='b';race.ctx.immoptimaNativeAccessResult({requestId:request,uid:'a',allowed:true});assert.equal(await result,false);
 const throwing=env();throwing.ctx.AndroidBridge.immoptimaAccessCheck=()=>{throw Error('offline')};assert.equal(await throwing.ctx.ioAccessAuthorize(backup(3)),false);
 for(const failure of ['metadata','portfolio','render']){
  const {ctx,store,data}=env('personal-test');store.set('test',JSON.stringify(data));const write=ctx.localStorage.setItem;
  ctx.localStorage.setItem=(k,v)=>{if((failure==='metadata'&&k==='meta')||(failure==='portfolio'&&k==='test'&&v.includes('p0')))throw Error('QA storage refused');write(k,v)};
  if(failure==='render')ctx.renderAll=()=>{throw Error('QA rendering refused')};
  await ctx.immoptimaNativeCloudResult({uid:'a',event:'snapshot',data:JSON.stringify({revision:1,payload:backup(2)})});
  assert.equal(JSON.stringify(ctx.db),JSON.stringify(data),'cloud '+failure+' keeps active portfolio');assert.equal(store.get('test'),JSON.stringify(data),'cloud '+failure+' keeps persisted portfolio');
 }
 console.log('PASS access: active/expired/owner policy; local, Drive, recovery and cloud imports; forged backup ignored; denied operations preserve data; personal bypass; single property; account switch and bridge failure');
})().catch(e=>{console.error(e);process.exit(1)});
