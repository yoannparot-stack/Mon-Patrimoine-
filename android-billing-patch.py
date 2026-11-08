from pathlib import Path
import sys
root=Path(sys.argv[1]);base=Path(__file__).resolve().parent
gradle=root/'app/build.gradle';s=gradle.read_text()
if 'com.android.billingclient:billing:' not in s:s=s.replace('dependencies {','dependencies {\n    implementation "com.android.billingclient:billing:8.3.0"',1);gradle.write_text(s)
assets=root/'app/src/main/assets';(assets/'play-billing.json').write_bytes((base/'billing/play-billing.json').read_bytes())
java=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java';s=java.read_text()
if 'immoptimaPlayBilling(' not in s:
 anchor='            @JavascriptInterface public void immoptimaRentalTrial('
 assert anchor in s
 s=s.replace(anchor,'''            @JavascriptInterface public void immoptimaPlayBilling(String requestId,String action,String plan) {
                runOnUiThread(() -> {
                    if (!immoptimaRentalOrigin()) return;
                    if (immoptimaPlay == null) immoptimaPlay=new ImmOptimaPlayBilling(MainActivity.this,webView);
                    immoptimaPlay.request(requestId,action,plan);
                });
            }
'''+anchor,1)
 anchor='public class MainActivity extends Activity {';assert anchor in s
 s=s.replace(anchor,anchor+'\n    private ImmOptimaPlayBilling immoptimaPlay;\n    @Override protected void onResume(){ super.onResume(); if(webView!=null){ if(immoptimaPlay==null)immoptimaPlay=new ImmOptimaPlayBilling(this,webView); immoptimaPlay.resume(); } }\n    @Override protected void onDestroy(){ if(immoptimaPlay!=null)immoptimaPlay.close(); super.onDestroy(); }',1);java.write_text(s)
(java.parent/'ImmOptimaPlayBilling.java').write_bytes((base/'billing/ImmOptimaPlayBilling.java').read_bytes())
manifest=root/'app/src/main/AndroidManifest.xml';s=manifest.read_text()
if 'com.android.vending.BILLING' not in s:s=s.replace('<application ', '<uses-permission android:name="com.android.vending.BILLING"/>\n<application ',1);manifest.write_text(s)
print('Google Play native preparation installed; purchasing disabled by config.')
