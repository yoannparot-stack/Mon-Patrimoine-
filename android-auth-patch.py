from pathlib import Path
import sys
root=Path(sys.argv[1])
java=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=java.read_text(encoding='utf-8')
if 'IMMOPTIMA_LOGIN_REQUEST' in s: sys.exit(0)
anchor='import android.print.PrintManager;'
if anchor not in s: raise SystemExit('Java import anchor missing')
s=s.replace(anchor,'''import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.firebase.auth.FirebaseUser;
'''+anchor,1)
bridge='            @JavascriptInterface public void backupToGoogleDrive(String json) {'
if bridge not in s: raise SystemExit('AndroidBridge anchor missing')
s=s.replace(bridge,'''            @JavascriptInterface public void immoptimaSignIn() {
                runOnUiThread(() -> beginImmoptimaSignIn());
            }
            @JavascriptInterface public void immoptimaSignOut() {
                runOnUiThread(() -> {
                    try {
                        FirebaseAuth.getInstance().signOut();
                        GoogleSignIn.getClient(MainActivity.this, immoptimaGoogleOptions()).signOut();
                        notifyImmoptimaAuth("signed_out", "", "");
                    } catch(Exception e) { notifyImmoptimaAuth("error", "", "Déconnexion impossible"); }
                });
            }
            @JavascriptInterface public void immoptimaAuthStatus() {
                runOnUiThread(() -> {
                    try {
                        FirebaseUser user=FirebaseAuth.getInstance().getCurrentUser();
                        notifyImmoptimaAuth(user==null?"signed_out":"signed_in", user==null?"":user.getUid(), user==null?"":user.getEmail());
                    } catch(Exception e) { notifyImmoptimaAuth("error", "", "Service indisponible"); }
                });
            }
'''+bridge,1)
anchor='    private static final int IMMOPTIMA_DRIVE_AUTH_REQUEST = 7413;'
if anchor not in s: raise SystemExit('Native Drive request anchor missing')
methods='''    private static final int IMMOPTIMA_LOGIN_REQUEST = 7414;
    private GoogleSignInOptions immoptimaGoogleOptions() {
        return new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken("1056446883177-en2sei046aeb8nh3gmt73cadq6ta900h.apps.googleusercontent.com")
            .requestEmail().build();
    }
    private void notifyImmoptimaAuth(String status, String uid, String detail) {
        try {
            JSONObject payload=new JSONObject();
            payload.put("status", status);
            payload.put("uid", uid==null?"":uid);
            payload.put("detail", detail==null?"":detail);
            runOnUiThread(() -> webView.evaluateJavascript(
                "window.immoptimaNativeAuthResult&&window.immoptimaNativeAuthResult("+payload.toString()+")", null));
        } catch(Exception ignored) { }
    }
    private void beginImmoptimaSignIn() {
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                notifyImmoptimaAuth("error", "", "Firebase non initialisé"); return;
            }
            startActivityForResult(
                GoogleSignIn.getClient(this, immoptimaGoogleOptions()).getSignInIntent(),
                IMMOPTIMA_LOGIN_REQUEST);
        } catch(Exception ex) {
            notifyImmoptimaAuth("error", "", "Impossible de lancer la connexion Google");
        }
    }
    private void finishImmoptimaSignIn(int resultCode, Intent data) {
        if(resultCode!=RESULT_OK || data==null) {
            notifyImmoptimaAuth("cancelled", "", "Connexion annulée"); return;
        }
        GoogleSignIn.getSignedInAccountFromIntent(data).addOnSuccessListener(account -> {
            String token=account.getIdToken();
            if(token==null || token.isEmpty()) {
                notifyImmoptimaAuth("error", "", "Jeton Google absent"); return;
            }
            FirebaseAuth.getInstance().signInWithCredential(GoogleAuthProvider.getCredential(token,null))
                .addOnSuccessListener(result -> {
                    FirebaseUser user=result.getUser();
                    if(user==null) notifyImmoptimaAuth("error", "", "Compte introuvable");
                    else notifyImmoptimaAuth("signed_in",user.getUid(),user.getEmail());
                })
                .addOnFailureListener(error -> notifyImmoptimaAuth("error", "", "Authentification Firebase refusée"));
        }).addOnFailureListener(error ->
            notifyImmoptimaAuth("error", "", "Connexion Google refusée"));
    }
'''
s=s.replace(anchor,methods+anchor,1)
anchor='protected void onActivityResult(int requestCode, int resultCode, Intent data) {'
if anchor not in s: raise SystemExit('onActivityResult missing')
s=s.replace(anchor,anchor+'\n        if (requestCode == IMMOPTIMA_LOGIN_REQUEST) { finishImmoptimaSignIn(resultCode, data); return; }',1)
java.write_text(s,encoding='utf-8')
print('ImmOptima Google Sign-In native bridge installed')
