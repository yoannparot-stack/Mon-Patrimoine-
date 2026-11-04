from pathlib import Path
import sys
p=Path(sys.argv[1])/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=p.read_text()
if 'immoptimaAccessCheck(' in s: sys.exit(0)
a='            @JavascriptInterface public void immoptimaCloudRead() {'
assert a in s
s=s.replace(a,'''            @JavascriptInterface public void immoptimaAccessCheck(String requestId, int count) {
                runOnUiThread(() -> {
                    FirebaseUser user=FirebaseAuth.getInstance().getCurrentUser();
                    if(user==null) { notifyImmoptimaAccess(requestId,"",false,0,false); return; }
                    final String uid=user.getUid();
                    FirebaseFirestore.getInstance().collection("accountAccess").document(uid)
                        .get(com.google.firebase.firestore.Source.SERVER).addOnSuccessListener(doc -> {
                            FirebaseUser current=FirebaseAuth.getInstance().getCurrentUser();
                            com.google.firebase.Timestamp until=doc.getTimestamp("expiresAt");
                            boolean allowed=current!=null && uid.equals(current.getUid()) &&
                                (Boolean.TRUE.equals(doc.getBoolean("owner")) ||
                                 ("active".equals(doc.getString("status")) && until!=null && until.toDate().getTime()>System.currentTimeMillis()));
                            notifyImmoptimaAccess(requestId,uid,allowed,until==null?0:until.toDate().getTime(),Boolean.TRUE.equals(doc.getBoolean("owner")));
                        }).addOnFailureListener(error -> notifyImmoptimaAccess(requestId,uid,false,0,false));
                });
            }
'''+a,1)
a='    private static final int IMMOPTIMA_LOGIN_REQUEST = 7414;'
assert a in s
s=s.replace(a,'''    private void notifyImmoptimaAccess(String requestId,String uid,boolean allowed,long expiresAt,boolean owner) {
        try {
            JSONObject data=new JSONObject();data.put("requestId",requestId);data.put("uid",uid);data.put("allowed",allowed);data.put("expiresAt",expiresAt);data.put("owner",owner);
            runOnUiThread(() -> webView.evaluateJavascript("window.immoptimaNativeAccessResult&&window.immoptimaNativeAccessResult("+data.toString()+")",null));
        } catch(Exception ignored) {}
    }
'''+a,1)
p.write_text(s)
