/* Commercial default. Personal test bypass is injected only by the personal build. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ImmOptimaAccess=api})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function decide(count,access={},now=Date.now()){
  if(!Number.isSafeInteger(count)||count<0)return false;
  if(count<=1)return true;
  if(access.owner===true)return true;
  return access.status==='active'&&Number.isFinite(access.expiresAt)&&access.expiresAt>now;
 }
 return Object.freeze({decide});
});
