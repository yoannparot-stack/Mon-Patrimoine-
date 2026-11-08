const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(source);
const fn=name=>{const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);assert(start>=0);return source.slice(start,end)};
const nodes={assets:{innerHTML:''},ioOtherDebtSummary:{},otherDebt:{value:'0',setAttribute(){},removeAttribute(){},focus(){}},otherDebtNote:{value:''},ioOtherDebtError:{}};
let fail=false,confirmDelete=false,saved=0,feedback=[];
const context={db:{assets:[],otherDebt:0,otherDebtNote:'',properties:[],loans:[]},structuredClone,Number,String,Set,console,
 document:{getElementById:id=>nodes[id]},window:{ioJourneyFeedback:m=>feedback.push(m)},
 FormData:class{constructor(form){this.form=form}entries(){return Object.entries(this.form.values)}},
 id:()=> 'new-savings',confirm:()=>confirmDelete,alert(){},closeForm(){},
 save(){if(fail)throw Error('storage unavailable');saved++},
 euro:n=>Number(n).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}),ioIcon:()=>''};
vm.createContext(context);vm.runInContext(['esc','saveAsset','renderAssets','deleteAsset','saveOtherDebt'].map(fn).join('\n'),context);
const run=s=>vm.runInContext(s,context),render=()=>{run('renderAssets()');return nodes.assets.innerHTML};
assert(render().includes('Ajouter mon premier placement'));
context.db.assets=[{id:'a',name:'Compte fictif',category:'Épargne',value:2000},{id:'b',name:'Contrat fictif',category:'Assurance-vie',value:6500}];
assert(render().includes(context.euro(8500)));assert(!render().includes('<table'));
context.db.assets[1].value='';assert(render().includes('À compléter'));assert(render().includes(context.euro(2000)+' renseignés'));
context.db.assets[1].value=0;assert(!render().includes('À compléter'));
context.db.assets[1].name='<img src=x onerror=alert(1)>';assert(render().includes('&lt;img'));assert(!render().includes('<img'));
const event=values=>({preventDefault(){},target:{values,querySelector(){return {}}}});
const previous=JSON.stringify(context.db);
for(const value of ['', '-1', 'NaN', 'Infinity'])context.saveAsset(event({name:'Fictif',value}),'a');
context.saveAsset(event({name:'   ',value:'20'}),'a');assert.equal(JSON.stringify(context.db),previous);
context.db.assets[0].retainedMetadata='keep';
context.saveAsset(event({name:'Compte actualisé',value:'0.01',category:'Épargne'}),'a');
assert.equal(context.db.assets[0].value,0.01);assert.equal(context.db.assets[0].retainedMetadata,'keep');
context.saveAsset(event({name:'Zéro déclaré',value:'0',category:'Autre'}),'');assert.equal(context.db.assets.at(-1).value,0);
let before=JSON.stringify(context.db);fail=true;context.saveAsset(event({name:'Non enregistré',value:'50'}),'a');assert.equal(JSON.stringify(context.db),before);
confirmDelete=true;context.deleteAsset('a');assert.equal(JSON.stringify(context.db),before);fail=false;confirmDelete=false;context.deleteAsset('a');assert.equal(JSON.stringify(context.db),before);
confirmDelete=true;context.deleteAsset('a');assert(!context.db.assets.some(a=>a.id==='a'));
for(const value of ['', '-1', 'Infinity']){nodes.otherDebt.value=value;context.saveOtherDebt();assert.equal(context.db.otherDebt,0);assert.equal(nodes.ioOtherDebtError.hidden,false)}
nodes.otherDebt.value='123.45';nodes.otherDebtNote.value='Dette fictive';context.saveOtherDebt();assert.equal(context.db.otherDebt,123.45);assert.equal(context.db.otherDebtNote,'Dette fictive');
render();assert(nodes.ioOtherDebtSummary.textContent.includes(context.euro(123.45)));
fail=true;nodes.otherDebt.value='50';before=JSON.stringify(context.db);context.saveOtherDebt();assert.equal(JSON.stringify(context.db),before);
console.log('PASS savings: totals, missing versus zero, escaped content, invalid inputs, metadata, cents, deletion confirmation, storage rollback and other debts');
