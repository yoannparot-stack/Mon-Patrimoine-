// Smoke test the actual signed release APK without enabling WebView debugging.
const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict');
const out='qa-out/android-client';fs.mkdirSync(out,{recursive:true});
const adb=(...args)=>cp.execFileSync('adb',args,{encoding:'utf8'}).trim();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 assert.equal(adb('shell','getprop','ro.kernel.qemu'),'1','Disposable emulator required');
 // AOSP/google_apis userdebug images force WebView debugging at OS level.
 // Use production-style Google Play images so the socket assertion is meaningful.
 assert.equal(adb('shell','getprop','ro.build.type'),'user','Production-style Android image required');
 assert.equal(adb('shell','getprop','ro.debuggable'),'0','OS debug override must be disabled');
 const apk=fs.readdirSync('installed-client').find(n=>n.endsWith('.apk'));assert(apk);
 adb('install','installed-client/'+apk);
 const info=adb('shell','dumpsys','package','com.immoptima.app');
 assert(/versionCode=50\b/.test(info));
 assert(!/\bDEBUGGABLE\b/.test(info),'Release must not be debuggable');
 adb('shell','input','keyevent','KEYCODE_WAKEUP');adb('shell','wm','dismiss-keyguard');
 adb('shell','am','start','-W','-n','com.immoptima.app/com.monpatrimoine.app.MainActivity');
 let rendered=false;
 for(let i=0;i<12;i++){
  await wait(2500);
  fs.writeFileSync(out+'/launch.png',cp.execFileSync('adb',['exec-out','screencap','-p']));
  const ocr=cp.execFileSync('tesseract',[out+'/launch.png','stdout'],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
  fs.writeFileSync(out+'/launch-ocr.txt',ocr);
  // The multicolour brand image is not reliably recognized by OCR. Require
  // three independent client-entry texts from the actual framebuffer instead.
  const text=ocr.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
  if(['betafermeegratuite','essayergratuitement','votrebilan'].every(t=>text.includes(t))){rendered=true;break;}
 }
 assert(rendered,'Actual release framebuffer must show the beta label, discovery action and property summary');
 const pid=adb('shell','pidof','com.immoptima.app');assert(/^\d+$/.test(pid));
 assert(!adb('shell','cat','/proc/net/unix').includes('webview_devtools_remote_'+pid),'No release WebView debugging socket');
 const focus=adb('shell','dumpsys','window','windows');
 assert(focus.split('\n').some(l=>/mCurrentFocus/.test(l)&&l.includes('com.immoptima.app')),'App must retain foreground focus');
 fs.writeFileSync(out+'/result.json',JSON.stringify({api:adb('shell','getprop','ro.build.version.sdk'),versionCode:50,releaseInstalled:true,framebufferRendered:true,debuggable:false,realGoogleAccountTested:false,scope:'Fresh emulator installation and launch only; customer behavior covered separately by prepared-beta browser suites'},null,2)+'\n');
 console.log('PASS signed client release installation, rendering and disabled debugging');
})().catch(e=>{console.error(e);process.exitCode=1});
