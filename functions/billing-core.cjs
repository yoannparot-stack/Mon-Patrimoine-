'use strict';
const {createHash}=require('node:crypto');
const PACKAGE='com.immoptima.app',PRODUCT='immoptima_premium',PLANS=['mensuel','annuel'];
const hash=s=>createHash('sha256').update(s).digest('hex');
function validateToken(token){if(typeof token!=='string'||token.length<10||token.length>4096||/[\s\x00-\x1f]/.test(token))throw Error('INVALID_TOKEN');return token}
function subscription(p,uid,now=Date.now()){
 if(!p||!uid||p.externalAccountIdentifiers?.obfuscatedExternalAccountId!==hash(uid))throw Error('ACCOUNT_MISMATCH');
 const lines=(p.lineItems||[]).filter(l=>l.productId===PRODUCT&&PLANS.includes(l.offerDetails?.basePlanId));
 if(!lines.length)throw Error('UNKNOWN_PRODUCT');
 const expiry=Math.max(...lines.map(l=>Date.parse(l.expiryTime)).filter(Number.isFinite));
 const state=p.subscriptionState,allowed=['SUBSCRIPTION_STATE_ACTIVE','SUBSCRIPTION_STATE_IN_GRACE_PERIOD','SUBSCRIPTION_STATE_CANCELED'].includes(state)&&Number.isFinite(expiry)&&expiry>now;
 return {allowed,expiresAt:Number.isFinite(expiry)?expiry:0,status:allowed?'active':state==='SUBSCRIPTION_STATE_PENDING'?'pending':'expired',state,plan:lines.find(l=>Date.parse(l.expiryTime)===expiry)?.offerDetails.basePlanId||lines[0].offerDetails.basePlanId,acknowledge:allowed&&p.acknowledgementState==='ACKNOWLEDGEMENT_STATE_PENDING'};
}
module.exports={PACKAGE,PRODUCT,PLANS,hash,validateToken,subscription};
