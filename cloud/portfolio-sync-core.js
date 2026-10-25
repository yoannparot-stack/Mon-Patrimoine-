/* ImmOptima: pure, backend-independent portfolio revision and migration guard.
   Not connected to Firebase until authentication, rules and restore UX are validated. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.ImmOptimaSyncCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAX_BYTES=850000; // Firestore document max 1 MiB: leave metadata headroom.
 const COLLECTIONS=['properties','loans','assets'];
 function validPortfolio(value){
   if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Patrimoine invalide');
   for(const k of COLLECTIONS)if(!Array.isArray(value[k]))throw Error('Collection manquante : '+k);
   if(!value.settings||typeof value.settings!=='object'||Array.isArray(value.settings))throw Error('Paramètres invalides');
   const serialized=JSON.stringify(value);
   if(!serialized)throw Error('Patrimoine vide');
   const bytes=typeof TextEncoder!=='undefined'?new TextEncoder().encode(serialized).length:unescape(encodeURIComponent(serialized)).length;
   if(bytes>MAX_BYTES)throw Error('Patrimoine trop volumineux pour cette synchronisation');
   return JSON.parse(serialized);
 }
 function makeUpload(portfolio,baseRevision){
   if(!Number.isSafeInteger(baseRevision)||baseRevision<0)throw Error('Révision de départ invalide');
   return {schemaVersion:1,revision:baseRevision+1,payload:validPortfolio(portfolio)};
 }
 function decideRestore(local,remote,hasLocalChanges){
   if(!remote||!Number.isSafeInteger(remote.revision)||remote.revision<1)throw Error('Sauvegarde cloud invalide');
   const cloud=validPortfolio(remote.payload);
   if(hasLocalChanges)return {action:'conflict',message:'Choisissez explicitement quelle version conserver',cloud};
   if(local&&JSON.stringify(validPortfolio(local))!==JSON.stringify(cloud))
     return {action:'confirmation_required',cloud};
   return {action:'no_change',cloud};
 }
 return Object.freeze({validPortfolio,makeUpload,decideRestore,MAX_BYTES});
});
