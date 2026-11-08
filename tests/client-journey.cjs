const assert=require('node:assert/strict'),A=require('../client-journey.js');
const now=new Date(),month=A.monthKey(now),date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
const base={id:'p',name:'Studio fictif',type:'Studio',rentHC:500,occupancy:100};
const full={month,rent:500,charges:35,paid:535,paymentDate:date,confirmed:true};
const p=extra=>({...base,...extra});
let state=A.monthState([p()],now);assert.equal(state.pending,1);assert.equal(state.rows[0].state,'unknown');assert(!state.headline.includes('impayé'));
state=A.monthState([p({rentalManagement:{payments:[full]}})],now);assert(state.complete);assert.equal(state.rows[0].documentReady,false,'a confirmed payment does not invent tenant identity');
const partial={...full,paid:100};state=A.monthState([p({rentalManagement:{payments:[partial]}})],now);assert.equal(state.rows[0].state,'partial');assert(!state.complete);assert.equal(state.pending,1);
state=A.monthState([p({rentalManagement:{payments:[{...full,paid:0,confirmed:false,paymentDate:''}]}})],now);assert.equal(state.rows[0].state,'zero');assert(!state.complete);
state=A.monthState([p({rentalManagement:{payments:[full,full]}})],now);assert.equal(state.rows[0].state,'invalid','duplicate imports never imply that the month is done');
state=A.monthState([p({rentalManagement:{payments:{bad:true}}})],now);assert.equal(state.rows[0].state,'invalid');
state=A.monthState([p({occupancy:0}),p({type:'Parking'}),p({isMainResidence:true})],now);assert.equal(state.rows.length,0);assert(!state.complete,'no eligible dwelling is not an all-clear statement');
const previous=new Date(now.getFullYear(),now.getMonth()-1,15);state=A.monthState([p({rentalManagement:{payments:[{...full,month:A.monthKey(previous)}]}})],now);assert.equal(state.rows[0].state,'unknown');
const original=JSON.stringify(base);A.monthState([base],now);assert.equal(JSON.stringify(base),original);assert(A.propertyFeedback({...base,surface:20},['surface']).includes('Surface enregistrée'));assert(!A.propertyFeedback(base,['surface']).includes('Surface enregistrée'));
assert.deepEqual(A.GOALS.map(x=>x.id),['rental','bank','complete']);
console.log('PASS client journey: missing versus partial/zero/confirmed, duplicates, scope, calendar rollover, preserved data, truthful feedback and goals');

state=A.monthState([p({occupancy:0,guidanceEnteredFields:['name','type','rentHC']})],now);assert.equal(state.rows.length,1,'an unentered occupancy converted to zero is not a declaration of vacancy');
