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
java_file.write_text(source, encoding="utf-8")
print("PASS: Android native print dialog enabled for bank summary PDF")
