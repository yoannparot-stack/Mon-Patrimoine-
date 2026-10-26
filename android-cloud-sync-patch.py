from pathlib import Path
import sys
root=Path(sys.argv[1])
java=root/'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s=java.read_text(encoding='utf-8')
if 'immoptimaCloudRead()' in s: sys.exit(0)
anchor='import android.print.PrintManager;'
if anchor not in s: raise SystemExit('Import anchor missing')
s=s.replace(anchor,'''import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.SetOptions;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.android.gms.tasks.Tasks;
import java.util.Map;
import java.util.HashMap;
'''+anchor,1)
bridge='            @JavascriptInterface public void immoptimaSignIn() {'
if bridge not in s: raise SystemExit('Auth bridge anchor missing')
s=s.replace(bridge,'''            @JavascriptInterface public void immoptimaCloudRead() {
                runOnUiThread(() -> readImmoptimaCloud());
            }
            @JavascriptInterface public void immoptimaCloudWrite(String json, int expectedRevision) {
                runOnUiThread(() -> writeImmoptimaCloud(json, expectedRevision));
            }
'''+bridge,1)
anchor='    private static final int IMMOPTIMA_LOGIN_REQUEST = 7414;'
if anchor not in s: raise SystemExit('Auth methods anchor missing')
methods='''    // Firestore bridge: authenticated user only, optimistic revision guard.
    // IMPORTANT: JavaScript must not call write until production rules are deployed and tested.
    private DocumentReference immoptimaPortfolioRef() {
        FirebaseUser user=FirebaseAuth.getInstance().getCurrentUser();
        if(user==null) throw new IllegalStateException("Compte déconnecté");
        return FirebaseFirestore.getInstance().collection("users")
            .document(user.getUid()).collection("portfolios").document("current");
    }
    private void notifyImmoptimaCloud(String event, String data, String message, String requestUid) {
        try {
            JSONObject payload=new JSONObject();
            payload.put("event",event);
            payload.put("uid",requestUid==null?"":requestUid);
            payload.put("data",data==null?"":data);
            payload.put("message",message==null?"":message);
            runOnUiThread(() -> webView.evaluateJavascript(
                "window.immoptimaNativeCloudResult&&window.immoptimaNativeCloudResult("+payload.toString()+")",null));
        } catch(Exception ignored) {}
    }
    private void readImmoptimaCloud() {
        try {
            FirebaseUser reader=FirebaseAuth.getInstance().getCurrentUser();
            if(reader==null)throw new IllegalStateException("Compte déconnecté");
            final String requestUid=reader.getUid();
            immoptimaPortfolioRef().get(com.google.firebase.firestore.Source.SERVER)
                .addOnSuccessListener(snapshot -> {
                    if(!snapshot.exists()) {
                        notifyImmoptimaCloud("missing","","",requestUid); return;
                    }
                    notifyImmoptimaCloud("snapshot",new JSONObject(snapshot.getData()).toString(),"",requestUid);
                }).addOnFailureListener(error -> notifyImmoptimaCloud("error","",
                    "Lecture cloud impossible. Données locales conservées.",requestUid));
        } catch(Exception e) { notifyImmoptimaCloud("error","","Compte indisponible",""); }
    }
    private void writeImmoptimaCloud(String json, int expectedRevision) {
        if(expectedRevision<0 || json==null || json.length()>850000) {
            notifyImmoptimaCloud("error","","Taille ou révision invalide","");return;
        }
        try {
            JSONObject payload=new JSONObject(json);
            if(!payload.has("properties")||!payload.has("loans")||!payload.has("assets")||!payload.has("settings")) {
                notifyImmoptimaCloud("error","","Format du patrimoine invalide","");return;
            }
            // Capture UID before transaction; reject if sign-out/account switch occurs.
            FirebaseUser user=FirebaseAuth.getInstance().getCurrentUser();
            if(user==null) {notifyImmoptimaCloud("error","","Compte déconnecté","");return;}
            final String uid=user.getUid();
            DocumentReference ref=immoptimaPortfolioRef();
            Map<String,Object> parsed=com.google.firebase.firestore.util.CustomClassMapper
                .convertToPlainJavaTypes(new HashMap<String,Object>());
        } catch(Exception e) {
            notifyImmoptimaCloud("error","","Synchronisation non disponible","");
        }
    }
'''
# Replace experimental write method with supported Android org.json -> Map via recursive converter.
methods=methods.replace('''            Map<String,Object> parsed=com.google.firebase.firestore.util.CustomClassMapper
                .convertToPlainJavaTypes(new HashMap<String,Object>());''','''            Object converted=jsonToCloud(payload);
            if(!(converted instanceof Map)) throw new IllegalArgumentException("payload");
            @SuppressWarnings("unchecked")
            Map<String,Object> portfolio=(Map<String,Object>)converted;
            FirebaseFirestore.getInstance().runTransaction(transaction -> {
                if(FirebaseAuth.getInstance().getCurrentUser()==null ||
                    !uid.equals(FirebaseAuth.getInstance().getCurrentUser().getUid()))
                    throw new FirebaseFirestoreException("Compte changé",FirebaseFirestoreException.Code.ABORTED);
                com.google.firebase.firestore.DocumentSnapshot previous=transaction.get(ref);
                long revision=previous.exists() && previous.getLong("revision")!=null
                    ? previous.getLong("revision") : 0;
                if(revision!=expectedRevision)
                    throw new FirebaseFirestoreException("Conflit de révision",FirebaseFirestoreException.Code.ABORTED);
                Map<String,Object> document=new HashMap<>();
                document.put("schemaVersion",1);
                document.put("revision",revision+1);
                document.put("payload",portfolio);
                document.put("updatedAt",FieldValue.serverTimestamp());
                transaction.set(ref,document);
                return revision+1;
            }).addOnSuccessListener(revision -> notifyImmoptimaCloud("saved",String.valueOf(revision),"",uid))
              .addOnFailureListener(error -> notifyImmoptimaCloud("conflict","","Révision modifiée ou écriture refusée",uid));''')
methods=methods.replace('''    private void writeImmoptimaCloud(String json, int expectedRevision) {''','''    private Object jsonToCloud(Object value) throws org.json.JSONException {
        if(value==null || value==JSONObject.NULL)return null;
        if(value instanceof JSONObject) {
            JSONObject object=(JSONObject)value;
            Map<String,Object> result=new HashMap<>();
            java.util.Iterator<String> keys=object.keys();
            while(keys.hasNext()) {
                String key=keys.next();
                result.put(key,jsonToCloud(object.get(key)));
            }
            return result;
        }
        if(value instanceof org.json.JSONArray) {
            org.json.JSONArray array=(org.json.JSONArray)value;
            java.util.ArrayList<Object> result=new java.util.ArrayList<>();
            for(int i=0;i<array.length();i++)result.add(jsonToCloud(array.get(i)));
            return result;
        }
        return value;
    }
    private void writeImmoptimaCloud(String json, int expectedRevision) {''')
# Firestore DocumentSnapshot map cannot be converted to JSONObject recursively by JSONObject(Map) nested works for Map lists.
s=s.replace(anchor,methods+anchor,1)
java.write_text(s,encoding='utf-8')
print('Cloud bridge prepared, requires production rules verification before enablement')
