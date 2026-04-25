import { useState, useEffect, useMemo, useRef } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

const JOURS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function DatePickerInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) { const d = new Date(value); return isNaN(d) ? new Date() : d; }
    return new Date();
  });
  const ref = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (popRef.current && !popRef.current.contains(e.target) && ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push({ day: prevDays - startDay + 1 + i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  const selectDay = (day) => {
    const d = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(d);
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const prevYear = () => setViewDate(new Date(year - 1, month, 1));
  const nextYear = () => setViewDate(new Date(year + 1, month, 1));

  const formatDisplay = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d)) return v;
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const selectedStr = value || "";

  return (
    <div style={{ position:"relative", flex:1 }} ref={ref}>
      <div onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", minHeight:20 }}>
        <span style={{ flex:1, fontSize:13, fontWeight:700, color:value?C.w:C.g3 }}>{value ? formatDisplay(value) : (placeholder || "Sélectionner une date")}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      {open && (
        <div ref={popRef} style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:9999, background:"#141416", border:"1px solid "+C.border, borderRadius:12, boxShadow:"0 12px 40px rgba(0,0,0,0.7)", width:280, padding:"12px", animation:"fadeUp 0.15s ease" }}>
          {/* Navigation */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", gap:2 }}>
              <button onClick={prevYear} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:"2px 4px", fontSize:11 }}>{"<<"}</button>
              <button onClick={prevMonth} style={{ background:"none", border:"none", color:C.g2, cursor:"pointer", padding:"2px 6px", fontSize:13 }}>{"<"}</button>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:C.w }}>{MOIS_NOMS[month]} {year}</span>
            <div style={{ display:"flex", gap:2 }}>
              <button onClick={nextMonth} style={{ background:"none", border:"none", color:C.g2, cursor:"pointer", padding:"2px 6px", fontSize:13 }}>{">"}</button>
              <button onClick={nextYear} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:"2px 4px", fontSize:11 }}>{">>"}</button>
            </div>
          </div>
          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, marginBottom:4 }}>
            {JOURS.map(j => <div key={j} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:C.g3, fontFamily:C.mono, padding:"2px 0" }}>{j}</div>)}
          </div>
          {/* Day cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1 }}>
            {cells.map((cell, i) => {
              const cellStr = cell.current ? `${year}-${String(month+1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}` : "";
              const isSelected = cell.current && cellStr === selectedStr;
              const isToday = cell.current && cellStr === todayStr;
              return (
                <button key={i} onClick={()=>cell.current && selectDay(cell.day)}
                  style={{ width:34, height:32, borderRadius:8, border:"none", fontSize:12, fontWeight:isSelected?800:isToday?700:500, cursor:cell.current?"pointer":"default",
                    background:isSelected?"linear-gradient(135deg,#3B82F6,#2563EB)":isToday?"rgba(59,130,246,0.12)":"transparent",
                    color:isSelected?"#fff":isToday?C.blue:cell.current?C.w:C.g3+"60",
                    transition:"all 0.1s" }}
                  onMouseEnter={e=>{if(cell.current&&!isSelected)e.currentTarget.style.background="rgba(59,130,246,0.08)";}}
                  onMouseLeave={e=>{if(cell.current&&!isSelected)e.currentTarget.style.background=isToday?"rgba(59,130,246,0.12)":"transparent";}}>
                  {cell.day}
                </button>
              );
            })}
          </div>
          {/* Today button */}
          <div style={{ marginTop:8, display:"flex", justifyContent:"center" }}>
            <button onClick={()=>{onChange(todayStr);setOpen(false);setViewDate(new Date());}}
              style={{ background:"none", border:"1px solid "+C.border, borderRadius:6, padding:"4px 12px", fontSize:10, color:C.blue, cursor:"pointer", fontFamily:C.mono }}>
              Aujourd'hui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const SIM_ABT_DON = { "parent-enfant":{montant:100000,rappel:15},"grand-parent-petit-enfant":{montant:31865,rappel:15},"epoux-pacs":{montant:80724,rappel:15},"handicap":{montant:159325,rappel:15} };
const SIM_BAR_USU = [{ageMin:0,ageMax:20,usufruit:90,nuePropriete:10},{ageMin:21,ageMax:30,usufruit:80,nuePropriete:20},{ageMin:31,ageMax:40,usufruit:70,nuePropriete:30},{ageMin:41,ageMax:50,usufruit:60,nuePropriete:40},{ageMin:51,ageMax:60,usufruit:50,nuePropriete:50},{ageMin:61,ageMax:70,usufruit:40,nuePropriete:60},{ageMin:71,ageMax:80,usufruit:30,nuePropriete:70},{ageMin:81,ageMax:90,usufruit:20,nuePropriete:80},{ageMin:91,ageMax:999,usufruit:10,nuePropriete:90}];
const SIM_BAR_DR = [{min:0,max:8072,taux:5},{min:8072,max:12109,taux:10},{min:12109,max:15932,taux:15},{min:15932,max:552324,taux:20},{min:552324,max:902838,taux:30},{min:902838,max:1805677,taux:40},{min:1805677,max:Infinity,taux:45}];
const SIM_ABT_IR = [0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,4,100];
const SIM_ABT_PS = [0,0,0,0,0,0,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.60,9,9,9,9,9,9,9,9,100];
const SIM_IFI_B = [{min:0,max:800000,taux:0},{min:800000,max:1300000,taux:0.5},{min:1300000,max:2570000,taux:0.7},{min:2570000,max:5000000,taux:1},{min:5000000,max:10000000,taux:1.25},{min:10000000,max:Infinity,taux:1.5}];

const SIM_OBJ = [
  { id:"vendre", label:"Vendre un bien", Ic:()=><I.Tag/>, short:"Vente" },
  { id:"transmettre", label:"Transmettre (donation)", Ic:()=><I.Sparkles/>, short:"Transmission" },
  { id:"succession", label:"Préparer la succession", Ic:()=><I.FileText/>, short:"Succession" },
  { id:"revenus", label:"Générer des revenus", Ic:()=><I.TrendUp/>, short:"Revenus" },
  { id:"optimiser-locatif", label:"Optimiser fiscalité locative", Ic:()=><I.Trend/>, short:"Optim. fiscale" },
  { id:"reduire-ifi", label:"Réduire l'IFI", Ic:()=><I.Dollar/>, short:"IFI" },
  { id:"gouvernance", label:"Gouvernance familiale", Ic:()=><I.Users/>, short:"Gouvernance" },
  { id:"indivision", label:"Sortir d'indivision", Ic:()=><I.Lock/>, short:"Indivision" },
  { id:"restructurer", label:"Restructurer la détention", Ic:()=><I.Building/>, short:"Restructuration" },
];

// Relevance matrix: scenario → objective relevance (0-100)
const SIM_REL = {
  "vente-directe":{vendre:95,transmettre:20,succession:15,revenus:5,"optimiser-locatif":10,"reduire-ifi":40,gouvernance:5,indivision:30,restructurer:20},
  "attente":{vendre:70,transmettre:15,succession:10,revenus:30,"optimiser-locatif":15,"reduire-ifi":10,gouvernance:5,indivision:10,restructurer:15},
  "donation-pp":{vendre:10,transmettre:95,succession:85,revenus:5,"optimiser-locatif":5,"reduire-ifi":50,gouvernance:60,indivision:15,restructurer:20},
  "donation-np":{vendre:5,transmettre:95,succession:90,revenus:40,"optimiser-locatif":10,"reduire-ifi":80,gouvernance:70,indivision:10,restructurer:25},
  "sci-ir":{vendre:15,transmettre:70,succession:65,revenus:35,"optimiser-locatif":40,"reduire-ifi":30,gouvernance:90,indivision:20,restructurer:85},
  "sci-is":{vendre:10,transmettre:40,succession:35,revenus:50,"optimiser-locatif":70,"reduire-ifi":20,gouvernance:75,indivision:10,restructurer:80},
  "loc-comp":{vendre:5,transmettre:5,succession:5,revenus:80,"optimiser-locatif":95,"reduire-ifi":10,gouvernance:5,indivision:5,restructurer:30},
  "sortie-indiv":{vendre:40,transmettre:10,succession:20,revenus:5,"optimiser-locatif":5,"reduire-ifi":15,gouvernance:15,indivision:95,restructurer:30},
  "ifi":{vendre:20,transmettre:30,succession:25,revenus:5,"optimiser-locatif":10,"reduire-ifi":95,gouvernance:15,indivision:5,restructurer:20},
  "pp-nu":{vendre:30,transmettre:30,succession:30,revenus:70,"optimiser-locatif":60,"reduire-ifi":20,gouvernance:15,indivision:10,restructurer:20},
  "pp-lmnp":{vendre:25,transmettre:25,succession:25,revenus:85,"optimiser-locatif":80,"reduire-ifi":15,gouvernance:10,indivision:5,restructurer:25},
  "sci-ir-acq":{vendre:15,transmettre:75,succession:70,revenus:45,"optimiser-locatif":45,"reduire-ifi":35,gouvernance:90,indivision:10,restructurer:85},
  "sci-is-acq":{vendre:10,transmettre:45,succession:40,revenus:60,"optimiser-locatif":75,"reduire-ifi":25,gouvernance:70,indivision:5,restructurer:80},
  "sarl-famille":{vendre:15,transmettre:70,succession:65,revenus:80,"optimiser-locatif":85,"reduire-ifi":25,gouvernance:85,indivision:5,restructurer:80},
};

