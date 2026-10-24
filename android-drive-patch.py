from pathlib import Path
import sys
root=Path(sys.argv[1])
java=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=java.read_text(encoding='utf-8')
if 'void beginDriveBackup(' in s:
    print('Drive backup patch already applied');sys.exit(0)
anchor='    private void beginSaveFile(String content, String filename, String mimeType) {'
if anchor not in s or 'public void shareFile(' not in s:raise SystemExit('Native backup bridge anchor missing')
imports='''import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.auth.api.identity.AuthorizationRequest;
import com.google.android.gms.auth.api.identity.AuthorizationResult;
import com.google.android.gms.common.api.Scope;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStream;
import org.json.JSONObject;
import java.util.Collections;
'''
s=s.replace('import android.print.PrintManager;',imports+'import android.print.PrintManager;',1)
bridge='''            @JavascriptInterface public void backupToGoogleDrive(String json) {
                runOnUiThread(() -> beginDriveBackup(json));
            }
'''
s=s.replace('            @JavascriptInterface public void shareFile(',bridge+'            @JavascriptInterface public void shareFile(',1)
methods='''    private static final int IMMOPTIMA_DRIVE_AUTH_REQUEST = 7413;
    private String pendingDriveBackup;
    private void beginDriveBackup(String json) {
        if (json == null || json.length() > 10 * 1024 * 1024) {
            Toast.makeText(this, "Sauvegarde trop volumineuse", Toast.LENGTH_LONG).show();
            return;
        }
        try {
            JSONObject data = new JSONObject(json);
            if (!data.has("properties") || !data.has("loans") || !data.has("assets")) {
                Toast.makeText(this, "Données de sauvegarde invalides", Toast.LENGTH_LONG).show();
                return;
            }
            pendingDriveBackup = json;
            AuthorizationRequest request = AuthorizationRequest.builder()
                .setRequestedScopes(Collections.singletonList(new Scope("https://www.googleapis.com/auth/drive.appdata")))
                .build();
            Identity.getAuthorizationClient(this).authorize(request)
                .addOnSuccessListener(result -> {
                    if (result.hasResolution()) {
                        try {
                            startIntentSenderForResult(result.getPendingIntent().getIntentSender(),
                                IMMOPTIMA_DRIVE_AUTH_REQUEST, null, 0, 0, 0);
                        } catch (Exception ex) {
                            pendingDriveBackup = null;
                            Toast.makeText(this, "Autorisation Google impossible", Toast.LENGTH_LONG).show();
                        }
                    } else {
                        uploadDriveBackup(result);
                    }
                })
                .addOnFailureListener(ex -> {
                    pendingDriveBackup = null;
                    Toast.makeText(this, "Accès Google Drive indisponible", Toast.LENGTH_LONG).show();
                });
        } catch (Exception ex) {
            pendingDriveBackup = null;
            Toast.makeText(this, "Sauvegarde invalide", Toast.LENGTH_LONG).show();
        }
    }

    private void handleDriveAuthorizationResult(int resultCode, android.content.Intent data) {
        if (resultCode != RESULT_OK || data == null) {
            pendingDriveBackup = null;
            Toast.makeText(this, "Autorisation Drive annulée", Toast.LENGTH_LONG).show();
            return;
        }
        try {
            uploadDriveBackup(Identity.getAuthorizationClient(this).getAuthorizationResultFromIntent(data));
        } catch (Exception ex) {
            pendingDriveBackup = null;
            Toast.makeText(this, "Autorisation Drive refusée", Toast.LENGTH_LONG).show();
        }
    }

    private void uploadDriveBackup(AuthorizationResult result) {
        final String payload = pendingDriveBackup;
        pendingDriveBackup = null;
        final String token = result.getAccessToken();
        if (payload == null || token == null || token.isEmpty()) return;
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                String boundary = "immoptima" + System.currentTimeMillis();
                JSONObject metadata = new JSONObject();
                metadata.put("name", "immoptima-backup-" + System.currentTimeMillis() + ".json");
                metadata.put("parents", new org.json.JSONArray().put("appDataFolder"));
                byte[] header = ("--" + boundary + "\\r\\nContent-Type: application/json; charset=UTF-8\\r\\n\\r\\n" +
                    metadata.toString() + "\\r\\n--" + boundary +
                    "\\r\\nContent-Type: application/json; charset=UTF-8\\r\\n\\r\\n").getBytes(java.nio.charset.StandardCharsets.UTF_8);
                byte[] body = payload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                byte[] end = ("\\r\\n--" + boundary + "--\\r\\n").getBytes(java.nio.charset.StandardCharsets.UTF_8);
                connection = (HttpURLConnection) new URL("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name").openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.setDoOutput(true);
                connection.setRequestProperty("Authorization", "Bearer " + token);
                connection.setRequestProperty("Content-Type", "multipart/related; boundary=" + boundary);
                connection.setFixedLengthStreamingMode(header.length + body.length + end.length);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(header);out.write(body);out.write(end);
                }
                int status = connection.getResponseCode();
                if (status < 200 || status >= 300) throw new java.io.IOException("HTTP " + status);
                try (InputStream in = connection.getInputStream()) {
                    byte[] response = new byte[4096];
                    int n = in.read(response);
                    if (n <= 0 || !new JSONObject(new String(response, 0, n, java.nio.charset.StandardCharsets.UTF_8)).has("id"))
                        throw new java.io.IOException("Réponse Drive non confirmée");
                }
                runOnUiThread(() -> Toast.makeText(this, "Sauvegarde Google Drive confirmée", Toast.LENGTH_LONG).show());
            } catch (Exception ex) {
                runOnUiThread(() -> Toast.makeText(this, "Échec sauvegarde Drive : données locales conservées", Toast.LENGTH_LONG).show());
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

'''
s=s.replace(anchor,methods+anchor,1)
# Reuse the existing onActivityResult to preserve the Android file picker.
existing = 'protected void onActivityResult(int requestCode, int resultCode, Intent data) {'
if existing not in s:
    raise SystemExit('Existing onActivityResult not found; refusing unsafe modification')
s=s.replace(existing,existing+'\n        if (requestCode == IMMOPTIMA_DRIVE_AUTH_REQUEST) { handleDriveAuthorizationResult(resultCode, data); return; }',1)
java.write_text(s,encoding='utf-8')
gradle=root/'app/build.gradle'
g=gradle.read_text(encoding='utf-8')
if 'play-services-auth' not in g:
    if 'dependencies {' not in g:raise SystemExit('Gradle dependencies missing')
    g=g.replace('dependencies {','dependencies {\n    implementation "com.google.android.gms:play-services-auth:21.5.0"',1)
    gradle.write_text(g,encoding='utf-8')
manifest=root/'app/src/main/AndroidManifest.xml'
m=manifest.read_text(encoding='utf-8')
if 'android.permission.INTERNET' not in m:
    m=m.replace('<application','<uses-permission android:name="android.permission.INTERNET" />\n    <application',1)
    manifest.write_text(m,encoding='utf-8')
print('Native Google Drive backup bridge installed')
