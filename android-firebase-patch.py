from pathlib import Path
import sys
root=Path(sys.argv[1])
gradle=root/'app/build.gradle'
s=gradle.read_text(encoding='utf-8')
if 'com.google.firebase:firebase-auth:' not in s:
    if 'dependencies {' not in s: raise SystemExit('Gradle dependencies block missing')
    s=s.replace('dependencies {','dependencies {\n    implementation "com.google.firebase:firebase-auth:23.2.1"\n    implementation "com.google.firebase:firebase-firestore:25.1.4"',1)
    gradle.write_text(s,encoding='utf-8')
java=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=java.read_text(encoding='utf-8')
if 'IMMOPTIMA_FIREBASE_APP_ID' not in s:
    anchor='import android.print.PrintManager;'
    if anchor not in s: raise SystemExit('Expected Java import anchor missing')
    s=s.replace(anchor,'''import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.json.JSONObject;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
'''+anchor,1)
    # Explicit initialization, independent of Google Services Gradle plugin.
    # Do not enable authentication UI until native Google sign-in flow is complete.
    method='''    private static final String IMMOPTIMA_FIREBASE_APP_ID = "1:1056446883177:android:1fd67567fb5fb73996c9f8";
    private void initializeImmOptimaFirebase() {
        try {
            InputStream stream = getAssets().open("immoptima-firebase.json");
            byte[] bytes = new byte[stream.available()];
            int offset = 0;
            while (offset < bytes.length) {
                int count = stream.read(bytes, offset, bytes.length - offset);
                if (count < 0) throw new java.io.IOException("Unexpected EOF");
                offset += count;
            }
            stream.close();
            JSONObject cfg = new JSONObject(new String(bytes, StandardCharsets.UTF_8));
            FirebaseOptions options = new FirebaseOptions.Builder()
                .setApplicationId(IMMOPTIMA_FIREBASE_APP_ID)
                .setApiKey(cfg.getString("apiKey"))
                .setProjectId("immoptima-6af3b")
                .build();
            if (FirebaseApp.getApps(this).isEmpty()) FirebaseApp.initializeApp(this, options);
            FirebaseAuth.getInstance();
        } catch (Exception ex) {
            android.util.Log.e("ImmOptima", "Firebase initialization unavailable", ex);
        }
    }
'''
    anchor='    private static final int IMMOPTIMA_DRIVE_AUTH_REQUEST = 7413;'
    if anchor not in s: raise SystemExit('Drive patch must run before Firebase patch')
    s=s.replace(anchor,method+anchor,1)
    # Call only once after Activity onCreate is reached, using a safe anchor.
    anchor='        super.onCreate(savedInstanceState);'
    if anchor not in s: raise SystemExit('onCreate anchor missing')
    s=s.replace(anchor,anchor+'\n        initializeImmOptimaFirebase();',1)
    java.write_text(s,encoding='utf-8')
print('Firebase SDK and explicit initialization prepared; no user login is advertised')