function simWS(sid, base, objs) {
  const r = SIM_REL[sid]; if(!r||!objs?.length) return base;
  const tw = objs.reduce((s,o) => s+o.weight, 0); if(!tw) return base;
  let wr = 0; for(const o of objs) wr += (r[o.id]||30)/100 * (o.weight/tw);
  return Math.round(base * 0.35 + wr * 100 * 0.65);
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLES
// ═══════════════════════════════════════════════════════════════════════
const SIM_EX = [
  { id:"couple-retraite",couleur:"#3B82F6",titre:"Couple retraité — Vente + succession",
    description:"Jean et Marie, 68 ans, mariés, 2 enfants. Locatif 380 000 €. Vendre (70%) + succession (30%).",
    tags:["Multi-objectif","Plus-value"],
    profile:{objectives:[{id:"vendre",weight:70},{id:"succession",weight:30}],age:68,couple:true,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:0,tmi:30,divorce:false},
    property:{mode:"existant",type:"locatif",isRP:false,prixAcquisition:180000,valeurActuelle:380000,dateAcquisition:"2007-03-15",anneesDetention:19,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:10800,chargesLocatives:3200,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:850000}
  },
  { id:"donation-revenu",couleur:"#10B981",titre:"Transmettre + garder des revenus",
    description:"Françoise, 62 ans, veuve, 3 enfants. Maison 520 000 €. Transmettre (80%) + revenus (20%).",
    tags:["Démembrement","Revenus"],
    profile:{objectives:[{id:"transmettre",weight:80},{id:"revenus",weight:20}],age:62,couple:false,regimeMatrimonial:"communaute-reduite",enfants:3,donationsAnterieures:0,tmi:30,divorce:false},
    property:{mode:"existant",type:"rs",isRP:false,prixAcquisition:150000,valeurActuelle:520000,dateAcquisition:"1998-06-01",anneesDetention:28,travaux:35000,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:0,chargesLocatives:0,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:520000}
  },
  { id:"triple-objectif",couleur:"#F59E0B",titre:"Acquisition — Triple objectif",
    description:"Marc, 50 ans, marié, 2 enfants. T3 à 280 000 €. Revenus (40%) + fiscal (35%) + transmission (25%).",
    tags:["Acquisition","Triple objectif"],
    profile:{objectives:[{id:"revenus",weight:40},{id:"optimiser-locatif",weight:35},{id:"transmettre",weight:25}],age:50,couple:true,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:0,tmi:41,divorce:false},
    property:{mode:"acquisition",type:"locatif",isRP:false,prixAcquisition:280000,valeurActuelle:280000,dateAcquisition:"2026-03-01",anneesDetention:0,travaux:0,dettes:210000,regimeFiscal:"reel",loyerAnnuel:14400,chargesLocatives:4800,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:280000,acqDureeDetention:15,acqTauxRevalo:2,acqLoyer:14400,acqCharges:4800,acqMeuble:false,acqTaxeFonciere:1800}
  },
  { id:"ifi-succession",couleur:"#EF4444",titre:"IFI + Succession",
    description:"Catherine, 72 ans, veuve, 2 enfants. Patrimoine 1 700 000 €. IFI (60%) + succession (40%).",
    tags:["IFI","Succession"],
    profile:{objectives:[{id:"reduire-ifi",weight:60},{id:"succession",weight:40}],age:72,couple:false,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:0,tmi:41,divorce:false},
    property:{mode:"existant",type:"locatif",isRP:false,prixAcquisition:420000,valeurActuelle:750000,dateAcquisition:"2005-07-01",anneesDetention:21,travaux:40000,dettes:180000,regimeFiscal:"reel",loyerAnnuel:36000,chargesLocatives:14000,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:1700000}
  },
  { id:"gouv-rev",icon:"👨‍👩‍👧‍👦",couleur:"#7c3aed",titre:"Gouvernance + Revenus + Fiscal",
    description:"Pierre, 58 ans, marié, 2 enfants. 3 biens (1 200 000 €). Gouvernance (50%) + revenus (30%) + fiscal (20%).",
    tags:["Gouvernance","SCI","Multi"],
    profile:{objectives:[{id:"gouvernance",weight:50},{id:"revenus",weight:30},{id:"optimiser-locatif",weight:20}],age:58,couple:true,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:50000,tmi:41,divorce:false},
    property:{mode:"existant",type:"locatif",isRP:false,prixAcquisition:680000,valeurActuelle:1200000,dateAcquisition:"2010-01-15",anneesDetention:16,travaux:85000,dettes:320000,regimeFiscal:"reel",loyerAnnuel:54000,chargesLocatives:22000,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:1900000}
  },
  { id:"indiv-vente",icon:"🔓",couleur:"#0891b2",titre:"Indivision + Vente",
    description:"Sophie et 2 frères. Appart 290 000 €. Indivision (75%) + vente (25%).",
    tags:["Indivision","Vente"],
    profile:{objectives:[{id:"indivision",weight:75},{id:"vendre",weight:25}],age:52,couple:false,regimeMatrimonial:"communaute-reduite",enfants:1,donationsAnterieures:0,tmi:30,divorce:false},
    property:{mode:"existant",type:"rs",isRP:false,prixAcquisition:45000,valeurActuelle:290000,dateAcquisition:"1985-04-10",anneesDetention:41,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:0,chargesLocatives:0,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:290000}
  },
];

// ═══════════════════════════════════════════════════════════════════════
// CALC ENGINE
// ═══════════════════════════════════════════════════════════════════════
function simFmt(n){if(n==null||isNaN(n))return"—";return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);}
function simCAb(a,t){if(a>=t.length)return 100;let s=0;for(let i=0;i<=Math.min(a,t.length-1);i++)s+=t[i];return Math.min(s,100);}
function simPV(p,c,a,rp,tr=0,am=0){
  if(rp)return{ir:0,ps:0,total:0,exo:"RP",pvBrute:0,abattIR:100,abattPS:100};
  const f=p*0.075,ft=(a>=5&&tr===0)?p*0.15:tr;let pc=Math.max(0,p+f+ft-am);const pv=Math.max(0,c-pc);
  if(!pv)return{ir:0,ps:0,total:0,exo:"Pas de PV",pvBrute:0,abattIR:0,abattPS:0};
  const aI=simCAb(a,SIM_ABT_IR),aP=simCAb(a,SIM_ABT_PS),nI=pv*(1-aI/100),nP=pv*(1-aP/100);
  const ir=nI*0.19,ps=nP*0.172;let sur=0;
  if(nI>250000)sur=nI*0.06;else if(nI>200000)sur=nI*0.05;else if(nI>150000)sur=nI*0.04;else if(nI>100000)sur=nI*0.03;else if(nI>60000)sur=nI*0.02;else if(nI>50000)sur=nI*0.02-(60000-nI)/20;
  return{ir:Math.round(ir),ps:Math.round(ps),surtaxe:Math.max(0,Math.round(sur)),total:Math.round(ir+ps+Math.max(0,sur)),pvBrute:Math.round(pv),abattIR:Math.round(aI*10)/10,abattPS:Math.round(aP*10)/10,exo:null};
}
function simDon(val,ant=0){const ab=Math.max(0,100000-ant),ba=Math.max(0,val-ab);let d=0,r=ba;for(const t of SIM_BAR_DR){if(r<=0)break;d+=Math.min(r,t.max-t.min)*t.taux/100;r-=(t.max-t.min);}return{droits:Math.round(d),abattement:ab,base:Math.round(ba),taux:ba>0?Math.round(d/ba*1000)/10:0};}
function simUsuf(age){return SIM_BAR_USU.find(t=>age>=t.ageMin&&age<=t.ageMax)||{usufruit:10,nuePropriete:90};}
function simIFI(pat,det=0,rp=0){const nt=pat-rp+rp*0.7-det;if(nt<=1300000)return{montant:0,netTaxable:nt,seuil:false};let i=0;for(const t of SIM_IFI_B){if(nt>t.min)i+=Math.min(nt-t.min,t.max-t.min)*t.taux/100;}return{montant:Math.round(i),netTaxable:Math.round(nt),seuil:true};}
function simDP(v,div=false){return Math.round(v*(div?0.011:0.025));}
function simRF(l,ch=0,reg="micro"){
  // Revenus fonciers (location nue)
  if(reg==="micro"){
    if(l>15000) return{imposable:l,ps:Math.round(l*0.172),regime:"micro (forcé réel >15k)"};
    return{imposable:Math.round(l*0.7),ps:Math.round(l*0.7*0.172),regime:"Micro-foncier (30%)"};
  }
  const r=Math.max(0,l-ch);
  return{imposable:r,deficit:ch>l?Math.min(ch-l,10700):0,ps:Math.round(r*0.172),regime:"Réel foncier"};
}
function simBIC(l,ch=0,amort=0,reg="micro",tourisme=false){
  // BIC meublé (LMNP/LMP)
  const seuilMicro = tourisme ? 188700 : 77700;
  const abattement = tourisme ? 0.71 : 0.50;
  if(reg==="micro" && l <= seuilMicro){
    const imp = Math.round(l * (1 - abattement));
    return{imposable:imp, ps:Math.round(imp*0.172), regime:"Micro-BIC ("+ Math.round(abattement*100) +"%)", amort:0, deficit:0};
  }
  // Réel BIC
  const r = Math.max(0, l - ch - amort);
  const def = (ch + amort) > l ? Math.min((ch + amort) - l, l) : 0; // deficit BIC reportable 10 ans (sur BIC only en LMNP)
  return{imposable:r, ps:Math.round(r*0.172), regime:"Réel BIC", amort:amort, deficit:def};
}
function simIsLMP(loyer, revenuGlobal) {
  // Test bascule LMP: recettes > 23k ET > 50% revenus activité
  return loyer > 23000 && (revenuGlobal <= 0 || loyer > revenuGlobal * 0.5);
}
function simCotSocLMP(benefice) {
  // Cotisations sociales TNS sur bénéfice LMP (~40% effectif)
  if(benefice <= 0) return 0;
  return Math.round(benefice * 0.40);
}
function simHO(objs, ids){return objs.some(o=>o.weight>0&&ids.includes(o.id));}

