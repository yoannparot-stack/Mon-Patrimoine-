from pathlib import Path
import sys

root = Path(sys.argv[1])
java_file = root / "app/src/main/java/com/monpatrimoine/app/MainActivity.java"
source = java_file.read_text(encoding="utf-8")

if "import android.print.PrintManager;" not in source:
    source = source.replace("import android.widget.Toast;\n", "import android.widget.Toast;\nimport android.print.PrintManager;\nimport android.print.PrintAttributes;\n")

old_bridge = """@JavascriptInterface public void saveFile(String content, String filename, String mimeType) {
                runOnUiThread(() -> beginSaveFile(content, filename, mimeType));
            }
        }, "AndroidBridge");"""
new_bridge = """@JavascriptInterface public void saveFile(String content, String filename, String mimeType) {
                runOnUiThread(() -> beginSaveFile(content, filename, mimeType));
            }
            @JavascriptInterface public void printBankSummary() {
                runOnUiThread(() -> beginPrint());
            }
        }, "AndroidBridge");"""
if "public void printBankSummary()" not in source:
    if old_bridge not in source:
        raise SystemExit("ERROR: AndroidBridge saveFile insertion point not found; refusing unsafe patch")
    source = source.replace(old_bridge, new_bridge, 1)

marker = "    private void beginSaveFile(String content, String filename, String mimeType) {"
print_method = """    private void beginPrint() {
        try {
            PrintManager printManager = (PrintManager) getSystemService(PRINT_SERVICE);
            if (printManager == null) throw new IllegalStateException("service d’impression indisponible");
            PrintAttributes attributes = new PrintAttributes.Builder()
                .setMediaSize(PrintAttributes.MediaSize.ISO_A4.asLandscape())
                .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                .build();
            printManager.print(
                "Mon_Patrimoine_Synthese_Bancaire",
                webView.createPrintDocumentAdapter("Mon Patrimoine - Synthèse bancaire"),
                attributes
            );
        } catch (Exception e) {
            Toast.makeText(this, "Impossible de créer le PDF : " +
                (e.getMessage() == null ? "erreur d’impression" : e.getMessage()),
                Toast.LENGTH_LONG).show();
        }
    }

"""
if "private void beginPrint()" not in source:
    if marker not in source:
        raise SystemExit("ERROR: beginSaveFile insertion point not found; refusing unsafe patch")
    source = source.replace(marker, print_method + marker, 1)

if "printManager.print(" not in source or "public void printBankSummary()" not in source:
    raise SystemExit("ERROR: native PDF printing patch verification failed")

# Enable secure Android share-sheet attachments for JSON backups.
if "import androidx.core.content.FileProvider;" not in source:
    source = source.replace("import android.print.PrintManager;", """import androidx.core.content.FileProvider;
import android.content.Intent;
import android.net.Uri;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import android.print.PrintManager;""", 1)

bridge_anchor = """@JavascriptInterface public void printBankSummary() {
                runOnUiThread(() -> beginPrint());
            }"""
if "public void shareFile(" not in source:
    if bridge_anchor not in source:
        raise SystemExit("ERROR: shareFile bridge insertion point not found")
    source = source.replace(bridge_anchor, bridge_anchor + """
            @JavascriptInterface public void shareFile(String content, String filename, String mimeType) {
                runOnUiThread(() -> beginShareFile(content, filename, mimeType));
            }""", 1)

share_method = """    private void beginShareFile(String content, String filename, String mimeType) {
        try {
            File directory = new File(getCacheDir(), "shared_backups");
            if (!directory.exists() && !directory.mkdirs()) throw new java.io.IOException("dossier de partage indisponible");
            String safeName = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
            File file = new File(directory, safeName);
            try (FileOutputStream output = new FileOutputStream(file)) {
                output.write(content.getBytes(StandardCharsets.UTF_8));
            }
            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".backupfileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("application/json");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.putExtra(Intent.EXTRA_SUBJECT, "Sauvegarde ImmOptima");
            send.putExtra(Intent.EXTRA_TEXT, "Sauvegarde personnelle ImmOptima en pièce jointe. Ce fichier contient des informations financières confidentielles.");
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            send.setClipData(android.content.ClipData.newUri(getContentResolver(), "Sauvegarde ImmOptima", uri));
            startActivity(Intent.createChooser(send, "Partager la sauvegarde par e-mail"));
        } catch (Exception e) {
            Toast.makeText(this, "Partage impossible : " + (e.getMessage() == null ? "erreur inconnue" : e.getMessage()), Toast.LENGTH_LONG).show();
        }
    }

"""
if "private void beginShareFile(" not in source:
    if marker not in source:
        raise SystemExit("ERROR: shareFile method insertion point not found")
    source = source.replace(marker, share_method + marker, 1)

manifest_file = root / "app/src/main/AndroidManifest.xml"
manifest = manifest_file.read_text(encoding="utf-8")
if 'androidx.core.content.FileProvider' not in manifest:
    provider = """        <provider android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.backupfileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/backup_file_paths" />
        </provider>
"""
    if "</application>" not in manifest:
        raise SystemExit("ERROR: Android manifest application element not found")
    manifest = manifest.replace("</application>", provider + "    </application>", 1)
    manifest_file.write_text(manifest, encoding="utf-8")

paths_file = root / "app/src/main/res/xml/backup_file_paths.xml"
paths_file.parent.mkdir(parents=True, exist_ok=True)
paths_file.write_text('<?xml version="1.0" encoding="utf-8"?>\\n<paths xmlns:android="http://schemas.android.com/apk/res/android"><cache-path name="shared_backups" path="shared_backups/" /></paths>\\n'.replace('\\\\n','\\n'), encoding="utf-8")

if "public void shareFile(" not in source or "FileProvider.getUriForFile" not in source:
    raise SystemExit("ERROR: Android JSON attachment sharing not installed")

java_file.write_text(source, encoding="utf-8")
print("PASS: Android native print dialog enabled for bank summary PDF")
