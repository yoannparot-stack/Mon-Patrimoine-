from pathlib import Path
import sys
p=Path(sys.argv[1])/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=p.read_text()
if 'immoptimaAccessCheck(' in s: sys.exit(0)
a='            @JavascriptInterface public void immoptimaCloudRead() {'
assert a in s
s=s.replace(a,'''            @JavascriptInterface public void immoptimaRentalTrial(String requestId, boolean start) {
                runOnUiThread(() -> {
                    FirebaseUser user=FirebaseAuth.getInstance().getCurrentUser();
                    if(user==null) { notifyRentalTrial(requestId,"",false,0,"AUTH_REQUIRED"); return; }
                    String uid=user.getUid();
                    com.google.firebase.firestore.DocumentReference ref=FirebaseFirestore.getInstance().collection("rentalTrials").document(uid);
                    ref.get(com.google.firebase.firestore.Source.SERVER).addOnSuccessListener(doc -> {
                        if(doc.exists() || !start) { checkRentalTrial(requestId,uid,doc); return; }
                        java.util.Map<String,Object> data=new java.util.HashMap<>();
                        data.put("startedAt",com.google.firebase.firestore.FieldValue.serverTimestamp());
                        ref.set(data).addOnCompleteListener(task -> {
                            // A concurrent activation may already have created the immutable document.
                            ref.get(com.google.firebase.firestore.Source.SERVER).addOnSuccessListener(saved -> checkRentalTrial(requestId,uid,saved))
                                .addOnFailureListener(error -> notifyRentalTrial(requestId,uid,false,0,"UNAVAILABLE"));
                        });
                    }).addOnFailureListener(error -> notifyRentalTrial(requestId,uid,false,0,"UNAVAILABLE"));
                });
            }
            @JavascriptInterface public void immoptimaAccessCheck(String requestId, int count) {
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
s=s.replace(a,'''    private void notifyRentalTrial(String requestId,String uid,boolean allowed,long startedAt,String code) {
        FirebaseUser current=FirebaseAuth.getInstance().getCurrentUser();
        if(current==null || !uid.equals(current.getUid())) { allowed=false; code="ACCOUNT_CHANGED"; }
        try {
            JSONObject data=new JSONObject();data.put("requestId",requestId);data.put("uid",uid);data.put("allowed",allowed);data.put("startedAt",startedAt);data.put("code",code);
            runOnUiThread(() -> webView.evaluateJavascript("window.immoptimaNativeRentalTrialResult&&window.immoptimaNativeRentalTrialResult("+data.toString()+")",null));
        } catch(Exception ignored) {}
    }
    private void checkRentalTrial(String requestId,String uid,com.google.firebase.firestore.DocumentSnapshot doc) {
        com.google.firebase.Timestamp since=doc.getTimestamp("startedAt");
        if(since==null) { notifyRentalTrial(requestId,uid,false,0,"NOT_STARTED"); return; }
        long startedAt=since.toDate().getTime();
        // Rules authorize this read only while server time is inside the 90 days.
        // No device clock, imported backup, local preference or client flag grants access.
        FirebaseFirestore.getInstance().collection("rentalTrials").document(uid).collection("access").document("current")
            .get(com.google.firebase.firestore.Source.SERVER)
            .addOnSuccessListener(probe -> notifyRentalTrial(requestId,uid,true,startedAt,"ACTIVE"))
            .addOnFailureListener(error -> notifyRentalTrial(requestId,uid,false,startedAt,
                error instanceof com.google.firebase.firestore.FirebaseFirestoreException &&
                ((com.google.firebase.firestore.FirebaseFirestoreException)error).getCode()==com.google.firebase.firestore.FirebaseFirestoreException.Code.PERMISSION_DENIED?"EXPIRED":"UNAVAILABLE"));
    }
    private void notifyImmoptimaAccess(String requestId,String uid,boolean allowed,long expiresAt,boolean owner) {
        try {
            JSONObject data=new JSONObject();data.put("requestId",requestId);data.put("uid",uid);data.put("allowed",allowed);data.put("expiresAt",expiresAt);data.put("owner",owner);
            runOnUiThread(() -> webView.evaluateJavascript("window.immoptimaNativeAccessResult&&window.immoptimaNativeAccessResult("+data.toString()+")",null));
        } catch(Exception ignored) {}
    }
'''+a,1)
p.write_text(s)