// ═══════════════════════════════════════════════════════════════════════
// SCENARIO GENERATORS
// ═══════════════════════════════════════════════════════════════════════
function simGenEx(pr,pp){
  const sc=[],a=pp.anneesDetention||0,v=pp.valeurActuelle||0,p=pp.prixAcquisition||0,ob=pr.objectives||[];
  const nE=Math.max(pr.enfants||1,1),mul=pr.couple?2:1;
  const ant=pr.donationsAnterieures||0;
  // Compute annual fiscal burden on rental income
  const loyerAn=pp.loyerAnnuel||0,chAn=pp.chargesLocatives||0;
  let fiscAn=0;
  if(loyerAn>0){const rf=simRF(loyerAn,chAn,pp.regimeFiscal==="reel"?"reel":"micro");fiscAn=Math.round(rf.imposable*(pr.tmi||30)/100)+rf.ps;}

  // Helper: succession droits for a given value with optional décote and Dutreil
  function succFor(val, decote=0, dutreil=false) {
    const valNette = Math.round(val * (1 - decote));
    const assiette = dutreil ? Math.round(valNette * 0.25) : valNette;
    const parEnfantParParent = assiette / nE / mul;
    const d = simDon(parEnfantParParent, ant);
    return { totalDroits: Math.round(d.droits * nE * mul), droitsParEnfant: Math.round(d.droits * mul), abattement: d.abattement, valeur: valNette, assiette };
  }

  // Base succession: détention directe, valeur vénale pleine
  const succPP = succFor(v, 0, false);
  // SCI IR: décote parts 10%
  const succSCIir = succFor(v, 0.10, false);
  // SCI IS: actif net (simplifié: valeur + tréso estimée - IS latent) avec décote 15%
  const amIS = loyerAn>0 ? Math.round(((pp.valeurActuelle||0)*0.85)/30) : 0;
  const rIS = Math.max(0, loyerAn - chAn - amIS - 2500);
  const isAn = Math.round(Math.min(rIS,42500)*0.15 + Math.max(0,rIS-42500)*0.25);
  const tresoEst = Math.round((Math.max(0, loyerAn - chAn - 2500) - isAn) * 10);
  const isLatent = Math.round(Math.max(0, v - Math.max(0, v - amIS*10)) * 0.25);
  const actifNetIS = Math.max(v, v + tresoEst - isLatent);
  const succSCIis = succFor(actifNetIS, 0.15, false);

  if(simHO(ob,["vendre","transmettre","succession","restructurer","reduire-ifi","revenus"])){
    const pv=simPV(p,v,a,pp.isRP,pp.travaux,pp.amortissementsLMNP);const b=pv.total===0?95:Math.max(20,80-Math.round(pv.total/v*100));
    sc.push({id:"vente-directe",nom:"Vente directe",categorie:"Cession",description:"Vente en l'état",
      _comp:{fiscDetention:0,coutVente:pv.total,coutSuccession:null,note:"Vente immédiate → plus de bien à transmettre"},
      kpis:{"PV brute":simFmt(pv.pvBrute),"IR 19%":simFmt(pv.ir),"PS 17,2%":simFmt(pv.ps),"Total":simFmt(pv.total),"Cash net":simFmt(v-pv.total),"Abatt. IR":pv.abattIR+"%","Abatt. PS":pv.abattPS+"%"},avantages:["Liquidité","Simplicité",pv.exo?`Exo: ${pv.exo}`:null].filter(Boolean),inconvenients:pv.total>0?["Imposition PV",a<22?"Abatt IR non max":null].filter(Boolean):[],alertes:pp.amortissementsLMNP>0?["⚠️ LF2025: amort LMNP minorent prix"]:[],sources:["CGI art. 150 U"],score:simWS("vente-directe",b,ob)});}
  if(a<30&&simHO(ob,["vendre","restructurer","revenus"])){
    const t=a<22?22:30,pvF=simPV(p,v,t,pp.isRP,pp.travaux,pp.amortissementsLMNP),pvN=simPV(p,v,a,pp.isRP,pp.travaux,pp.amortissementsLMNP);
    const attFisc=fiscAn*(t-a);
    sc.push({id:"attente",nom:`Attendre ${t-a} an(s)`,categorie:"Cession différée",description:`Détention ${t} ans`,
      _comp:{fiscDetention:attFisc,coutVente:pvF.total,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:`Détention directe. Succession sur valeur pleine.`},
      kpis:{"Total projeté":simFmt(pvF.total),"Économie":simFmt(pvN.total-pvF.total),"Abatt IR":pvF.abattIR+"%"},avantages:["Exo IR 22 ans","Exo PS 30 ans","Revenus maintenus"],inconvenients:["Immobilisation","Risque marché"],alertes:[],sources:["CGI art. 150 VC"],score:simWS("attente",Math.min(90,50+(t-a<=5?30:10)),ob)});}
  if(simHO(ob,["transmettre","succession","gouvernance","reduire-ifi"])&&pr.enfants>0){
    const n=pr.enfants,m=pr.couple?2:1,d=simDon(v/n/m,ant),tot=Math.round(d.droits*n*m);
    sc.push({id:"donation-pp",nom:"Donation pleine propriété",categorie:"Transmission",description:`Aux ${n} enfant(s)`,
      _comp:{fiscDetention:0,coutVente:null,coutSuccession:tot,succDetail:{valeur:v,assiette:v,decote:null,dutreil:false,abattement:d.abattement},note:"Droits de donation (transmission immédiate)"},
      kpis:{"Valeur":simFmt(v),"Abattements":simFmt(d.abattement*n*m),"Droits":simFmt(tot),"Taux":d.taux+"%"},avantages:["Transmission immédiate","Purge PV"],inconvenients:["Perte contrôle","Plus de revenus"],alertes:ant>0?["⚠️ Rappel < 15 ans"]:[],sources:["CGI art. 779 I"],score:simWS("donation-pp",tot===0?90:Math.max(30,75-Math.round(tot/v*100)),ob)});}
  if(simHO(ob,["transmettre","succession","reduire-ifi","gouvernance","revenus"])&&pr.enfants>0&&pr.age){
    const u=simUsuf(pr.age),vnp=v*u.nuePropriete/100,n=pr.enfants,m=pr.couple?2:1;
    const d=simDon(vnp/n/m,ant),tot=Math.round(d.droits*n*m);
    const dPP=simDon(v/n/m,ant),totPP=Math.round(dPP.droits*n*m);
    sc.push({id:"donation-np",nom:"Donation nue-propriété",categorie:"Transmission démembrée",description:`NP ${u.nuePropriete}% / Usufruit ${u.usufruit}%`,
      _comp:{fiscDetention:0,coutVente:null,coutSuccession:tot,succDetail:{valeur:vnp,assiette:vnp,decote:`NP ${u.nuePropriete}%`,dutreil:false,abattement:d.abattement},note:`Droits sur NP (${u.nuePropriete}%). Réunion au décès sans droits (art. 1133 CGI).`},
      kpis:{"PP":simFmt(v),"NP":simFmt(vnp),"Droits":simFmt(tot),"Éco. vs PP":simFmt(totPP-tot)},avantages:["Usage & revenus conservés",`Assiette -${u.usufruit}%`,"Réunion sans droits","Réduit IFI"],inconvenients:["Partage contrôle","Complexité"],alertes:["ℹ️ Art. 1133 CGI"],sources:["CGI art. 669"],score:simWS("donation-np",Math.min(95,70+Math.round(u.usufruit/5)),ob)});}
  if(simHO(ob,["restructurer","gouvernance","transmettre","revenus"])){
    sc.push({id:"sci-ir",nom:"SCI à l'IR",categorie:"Structuration",description:"Transparente",
      _comp:{fiscDetention:fiscAn>0?(fiscAn+1500)*15:null,coutVente:simPV(p,v,a+15,pp.isRP).total,coutSuccession:succSCIir.totalDroits,succDetail:{valeur:succSCIir.valeur,assiette:succSCIir.assiette,decote:"10%",dutreil:false,abattement:succSCIir.abattement},note:`Décote parts 10%. Succession: ${simFmt(succSCIir.totalDroits)} vs ${simFmt(succPP.totalDroits)} en direct.`},
      kpis:{"PV":"Particuliers","Coût":"1 500–3 000 €"},avantages:["Parts transmissibles","Clauses","Démembrement","Revenus","Décote 10% succession"],inconvenients:["Formalisme","Coût","Meublé interdit"],alertes:["⚠️ SCI+meublé=IS"],sources:["CGI art. 8"],score:simWS("sci-ir",65,ob)});}
  if(simHO(ob,["restructurer","optimiser-locatif","revenus"])){
    sc.push({id:"sci-is",nom:"SCI à l'IS",categorie:"Structuration",description:"Amortissement, IS",
      _comp:{fiscDetention:loyerAn>0?(isAn+2500)*15:null,coutVente:Math.round(Math.max(0,v-Math.max(0,v-amIS*15))*0.25),coutSuccession:succSCIis.totalDroits,succDetail:{valeur:succSCIis.valeur,assiette:succSCIis.assiette,decote:"15%",dutreil:false,abattement:succSCIis.abattement},note:`Actif net réévalué ${simFmt(actifNetIS)}. Décote 15%.`},
      kpis:{"IS":"15%/25%","Amort":"Oui","PV":"Pro"},avantages:["Amortissement","IS réduit","Décote 15% succession"],inconvenients:["Double imposition","PV pro","IS irrévocable","Actif net élevé"],alertes:["⚠️ IS irrévocable","⚠️ Tréso accumulée gonfle actif net"],sources:["CGI art. 206"],score:simWS("sci-is",50,ob)});}
  if(simHO(ob,["optimiser-locatif","restructurer","revenus"])&&pp.loyerAnnuel){
    const mi=simRF(pp.loyerAnnuel,0,"micro"),re=simRF(pp.loyerAnnuel,pp.chargesLocatives||pp.loyerAnnuel*0.35,"reel");
    const fiscMi=Math.round(mi.imposable*(pr.tmi||30)/100)+mi.ps, fiscRe=Math.round(re.imposable*(pr.tmi||30)/100)+re.ps;
    const best=Math.min(fiscMi,fiscRe);
    sc.push({id:"loc-comp",nom:"Micro vs Réel",categorie:"Exploitation locative",description:"Comparaison régimes",
      _comp:{fiscDetention:best*10,coutVente:simPV(p,v,a+10,pp.isRP).total,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:"Détention directe. Succession sur valeur pleine."},
      kpis:{"Micro":simFmt(mi.imposable),"Réel":simFmt(re.imposable),"Déficit":simFmt(re.deficit||0)},avantages:["Micro: simplicité","Réel: déductions"],inconvenients:["Micro: forfait","Réel: 3 ans"],alertes:pp.loyerAnnuel>15000?["⚠️ >15k"]:[],sources:["CGI art. 31-32"],score:simWS("loc-comp",re.imposable<mi.imposable?70:65,ob)});}
  if(simHO(ob,["indivision","vendre"])){
    const dp=simDP(v,pr.divorce),pv=simPV(p,v,a,pp.isRP);
    sc.push({id:"sortie-indiv",nom:"Sortie d'indivision",categorie:"Indivision",description:"Partage / licitation",
      _comp:{fiscDetention:dp,coutVente:pv.total+dp,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:"Succession sur valeur pleine après partage."},
      kpis:{"Valeur":simFmt(v),"Droit partage":simFmt(dp),"PV":simFmt(pv.total)},avantages:["Résolution","Rachat possible"],inconvenients:["Droit partage","Contentieux"],alertes:["⚠️ Art. 815-3"],sources:["CGI art. 746"],score:simWS("sortie-indiv",60,ob)});}
  if(simHO(ob,["reduire-ifi","succession","transmettre"])){
    const ifi=simIFI(pp.patrimoineImmoTotal||v,pp.dettes||0,pp.isRP?v:0);
    sc.push({id:"ifi",nom:"Estimation IFI",categorie:"IFI",description:"Leviers de réduction",
      _comp:{fiscDetention:ifi.montant*10,coutVente:null,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:"Succession sur valeur pleine. IFI projeté sur 10 ans."},
      kpis:{"Net taxable":simFmt(ifi.netTaxable),"IFI":simFmt(ifi.montant)},avantages:["Donation NP","Dettes déductibles"],inconvenients:["Restructuration"],alertes:ifi.seuil?["⚠️ Seuil dépassé"]:[],sources:["CGI art. 964"],score:simWS("ifi",ifi.montant>0?55:80,ob)});}
  return sc.sort((a,b)=>b.score-a.score);
}

