/* ImmOptima — fixed-rate amortizing loan, separate from the saved portfolio. */
(function(root){
 'use strict';
 const reference=Object.freeze({rate:3.32,period:'août 2026',published:'2026-10-06',checked:'2026-11-02',source:'Banque de France',url:'https://www.banque-france.fr/fr/statistiques/credit/credits-aux-particuliers-2026-08'});
 const cents=v=>Math.round((v+Number.EPSILON)*100)/100;
 function calculate(input){
  const {amount,years,rate,insurance,fees}=input;
  if(![amount,years,rate,insurance,fees].every(Number.isFinite)||amount<100||amount>10000000||years<1||years>35||!Number.isInteger(years*12)||rate<0||rate>25||insurance<0||insurance>10||fees<0||fees>amount)throw Error('Vérifiez les montants, la durée (1 à 35 ans) et les taux.');
  const months=years*12,r=rate/1200;
  const theoretical=r===0?amount/months:amount*r/(-Math.expm1(-months*Math.log1p(r)));
  const payment=cents(theoretical),insuranceMonthly=cents(amount*insurance/1200);
  let balance=cents(amount),totalInterest=0,totalPrincipal=0;const schedule=[];
  for(let month=1;month<=months;month++){
   const interest=cents(balance*r),principal=month===months?balance:Math.max(0,Math.min(balance,cents(payment-interest)));
   balance=cents(balance-principal);totalInterest=cents(totalInterest+interest);totalPrincipal=cents(totalPrincipal+principal);
   schedule.push({month,interest,principal,balance,payment:cents(principal+interest),insurance:insuranceMonthly});
  }
  const insuranceTotal=cents(insuranceMonthly*months),cost=cents(totalInterest+insuranceTotal+fees);
  return {amount,months,payment,insuranceMonthly,monthly:cents(payment+insuranceMonthly),lastMonthly:cents(schedule.at(-1).payment+insuranceMonthly),interest:totalInterest,insuranceTotal,fees,cost,total:cents(totalPrincipal+cost),schedule};
 }
 const api={calculate,reference};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 root.ioLoanMath=api;let focusBefore,scrollBefore=0;
 const money=v=>v.toLocaleString('fr-FR',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2});
 function mount(){
  if(document.getElementById('ioLoanSimulator'))return;
  const style=document.createElement('style');style.textContent=`
.io-bank-loan-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.io-bank-loan-actions button{min-width:0;font-size:12px;padding:8px 6px;min-height:38px}
#ioLoanSimulator[hidden]{display:none!important}#ioLoanSimulator{position:fixed;inset:0;z-index:1300;background:#fff;overflow:auto;overscroll-behavior:contain;color:#11163e;padding:14px max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom));box-sizing:border-box}
.io-sim-wrap{max-width:560px;margin:auto;display:flex;flex-direction:column;gap:12px}.io-sim-head{display:flex;align-items:center;gap:12px}.io-sim-head h2{margin:0;font-size:22px}.io-sim-head button{border:0;background:transparent;color:#172448;font-size:24px;padding:5px;min-height:40px}.io-sim-sub{margin:0;color:#69778b;font-size:12px}
.io-sim-reference{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;background:#f0ecff;border-radius:13px}.io-sim-reference b{font-size:18px;color:#6c2ab5}.io-sim-reference small{display:block;color:#5e657e;font-size:11px;line-height:1.4}.io-sim-reference button{font-size:11px;color:#075fca;background:#fff;border:1px solid #d6ddeb;border-radius:9px;padding:8px;flex-shrink:0}
#ioLoanForm{display:grid;grid-template-columns:1fr 1fr;gap:10px}#ioLoanForm label{font-size:12px;color:#4e6079;display:flex;flex-direction:column;gap:5px;min-width:0}#ioLoanForm input{box-sizing:border-box;width:100%;min-width:0;font-size:16px;padding:9px;border:1px solid #dbe2ee;border-radius:9px;background:#f8faff;color:#13183c}#ioLoanError{margin:0;color:#a32a26;font-size:12px}
.io-sim-hero{background:linear-gradient(110deg,#e9f8f1,#f3fbf8);border-radius:14px;padding:14px;display:flex;justify-content:space-between;gap:12px;align-items:center}.io-sim-hero span{font-size:12px;color:#42695b}.io-sim-hero strong{display:block;font-size:29px;color:#078251;margin-top:4px}.io-sim-hero small{display:block;font-size:11px;color:#537362;margin-top:4px}.io-sim-costs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.io-sim-costs div{padding:10px 8px;background:#f4f6fc;border:1px solid #e6eaf2;border-radius:11px;min-width:0}.io-sim-costs div:nth-child(2){background:#f4eeff}.io-sim-costs span{font-size:10px;color:#627189;display:block}.io-sim-costs b{font-size:14px;display:block;margin-top:5px;overflow-wrap:anywhere}
.io-sim-note{margin:0;font-size:11px;color:#65738b;line-height:1.4}.io-sim-details{background:#f7f9fe;border:1px solid #e2e7f1;border-radius:11px;font-size:12px}.io-sim-details summary{padding:11px;cursor:pointer;font-weight:600}.io-sim-details>div{padding:0 11px 12px}.io-sim-details p{line-height:1.45}.io-sim-details input{max-width:130px;padding:7px;border:1px solid #cbd6e6;border-radius:7px}.io-sim-details table{width:100%;min-width:0;border-collapse:collapse;font-size:11px}.io-sim-details td,.io-sim-details th{padding:7px 3px;border-bottom:1px solid #e2e7ef;text-align:right;white-space:normal}.io-sim-details th:first-child,.io-sim-details td:first-child{text-align:left}.io-sim-details a{color:#075fca}#ioLoanPrepare{width:100%;font-size:13px;min-height:38px}
@media(max-height:750px){.io-sim-wrap{gap:8px}.io-sim-head h2{font-size:20px}.io-sim-reference{padding:9px}.io-sim-hero{padding:11px}.io-sim-hero strong{font-size:25px}.io-sim-costs div{padding:8px 6px}.io-sim-details summary{padding:9px}#ioLoanForm{gap:8px}#ioLoanForm input{padding:7px}}
@media print{#ioLoanSimulator{display:none!important}}
`;
  document.head.appendChild(style);
  const el=document.createElement('div');el.id='ioLoanSimulator';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','ioLoanTitle');
  el.innerHTML=`<div class="io-sim-wrap"><header class="io-sim-head"><button type="button" id="ioLoanClose" aria-label="Fermer le simulateur">‹</button><h2 id="ioLoanTitle">Simuler un prêt</h2></header><p class="io-sim-sub">Un premier aperçu de votre financement immobilier</p>
<div class="io-sim-reference"><div><b>${reference.rate.toLocaleString('fr-FR')} %</b><small>Repère national · ${reference.period}<br>${reference.source} · hors frais et assurance</small></div><button type="button" id="ioLoanUseReference">Utiliser ce taux</button></div>
<form id="ioLoanForm" novalidate><label>Montant emprunté (€)<input name="amount" aria-label="Montant emprunté en euros" type="number" inputmode="decimal" min="100" max="10000000" step="0.01" value="100000"></label><label>Durée (années)<input name="years" aria-label="Durée en années" type="number" inputmode="numeric" min="1" max="35" step="1" value="20"></label><label>Taux annuel hors assurance (%)<input name="rate" aria-label="Taux annuel hors assurance" type="number" inputmode="decimal" min="0" max="25" step="0.01" value="${reference.rate}"></label><label>Assurance annuelle (%)<input name="insurance" aria-label="Assurance annuelle" type="number" inputmode="decimal" min="0" max="10" step="0.01" value="0.30"></label></form>
<p id="ioLoanError" role="status" hidden></p><div id="ioLoanResults" aria-live="polite"></div>
<details id="ioLoanHelp" class="io-sim-details"><summary>Comprendre les calculs et le taux</summary><div><label>Frais de dossier et de garantie payés comptant (€) <input id="ioLoanFees" aria-label="Frais de dossier et de garantie" type="number" min="0" step="0.01" value="0" inputmode="decimal"></label><p>Prêt amortissable à taux fixe, échéances mensuelles, sans différé. Assurance constante sur le capital initial, pour la quotité totale assurée : 0,30 % est une hypothèse modifiable. La dernière échéance s’ajuste au centime. Les frais sont ajoutés au coût, sans être financés.</p><p id="ioLoanRateAge"></p><p>Le repère Banque de France concerne les nouveaux crédits à l’habitat hors renégociations, toutes durées et tous profils. Il est publié avec un décalage ; ce n’est ni un barème personnalisé, ni le TAEG. <a href="${reference.url}" target="_blank" rel="noopener noreferrer">Consulter la publication source</a>.</p><p>Simulation indicative : frais de notaire, fiscalité, différé et variation de taux exclus. Les résultats restent distincts du patrimoine enregistré.</p><div id="ioLoanDurations"></div></div></details>
<button type="button" class="primary" id="ioLoanPrepare">Préparer ce crédit</button><p class="io-sim-note">Le formulaire sera prérempli. Aucun crédit n’est ajouté sans votre enregistrement.</p></div>`;
  document.body.appendChild(el);
  document.getElementById('ioLoanClose').onclick=root.ioLoanClose;
  document.getElementById('ioLoanForm').oninput=update;
  document.getElementById('ioLoanForm').onsubmit=e=>e.preventDefault();
  document.getElementById('ioLoanFees').oninput=update;
  document.getElementById('ioLoanUseReference').onclick=()=>{document.querySelector('#ioLoanForm [name=rate]').value=reference.rate;update()};
  document.getElementById('ioLoanPrepare').onclick=prepare;
  document.getElementById('ioLoanHelp').addEventListener('toggle',()=>{if(!document.getElementById('ioLoanHelp').open)el.scrollTop=0});
 }
 function values(){const f=document.getElementById('ioLoanForm');const n=k=>f.elements.namedItem(k).value.trim()===''?NaN:Number(f.elements.namedItem(k).value);const fee=document.getElementById('ioLoanFees').value.trim();return {amount:n('amount'),years:n('years'),rate:n('rate'),insurance:n('insurance'),fees:fee===''?NaN:Number(fee)}}
 function update(){
  const error=document.getElementById('ioLoanError'),results=document.getElementById('ioLoanResults'),button=document.getElementById('ioLoanPrepare');
  const age=(Date.now()-Date.parse(reference.published+'T12:00:00Z'))/86400000;
  document.getElementById('ioLoanRateAge').textContent=`Publication du 06/10/2026, vérifiée le 02/11/2026.${age>90?' Repère ancien : vérifiez un taux récent avant de décider.':' Le mois de référence reste août 2026 ; il ne décrit pas les offres du jour.'}`;
  try{const input=values(),r=calculate(input);error.hidden=true;button.disabled=false;
   results.innerHTML=`<div class="io-sim-hero"><div><span>Mensualité avec assurance</span><strong id="ioLoanMonthly">${money(r.monthly)}</strong><small>${money(r.payment)} de crédit + ${money(r.insuranceMonthly)} d’assurance</small></div></div><div class="io-sim-costs" style="margin-top:8px"><div><span>Intérêts</span><b>${money(r.interest)}</b></div><div><span>Assurance totale</span><b>${money(r.insuranceTotal)}</b></div><div><span>Coût du crédit, frais inclus</span><b id="ioLoanCost">${money(r.cost)}</b></div></div><p class="io-sim-note" style="margin-top:8px">Total remboursé et frais : ${money(r.total)} · ${r.months} mensualités</p>`;
   document.getElementById('ioLoanDurations').innerHTML='<p><b>Comparer les durées au même taux</b></p><table><thead><tr><th>Durée</th><th>Mensualité assurée</th><th>Coût, frais inclus</th></tr></thead><tbody>'+[15,20,25].map(years=>{const s=calculate({...input,years});return `<tr><td>${years} ans</td><td>${money(s.monthly)}</td><td>${money(s.cost)}</td></tr>`}).join('')+'</tbody></table><p>Le même taux est conservé pour isoler l’effet de la durée. Les offres réelles peuvent avoir des taux différents.</p>';
  }catch(e){error.hidden=false;error.textContent=e.message;button.disabled=true;results.innerHTML='';document.getElementById('ioLoanDurations').innerHTML=''}
 }
 root.ioLoanOpen=function(){mount();focusBefore=document.activeElement;scrollBefore=window.scrollY;const el=document.getElementById('ioLoanSimulator');el.hidden=false;el.scrollTop=0;document.getElementById('ioLoanHelp').open=false;document.body.classList.add('io-modal-open');update();document.getElementById('ioLoanClose').focus({preventScroll:true})};
 root.ioLoanClose=function(){const el=document.getElementById('ioLoanSimulator');if(!el||el.hidden)return;el.hidden=true;document.body.classList.remove('io-modal-open');window.scrollTo({top:scrollBefore,behavior:'instant'});focusBefore?.focus({preventScroll:true})};
 root.ioLoanBack=function(){const el=document.getElementById('ioLoanSimulator');if(!el||el.hidden)return false;const help=document.getElementById('ioLoanHelp');if(help.open){help.open=false;el.scrollTop=0}else root.ioLoanClose();return true};
 function prepare(){let input;try{input=values();calculate(input)}catch{return}root.ioLoanClose();openLoanForm();const f=document.querySelector('#loanFormWrap form');for(const [k,v] of Object.entries({initial:input.amount,remaining:input.amount,years:input.years,rate:input.rate,insuranceRate:input.insurance,insuranceAmount:'',payment:'',notes:'Préparé depuis le simulateur. Frais comptants simulés : '+money(input.fees)+'. À vérifier avec l’offre bancaire.'}))f.elements.namedItem(k).value=v;f.dispatchEvent(new Event('input',{bubbles:true}));}
})(typeof window!=='undefined'?window:globalThis);
