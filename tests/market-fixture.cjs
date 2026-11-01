// Fictional values for rendering and mocked DVF tests only.
module.exports=function marketFixture(data){
 const now=new Date().toISOString();
 data.properties[1].surface=30;data.properties[1].dpe='D';
 data.properties.forEach((p,i)=>p.marketAnalysis={estimate:i?105000:125000,priceM2:i?3500:2778,low:i?97000:115000,high:i?113000:135000,comparables:i?7:12,confidence:i?'Moyenne':'Bonne',updatedAt:now,source:'DVF — données fictives de validation'});
 return data;
};