function simGenAcq(pr,pp){
  const px=pp.prixAcquisition||0, dur=pp.acqDureeDetention||15, txR=(pp.acqTauxRevalo||2)/100;
  const loy=pp.acqLoyer||pp.loyerAnnuel||0, ch=pp.acqCharges||pp.chargesLocatives||0, txF=pp.acqTaxeFonciere||0;
  const tmi=pr.tmi||30, nE=Math.max(pr.enfants||1,1), mul=pr.couple?2:1;
  const vR=Math.round(px*Math.pow(1+txR,dur)), fN=Math.round(px*0.08), ob=pr.objectives||[];
  const ant=pr.donationsAnterieures||0;
  const isLMP = simIsLMP(loy, pr.revenuGlobal||loy*3);
  const isMeuble = pp.acqMeuble || pp.meuble;
  const sc=[];

  function succForValue(val, decote=0, dutreil=false) {
    const valNette = Math.round(val * (1 - decote));
    const assiette = dutreil ? Math.round(valNette * 0.25) : valNette;
    const parEnfantParParent = assiette / nE / mul;
    const d = simDon(parEnfantParParent, ant);
    return { valeur:valNette, assiette, droitsParEnfant:Math.round(d.droits*mul), totalDroits:Math.round(d.droits*nE*mul), abattement:d.abattement, tauxMoyen:d.taux, decote:decote>0?Math.round(decote*100)+"%":null, dutreil };
  }
  function rendement(revNet){ return px>0 ? Math.round(revNet/px*10000)/100 : 0; }
  function cashflowAn(revNet, mensualite){ return Math.round(revNet - (mensualite||0)*12); }

  const dette = pp.dettes||0;
  const mensualiteEst = dette > 0 ? Math.round(dette * 0.005) : 0; // ~estimation mensualité

  // ═══════════════════════════════════════════════════════════
  // 1. PP — Location nue MICRO-FONCIER
  // ═══════════════════════════════════════════════════════════
  if(!isMeuble){
    const rf = simRF(loy, 0, "micro");
    const ir = Math.round(rf.imposable*tmi/100), fa = ir + rf.ps, ft = fa*dur;
    const revNet = loy - ch - txF - fa;
    const pv = simPV(px, vR, dur, false);
    const succ = succForValue(vR, 0, false);
    sc.push({id:"pp-nu-micro",nom:"Location nue — Micro-foncier",categorie:"Personne physique",icon:"📋",couleur:"#6366f1",
      description:"Abattement 30% · Seuil 15 000 €/an · Simplicité maximale",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:rf.regime,revenuImposable:rf.imposable,irAnnuel:ir,psAnnuel:rf.ps,cotSociales:0,fiscAnnuelle:fa,fiscTotale:ft,duree:dur,revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
        succession:{...succ,notes:"Valeur vénale pleine."}},
      totalCout:fN+ft+pv.total,totalCoutSucc:fN+ft+succ.totalDroits,
      avantages:["Ultra-simple","Pas de comptabilité","Abattement 30% auto","Pas de cotisations sociales"],
      inconvenients:["Plafond 15 000 €/an","Pas de déduction charges réelles","Pas de déficit foncier","Pas d'amortissement"],
      alertes:loy>15000?["⚠️ Revenus > 15 000 € → micro impossible, passage réel obligatoire"]:[],
      sources:["CGI art. 32"],score:simWS("pp-nu",loy<=15000?65:30,ob)});

  // ═══════════════════════════════════════════════════════════
  // 2. PP — Location nue RÉEL FONCIER
  // ═══════════════════════════════════════════════════════════
    const rfR = simRF(loy, ch+txF, "reel");
    const irR = Math.round(rfR.imposable*tmi/100), faR = irR + rfR.ps, ftR = faR*dur;
    const revNetR = loy - ch - txF - faR;
    sc.push({id:"pp-nu-reel",nom:"Location nue — Réel foncier",categorie:"Personne physique",icon:"📊",couleur:"#2563eb",
      description:"Charges réelles déductibles · Déficit foncier possible (10 700 €/an)",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:rfR.regime,revenuImposable:rfR.imposable,irAnnuel:irR,psAnnuel:rfR.ps,cotSociales:0,deficitFoncier:rfR.deficit||0,fiscAnnuelle:faR,fiscTotale:ftR,duree:dur,revenuNet:revNetR,cashflow:cashflowAn(revNetR,mensualiteEst),rendement:rendement(revNetR)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
        succession:{...succ,notes:"Valeur vénale pleine."}},
      totalCout:fN+ftR+pv.total,totalCoutSucc:fN+ftR+succ.totalDroits,
      avantages:["Déduction intérêts emprunt","Déduction travaux/taxes","Déficit foncier imputable (10 700 €/an sur revenu global)","Report déficit 10 ans"],
      inconvenients:["Comptabilité foncière (décl. 2044)","Engagement 3 ans min","Pas d'amortissement du bien"],
      alertes:rfR.deficit>0?["ℹ️ Déficit foncier de "+simFmt(rfR.deficit)+" imputable sur revenu global"]:[],
      sources:["CGI art. 28-31"],score:simWS("pp-nu",rfR.imposable<rf.imposable?72:55,ob)});
  }

  // ═══════════════════════════════════════════════════════════
  // 3. LMNP Micro-BIC (si meublé et recettes ≤ 77 700 €)
  // ═══════════════════════════════════════════════════════════
  if(isMeuble && loy <= 77700){
    const bic = simBIC(loy, 0, 0, "micro", false);
    const ir = Math.round(bic.imposable*tmi/100), fa = ir + bic.ps, ft = fa*dur;
    const revNet = loy - ch - txF - fa;
    const pv = simPV(px, vR, dur, false);
    const succ = succForValue(vR, 0, false);
    sc.push({id:"lmnp-micro",nom:"LMNP — Micro-BIC",categorie:"Personne physique",icon:"📋",couleur:"#f59e0b",
      description:"Abattement 50% · Seuil 77 700 € · Aucune comptabilité",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:bic.regime,revenuImposable:bic.imposable,irAnnuel:ir,psAnnuel:bic.ps,cotSociales:0,fiscAnnuelle:fa,fiscTotale:ft,duree:dur,revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
        succession:{...succ,notes:"Valeur vénale pleine."}},
      totalCout:fN+ft+pv.total,totalCoutSucc:fN+ft+succ.totalDroits,
      avantages:["Ultra-simple (décl. 2042-C PRO)","Abattement 50% automatique","Pas de comptabilité","Pas de cotisations sociales (si < 23k)"],
      inconvenients:["Pas d'amortissement","Pas de déduction charges réelles","Plafond 77 700 €"],
      alertes:isLMP?["⚠️ Recettes > 23k ET > 50% revenus → bascule LMP obligatoire"]:[],
      sources:["CGI art. 50-0"],score:simWS("pp-lmnp",loy<=30000?68:55,ob)});
  }

  // ═══════════════════════════════════════════════════════════
  // 4. LMNP Réel BIC (amortissements + charges)
  // ═══════════════════════════════════════════════════════════
  if(isMeuble){
    const amA = Math.round((px*0.85)/25); // amort bien 25 ans (hors terrain 15%)
    const chTot = ch + txF;
    const bic = simBIC(loy, chTot, amA, "reel");
    const ir = Math.round(bic.imposable*tmi/100), fa = ir + bic.ps, ft = fa*dur;
    const revNet = loy - chTot - fa;
    const pv = simPV(px, vR, dur, false, 0, amA*dur);
    const succ = succForValue(vR, 0, false);
    sc.push({id:"lmnp-reel",nom:isLMP?"LMP — Réel BIC":"LMNP — Réel BIC",categorie:"Personne physique",icon:"🛋️",couleur:"#d97706",
      description:"Amort. "+simFmt(amA)+"/an · Charges réelles · "+( isLMP?"Cotisations SSI":"Pas de cotisations"),
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:"BIC réel (amortissements)",revenuImposable:bic.imposable,irAnnuel:ir,psAnnuel:bic.ps,
          cotSociales:isLMP?simCotSocLMP(bic.imposable):0,
          fiscAnnuelle:fa + (isLMP?simCotSocLMP(bic.imposable):0),
          fiscTotale:(fa + (isLMP?simCotSocLMP(bic.imposable):0))*dur,
          duree:dur,amortAnnuel:amA,deficitBIC:bic.deficit,
          revenuNet:revNet-(isLMP?simCotSocLMP(bic.imposable):0),
          cashflow:cashflowAn(revNet-(isLMP?simCotSocLMP(bic.imposable):0),mensualiteEst),
          rendement:rendement(revNet-(isLMP?simCotSocLMP(bic.imposable):0))+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total,
          alerte:isLMP?"PV professionnelle (exo possible après 5 ans, art. 151 septies)":"⚠️ LF2025: amort minorent prix acq."},
        succession:{...succ,notes:"Valeur vénale pleine. Amortissements sans incidence sur succession."}},
      totalCout:fN+ft+pv.total,totalCoutSucc:fN+ft+succ.totalDroits,
      avantages:["Amortissement bien + mobilier","Déduction charges réelles","Déficit BIC reportable 10 ans",
        isLMP?"Déficit imputable sur revenu global":"Loyers quasi neutralisés",
        isLMP?"PV pro exo après 5 ans (art. 151 septies)":"PV particuliers avec abattements"],
      inconvenients:["Comptabilité commerciale (bilan, 2031)","Frais comptable ~800-1 500 €/an",
        isLMP?"Cotisations SSI ~40% du bénéfice":"",
        "PV majorée si amort (LF2025)"].filter(Boolean),
      alertes:isLMP?["⚠️ Statut LMP détecté (recettes > 23k + > 50% revenus)","ℹ️ Affiliation SSI obligatoire"]:
        bic.deficit>0?["ℹ️ Déficit BIC de "+simFmt(bic.deficit)+" reportable"]:[],
      sources:isLMP?["CGI art. 155 IV","CGI art. 151 septies"]:["CGI art. 35 bis","CGI art. 39 C"],
      score:simWS("pp-lmnp",bic.imposable===0?85:75,ob)});
  }

  // ═══════════════════════════════════════════════════════════
  // 5. SCI à l'IR (location nue, transparente)
  // ═══════════════════════════════════════════════════════════
  {const cC=2000,cA=1500;
  const bR = Math.min(Math.round(loy*0.7), Math.max(0, loy-ch-txF));
  const ir = Math.round(bR*tmi/100), fa = ir + Math.round(bR*0.172), ft = (fa+cA)*dur;
  const revNet = loy - ch - txF - fa - cA;
  const pv = simPV(px, vR, dur, false);
  const succ = succForValue(vR, 0.10, false);
  sc.push({id:"sci-ir-acq",nom:"SCI à l'IR",categorie:"Société civile",icon:"🏛️",couleur:"#059669",
    description:"Transparente · Parts transmissibles · Décote 10% succession",
    phases:{acquisition:{fraisNotaire:fN,fraisStructure:cC,total:fN+cC},
      detention:{regime:"Foncier (IR transparent)",revenuImposable:bR,irAnnuel:ir,psAnnuel:Math.round(bR*0.172),cotSociales:0,fiscAnnuelle:fa,fiscTotale:fa*dur,duree:dur,coutStructure:cA,revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
      vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
      succession:{...succ,notes:"Décote parts 10% (illiquidité). Démembrement de parts possible (art. 669 CGI)."}},
    totalCout:fN+cC+ft+pv.total,totalCoutSucc:fN+cC+ft+succ.totalDroits,
    avantages:["Parts transmissibles","Démembrement de parts","Clauses statutaires","PV particuliers","Décote 10% succession","Pas de cotisations sociales"],
    inconvenients:["Coût création 2 000 €","Frais annuels ~1 500 €","Location meublée interdite (→ IS)","Pas d'amortissement"],
    alertes:isMeuble?["⚠️ Meublé dans SCI IR = requalification IS automatique"]:[],
    sources:["CGI art. 8","CGI art. 239 bis AA"],score:simWS("sci-ir-acq",isMeuble?30:65,ob)});}

  // ═══════════════════════════════════════════════════════════
  // 6. SCI à l'IS (amortissements, capitalisation)
  // ═══════════════════════════════════════════════════════════
  {const cC=2000,cA=2500,amA=Math.round((px*0.85)/30);
  const rIS = Math.max(0, loy-ch-txF-amA-cA);
  const isA = Math.round(Math.min(rIS,42500)*0.15 + Math.max(0,rIS-42500)*0.25);
  const vnc = Math.max(0, px-amA*dur);
  const isPV = Math.round(Math.max(0, vR-vnc)*0.25);
  const tresoAn = Math.max(0, loy-ch-txF-cA) - isA;
  const tresoCum = Math.round(tresoAn*dur);
  const isLatent = isPV;
  const actifNet = Math.max(0, vR + tresoCum - isLatent);
  const revNetSociete = loy - ch - txF - cA - isA;
  // Si distribution: flat tax 30% sur dividendes
  const divBrut = Math.max(0, revNetSociete);
  const flatTax = Math.round(divBrut * 0.30);
  const revNetAssocies = divBrut - flatTax;
  const succ = succForValue(actifNet, 0.15, false);
  sc.push({id:"sci-is-acq",nom:"SCI à l'IS",categorie:"Société civile",icon:"🏢",couleur:"#7c3aed",
    description:"IS 15%/25% · Amort. "+simFmt(amA)+"/an · Double imposition si distribution",
    phases:{acquisition:{fraisNotaire:fN,fraisStructure:cC,total:fN+cC},
      detention:{regime:"IS (amortissements)",revenuImposable:rIS,isAnnuel:isA,fiscAnnuelle:isA,fiscTotale:isA*dur,duree:dur,coutStructure:cA,amortAnnuel:amA,
        revenuNetSociete:revNetSociete,flatTaxDividendes:flatTax,revenuNetAssocies:revNetAssocies,
        cashflow:cashflowAn(revNetAssocies,mensualiteEst),rendement:rendement(revNetAssocies)+"%",
        notes:"Double imposition: IS + flat tax 30% si distribution."},
      vente:{valeurRevente:vR,vnc,pvPro:Math.max(0,vR-vnc),isPV,pvTotal:isPV,alerte:"PV professionnelle (base amortie → PV élevée)"},
      succession:{...succ,notes:"Actif net réévalué: "+simFmt(actifNet)+". Décote 15%. Tréso accumulée gonfle valeur parts."}},
    totalCout:fN+cC+(isA+cA)*dur+isPV,totalCoutSucc:fN+cC+(isA+cA)*dur+succ.totalDroits,
    avantages:["Amortissement complet","IS réduit (15% < 42 500 €)","Capitalisation sans distribution","Meublé autorisé","Décote 15% succession"],
    inconvenients:["Double imposition (IS + flat tax 30%)","PV sur base amortie (très élevée)","IS irrévocable","Tréso gonfle actif net → succession lourde","Comptabilité complète"],
    alertes:["⚠️ IS irrévocable","⚠️ Tréso accumulée augmente valeur parts"],
    sources:["CGI art. 206","CGI art. 219"],score:simWS("sci-is-acq",55,ob)});}

  // ═══════════════════════════════════════════════════════════
  // 7. SARL de famille (IR) — meublé uniquement
  // ═══════════════════════════════════════════════════════════
  if(isMeuble && nE>0){
    const cC=2500,cA=2000,amA=Math.round((px*0.85)/25),chM=ch+txF;
    const rBIC = Math.max(0, loy-chM-amA);
    const ir = Math.round(rBIC*tmi/100), ps = Math.round(rBIC*0.172), fa = ir+ps;
    const revNet = loy - chM - cA - fa;
    const pv = simPV(px, vR, dur, false);
    const succ = succForValue(vR, 0.10, true); // Dutreil 75% exo + décote 10%
    sc.push({id:"sarl-famille",nom:"SARL de famille (IR)",categorie:"Société commerciale",icon:"👨‍👩‍👧",couleur:"#0891b2",
      description:"Amort. BIC + PV particuliers + Pacte Dutreil (-75% succession)",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:cC,total:fN+cC},
        detention:{regime:"BIC réel (IR transparent)",revenuImposable:rBIC,irAnnuel:ir,psAnnuel:ps,cotSociales:0,fiscAnnuelle:fa,fiscTotale:fa*dur,duree:dur,coutStructure:cA,amortAnnuel:amA,
          revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total,
          alerte:"PV des particuliers (pas de réintégration des amortissements)"},
        succession:{...succ,notes:"Pacte Dutreil: 75% exo (art. 787 B CGI). Assiette: "+simFmt(succ.assiette)+". Décote 10%."}},
      totalCout:fN+cC+(fa+cA)*dur+pv.total,totalCoutSucc:fN+cC+(fa+cA)*dur+succ.totalDroits,
      avantages:["Amortissement LMNP + IR transparent","PV des particuliers (pas pro)","Pacte Dutreil (-75% succession)","Responsabilité limitée","Décote parts 10%"],
      inconvenients:["Associés famille uniquement (3e degré)","Formalisme société","Engagement Dutreil 6 ans min","Frais comptable + gestion ~2 000 €/an"],
      alertes:["ℹ️ Dutreil: engagement collectif 2 ans + individuel 4 ans","ℹ️ Option IR irrévocable"],
      sources:["CGI art. 239 bis AA","CGI art. 787 B"],score:simWS("sarl-famille",78,ob)});
  }

  return sc.sort((a,b)=>b.score-a.score);
}



