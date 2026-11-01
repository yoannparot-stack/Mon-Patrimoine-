// Synthetic references for UI/financial QA only, never loaded by the application.
module.exports=function rentalFixture(){
 const f=require('./fixture.cjs')(),p=f.properties[0],date=new Date().toISOString().slice(0,10);p.name='Studio – Bretonneau';p.surface=30;p.rooms=1;p.rentHC=450;p.recoverable=35;p.type='Appartement';
 p.optimization={currentMode:'nu',selectedMode:'meuble',usage:'locatif',rooms:1,communeCode:'37261',currentVacancy:0,works:0,scenarios:{nu:{target:null,extraMonthly:0,investment:0,vacancy:0},meuble:{target:null,extraMonthly:20,investment:1200,vacancy:0}},references:['nu','meuble'].flatMap((mode,i)=>[0,1,2].map((n)=>({id:'ref-'+mode+'-'+n,mode,source:'Référence de validation '+(n+1),url:'https://exemple'+n+'.test/'+mode,date,rentHC:(i?510:470)+n*10,surface:30,rooms:1,communeCode:'37261',family:'appartement',verified:true})))};
 f.properties[1].optimization={usage:'locatif',rooms:1,currentMode:'nu',scenarios:{},references:[]};return f;
};
