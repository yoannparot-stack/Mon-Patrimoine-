"""Open only the configured account-deletion page in the external browser."""
from pathlib import Path
import sys
root=Path(sys.argv[1]);base=Path(__file__).resolve().parent
(root/'app/src/main/assets/account-deletion.json').write_bytes((base/'account-deletion/config.json').read_bytes())
p=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java';s=p.read_text()
anchor='            @JavascriptInterface public void immoptimaSignIn() {'
assert anchor in s
s=s.replace(anchor,'''            @JavascriptInterface public void immoptimaOpenAccountDeletion() {
                runOnUiThread(() -> {
                    if (!immoptimaRentalOrigin()) return;
                    try {
                        java.io.InputStream stream=getAssets().open("account-deletion.json");
                        java.io.ByteArrayOutputStream output=new java.io.ByteArrayOutputStream();
                        byte[] buffer=new byte[1024];int count;
                        while((count=stream.read(buffer))!=-1)output.write(buffer,0,count);stream.close();
                        JSONObject config=new JSONObject(output.toString("UTF-8"));
                        String url=config.optString("deletionUrl", "");android.net.Uri uri=android.net.Uri.parse(url);
                        if(!config.optBoolean("enabled",false)||!"https".equals(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||uri.getFragment()!=null)throw new Exception();
                        startActivity(new Intent(Intent.ACTION_VIEW,uri));
                    } catch(Exception error) {
                        new android.app.AlertDialog.Builder(MainActivity.this).setTitle("Suppression du compte")
                            .setMessage("Le service de suppression du compte n’est pas encore activé. Aucune demande n’a été envoyée et aucune donnée n’a été supprimée.").setPositiveButton("Compris",null).show();
                    }
                });
            }
'''+anchor,1);p.write_text(s)
print('Account deletion browser entry installed; disabled until deployment verification.')