/* ════════════════════════════════════════
   SIMULATEUR — DARK MODE UI
════════════════════════════════════════ */
function SimScoreBar({score}){
  const col=score>=70?C.green:score>=45?"#F59E0B":C.red;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:6,background:C.g4,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${Math.min(score,100)}%`,height:"100%",background:col,borderRadius:3,transition:"width 0.6s"}}/>
      </div>
      <span style={{fontSize:12,fontWeight:700,color:col,fontFamily:C.mono,minWidth:28}}>{score}</span>
    </div>
  );
}

function SimCard({children,style,onClick,hover}){
  const[h,setH]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:C.card,borderRadius:14,padding:22,border:`1px solid ${C.border}`,transition:"all 0.2s",
        cursor:onClick?"pointer":"default",
        boxShadow:h&&hover?"0 8px 32px rgba(0,0,0,0.4)":"none",
        transform:h&&hover?"translateY(-2px)":"none",...style}}>
      {children}
    </div>
  );
}

function SimInp({label,value,onChange,type="text",suffix,placeholder,min,max}){
  return(
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.g2,marginBottom:6,fontFamily:C.mono,letterSpacing:"0.05em"}}>{label}</label>
      <div style={{position:"relative"}}>
        {type==="date" ? (
          <div style={{padding:"10px 14px",border:`1px solid ${C.border2}`,borderRadius:10,background:"rgba(255,255,255,0.03)"}}>
            <DatePickerInput value={value} onChange={onChange} placeholder={placeholder}/>
          </div>
        ) : (
        <input type={type} value={value} onChange={e=>onChange(type==="number"?(e.target.value===""?"":Number(e.target.value)):e.target.value)}
          placeholder={placeholder} min={min} max={max}
          style={{width:"100%",padding:"10px 14px",paddingRight:suffix?50:14,border:`1px solid ${C.border2}`,borderRadius:10,fontSize:14,
            fontFamily:C.font,outline:"none",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",color:C.w,transition:"all 0.15s"}}
          onFocus={e=>{e.target.style.borderColor=C.blue;e.target.style.boxShadow=`0 0 0 2px ${C.blueGlow}`;}}
          onBlur={e=>{e.target.style.borderColor=C.border2;e.target.style.boxShadow="none";}}/>
        )}
        {suffix&&<span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:C.g2,fontSize:12,fontFamily:C.mono}}>{suffix}</span>}
      </div>
    </div>
  );
}

function SimSel({label,value,onChange,options}){
  return(
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.g2,marginBottom:6,fontFamily:C.mono,letterSpacing:"0.05em"}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"10px 14px",border:`1px solid ${C.border2}`,borderRadius:10,fontSize:14,
          fontFamily:C.font,outline:"none",background:C.card2,color:C.w,cursor:"pointer",boxSizing:"border-box",
          MozAppearance:"none",WebkitAppearance:"none"}}>
        {options.map(o=><option key={o.value} value={o.value} style={{background:C.card,color:C.w}}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SimChk({label,checked,onChange}){
  return(
    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:14,fontSize:13,color:C.g1}}>
      <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checked?C.blue:C.border2}`,background:checked?C.blue:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
        {checked&&<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      {label}
    </label>
  );
}

function SimStepInd({c,onGo}){
  const STEPS=["Objectifs","Profil","Bien","Résultats"];
  return(
    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:32}}>
      {STEPS.map((s,i)=>(
        <div key={s} style={{display:"flex",alignItems:"center",flex:i<3?1:"none"}}>
          <div onClick={()=>onGo&&i<c&&onGo(i)}
            style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background:i<=c?C.blue:C.g4,color:i<=c?"#fff":C.g2,fontFamily:C.mono,fontSize:12,fontWeight:700,
              boxShadow:i===c?`0 0 0 3px ${C.blueGlow}`:"none",cursor:onGo&&i<c?"pointer":"default",transition:"all 0.2s"}}>
            {i<c?"✓":i+1}
          </div>
          <div style={{marginLeft:8,fontSize:12,fontWeight:i===c?700:500,color:i<=c?C.w:C.g2,whiteSpace:"nowrap",
            cursor:onGo&&i<c?"pointer":"default"}} onClick={()=>onGo&&i<c&&onGo(i)}>{s}</div>
          {i<3&&<div style={{flex:1,height:1,background:i<c?C.blue:C.g4,margin:"0 16px",transition:"background 0.3s"}}/>}
        </div>
      ))}
    </div>
  );
}

function SimObjSel({objectives:objs,onChange}){
  const total=objs.reduce((s,o)=>s+o.weight,0);
  const toggle=(id)=>{const e=objs.find(o=>o.id===id);if(e&&e.weight>0)onChange(objs.filter(o=>o.id!==id));else onChange([...objs,{id,weight:Math.max(5,100-total)}]);};
  const setW=(id,w)=>onChange(objs.map(o=>o.id===id?{...o,weight:Math.max(0,Math.min(100,w))}:o));
  const bal=()=>{const a=objs.filter(o=>o.weight>0);if(!a.length)return;const e=Math.floor(100/a.length),r=100-e*a.length;onChange(objs.map((o,i)=>({...o,weight:e+(i===0?r:0)})));};


  return(
    <div>
      <p style={{color:C.g2,fontSize:13,marginBottom:20}}>Sélectionnez et pondérez les priorités (total = 100)</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:24}}>
        {SIM_OBJ.map(obj=>{const on=objs.find(o=>o.id===obj.id&&o.weight>0);return(
          <div key={obj.id} onClick={()=>toggle(obj.id)}
            style={{padding:"14px 16px",borderRadius:12,cursor:"pointer",
              border:on?`1.5px solid ${C.blue}`:`1px solid ${C.border}`,
              background:on?C.blueSub:C.card,transition:"all 0.2s"}}>
            <div style={{color:on?C.blue:C.g2,marginBottom:6}}><obj.Ic/></div>
            <div style={{fontSize:13,fontWeight:600,color:on?C.blue:C.g1}}>{obj.short}</div>
          </div>
        );})}
      </div>
      {objs.filter(o=>o.weight>0).length>0&&<SimCard>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em"}}>PONDÉRATION</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={bal} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",fontSize:11,fontWeight:600,cursor:"pointer",color:C.g1}}>Répartir</button>
            <div style={{padding:"4px 10px",borderRadius:6,fontFamily:C.mono,fontSize:12,fontWeight:700,
              background:total===100?C.greenSub:total>100?C.redSub:C.yellowSub,
              color:total===100?C.green:total>100?C.red:C.yellow,
              border:`1px solid ${total===100?C.greenBord:total>100?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`}}>{total}/100</div>
          </div>
        </div>
        {objs.filter(o=>o.weight>0).map(obj=>{const m=SIM_OBJ.find(x=>x.id===obj.id);return(
          <div key={obj.id} style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:C.blue}}>{m&&<m.Ic/>}</span><span style={{fontSize:13,fontWeight:600,color:C.w}}>{m?.label}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:700,color:C.blue,fontFamily:C.mono}}>{obj.weight}%</span>
                <div onClick={e=>{e.stopPropagation();onChange(objs.filter(o=>o.id!==obj.id));}}
                  style={{width:22,height:22,borderRadius:6,background:C.redSub,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.red,fontSize:12,fontWeight:700}}>×</div>
              </div>
            </div>
            <input type="range" min={5} max={100} step={5} value={obj.weight} onChange={e=>setW(obj.id,Number(e.target.value))}
              style={{width:"100%",height:6,borderRadius:3,outline:"none",cursor:"pointer",WebkitAppearance:"none",
                background:`linear-gradient(to right,${C.blue} 0%,${C.blue} ${obj.weight}%,${C.g4} ${obj.weight}%,${C.g4} 100%)`}}/>
          </div>
        );})}
        {total!==100&&<div style={{marginTop:10,padding:10,borderRadius:8,fontSize:12,
          background:total>100?C.redSub:C.yellowSub,color:total>100?C.red:C.yellow,
          border:`1px solid ${total>100?"rgba(239,68,68,0.2)":"rgba(245,158,11,0.2)"}`}}>
          {total>100?`Total ${total}% — réduisez.`:`Reste ${100-total}% à répartir.`}
        </div>}
      </SimCard>}
    </div>
  );
}

