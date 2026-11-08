package com.monpatrimoine.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;
import com.android.billingclient.api.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Collections;
import java.util.List;
import java.nio.charset.StandardCharsets;

/** Disabled until the native config and server are explicitly configured. */
public final class ImmOptimaPlayBilling {
    private final Activity activity;
    private final WebView view;
    private BillingClient client;
    private String flowRequest="", flowUid="";
    private boolean enabled=false, connecting=false;
    private static final String PRODUCT="immoptima_premium";
    private static final String ENDPOINT="https://europe-west1-immoptima-6af3b.cloudfunctions.net/verifyPlaySubscription";
    public ImmOptimaPlayBilling(Activity a,WebView v) {
        activity=a;view=v;
        try(java.io.InputStream in=a.getAssets().open("play-billing.json")) {
            java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] buf=new byte[1024];int n;
            while((n=in.read(buf))!=-1)out.write(buf,0,n);
            enabled=new JSONObject(out.toString("UTF-8")).optBoolean("enabled",false);
        }catch(Exception ignored){}
    }
    private String uid(){FirebaseUser u=FirebaseAuth.getInstance().getCurrentUser();return u==null?"":u.getUid();}
    private static String accountHash(String uid) throws Exception {
        byte[] digest=java.security.MessageDigest.getInstance("SHA-256").digest(uid.getBytes(StandardCharsets.UTF_8));
        StringBuilder s=new StringBuilder();for(byte b:digest)s.append(String.format(java.util.Locale.ROOT,"%02x",b&255));return s.toString();
    }
    private void reply(String request,String user,String code,JSONArray offers){
        if(!user.equals(uid()))code="ACCOUNT_CHANGED";
        try{JSONObject data=new JSONObject();data.put("requestId",request);data.put("uid",user);data.put("code",code);if(offers!=null)data.put("offers",offers);
            String script="window.immoptimaNativeBillingResult&&window.immoptimaNativeBillingResult("+data.toString()+")";
            activity.runOnUiThread(()->view.evaluateJavascript(script,null));
        }catch(Exception ignored){}
    }
    public void request(String request,String action,String plan){
        String user=uid();if(request==null||!request.matches("[a-zA-Z0-9_-]{1,80}"))return;
        if(user.isEmpty()){reply(request,user,"AUTH_REQUIRED",null);return;}
        if("manage".equals(action)){try{activity.startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse("https://play.google.com/store/account/subscriptions?sku="+PRODUCT+"&package=com.immoptima.app")));reply(request,user,"MANAGE",null);}catch(Exception e){reply(request,user,"UNAVAILABLE",null);}return;}
        if(!enabled){reply(request,user,"NOT_CONFIGURED",null);return;}
        if(!("list".equals(action)||"buy".equals(action)||"restore".equals(action))){reply(request,user,"UNAVAILABLE",null);return;}
        if(!flowRequest.isEmpty()||connecting){reply(request,user,"UNAVAILABLE",null);return;}
        Runnable ready=()->{if(!user.equals(uid())){reply(request,user,"ACCOUNT_CHANGED",null);return;}if("restore".equals(action))restore(request,user);else products(request,user,"buy".equals(action)?plan:"");};
        if(client==null)client=BillingClient.newBuilder(activity).setListener(this::updated)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .enableAutoServiceReconnection().build();
        if(client.isReady()){ready.run();return;}
        connecting=true;client.startConnection(new BillingClientStateListener(){
            public void onBillingSetupFinished(BillingResult r){connecting=false;if(r.getResponseCode()==BillingClient.BillingResponseCode.OK)ready.run();else reply(request,user,"UNAVAILABLE",null);}
            public void onBillingServiceDisconnected(){connecting=false;}
        });
    }
    private void products(String request,String user,String plan){
        QueryProductDetailsParams.Product product=QueryProductDetailsParams.Product.newBuilder().setProductId(PRODUCT).setProductType(BillingClient.ProductType.SUBS).build();
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(product)).build(),(r,result)->{
            if(!user.equals(uid())){reply(request,user,"ACCOUNT_CHANGED",null);return;}
            if(r.getResponseCode()!=BillingClient.BillingResponseCode.OK||result.getProductDetailsList().isEmpty()){reply(request,user,"UNAVAILABLE",null);return;}
            ProductDetails details=result.getProductDetailsList().get(0);List<ProductDetails.SubscriptionOfferDetails> offers=details.getSubscriptionOfferDetails();JSONArray list=new JSONArray();
            if(offers!=null)for(ProductDetails.SubscriptionOfferDetails offer:offers){String base=offer.getBasePlanId();if(offer.getOfferId()!=null||!("mensuel".equals(base)||"annuel".equals(base)))continue;
                List<ProductDetails.PricingPhase> phases=offer.getPricingPhases().getPricingPhaseList();if(phases.size()!=1)continue;
                ProductDetails.PricingPhase price=phases.get(0);if(!(("mensuel".equals(base)&&"P1M".equals(price.getBillingPeriod()))||("annuel".equals(base)&&"P1Y".equals(price.getBillingPeriod()))))continue;
                if(!plan.isEmpty()&&plan.equals(base)){
                    try{flowRequest=request;flowUid=user;BillingFlowParams.ProductDetailsParams item=BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details).setOfferToken(offer.getOfferToken()).build();
                        BillingResult launch=client.launchBillingFlow(activity,BillingFlowParams.newBuilder().setObfuscatedAccountId(accountHash(user)).setProductDetailsParamsList(Collections.singletonList(item)).build());
                        if(launch.getResponseCode()!=BillingClient.BillingResponseCode.OK){flowRequest="";reply(request,user,launch.getResponseCode()==BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED?"ALREADY_OWNED":"UNAVAILABLE",null);}
                    }catch(Exception e){flowRequest="";reply(request,user,"UNAVAILABLE",null);}return;
                }
                try{JSONObject item=new JSONObject();item.put("plan",base);item.put("price",price.getFormattedPrice());list.put(item);}catch(Exception ignored){}
            }
            reply(request,user,plan.isEmpty()&&list.length()>0?"OFFERS":"UNAVAILABLE",list);
        });
    }
    private void updated(BillingResult result,List<Purchase> purchases){
        String request=flowRequest,user=flowUid;flowRequest="";flowUid="";if(request.isEmpty())return;
        if(result.getResponseCode()==BillingClient.BillingResponseCode.USER_CANCELED){reply(request,user,"CANCELLED",null);return;}
        if(result.getResponseCode()!=BillingClient.BillingResponseCode.OK||purchases==null){reply(request,user,"UNAVAILABLE",null);return;}
        boolean found=false;for(Purchase p:purchases)if(p.getProducts().contains(PRODUCT)){found=true;process(request,user,p);}if(!found)reply(request,user,"NO_PURCHASES",null);
    }
    private void restore(String request,String user){client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.SUBS).build(),(r,purchases)->{
        if(r.getResponseCode()!=BillingClient.BillingResponseCode.OK){reply(request,user,"UNAVAILABLE",null);return;}
        boolean found=false;for(Purchase p:purchases)if(p.getProducts().contains(PRODUCT)){found=true;process(request,user,p);}if(!found)reply(request,user,"NO_PURCHASES",null);
    });}
    private void process(String request,String user,Purchase purchase){
        if(!user.equals(uid())){reply(request,user,"ACCOUNT_CHANGED",null);return;}
        if(purchase.getPurchaseState()==Purchase.PurchaseState.PENDING){reply(request,user,"PENDING",null);return;}
        if(purchase.getPurchaseState()!=Purchase.PurchaseState.PURCHASED){reply(request,user,"VERIFY_FAILED",null);return;}
        FirebaseUser current=FirebaseAuth.getInstance().getCurrentUser();if(current==null){reply(request,user,"AUTH_REQUIRED",null);return;}
        current.getIdToken(false).addOnSuccessListener(idToken->{if(!user.equals(uid())){reply(request,user,"ACCOUNT_CHANGED",null);return;}
            new Thread(()->{javax.net.ssl.HttpsURLConnection conn=null;String code="VERIFY_FAILED";
                try{conn=(javax.net.ssl.HttpsURLConnection)new java.net.URL(ENDPOINT).openConnection();conn.setInstanceFollowRedirects(false);conn.setRequestMethod("POST");conn.setConnectTimeout(10000);conn.setReadTimeout(30000);conn.setDoOutput(true);conn.setRequestProperty("Authorization","Bearer "+idToken.getToken());conn.setRequestProperty("Content-Type","application/json");JSONObject body=new JSONObject();body.put("purchaseToken",purchase.getPurchaseToken());byte[] data=body.toString().getBytes(StandardCharsets.UTF_8);try(java.io.OutputStream out=conn.getOutputStream()){out.write(data);}java.io.InputStream stream=conn.getResponseCode()==200?conn.getInputStream():conn.getErrorStream();if(stream!=null){java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();byte[] b=new byte[1024];int n;while((n=stream.read(b))!=-1&&out.size()<10000)out.write(b,0,n);stream.close();code=new JSONObject(out.toString("UTF-8")).optString("code","VERIFY_FAILED");}
                }catch(Exception ignored){}finally{if(conn!=null)conn.disconnect();}reply(request,user,code,null);
            }).start();
        }).addOnFailureListener(e->reply(request,user,"UNAVAILABLE",null));
    }
    public void resume(){if(enabled&&flowRequest.isEmpty()&&!uid().isEmpty())request("resume_check","restore","");}
    public void close(){if(client!=null)client.endConnection();}
}
