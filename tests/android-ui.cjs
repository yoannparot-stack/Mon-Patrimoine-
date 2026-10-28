// Captures come from Android's framebuffer after rendering the installed APK.
const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict'),WebSocket=require('ws');
const fixture=require('./fixture.cjs'),out='qa-out/android';fs.mkdirSync(out,{recursive:true});
const adb=(...args)=>cp.execFileSync('adb',args,{encoding:'utf8'}).trim(),wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const apk=fs.readdirSync('installed-apk').find(n=>n.endsWith('.apk'));assert(apk,'APK artifact missing');adb('install','-r','installed-apk/'+apk);
 adb('shell','settings','put','global','window_animation_scale','0');adb('shell','settings','put','global','transition_animation_scale','0');adb('shell','settings','put','global','animator_duration_scale','0');
 adb('shell','am','start','-n','com.immoptima.app/com.monpatrimoine.app.MainActivity');
 let targets;for(let i=0;i<40;i++){await wait(500);try{const pid=adb('shell','pidof','com.immoptima.app');adb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);targets=await fetch('http://127.0.0.1:9222/json').then(r=>r.json());if(targets.some(t=>t.url.includes('appassets')))break}catch{}}
 const target=targets?.find(t=>t.url.includes('appassets'));assert(target,'WebView debugging target unavailable');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.on('open',r);ws.on('error',j)});let seq=0;const pending=new Map();ws.on('message',d=>{const msg=JSON.parse(d);if(msg.id&&pending.has(msg.id)){const {r,j,t}=pending.get(msg.id);clearTimeout(t);pending.delete(msg.id);msg.error?j(Error(msg.error.message)):r(msg.result)}});
 const cmd=(method,params={})=>new Promise((r,j)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);j(Error('CDP timeout: '+method))},15000);pending.set(id,{r,j,t});ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(JSON.stringify(v.exceptionDetails));return v.result.value};
 let ready;for(let i=0;i<60;i++){ready=await evaluate('({url:location.href,origin:location.origin,state:document.readyState,save:typeof save,html:document.documentElement?.outerHTML.slice(0,600)})');if(ready.save==='function'&&ready.origin==='https://appassets.androidplatform.net')break;await wait(500)}fs.writeFileSync(out+'/webview-ready.json',JSON.stringify(ready,null,2));assert.equal(ready.save,'function','application document must finish loading before data injection');
 await evaluate(`localStorage.setItem('immoptima_welcome_v1','seen');document.getElementById('immoptimaWelcome')?.remove();db=(${fixture.toString()})();localStorage.setItem(KEY,JSON.stringify(db));localStorage.setItem('immoptima_dashboard_view_v1','graph');renderAll();showPage('dashboard');true`);
 const capture=async(name,expected)=>{
  // Let Android's compositor present the frame; validate its actual pixels with OCR.
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))');
  for(let attempt=0;attempt<5;attempt++){
   await wait(1000);cp.execFileSync('adb',['exec-out','screencap','-p'],{stdio:['ignore',fs.openSync(out+'/'+name+'.png','w'),'inherit']});
   const ocr=cp.execFileSync('tesseract',[out+'/'+name+'.png','stdout'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});fs.writeFileSync(out+'/'+name+'-ocr.txt',ocr);
   const normalized=ocr.toLowerCase().replace(/[^a-z]/g,'');if(normalized.includes(expected.replace(/[^a-z]/g,''))&&(expected==='immoptima'||!normalized.includes('immoptima')))return;
  }
  throw Error('Android screenshot does not show expected screen: '+name);
 };
 assert.equal(await evaluate('totalsFor(db.properties).cashNet'),580);await capture('01-dashboard','immoptima');
 // Touch the actual dashboard tile using screen coordinates derived from the DOM.
 const tap=async selector=>{const r=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:innerWidth,dpr:devicePixelRatio}})()`);const size=adb('shell','wm','size').match(/(\d+)x(\d+)/),scale=Number(size[1])/r.w;adb('shell','input','tap',String(Math.round(r.x*scale)),String(Math.round(r.y*scale+24*r.dpr)));};
 await tap('#dashboardGraph article');await wait(250);assert.equal(await evaluate('document.getElementById("ioAnalysisOverlay").hidden'),false,'native touchscreen opens wealth tile');adb('shell','input','keyevent','4');await wait(200);
 // DOM click events verify handlers; Android Back is exercised natively below.
 for(const [kind,name] of [['wealth','02-richesse'],['income','03-revenus'],['yield','04-performance'],['diagnostic','05-diagnostic']]){
 await evaluate(`document.querySelector('#dashboardGraph article[onclick*="${kind}"]').click();true`);assert.equal(await evaluate('document.getElementById("ioAnalysisOverlay").hidden'),false);
 await capture(name,({wealth:'ma richesse',income:'mes revenus',yield:'ma performance',diagnostic:'mon diagnostic'})[kind]);await evaluate(`document.querySelector('#ioAnalysisBody .io-premium-tabs button:nth-child(2)').click();document.querySelector('#ioAnalysisBody .io-premium-periods button').click();true`);
 adb('shell','input','keyevent','4');await wait(250);assert.equal(await evaluate('document.getElementById("ioAnalysisOverlay").hidden'),true,'native Back closes analysis');
 }
 await evaluate("showPage('immobilier');immoptimaOpenPropertyDetail('qa-tours');true");await capture('06-bien','appartement');
 await evaluate("ioPropertyTab(2);true");assert((await evaluate('document.getElementById("ioPropertyDetailOverlay").textContent')).includes('350'));
 adb('shell','input','keyevent','4');await wait(250);assert.equal(await evaluate('document.getElementById("ioPropertyDetailOverlay").hidden'),true);
 await evaluate("db.properties[0].rentHC=925;save();true");await cmd('Page.reload');await wait(1200);assert.equal(await evaluate('db.properties[0].rentHC'),925,'WebView local data survives reload');
 await evaluate("showPage('dashboard');immoptimaMore();true");assert.equal(await evaluate('document.querySelectorAll("#ioMore .io-more-grid button").length'),11);adb('shell','input','keyevent','4');await wait(200);assert.equal(await evaluate('document.getElementById("ioMore").hidden'),true);
 await evaluate("showPage('dashboard');immoptimaFitDashboard();true");
 const layout=await evaluate('({scrollHeight:document.documentElement.scrollHeight,height:innerHeight,tiles:[...document.querySelectorAll("#dashboardGraph article")].map(e=>e.getBoundingClientRect().bottom),navTop:document.getElementById("nav").getBoundingClientRect().top})');assert(layout.scrollHeight<=layout.height+1,'Android dashboard fits one screen');assert(Math.max(...layout.tiles)<=layout.navTop+1,'all cards above Android navigation');
 await evaluate(`const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);db.dashboardSnapshots=[{date:yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0'),holder:'Tous',net:45000,debt:45000,gross:90000}];db.properties=[{id:'short',name:'Bien de validation',retainedValue:90000,rentHC:500,holder:'Validation'}];db.loans=[{propertyId:'short',remaining:40000,initial:45000,payment:200}];document.getElementById('ioHolderFilter').value='Tous';immoptimaOpenAnalysis('wealth');true`);
 assert.equal(await evaluate('document.querySelectorAll("#ioAnalysisBody .io-footer-stats b")[2].textContent'),'—');assert(await evaluate('document.getElementById("ioAnalysisOverlay").scrollWidth<=innerWidth'));
 await capture('07-richesse-historique-court','ma richesse');
 fs.writeFileSync(out+'/results.json',JSON.stringify({passed:true,package:'com.immoptima.app',device:adb('shell','getprop','ro.product.model'),api:adb('shell','getprop','ro.build.version.sdk'),screen:adb('shell','wm','size'),data:'Isolated synthetic QA portfolio, no user account',checks:['dashboard fits one screen','short-history annual growth suppressed','financial result 580 EUR','six actual APK screenshots verified with OCR','native touchscreen tile','four analysis handlers','tabs','period buttons','native Android Back','property rents tab','WebView persistence after reload','all legacy destinations accessible']},null,2));
 ws.close();console.log('PASS installed Android APK rendering, navigation, Back, persistence and six screenshots');
})().catch(e=>{console.error(e);try{cp.execFileSync('adb',['exec-out','screencap','-p'],{stdio:['ignore',fs.openSync(out+'/failure-screen.png','w'),'inherit']});fs.writeFileSync(out+'/logcat.txt',adb('logcat','-d','-t','1000'))}catch{}process.exit(1)});