function SimModeToggle({mode,onChange}){
  return(
    <div style={{display:"flex",background:C.card2,borderRadius:10,padding:3,marginBottom:24,maxWidth:360,border:`1px solid ${C.border}`}}>
      {[{id:"existant",label:"Existant"},{id:"acquisition",label:"Acquisition"}].map(m=>(
        <div key={m.id} onClick={()=>onChange(m.id)}
          style={{flex:1,padding:"10px 16px",borderRadius:8,cursor:"pointer",textAlign:"center",
            background:mode===m.id?C.blue:"transparent",transition:"all 0.2s"}}>
          <div style={{fontSize:13,fontWeight:700,color:mode===m.id?"#fff":C.g2}}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

function SimExCard({s,expanded:ex,onToggle,objs,isAcq}){
  const col=s.couleur||C.blue;
  const ao=objs?.filter(o=>o.weight>0)||[];
  const KV=({k,v,b})=>(
    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:12,color:C.g2}}>{k}</span>
      <span style={{fontSize:12,fontWeight:b?700:500,color:b?C.w:C.g1,fontFamily:C.mono}}>{v}</span>
    </div>
  );
  const PB=({t,c,children})=>(
    <div style={{background:`${c}08`,border:`1px solid ${c}20`,borderRadius:10,padding:14,marginBottom:10}}>
      <h5 style={{margin:"0 0 8px",fontSize:10,fontWeight:700,color:c,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:C.mono}}>{t}</h5>
      {children}
    </div>
  );

  return(
    <SimCard style={{marginBottom:14,borderLeft:`3px solid ${col}`}}>
      <div onClick={onToggle} style={{cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}>
            <span style={{background:`${col}18`,color:col,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,textTransform:"uppercase",fontFamily:C.mono}}>{s.categorie}</span>
            <h3 style={{margin:"6px 0 0",fontSize:15,fontWeight:700,color:C.w}}>{s.nom}</h3>
            <p style={{margin:"4px 0 0",fontSize:12,color:C.g2}}>{s.description}</p>
          </div>
          <div style={{textAlign:"right",minWidth:120}}>
            <div style={{fontSize:10,color:C.g3,marginBottom:4,fontFamily:C.mono}}>SCORE</div>
            <SimScoreBar score={s.score}/>
            {(s.totalCout!=null)&&<><div style={{fontSize:10,color:C.g3,marginTop:8,fontFamily:C.mono}}>COÛT TOTAL</div>
            <div style={{fontSize:14,fontWeight:700,fontFamily:C.mono,color:C.w}}>{simFmt(s.totalCout)}</div></>}
          </div>
        </div>
        {ao.length>1&&<div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>{ao.map(o=>{
          const r=SIM_REL[s.id]?.[o.id]||30;const m=SIM_OBJ.find(x=>x.id===o.id);
          return(<div key={o.id} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:6,
            background:r>=70?C.greenSub:r>=40?C.yellowSub:C.redSub,fontSize:10}}>
            <span style={{fontWeight:700,color:r>=70?C.green:r>=40?C.yellow:C.red}}>{m?.short} {r}%</span>
          </div>);
        })}</div>}
        <div style={{fontSize:12,color:col,fontWeight:600,marginTop:10}}>{ex?"▾ Masquer":"▸ Détails"}</div>
      </div>
      {ex&&<div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
        {/* KPI grid for existant scenarios */}
        {s.kpis&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8,marginBottom:14}}>
          {Object.entries(s.kpis).map(([k,v])=><div key={k} style={{background:C.card2,border:`1px solid ${C.border}`,padding:"8px 12px",borderRadius:8}}>
            <div style={{fontSize:10,color:C.g3,fontFamily:C.mono}}>{k}</div>
            <div style={{fontSize:13,fontWeight:700,fontFamily:C.mono,color:C.w}}>{v}</div>
          </div>)}
        </div>}
        {/* Phases for acquisition scenarios */}
        {s.phases&&<>
          <PB t={"① Acquisition"} c={C.blue}><KV k="Frais notaire" v={simFmt(s.phases.acquisition.fraisNotaire)}/>{s.phases.acquisition.fraisStructure>0&&<KV k="Constitution" v={simFmt(s.phases.acquisition.fraisStructure)}/>}<KV k="Total" v={simFmt(s.phases.acquisition.total)} b/></PB>
          <PB t={`② Détention (${s.phases.detention.duree} ans)`} c={C.green}><KV k="Régime" v={s.phases.detention.regime}/><KV k="Imposable/an" v={simFmt(s.phases.detention.revenuImposable)}/>{s.phases.detention.amortAnnuel&&<KV k="Amort./an" v={simFmt(s.phases.detention.amortAnnuel)}/>}<KV k="Fiscal/an" v={simFmt(s.phases.detention.fiscAnnuelle)} b/><KV k="Revenu net/an" v={simFmt(s.phases.detention.revenuNet)} b/></PB>
          <PB t="③ Vente" c={C.yellow}><KV k="Valeur" v={simFmt(s.phases.vente.valeurRevente)}/>{s.phases.vente.pvBrute!=null&&<KV k="PV brute" v={simFmt(s.phases.vente.pvBrute)}/>}<KV k="Total fiscal" v={simFmt(s.phases.vente.pvTotal)} b/>{s.phases.vente.cashNet!=null&&<KV k="Cash net" v={simFmt(s.phases.vente.cashNet)} b/>}</PB>
          <PB t="④ Succession" c="#8B5CF6"><KV k="Valeur transmise" v={simFmt(s.phases.succession.valeur)}/>{s.phases.succession.decote&&<KV k="Décote" v={s.phases.succession.decote}/>}{s.phases.succession.dutreil&&<KV k="Dutreil" v="−75%"/>}<KV k="Total droits" v={simFmt(s.phases.succession.totalDroits)} b/></PB>
          <div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}><KV k="Acq+Détention+Vente" v={simFmt(s.totalCout)} b/><KV k="Acq+Détention+Succession" v={simFmt(s.totalCoutSucc)} b/></div>
        </>}
        {/* Avantages / Inconvénients */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12,marginBottom:12}}>
          <div>{(s.avantages||[]).map((a,i)=><div key={i} style={{fontSize:11,padding:"4px 0",color:C.green,borderBottom:`1px solid ${C.border}`}}>✓ {a}</div>)}</div>
          <div>{(s.inconvenients||[]).map((a,i)=><div key={i} style={{fontSize:11,padding:"4px 0",color:C.red,borderBottom:`1px solid ${C.border}`}}>✗ {a}</div>)}</div>
        </div>
        {(s.alertes||[]).length>0&&<div style={{marginBottom:10}}>{s.alertes.map((a,i)=><div key={i} style={{background:C.yellowSub,border:"1px solid rgba(245,158,11,0.2)",borderRadius:6,padding:"6px 10px",marginBottom:4,fontSize:11,color:C.yellow}}>{a}</div>)}</div>}
        {(s.sources||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{s.sources.map((src,i)=><span key={i} style={{background:C.card2,border:`1px solid ${C.border}`,padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:C.mono,color:C.g2}}>{src}</span>)}</div>}
      </div>}
    </SimCard>
  );
}

