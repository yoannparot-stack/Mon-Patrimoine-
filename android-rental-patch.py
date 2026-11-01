from pathlib import Path
import sys
java=Path(sys.argv[1])/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=java.read_text(encoding='utf-8')
if 'immoptimaRentalCollect(String requestId' in s: sys.exit(0)
bridge='            @JavascriptInterface public void immoptimaSignIn() {'
assert bridge in s, 'Auth bridge anchor missing'
s=s.replace(bridge,'''            @JavascriptInterface public void immoptimaRentalCollect(String requestId, String requestJson) {
                runOnUiThread(() -> collectImmoptimaRental(requestId, requestJson));
            }
'''+bridge,1)
anchor='    private static final int IMMOPTIMA_LOGIN_REQUEST = 7414;'
assert anchor in s, 'Auth methods anchor missing'
methods='''    // Supplier secret and Firebase ID token never cross the JavaScript bridge.
    private boolean immoptimaRentalBusy = false;
    private boolean immoptimaRentalOrigin() {
        return webView != null && "https://appassets.androidplatform.net/assets/index.html".equals(webView.getUrl());
    }
    private void notifyImmoptimaRental(String requestId, String uid, String body) {
        runOnUiThread(() -> {
            if (!immoptimaRentalOrigin()) return;
            FirebaseUser current=FirebaseAuth.getInstance().getCurrentUser();
            String currentUid=current==null?"":current.getUid();
            try {
                JSONObject payload=new JSONObject();
                payload.put("requestId",requestId); payload.put("uid",uid);
                payload.put("result",currentUid.equals(uid)?new JSONObject(body):new JSONObject().put("code","ACCOUNT_CHANGED"));
                webView.evaluateJavascript("window.immoptimaNativeRentalResult&&window.immoptimaNativeRentalResult("+payload.toString()+")",null);
            } catch(Exception ignored) {}
        });
    }
    private void collectImmoptimaRental(String requestId, String requestJson) {
        if (!immoptimaRentalOrigin() || requestId==null || !requestId.matches("[a-zA-Z0-9_-]{1,80}") || requestJson==null || requestJson.length()>2048) return;
        FirebaseUser user=FirebaseAuth.getInstance().getCurrentUser();
        String uid=user==null?"":user.getUid();
        if(user==null) { notifyImmoptimaRental(requestId,uid,"{\\"code\\":\\"AUTH_REQUIRED\\"}"); return; }
        if(immoptimaRentalBusy) { notifyImmoptimaRental(requestId,uid,"{\\"code\\":\\"BUSY\\"}"); return; }
        immoptimaRentalBusy=true;
        user.getIdToken(false).addOnSuccessListener(token -> {
            FirebaseUser current=FirebaseAuth.getInstance().getCurrentUser();
            if(current==null||!uid.equals(current.getUid())) {
                immoptimaRentalBusy=false; notifyImmoptimaRental(requestId,uid,"{\\"code\\":\\"ACCOUNT_CHANGED\\"}"); return;
            }
            new Thread(() -> {
                javax.net.ssl.HttpsURLConnection connection=null;
                String response="{\\"code\\":\\"SERVICE_UNAVAILABLE\\"}";
                try {
                    java.net.URL endpoint=new java.net.URL("https://europe-west1-immoptima-6af3b.cloudfunctions.net/rentalComparables");
                    connection=(javax.net.ssl.HttpsURLConnection)endpoint.openConnection();
                    connection.setInstanceFollowRedirects(false); connection.setRequestMethod("POST");
                    connection.setConnectTimeout(10000); connection.setReadTimeout(65000); connection.setDoOutput(true);
                    connection.setRequestProperty("Authorization","Bearer "+token.getToken());
                    connection.setRequestProperty("Content-Type","application/json; charset=utf-8");
                    byte[] bytes=requestJson.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                    connection.setFixedLengthStreamingMode(bytes.length);
                    try(java.io.OutputStream out=connection.getOutputStream()) {out.write(bytes);}
                    int status=connection.getResponseCode();
                    String contentType=connection.getContentType();
                    if(status==404) response="{\\"code\\":\\"NOT_CONFIGURED\\"}";
                    else if(contentType!=null&&contentType.toLowerCase(java.util.Locale.ROOT).contains("application/json")) {
                        java.io.InputStream stream=status>=400?connection.getErrorStream():connection.getInputStream();
                        if(stream==null) throw new java.io.IOException("Empty response");
                        try(java.io.InputStream in=stream;java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream()) {
                            byte[] buffer=new byte[4096];int count,total=0;
                            while((count=in.read(buffer))!=-1) {total+=count;if(total>500000)throw new java.io.IOException("Response too large");out.write(buffer,0,count);}
                            JSONObject result=new JSONObject(out.toString("UTF-8"));
                            if(status==200||result.has("code"))response=result.toString();
                        }
                    }
                } catch(Exception ignored) {}
                finally {if(connection!=null)connection.disconnect();}
                final String body=response;
                runOnUiThread(() -> {immoptimaRentalBusy=false;notifyImmoptimaRental(requestId,uid,body);});
            },"ImmOptimaRental").start();
        }).addOnFailureListener(error -> {
            immoptimaRentalBusy=false;notifyImmoptimaRental(requestId,uid,"{\\"code\\":\\"AUTH_REQUIRED\\"}");
        });
    }

'''
s=s.replace(anchor,methods+anchor,1)
java.write_text(s,encoding='utf-8')
print('Native rental bridge installed: fixed HTTPS endpoint, authenticated native transport')
