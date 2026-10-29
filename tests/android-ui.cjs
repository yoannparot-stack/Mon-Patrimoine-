// Captures come from Android's framebuffer after rendering the installed APK.
const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict'),WebSocket=require('ws');
const fixture=require('./fixture.cjs'),out='qa-out/android';fs.mkdirSync(out,{recursive:true});
const adb=(...args)=>cp.execFileSync('adb',args,{encoding:'utf8'}).trim(),wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 assert.equal(adb('shell','getprop','ro.kernel.qemu'),'1','QA requires a disposable Android emulator');
 const apk=fs.readdirSync('installed-apk').find(n=>n.endsWith('.apk'));assert(apk,'APK artifact missing');adb('install','-r','installed-apk/'+apk);
 adb('shell','settings','put','global','window_animation_scale','0');adb('shell','settings','put','global','transition_animation_scale','0');adb('shell','settings','put','global','animator_duration_scale','0');
 adb('shell','am','start','-n','com.immoptima.app/com.monpatrimoine.app.MainActivity');
 // Quickstep repeatedly ANRs in the headless API-35 image. Isolate the test app
 // from this unrelated launcher; this emulator is discarded after the job.
 adb('shell','pm','disable-user','--user','0','com.android.launcher3');
 adb('shell','am','force-stop','com.android.launcher3');
 let targets;for(let i=0;i<40;i++){await wait(500);try{const pid=adb('shell','pidof','com.immoptima.app');adb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);targets=await fetch('http://127.0.0.1:9222/json').then(r=>r.json());if(targets.some(t=>t.url.includes('appassets')))break}catch{}}
 const target=targets?.find(t=>t.url.includes('appassets'));assert(target,'WebView debugging target unavailable');
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.on('open',r);ws.on('error',j)});let seq=0;const pending=new Map();ws.on('message',d=>{const msg=JSON.parse(d);if(msg.id&&pending.has(msg.id)){const {r,j,t}=pending.get(msg.id);clearTimeout(t);pending.delete(msg.id);msg.error?j(Error(msg.error.message)):r(msg.result)}});
 const cmd=(method,params={})=>new Promise((r,j)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);j(Error('CDP timeout: '+method))},15000);pending.set(id,{r,j,t});ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(JSON.stringify(v.exceptionDetails));return v.result.value};
 let ready;for(let i=0;i<60;i++){ready=await evaluate('({url:location.href,origin:location.origin,state:document.readyState,save:typeof save,html:document.documentElement?.outerHTML.slice(0,600)})');if(ready.save==='function'&&ready.origin==='https://appassets.androidplatform.net')break;await wait(500)}fs.writeFileSync(out+'/webview-ready.json',JSON.stringify(ready,null,2));assert.equal(ready.save,'function','application document must finish loading before data injection');
 await evaluate(`localStorage.setItem('immoptima_welcome_v1','seen');document.getElementById('immoptimaWelcome')?.remove();db=(${fixture.toString()})();localStorage.setItem(KEY,JSON.stringify(db));localStorage.setItem('immoptima_dashboard_view_v1','graph');renderAll();showPage('dashboard');true`);
 const waitFor=async expression=>{for(let i=0;i<24;i++){if(await evaluate(expression))return;await wait(250)}throw Error('Android condition not reached: '+expression)};
 const uiNodes=()=>{try{adb('shell','uiautomator','dump','/sdcard/immoptima-qa-window.xml')}catch(e){if(e.status!==137||!String(e.stdout).includes('dumped to:'))throw e;}return adb('shell','cat','/sdcard/immoptima-qa-window.xml').match(/<node\b[^>]*>/g)||[]};
 const bounds=node=>{const m=node.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);assert(m,'native bounds');return m.slice(1).map(Number)};
 const dismissLauncherAnr=async()=>{const nodes=uiNodes();if(!nodes.some(n=>/Quickstep/.test(n)))return;const button=nodes.find(n=>/resource-id="android:id\/aerr_wait"|text="Wait"/.test(n));assert(button,'known launcher Wait button');const [l,t,r,b]=bounds(button);adb('shell','input','tap',String(Math.round((l+r)/2)),String(Math.round((t+b)/2)));await wait(500)};
 const capture=async(name,expected)=>{
  // Let Android's compositor present the frame; validate its actual pixels with OCR.
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))');
  for(let attempt=0;attempt<5;attempt++){
   await wait(1000);cp.execFileSync('adb',['exec-out','screencap','-p'],{stdio:['ignore',fs.openSync(out+'/'+name+'.png','w'),'inherit']});
   const ocr=cp.execFileSync('tesseract',[out+'/'+name+'.png','stdout'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});fs.writeFileSync(out+'/'+name+'-ocr.txt',ocr);
   if(/quickstep/i.test(ocr)&&/responding/i.test(ocr)){await dismissLauncherAnr();continue;}
   const normalized=ocr.toLowerCase().replace(/[^a-z]/g,'');if(normalized.includes(expected.replace(/[^a-z]/g,''))&&(expected==='immoptima'||!normalized.includes('immoptima')))return;
  }
  throw Error('Android screenshot does not show expected screen: '+name);
 };
 assert.equal(await evaluate('totalsFor(db.properties).cashNet'),580);await capture('01-dashboard','immoptima');
 // Touch the actual dashboard tile using screen coordinates derived from the DOM.
 const tap=async selector=>{const r=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:innerWidth}})()`);
  const views=uiNodes().filter(n=>/class="android.webkit.WebView"/.test(n)).map(bounds).sort((a,b)=>(b[2]-b[0])*(b[3]-b[1])-(a[2]-a[0])*(a[3]-a[1]));assert(views.length,'native WebView bounds');const [left,top,right,bottom]=views[0],scale=(right-left)/r.w;
  adb('shell','input','tap',String(Math.round(left+r.x*scale)),String(Math.round(top+r.y*scale)));
 };
 await evaluate("showPage('immobilier');db.properties.push({...db.properties[1],id:'qa-list-third',name:'Studio · Validation liste',address:'Tours',surface:22});renderProperties();true");
 assert.equal(await evaluate('document.querySelectorAll("#properties .io-property-card").length'),3);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
 await capture('08-biens-liste-b','immoptima');
 await tap('#properties .io-property-card .io-property-menu summary');await waitFor('document.querySelector("#properties .io-property-menu").open');
 adb('shell','input','keyevent','4');await waitFor('!document.querySelector("#properties .io-property-menu").open');assert.equal(await evaluate('document.querySelector(".page.active").id'),'immobilier');
 await tap('#properties .io-list-open');await waitFor('!document.getElementById("ioPropertyDetailOverlay").hidden');adb('shell','input','keyevent','4');await waitFor('document.getElementById("ioPropertyDetailOverlay").hidden');
 await evaluate("db.properties=db.properties.filter(p=>p.id!=='qa-list-third');renderProperties();showPage('dashboard');true");
 await tap('#dashboardGraph article');await waitFor('!document.getElementById("ioAnalysisOverlay").hidden');
 adb('shell','input','keyevent','4');await waitFor('document.getElementById("ioAnalysisOverlay").hidden');
 // DOM click events verify handlers; Android Back is exercised natively below.
 for(const [kind,name] of [['wealth','02-richesse'],['income','03-revenus'],['yield','04-performance'],['diagnostic','05-diagnostic']]){
 await evaluate(`document.querySelector('#dashboardGraph article[onclick*="${kind}"]').click();true`);assert.equal(await evaluate('document.getElementById("ioAnalysisOverlay").hidden'),false);
 await waitFor('document.getElementById("ioAnalysisOverlay").classList.contains("io-analysis-fit")');
 const analysisLayout=await evaluate('(()=>{const o=document.getElementById("ioAnalysisOverlay"),r=o.querySelector("details summary").getBoundingClientRect();return {height:innerHeight,scroll:o.scrollHeight,client:o.clientHeight,helpBottom:r.bottom,headerTop:o.querySelector(".io-analysis-header").getBoundingClientRect().top}})()');assert(analysisLayout.scroll<=analysisLayout.client+1&&analysisLayout.helpBottom<=analysisLayout.height&&analysisLayout.headerTop>=0,'closed analysis fits: '+kind+JSON.stringify(analysisLayout));
 await capture(name,({wealth:'ma richesse',income:'mes revenus',yield:'ma performance',diagnostic:'mon diagnostic'})[kind]);
 await evaluate('document.querySelector("#ioAnalysisBody details summary").click();true');await waitFor('document.getElementById("ioAnalysisOverlay").scrollHeight>document.getElementById("ioAnalysisOverlay").clientHeight+20');
 await evaluate('document.querySelector("#ioAnalysisBody details").open=false;true');await waitFor('document.getElementById("ioAnalysisOverlay").scrollHeight<=document.getElementById("ioAnalysisOverlay").clientHeight+1');await evaluate(`document.querySelector('#ioAnalysisBody .io-premium-tabs button:nth-child(2)').click();document.querySelector('#ioAnalysisBody .io-premium-periods button').click();true`);
 adb('shell','input','keyevent','4');await waitFor('document.getElementById("ioAnalysisOverlay").hidden');
 }
 await evaluate("showPage('immobilier');immoptimaOpenPropertyDetail('qa-tours');true");await capture('06-bien','appartement');
 await evaluate("ioPropertyTab(2);true");assert((await evaluate('document.getElementById("ioPropertyDetailOverlay").textContent')).includes('350'));
 adb('shell','input','keyevent','4');await waitFor('document.getElementById("ioPropertyDetailOverlay").hidden');
 await evaluate("db.properties[0].rentHC=925;save();true");await cmd('Page.reload');await wait(1200);assert.equal(await evaluate('db.properties[0].rentHC'),925,'WebView local data survives reload');
 await evaluate("showPage('dashboard');immoptimaMore();true");assert.equal(await evaluate('document.querySelectorAll("#ioMore .io-more-grid button").length'),11);adb('shell','input','keyevent','4');await waitFor('document.getElementById("ioMore").hidden');
 await evaluate("showPage('dashboard');immoptimaFitDashboard();true");
 const layout=await evaluate('({scrollHeight:document.documentElement.scrollHeight,height:innerHeight,tiles:[...document.querySelectorAll("#dashboardGraph article")].map(e=>e.getBoundingClientRect().bottom),navTop:document.getElementById("nav").getBoundingClientRect().top})');assert(layout.scrollHeight<=layout.height+1,'Android dashboard fits one screen');assert(Math.max(...layout.tiles)<=layout.navTop+1,'all cards above Android navigation');
 await evaluate(`const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);db.dashboardSnapshots=[{date:yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0'),holder:'Tous',net:45000,debt:45000,gross:90000}];db.properties=[{id:'short',name:'Bien de validation',retainedValue:90000,rentHC:500,holder:'Validation'}];db.loans=[{propertyId:'short',remaining:40000,initial:45000,payment:200}];document.getElementById('ioHolderFilter').value='Tous';immoptimaOpenAnalysis('wealth');true`);
 assert.equal(await evaluate('document.querySelectorAll("#ioAnalysisBody .io-footer-stats b")[2].textContent'),'—');assert(await evaluate('document.getElementById("ioAnalysisOverlay").scrollWidth<=innerWidth'));
 await capture('07-richesse-historique-court','ma richesse');
 fs.writeFileSync(out+'/results.json',JSON.stringify({passed:true,package:'com.immoptima.app',device:adb('shell','getprop','ro.product.model'),api:adb('shell','getprop','ro.build.version.sdk'),screen:adb('shell','wm','size'),data:'Isolated synthetic QA portfolio, no user account',checks:['dashboard fits one screen','short-history annual growth suppressed','financial result 580 EUR','six actual APK screenshots verified with OCR','native touchscreen tile','four analyses fit with closed calculations','opening help permits scrolling; closing restores viewport','four analysis handlers','tabs','period buttons','native Android Back','property rents tab','WebView persistence after reload','all legacy destinations accessible']},null,2));
 ws.close();console.log('PASS installed Android APK rendering, navigation, Back, persistence and six screenshots');
})().catch(e=>{console.error(e);try{cp.execFileSync('adb',['exec-out','screencap','-p'],{stdio:['ignore',fs.openSync(out+'/failure-screen.png','w'),'inherit']});fs.writeFileSync(out+'/logcat.txt',adb('logcat','-d','-t','1000'))}catch{}process.exit(1)});