function SimCompTable({scenarios:sc}){
  const rows=sc.map(s=>{
    let fiscDet=null,coutVente=null,coutSucc=null,succDetail=null;
    if(s.phases){fiscDet=(s.phases.detention?.fiscTotale||0)+(s.phases.detention?.coutStructureTotal||0);coutVente=(s.phases.vente?.pvTotal||0);coutSucc=(s.phases.succession?.totalDroits||0);succDetail=s.phases.succession||null;}
    else if(s._comp){fiscDet=s._comp.fiscDetention;coutVente=s._comp.coutVente;coutSucc=s._comp.coutSuccession;succDetail=s._comp.succDetail||null;}
    return{nom:s.nom,categorie:s.categorie,couleur:s.couleur||C.blue,score:s.score,fiscDet,coutVente,coutSucc,succDetail};
  });
  const vals=(key)=>rows.map(r=>r[key]).filter(v=>v!=null&&v>0);
  const minDet=vals("fiscDet").length?Math.min(...vals("fiscDet")):null;
  const minVente=vals("coutVente").length?Math.min(...vals("coutVente")):null;
  const minSucc=vals("coutSucc").length?Math.min(...vals("coutSucc")):null;
  const th={padding:"12px 16px",fontSize:10,fontWeight:700,color:C.g2,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"center",borderBottom:`1px solid ${C.border}`,background:C.card2,fontFamily:C.mono};
  const td={padding:"12px 16px",borderBottom:`1px solid ${C.border}`,textAlign:"center"};
  return(
    <div style={{marginBottom:24}}>
      <p style={{fontSize:10,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:12}}>TABLEAU COMPARATIF</p>
      <div style={{overflowX:"auto",borderRadius:12,border:`1px solid ${C.border}`,background:C.card}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
          <thead><tr>
            <th style={{...th,textAlign:"left",minWidth:180}}>Véhicule</th>
            <th style={th}>Coût fiscal</th>
            <th style={th}>Coût cession</th>
            <th style={th}>Coût succession</th>
          </tr></thead>
          <tbody>{rows.map((r,i)=>{
            const best=(key,min)=>r[key]!=null&&r[key]>0&&r[key]===min;
            return(
              <tr key={i} style={{transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{...td,textAlign:"left"}}><div style={{fontSize:13,fontWeight:700,color:C.w}}>{r.nom}</div><div style={{display:"flex",gap:6,marginTop:4}}><span style={{fontSize:9,color:r.couleur,fontFamily:C.mono}}>{r.categorie}</span><span style={{fontSize:10,fontWeight:700,color:r.score>=70?C.green:r.score>=45?C.yellow:C.red,fontFamily:C.mono}}>{r.score}</span></div></td>
                <td style={{...td,background:best("fiscDet",minDet)?C.greenSub:"transparent"}}>{r.fiscDet!=null?<span style={{fontSize:13,fontWeight:700,color:best("fiscDet",minDet)?C.green:C.w,fontFamily:C.mono}}>{simFmt(r.fiscDet)}</span>:<span style={{color:C.g3}}>—</span>}</td>
                <td style={{...td,background:best("coutVente",minVente)?C.greenSub:"transparent"}}>{r.coutVente!=null?<span style={{fontSize:13,fontWeight:700,color:best("coutVente",minVente)?C.green:C.w,fontFamily:C.mono}}>{simFmt(r.coutVente)}</span>:<span style={{color:C.g3}}>—</span>}</td>
                <td style={{...td,background:best("coutSucc",minSucc)?"rgba(139,92,246,0.08)":"transparent"}}>{r.coutSucc!=null?<div><span style={{fontSize:13,fontWeight:700,color:best("coutSucc",minSucc)?"#8B5CF6":C.w,fontFamily:C.mono}}>{simFmt(r.coutSucc)}</span>{r.succDetail?.decote&&<div style={{fontSize:9,color:"#8B5CF6",marginTop:2}}>Décote {r.succDetail.decote}</div>}</div>:<span style={{color:C.g3}}>—</span>}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function SimChatbot({profile:pr,property:pp,scenarios:sc,isAcq}){
  const[open,setOpen]=useState(false);const[msgs,setMsgs]=useState([]);const[inp,setInp]=useState("");const[ld,setLd]=useState(false);
  const eR=useRef(null),iR=useRef(null);
  const objStr=pr.objectives?.filter(o=>o.weight>0).map(o=>`${SIM_OBJ.find(x=>x.id===o.id)?.label} (${o.weight}%)`).join(", ")||"";
  const sys=useMemo(()=>`Tu es l'assistant IA Equity, expert patrimoine immobilier France. Pédagogique, cite CGI/BOFiP.\nOBJECTIFS: ${objStr}\nPROFIL: ${pr.age} ans, ${pr.couple?"couple":"seul"}, ${pr.enfants} enf., TMI ${pr.tmi}%\nBIEN: ${pp.mode}, ${simFmt(pp.prixAcquisition)}${isAcq?", loyer "+simFmt(pp.acqLoyer):", valeur "+simFmt(pp.valeurActuelle)}\nSCÉNARIOS:\n${sc.map((s,i)=>`#${i+1} ${s.nom} (${s.score})`).join("\n")}`,[pr,pp,sc,isAcq]);
  useEffect(()=>{eR.current?.scrollIntoView({behavior:"smooth"});},[msgs,ld]);
  useEffect(()=>{if(open&&iR.current)iR.current.focus();},[open]);
  useEffect(()=>{
    const os=pr.objectives?.filter(o=>o.weight>0).map(o=>`**${SIM_OBJ.find(x=>x.id===o.id)?.short}** ${o.weight}%`).join(" · ")||"";
    setMsgs([{role:"assistant",content:`**${sc.length} scénarios** classés selon vos priorités : ${os}.\n\nLe score combine pertinence technique (35%) et adéquation objectifs (65%). Posez votre question !`}]);
  },[]);
  const sugg=["Pourquoi ce classement ?","Détaille le meilleur","Compare les 2 premiers","Impact d'un changement ?"];
  const send=async(t)=>{if(!t.trim()||ld)return;const nm=[...msgs,{role:"user",content:t.trim()}];setMsgs(nm);setInp("");setLd(true);
    try{const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5-20250514",max_tokens:2048,system:sys,messages:nm.map(m=>({role:m.role,content:m.content}))})});const d=await r.json();setMsgs(p=>[...p,{role:"assistant",content:d.content?.map(c=>c.text||"").join("")||"Erreur."}]);}catch(e){setMsgs(p=>[...p,{role:"assistant",content:`Erreur: ${e.message}`}]);}finally{setLd(false);}};
  const md=(t)=>t.split(/(\*\*[^*]+\*\*)/g).map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i} style={{color:C.blue}}>{p.slice(2,-2)}</strong>:p.split("\n").map((l,j)=><span key={`${i}-${j}`}>{j>0&&<br/>}{l}</span>));

  if(!open)return(
    <div onClick={()=>setOpen(true)} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},#2563EB)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 6px 24px ${C.blueGlow}`,zIndex:1000,transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </div>
  );

  return(
    <div style={{position:"fixed",bottom:24,right:24,width:400,height:560,maxHeight:"calc(100vh - 48px)",borderRadius:18,overflow:"hidden",zIndex:1000,background:C.card,border:`1px solid ${C.border}`,boxShadow:"0 12px 48px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",animation:"fadeUp 0.25s ease"}}>
      <div style={{background:`linear-gradient(135deg,${C.blue},#2563EB)`,padding:"14px 18px",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800}}>E</div>
          <div><div style={{fontSize:14,fontWeight:700}}>Equity IA</div><div style={{fontSize:10,opacity:0.7}}>Assistant patrimonial</div></div>
        </div>
        <div onClick={()=>setOpen(false)} style={{width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"rgba(255,255,255,0.12)"}}><I.X/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px"}}>
        {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
          <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
            background:m.role==="user"?C.blue:C.card2,border:m.role==="user"?"none":`1px solid ${C.border}`,
            color:"#fff",fontSize:12.5,lineHeight:1.6}}>{md(m.content)}</div>
        </div>))}
        {ld&&<div style={{display:"flex",gap:6,marginBottom:10}}><div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:"14px 14px 14px 4px",padding:"12px 18px",display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.g2,animation:`pulse 1.4s ${i*0.16}s infinite ease-in-out both`}}/>)}</div></div>}
        <div ref={eR}/>
      </div>
      {msgs.length<=2&&!ld&&<div style={{padding:"4px 14px 6px",display:"flex",flexWrap:"wrap",gap:5,flexShrink:0}}>{sugg.map((q,i)=><div key={i} onClick={()=>send(q)} style={{padding:"5px 11px",borderRadius:16,border:`1px solid ${C.border}`,background:C.card2,fontSize:11,color:C.g1,cursor:"pointer",fontWeight:500,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g1;}}>{q}</div>)}</div>}
      <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",gap:8}}>
          <input ref={iR} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(inp);}}} placeholder="Posez votre question…"
            style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.border2}`,fontSize:13,fontFamily:C.font,outline:"none",background:C.card2,color:C.w}}
            onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border2}/>
          <button onClick={()=>send(inp)} disabled={!inp.trim()||ld}
            style={{width:38,height:38,borderRadius:10,border:"none",background:inp.trim()&&!ld?C.blue:C.g4,color:"#fff",cursor:inp.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div style={{fontSize:9,color:C.g3,marginTop:5,textAlign:"center",fontFamily:C.mono}}>Alimenté par Claude · Pas un conseil juridique</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SIMULATEUR PAGE
════════════════════════════════════════ */
function SimulateurPage(){
  const[step,setStep]=useState(-1);const[ex,setEx]=useState(null);const[selEx,setSelEx]=useState(null);const[ck,setCk]=useState(0);const[viewMode,setViewMode]=useState("both");const[hasRes,setHasRes]=useState(false);
  const[pr,setPr]=useState({objectives:[],age:"",couple:false,regimeMatrimonial:"communaute-reduite",enfants:0,donationsAnterieures:0,tmi:30,divorce:false});
  const[pp,setPp]=useState({mode:"existant",type:"locatif",isRP:false,prixAcquisition:"",valeurActuelle:"",dateAcquisition:"",anneesDetention:0,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:"",chargesLocatives:"",meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:"",acqDureeDetention:15,acqTauxRevalo:2,acqLoyer:"",acqCharges:"",acqMeuble:false,acqTaxeFonciere:""});
  const up=(k,v)=>setPr(p=>({...p,[k]:v}));const upr=(k,v)=>setPp(p=>({...p,[k]:v}));
  useEffect(()=>{if(pp.dateAcquisition){const y=parseInt(pp.dateAcquisition.split("-")[0]);if(y)upr("anneesDetention",new Date().getFullYear()-y);}},[pp.dateAcquisition]);
  const isA=pp.mode==="acquisition";
  const loadEx=(e)=>{setSelEx(e.id);setPr(e.profile);setPp(e.property);setCk(k=>k+1);setTimeout(()=>{setStep(3);setEx(null);},200);};
  const fresh=()=>{setPr({objectives:[],age:"",couple:false,regimeMatrimonial:"communaute-reduite",enfants:0,donationsAnterieures:0,tmi:30,divorce:false});setPp({mode:"existant",type:"locatif",isRP:false,prixAcquisition:"",valeurActuelle:"",dateAcquisition:"",anneesDetention:0,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:"",chargesLocatives:"",meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:"",acqDureeDetention:15,acqTauxRevalo:2,acqLoyer:"",acqCharges:"",acqMeuble:false,acqTaxeFonciere:""});setSelEx(null);setCk(k=>k+1);setHasRes(false);setStep(0);};
  const sc=useMemo(()=>{if(step<3||!pr.objectives?.length)return[];return isA?simGenAcq(pr,pp):simGenEx(pr,pp);},[step,pr,pp,isA]);
  useEffect(()=>{if(step===3&&sc.length>0)setHasRes(true);},[step,sc]);
  const tw=pr.objectives.reduce((s,o)=>s+o.weight,0);
  const canGo=()=>{if(step===0)return pr.objectives.filter(o=>o.weight>0).length>0&&tw===100;if(step===1)return!!pr.age;if(step===2)return isA?(pp.prixAcquisition&&pp.acqLoyer):(pp.prixAcquisition&&pp.valeurActuelle);return true;};

  const NavBtn=({onClick,children,primary,disabled,danger})=>(
    <button onClick={disabled?undefined:onClick} disabled={disabled}
      style={{padding:"10px 24px",borderRadius:10,border:primary?"none":`1px solid ${C.border2}`,
        background:disabled?C.g4:danger?C.redSub:primary?`linear-gradient(135deg,${C.blue},#2563EB)`:C.card,
        fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",color:disabled?C.g3:danger?C.red:"#fff",
        boxShadow:primary&&!disabled?`0 4px 16px ${C.blueGlow}`:"none",transition:"all 0.15s"}}>
      {children}
    </button>
  );

  return(
    <main style={{flex:1,overflowY:"auto",background:C.bg,padding:"28px 36px 80px",position:"relative"}}>
      <style>{`
        .sim-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#3B82F6;cursor:pointer;border:2px solid #09090B;box-shadow:0 0 0 2px #3B82F6}
        .sim-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#3B82F6;cursor:pointer;border:2px solid #09090B}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.5}
      `}</style>
      <div style={{maxWidth:920,margin:"0 auto"}}>

        {/* ── HOME SCREEN ── */}
        {step===-1&&(<div>
          <div style={{marginBottom:36}}>
            <p style={{fontSize:10,fontFamily:C.mono,color:C.blue,letterSpacing:"0.12em",marginBottom:8}}>SIMULATEURS</p>
            <h2 style={{fontSize:26,fontWeight:800,color:C.w,letterSpacing:"-0.03em",marginBottom:8}}>Arbitrage patrimonial</h2>
            <p style={{color:C.g2,fontSize:13}}>Objectifs pondérés, calculs déterministes, assistant IA intégré.</p>
          </div>
          <button onClick={fresh} style={{padding:"12px 28px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.blue},#2563EB)`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${C.blueGlow}`,marginBottom:32,display:"flex",alignItems:"center",gap:8}}>
            <I.Sparkles/> Nouvelle simulation
          </button>
          <p style={{fontSize:10,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:16}}>CAS PRATIQUES</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {SIM_EX.map(e=>(
              <SimCard key={e.id} hover onClick={()=>loadEx(e)} style={{borderTop:`3px solid ${e.couleur}`,padding:0,overflow:"hidden"}}>
                <div style={{padding:"18px 20px 14px"}}>
                  <h3 style={{margin:"0 0 6px",fontSize:14,fontWeight:700,color:C.w,lineHeight:1.3}}>{e.titre}</h3>
                  <p style={{margin:"0 0 10px",fontSize:11.5,color:C.g2,lineHeight:1.5}}>{e.description}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{e.tags.map(t=><span key={t} style={{background:`${e.couleur}15`,color:e.couleur,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:12,fontFamily:C.mono}}>{t}</span>)}</div>
                </div>
                <div style={{background:C.card2,padding:"8px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end"}}>
                  <span style={{fontSize:11,fontWeight:700,color:e.couleur}}>Simuler →</span>
                </div>
              </SimCard>
            ))}
          </div>
        </div>)}

        {/* ── WIZARD STEPS ── */}
        {step>=0&&step<=2&&<SimStepInd c={step}/>}

        {step===0&&<div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:4}}>Objectifs</h2>
          <SimObjSel objectives={pr.objectives} onChange={v=>up("objectives",v)}/>
        </div>}

        {step===1&&(<div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:20}}>Profil du client</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>PERSONNEL</p>
              <SimInp label="Âge" value={pr.age} onChange={v=>up("age",v)} type="number" suffix="ans" placeholder="55"/>
              <SimChk label="En couple" checked={pr.couple} onChange={()=>up("couple",!pr.couple)}/>
              {pr.couple&&<SimSel label="Régime" value={pr.regimeMatrimonial} onChange={v=>up("regimeMatrimonial",v)} options={[{value:"communaute-reduite",label:"Communauté réduite"},{value:"separation",label:"Séparation de biens"},{value:"pacs",label:"PACS"}]}/>}
              <SimChk label="Divorce / rupture" checked={pr.divorce} onChange={()=>up("divorce",!pr.divorce)}/>
              <SimInp label="Enfants" value={pr.enfants} onChange={v=>up("enfants",v)} type="number" min={0}/>
            </SimCard>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>FISCAL</p>
              <SimSel label="TMI" value={pr.tmi} onChange={v=>up("tmi",Number(v))} options={[{value:0,label:"0%"},{value:11,label:"11%"},{value:30,label:"30%"},{value:41,label:"41%"},{value:45,label:"45%"}]}/>
              <SimInp label="Donations ant. (<15 ans) / enf." value={pr.donationsAnterieures} onChange={v=>up("donationsAnterieures",v)} type="number" suffix="€" placeholder="0"/>
            </SimCard>
          </div>
        </div>)}

        {step===2&&(<div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:14}}>Le bien immobilier</h2>
          <SimModeToggle mode={pp.mode} onChange={v=>upr("mode",v)}/>
          {!isA&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>IDENTIFICATION</p>
              <SimSel label="Type" value={pp.type} onChange={v=>{upr("type",v);upr("isRP",v==="rp");}} options={[{value:"rp",label:"Résidence principale"},{value:"rs",label:"Résidence secondaire"},{value:"locatif",label:"Locatif"}]}/>
              <SimChk label="Résidence principale" checked={pp.isRP} onChange={()=>upr("isRP",!pp.isRP)}/>
              <SimInp label="Prix acquisition" value={pp.prixAcquisition} onChange={v=>upr("prixAcquisition",v)} type="number" suffix="€"/>
              <SimInp label="Valeur actuelle" value={pp.valeurActuelle} onChange={v=>upr("valeurActuelle",v)} type="number" suffix="€"/>
              <SimInp label="Date acquisition" value={pp.dateAcquisition} onChange={v=>upr("dateAcquisition",v)} type="date"/>
              <div style={{background:C.card2,border:`1px solid ${C.border}`,padding:"10px 14px",borderRadius:8,fontSize:13,color:C.g1}}>Détention: <strong style={{color:C.w,fontFamily:C.mono}}>{pp.anneesDetention} an(s)</strong></div>
            </SimCard>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>FISCAL</p>
              <SimInp label="Travaux" value={pp.travaux} onChange={v=>upr("travaux",v)} type="number" suffix="€"/>
              <SimInp label="Dettes" value={pp.dettes} onChange={v=>upr("dettes",v)} type="number" suffix="€"/>
              <SimChk label="Loué meublé" checked={pp.meuble} onChange={()=>upr("meuble",!pp.meuble)}/>
              {pp.meuble&&<SimInp label="Amort. LMNP" value={pp.amortissementsLMNP} onChange={v=>upr("amortissementsLMNP",v)} type="number" suffix="€"/>}
              {!pp.meuble&&<>
                <SimSel label="Régime fiscal" value={pp.regimeFiscal} onChange={v=>upr("regimeFiscal",v)} options={[{value:"micro-foncier",label:"Micro-foncier (30%)"},{value:"reel",label:"Réel (déductions)"}]}/>
                <SimInp label="Loyer annuel" value={pp.loyerAnnuel} onChange={v=>upr("loyerAnnuel",v)} type="number" suffix="€"/>
                <SimInp label="Charges annuelles" value={pp.chargesLocatives} onChange={v=>upr("chargesLocatives",v)} type="number" suffix="€"/>
              </>}
              {simHO(pr.objectives,["reduire-ifi"])&&<SimInp label="Patrimoine immo total" value={pp.patrimoineImmoTotal} onChange={v=>upr("patrimoineImmoTotal",v)} type="number" suffix="€"/>}
            </SimCard>
          </div>}
          {isA&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>ACQUISITION</p>
              <SimInp label="Prix" value={pp.prixAcquisition} onChange={v=>{upr("prixAcquisition",v);upr("valeurActuelle",v);}} type="number" suffix="€" placeholder="280 000"/>
              <SimInp label="Emprunt" value={pp.dettes} onChange={v=>upr("dettes",v)} type="number" suffix="€"/>
              <SimChk label="Meublé envisagé" checked={pp.acqMeuble} onChange={()=>upr("acqMeuble",!pp.acqMeuble)}/>
            </SimCard>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>PROJECTION</p>
              <SimInp label="Loyer annuel" value={pp.acqLoyer} onChange={v=>{upr("acqLoyer",v);upr("loyerAnnuel",v);}} type="number" suffix="€" placeholder="14 400"/>
              <SimInp label="Charges" value={pp.acqCharges} onChange={v=>{upr("acqCharges",v);upr("chargesLocatives",v);}} type="number" suffix="€"/>
              <SimInp label="Taxe foncière" value={pp.acqTaxeFonciere} onChange={v=>upr("acqTaxeFonciere",v)} type="number" suffix="€"/>
              <SimInp label="Durée" value={pp.acqDureeDetention} onChange={v=>upr("acqDureeDetention",v)} type="number" suffix="ans"/>
              <SimInp label="Revalo./an" value={pp.acqTauxRevalo} onChange={v=>upr("acqTauxRevalo",v)} type="number" suffix="%"/>
            </SimCard>
          </div>}
        </div>)}

        {/* ── RESULTS ── */}
        {step===3&&(<div>
          <SimStepInd c={3} onGo={(s)=>{setStep(s);setEx(null);setCk(k=>k+1);}}/>
          {/* Edit toolbar */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div style={{fontSize:13,fontWeight:600,color:C.w}}>{selEx?SIM_EX.find(e=>e.id===selEx)?.titre:"Simulation personnalisée"}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{s:0,label:"Objectifs"},{s:1,label:"Profil"},{s:2,label:"Bien"}].map(b=>(
                <button key={b.s} onClick={()=>{setStep(b.s);setEx(null);setCk(k=>k+1);}}
                  style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.g1,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1;}}>{b.label}</button>
              ))}
              <button onClick={fresh} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.g2,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g2;}}>Nouveau</button>
            </div>
          </div>

          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:6}}>{isA?"Comparatif structures":"Scénarios comparés"}</h2>
          {/* Objective pills */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>{pr.objectives?.filter(o=>o.weight>0).map(o=>{const m=SIM_OBJ.find(x=>x.id===o.id);return(
            <div key={o.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:16,background:C.blueSub,border:`1px solid ${C.blueMid}`}}>
              <span style={{color:C.blue,display:"flex"}}>{m&&<m.Ic/>}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.w}}>{m?.short}</span>
              <span style={{fontSize:11,fontWeight:700,color:C.blue,fontFamily:C.mono}}>{o.weight}%</span>
            </div>
          );})}</div>
          {/* Summary card */}
          <SimCard style={{marginBottom:20,background:`linear-gradient(135deg,rgba(59,130,246,0.06),rgba(59,130,246,0.02))`,border:`1px solid ${C.blueMid}`}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:14}}>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>CLIENT</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{pr.age} ans{pr.couple?" · Couple":""}</div></div>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>{isA?"PRIX":"BIEN"}</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{simFmt(pp.prixAcquisition)}</div></div>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>{isA?"LOYER":"DÉTENTION"}</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{isA?simFmt(pp.acqLoyer)+"/an":pp.anneesDetention+" ans"}</div></div>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>TMI</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{pr.tmi}%</div></div>
            </div>
          </SimCard>
          {/* View mode toggle */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <p style={{color:C.g2,margin:0,fontSize:12}}>{sc.length} scénario(s) · Score = 35% technique + 65% objectifs</p>
            <div style={{display:"flex",background:C.card2,borderRadius:8,padding:2,border:`1px solid ${C.border}`}}>
              {[{id:"cards",label:"Fiches"},{id:"table",label:"Tableau"},{id:"both",label:"Les deux"}].map(m=>(
                <div key={m.id} onClick={()=>setViewMode(m.id)}
                  style={{padding:"5px 14px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:viewMode===m.id?700:500,
                    background:viewMode===m.id?C.blue:"transparent",color:viewMode===m.id?"#fff":C.g2,transition:"all 0.2s"}}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          {(viewMode==="table"||viewMode==="both")&&<SimCompTable scenarios={sc}/>}
          {(viewMode==="cards"||viewMode==="both")&&<>{sc.map(s=><SimExCard key={s.id} s={s} expanded={ex===s.id} onToggle={()=>setEx(ex===s.id?null:s.id)} objs={pr.objectives} isAcq={isA}/>)}</>}
          <div style={{marginTop:28,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,fontSize:11,color:C.g2,lineHeight:1.7}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{color:C.g3,flexShrink:0,marginTop:1}}><I.Shield/></span>
              <div>
                <strong style={{color:C.g1}}>Avertissement</strong> — Estimations basées sur CGI/BOFiP en vigueur (04/03/2026). Le score pondéré combine 35% de pertinence technique et 65% d'adéquation à vos objectifs. Ces résultats ne constituent pas un conseil juridique ou fiscal. Validation notariale recommandée.
              </div>
            </div>
          </div>
        </div>)}

        {/* ── NAV BUTTONS ── */}
        {step>=0&&step<=2&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:28,gap:12}}>
          {step>0?<NavBtn onClick={()=>setStep(s=>s-1)}>← Précédent</NavBtn>:<div/>}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {hasRes&&<NavBtn onClick={()=>{setCk(k=>k+1);setEx(null);setStep(3);}}>↻ Résultats</NavBtn>}
            <NavBtn primary onClick={()=>canGo()&&setStep(s=>s+1)} disabled={!canGo()}>{step===0&&tw!==100?`Total: ${tw}/100`:"Suivant →"}</NavBtn>
          </div>
        </div>}
      </div>
      {step===3&&sc.length>0&&<SimChatbot key={ck} profile={pr} property={pp} scenarios={sc} isAcq={isA}/>}
    </main>
  );
}

export { SimulateurPage };
