import { useState } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";
import { simFmt, simGenAcq } from "./SimulateurPage.jsx";

/* ════════════════════════════════════════
   KYC — MES INFORMATIONS (fil d'Ariane)
════════════════════════════════════════ */
const KYC_PILLARS = [
  {
    id:"civil", emoji:"👤", label:"Profil Civil", short:"Civil",
    color:"#6366F1",
    questions:[
      { key:"etatCivil",    label:"État civil", type:"select",
        options:["Célibataire","Marié — Communauté","Marié — Séparation de biens","PACS","Concubinage"],
        info:"Détermine le régime matrimonial applicable et les règles de propriété du bien." },
      { key:"enfants",      label:"Avez-vous des enfants ?", type:"select",
        options:["Non","1 enfant","2 enfants","3 enfants","4 enfants et plus"],
        info:"Impact sur le quotient familial et les stratégies de transmission." },
      { key:"ageEnfants",   label:"Âge moyen des enfants", type:"number", unit:"ans", placeholder:"ex : 8", optional:true,
        info:"Permet de calibrer les abattements en cas de démembrement de propriété." },
      { key:"residenceFiscale", label:"Résidence fiscale", type:"select",
        options:["France (métropole)","France (DOM-TOM)","Suisse","Expatrié UE","Expatrié hors UE"],
        info:"Conditionne l'éligibilité au LMNP et les conventions fiscales applicables." },
      { key:"age",          label:"Votre âge", type:"number", unit:"ans", placeholder:"ex : 38",
        info:"Crucial pour le calcul des abattements en cas de donation ou démembrement de propriété (barème fiscal de l'usufruit)." },
      { key:"investisseurs", label:"Investissement", type:"select",
        options:["Seul","En couple (conjoint)","En famille","Entre amis (hors famille)","En association professionnelle"],
        info:"Détermine le véhicule optimal : détention en nom propre, SCI, SARL de famille..." },
    ],
  },
  {
    id:"financier", emoji:"💰", label:"Profil Financier", short:"Financier",
    color:"#10B981",
    questions:[
      { key:"tmi", label:"Tranche Marginale d'Imposition (TMI)", type:"select",
        options:["0 % — Non imposable","11 % — Tranche basse","30 % — Tranche médiane","41 % — Haute tranche","45 % — Tranche maximale"],
        info:"Plus votre TMI est élevé, plus le LMNP Réel est avantageux face à une location nue." },
      { key:"revenusAnnuels", label:"Revenus d'activité annuels (N-1)", type:"number", unit:"€", placeholder:"ex : 85000",
        info:"Indispensable pour le test de basculement LMNP → LMP (Loueur Meublé Professionnel) à 23 000 €/an de recettes." },
      { key:"revenusFonciers", label:"Revenus fonciers existants", type:"number", unit:"€/an", placeholder:"0 si aucun", optional:true,
        info:"Location nue en cours. Peut créer un déficit foncier reportable et influer sur la structure recommandée." },
      { key:"ifi", label:"Êtes-vous assujetti à l'IFI ?", type:"select",
        options:["Non — Patrimoine net < 1,3 M€","Oui — Patrimoine net entre 1,3 et 2 M€","Oui — Patrimoine net > 2 M€"],
        info:"L'IFI (>1,3 M€ de patrimoine immobilier net) peut orienter vers une SCI à l'IS pour sortir les actifs de l'assiette." },
      { key:"deficitFoncier", label:"Déficits fonciers reportables ?", type:"select",
        options:["Non","Oui — moins de 5 000 €","Oui — entre 5 000 et 20 000 €","Oui — plus de 20 000 €"],
        info:"Des déficits fonciers reportables peuvent rendre la location nue temporairement plus intéressante." },
    ],
  },
  {
    id:"projet", emoji:"🏘️", label:"Projet Immobilier", short:"Projet",
    color:"#F59E0B",
    questions:[
      { key:"typeBien", label:"Type de bien", type:"select",
        options:["Appartement","Maison","Immeuble de rapport","Local commercial converti","Résidence étudiante","Résidence senior"],
        info:"Le type de bien conditionne les règles d'amortissement et la gestion locative applicable." },
      { key:"modeExploitation", label:"Mode d'exploitation visé", type:"select",
        options:["LMNP — Meublé longue durée","Colocation meublée","Saisonnier / Airbnb","Location nue (revenus fonciers)","Mixte (longue durée + saisonnier)"],
        info:"La location meublée (LMNP) ouvre l'amortissement. La location nue relève des revenus fonciers — régime différent." },
      { key:"travauxType", label:"Nature des travaux prévus", type:"select", optional:true,
        options:["Aucuns travaux","Entretien / rafraîchissement","Amélioration (cuisine, salle de bain)","Rénovation lourde","Reconstruction / division"],
        info:"Les travaux d'entretien sont déductibles immédiatement. Les travaux d'amélioration sont amortis sur leur durée de vie." },
      { key:"partTerrain", label:"Part estimée du terrain", type:"select",
        options:["Standard — 15 %","Urbain dense — 20 %","Zone tendue — 25 %","Rural — 10 %","Je ne sais pas (15% appliqué)"],
        info:"Le terrain n'est pas amortissable. Plus sa quote-part est faible, plus la base amortissable est élevée." },
    ],
  },
  {
    id:"strategie", emoji:"🎯", label:"Stratégie", short:"Stratégie",
    color:"#007BFF",
    questions:[
      { key:"objectifPrioritaire", label:"Objectif prioritaire", type:"select",
        options:["Générer des revenus immédiats (cash-flow)","Préparer la retraite (patrimoine)","Réduire mes impôts actuels","Transmettre un capital à mes enfants","Équilibre revenus + patrimoine"],
        info:"L'objectif détermine le véhicule : LMNP pour la réduction fiscale, SCI IS pour la capitalisation, démembrement pour la transmission." },
      { key:"horizonDetention", label:"Durée de détention prévue", type:"select",
        options:["Court terme — moins de 5 ans","Moyen terme — 10 à 15 ans","Long terme — 20 ans et plus","Indéfini / À vie"],
        info:"Déterminant pour la SCI à l'IS : piège fiscal à la revente si détention courte (pas d'abattement sur plus-value)." },
      { key:"revente", label:"Intention de revente ?", type:"select",
        options:["Oui — revente probable à terme","Non — bien patrimonial à conserver","Transmission aux héritiers sans revente","Indécis"],
        info:"La SCI à l'IS est un piège si revente envisagée : la plus-value est taxée à l'IS puis à l'IR lors de la distribution." },
      { key:"liquidite", label:"Besoin de liquidité sur les loyers", type:"select",
        options:["Élevé — j'ai besoin des loyers pour vivre","Modéré — je veux un complément de revenu","Faible — je préfère capitaliser et réinvestir","Nul — optimisation fiscale pure"],
        info:"Un besoin de liquidité élevé exclut les structures opaques (SCI IS) où distribuer les bénéfices génère une double imposition." },
    ],
  },
  {
    id:"transmission", emoji:"👨‍👩‍👧‍👦", label:"Transmission", short:"Succession",
    color:"#8B5CF6",
    questions:[
      { key:"enfantsMontage", label:"Intégrer vos enfants dans le montage ?", type:"select",
        options:["Non","Oui — via une SCI","Oui — via une SARL de Famille","Oui — donation nue-propriété","À étudier"],
        info:"La SARL de Famille permet l'option IR + amortissements LMNP + transmission facilitée. Très puissant si enfants majeurs." },
      { key:"donationNue", label:"Donation de nue-propriété envisagée ?", type:"select",
        options:["Non — pas d'horizon","Oui — dans les 5 ans","Oui — dans les 10–15 ans","Déjà en cours"],
        info:"Donner la nue-propriété jeune réduit la valeur taxable (barème de l'usufruit). Stratégie de transmission à anticiper tôt." },
      { key:"protectionConjoint", label:"Protection du conjoint en cas de décès", type:"select",
        options:["Non nécessaire (célibataire)","Clause de réversibilité souhaitée","Quasi-usufruit","Testament déjà rédigé","À étudier avec un notaire"],
        info:"Le quasi-usufruit permet au conjoint survivant de percevoir les revenus sans être propriétaire. Crucial en SCI." },
    ],
  },
  {
    id:"gestion", emoji:"⚙️", label:"Gestion & Logistique", short:"Gestion",
    color:"#F97316",
    questions:[
      { key:"modeGestion", label:"Mode de gestion du bien", type:"select",
        options:["Autogestion complète","Agence locative (5–8 %)","Conciergerie (Airbnb, ~20 %)","Co-gestion (agence + supervision)"],
        info:"L'autogestion maximise le cash-flow mais nécessite du temps. L'agence est déductible fiscalement en LMNP." },
      { key:"comptabilite", label:"Prêt(e) à tenir une comptabilité commerciale ?", type:"select",
        options:["Oui — j'ai déjà un expert-comptable","Oui — je suis prêt(e) à en prendre un","Non — je préfère le micro-BIC ou le foncier","Indécis"],
        info:"La comptabilité commerciale (bilan/liasse) est obligatoire en LMNP Réel et en société. Coût ~600–1 500 €/an." },
      { key:"deductionFrais", label:"Déduire frais de déplacement & bureau ?", type:"select",
        options:["Oui — c'est important pour moi","Non — pas de frais significatifs","Je ne savais pas que c'était possible"],
        info:"En LMNP Réel ou en société, vos frais de déplacement, de repas liés à la gestion et même un bureau à domicile sont déductibles. Impossible en revenus fonciers." },
      { key:"objectifCF", label:"Cash-flow mensuel cible", type:"number", unit:"€/mois", placeholder:"ex : 300", optional:true,
        info:"Votre cible de cash-flow mensuel net après toutes charges et impôts. Aide à calibrer le levier bancaire optimal." },
    ],
  },
];

function KYCInfoTip({ text, color="#007BFF" }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
      <div
        onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}
        style={{ width:14, height:14, borderRadius:"50%", background:`${color}15`, border:`1px solid ${color}35`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"help", flexShrink:0 }}>
        <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5.5" stroke={color} strokeWidth="1.2"/>
          <text x="6" y="9" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" fontWeight="700">i</text>
        </svg>
      </div>
      {show && (
        <div style={{ position:"absolute", bottom:"calc(100% + 7px)", right:0, background:"#1e1e1e", border:`1px solid ${color}35`, borderRadius:10, padding:"9px 13px", width:220, zIndex:9999, boxShadow:"0 8px 32px rgba(0,0,0,0.7)", pointerEvents:"none" }}>
          <p style={{ fontSize:10.5, color:C.g1, lineHeight:1.7, fontFamily:C.mono }}>{text}</p>
        </div>
      )}
    </div>
  );
}

function KYCField({ q, value, onChange, accentColor }) {
  const [focus, setFocus] = useState(false);
  const baseInput = {
    background:"transparent", border:"none", outline:"none",
    fontSize:13, fontWeight:600, color:C.w,
    width:"100%", fontFamily:C.mono,
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <label style={{ fontSize:9.5, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g2, textTransform:"uppercase", flex:1 }}>
          {q.label}
        </label>
        {q.optional && <span style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:3, padding:"1px 5px" }}>OPT.</span>}
        {q.info && (
          <div style={{ position:"relative", display:"inline-flex" }}>
            <KYCInfoTip text={q.info} color={accentColor}/>
          </div>
        )}
      </div>
      <div style={{
        display:"flex", alignItems:"center",
        background: focus ? `${accentColor}08` : "rgba(255,255,255,0.03)",
        border:`1px solid ${focus ? `${accentColor}50` : value ? `${accentColor}25` : C.border2}`,
        borderRadius:9, padding:"0 12px",
        transition:"all 0.15s",
        boxShadow: focus ? `0 0 0 2px ${accentColor}18` : "none",
      }}>
        {q.type === "select" ? (
          <select value={value} onChange={e=>onChange(e.target.value)}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            style={{ ...baseInput, padding:"10px 0", cursor:"pointer",
              MozAppearance:"none", WebkitAppearance:"none", appearance:"none",
              color: value ? C.w : C.g3,
            }}>
            <option value="" disabled style={{ background:"#1a1a1a", color:C.g3 }}>— Sélectionner</option>
            {q.options.map(o=>(
              <option key={o} value={o} style={{ background:"#1a1a1a", color:C.w }}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            type={q.type||"text"}
            value={value}
            placeholder={q.placeholder||""}
            onChange={e=>onChange(e.target.value)}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            style={{ ...baseInput, padding:"10px 0" }}
          />
        )}
        {q.unit && <span style={{ fontSize:11, color:C.g3, fontFamily:C.mono, marginLeft:6, flexShrink:0 }}>{q.unit}</span>}
        {q.type==="select" && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginLeft:6 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>
      {/* Valeur sélectionnée mise en avant */}
      {value && (
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:accentColor, flexShrink:0 }}/>
          <span style={{ fontSize:9.5, color:accentColor, fontFamily:C.mono }}>{value}</span>
        </div>
      )}
    </div>
  );
}

function KYCWizard({ kycData, onSave }) {
  const [step,    setStep]    = useState(0);
  const [data,    setData]    = useState(kycData || {});
  const [saved,   setSaved]   = useState(false);
  const [animate, setAnimate] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const pillar  = KYC_PILLARS[step];
  const total   = KYC_PILLARS.length;
  const progress = KYC_PILLARS.slice(0, step).reduce((acc,p)=>acc+p.questions.length, 0);
  const totalQ   = KYC_PILLARS.reduce((acc,p)=>acc+p.questions.length, 0);
  const filled   = Object.keys(data).length;
  const pct      = Math.round((filled / totalQ) * 100);

  const goTo = (idx) => {
    setAnimate(true);
    setTimeout(()=>{ setStep(idx); setAnimate(false); }, 160);
  };

  const handleSaveAll = () => {
    onSave(data);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const setField = (key, val) => setData(d=>({...d, [key]: val}));

  const pillarComplete = (p) => p.questions.filter(q=>!q.optional).every(q=>data[q.key]);
  const allDone = KYC_PILLARS.every(p=>pillarComplete(p));

  // ── Simulation from KYC data ──
  const runSimulation = () => {
    setSimLoading(true);
    setTimeout(() => {
      // Map KYC data → simulation params
      const tmiMap = {"0 % — Non imposable":0,"11 % — Tranche basse":11,"30 % — Tranche médiane":30,"41 % — Haute tranche":41,"45 % — Tranche maximale":45};
      const tmi = tmiMap[data.tmi] || 30;
      const revAn = parseInt(data.revenusAnnuels) || 50000;
      const isMeuble = (data.modeExploitation||"").toLowerCase().includes("meubl") || (data.modeExploitation||"").includes("LMNP") || (data.modeExploitation||"").includes("saisonnier") || (data.modeExploitation||"").includes("Airbnb");
      const isNue = (data.modeExploitation||"").toLowerCase().includes("nue") || (data.modeExploitation||"").toLowerCase().includes("foncier");
      const loyerEst = parseInt(data.revenusFonciers) || parseInt(data.objectifCF)*12 || 12000;
      const chargesEst = Math.round(loyerEst * 0.3);
      const prixEst = Math.round(loyerEst / 0.05); // estimation ~5% rendement
      const enfantsMap = {"Non":0,"1 enfant":1,"2 enfants":2,"3 enfants":3,"4 enfants et plus":4};
      const nEnfants = enfantsMap[data.enfants] || 0;
      const couple = (data.etatCivil||"").includes("Marié") || (data.etatCivil||"").includes("PACS");
      const horizonMap = {"< 5 ans":5,"5 à 10 ans":8,"10 à 20 ans":15,"> 20 ans":25,"Indéterminé":15};
      const duree = horizonMap[data.horizonDetention] || 15;

      const pr = {objectives:[{id:"revenus",weight:40},{id:"optimiser-locatif",weight:35},{id:"transmettre",weight:25}],
        age:parseInt(data.age)||45, couple, regimeMatrimonial:couple?"communaute-reduite":"separation",
        enfants:nEnfants, donationsAnterieures:0, tmi, revenuGlobal:revAn};
      const pp = {mode:"acquisition",type:"locatif",isRP:false,prixAcquisition:prixEst,valeurActuelle:prixEst,
        dateAcquisition:"2026-01-01",anneesDetention:0,travaux:0,dettes:Math.round(prixEst*0.75),
        regimeFiscal:isNue?"reel":"reel",loyerAnnuel:loyerEst,chargesLocatives:chargesEst,
        meuble:isMeuble,acqMeuble:isMeuble,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:prixEst,
        acqDureeDetention:duree,acqTauxRevalo:2,acqLoyer:loyerEst,acqCharges:chargesEst,acqTaxeFonciere:Math.round(prixEst*0.007)};

      const scenarios = simGenAcq(pr, pp);
      setSimResult({ scenarios: scenarios.slice(0, 3), params: {tmi, isMeuble, loyerEst, prixEst, duree, nEnfants, couple}, date: new Date().toLocaleDateString("fr-FR") });
      setSimLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%" }}>

      {/* Breadcrumb fil d'Ariane */}
      <div style={{ padding:"14px 0 0", marginBottom:16 }}>
        <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:10 }}>
          MES INFORMATIONS · PROFIL INVESTISSEUR
        </p>
        {/* Progress global */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.blue},#6366f1)`, borderRadius:99, transition:"width 0.4s ease" }}/>
          </div>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{filled}/{totalQ} renseignés</span>
        </div>
        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
          {KYC_PILLARS.map((p, i) => {
            const isActive  = i === step;
            const isDone    = pillarComplete(p);
            const isPast    = i < step;
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
                <button
                  onClick={()=>goTo(i)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    background:"none", border:"none", cursor:"pointer", padding:"4px 2px",
                    flex:1, minWidth:0,
                  }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12,
                    background: isActive ? p.color : isDone ? `${p.color}22` : "rgba(255,255,255,0.05)",
                    border:`2px solid ${isActive ? p.color : isDone ? `${p.color}60` : "rgba(255,255,255,0.1)"}`,
                    boxShadow: isActive ? `0 0 12px ${p.color}50` : "none",
                    transition:"all 0.2s",
                  }}>
                    {isDone && !isActive
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : <span style={{ fontSize:10 }}>{p.emoji}</span>
                    }
                  </div>
                  <span style={{ fontSize:8, fontFamily:C.mono, color: isActive ? p.color : isDone ? C.g2 : C.g3, letterSpacing:"0.06em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>
                    {p.short}
                  </span>
                </button>
                {i < total-1 && (
                  <div style={{ width:1, height:2, flex:"0 0 auto", background: i<step ? `${KYC_PILLARS[i+1].color}50` : "rgba(255,255,255,0.08)", margin:"0 1px", marginBottom:14 }}/>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pilier actif */}
      <div style={{
        flex:1, overflowY:"auto",
        opacity: animate ? 0 : 1,
        transform: animate ? "translateY(6px)" : "translateY(0)",
        transition:"all 0.16s ease",
      }}>
        {/* En-tête pilier */}
        <div style={{ marginBottom:16, padding:"14px 16px", background:`${pillar.color}0e`, border:`1px solid ${pillar.color}25`, borderRadius:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>{pillar.emoji}</span>
            <div>
              <p style={{ fontSize:13, fontWeight:800, color:C.w, letterSpacing:"-0.01em" }}>Pilier {step+1} — {pillar.label}</p>
              <p style={{ fontSize:9.5, color:C.g3, marginTop:2 }}>
                {step+1}/{total} · {pillar.questions.filter(q=>!q.optional).length} questions essentielles
                {pillar.questions.some(q=>q.optional) ? ` + ${pillar.questions.filter(q=>q.optional).length} optionnelles` : ""}
              </p>
            </div>
            {pillarComplete(pillar) && (
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, background:`${C.green}12`, border:`1px solid ${C.greenBord}`, borderRadius:18, padding:"3px 10px" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span style={{ fontSize:9, color:C.green, fontFamily:C.mono }}>COMPLÉTÉ</span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {pillar.questions.map((q) => (
            <KYCField key={q.key} q={q} value={data[q.key]||""} onChange={v=>setField(q.key,v)} accentColor={pillar.color}/>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", gap:8, marginTop:18 }}>
          {step > 0 && (
            <button onClick={()=>goTo(step-1)}
              style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;}} onMouseLeave={e=>{e.currentTarget.style.color=C.g2;}}>
              ← Pilier précédent
            </button>
          )}
          {step < total-1 ? (
            <button onClick={()=>goTo(step+1)}
              style={{ flex:2, background:`linear-gradient(135deg,${pillar.color},${pillar.color}cc)`, border:"none", borderRadius:10, padding:"11px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${pillar.color}30`, transition:"all 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              Pilier suivant →
            </button>
          ) : (
            <button onClick={handleSaveAll}
              style={{ flex:2, background:saved?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${pillar.color},${pillar.color}cc)`, border:"none", borderRadius:10, padding:"11px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${pillar.color}30`, transition:"all 0.3s" }}>
              {saved ? "✓ Profil sauvegardé !" : allDone ? "💾 Enregistrer mon profil complet" : "💾 Enregistrer (partiel)"}
            </button>
          )}
        </div>

        {/* Score de complétude */}
        {step === total-1 && (
          <div style={{ marginTop:12, padding:"10px 14px", background: allDone ? `${C.green}0e` : "rgba(245,158,11,0.07)", border:`1px solid ${allDone ? C.greenBord : "rgba(245,158,11,0.25)"}`, borderRadius:10 }}>
            <p style={{ fontSize:10, color: allDone ? C.green : C.yellow, fontFamily:C.mono }}>
              {allDone
                ? "✅ Profil complet — EQUITY peut générer votre recommandation de structure juridique optimale."
                : `⚠️ ${totalQ - filled} champs manquants — Remplissez-les pour obtenir une analyse fiscale précise.`}
            </p>
          </div>
        )}

        {/* ── Simulation de statut ── */}
        {pct >= 40 && (
          <div style={{ marginTop:16 }}>
            {/* Button */}
            {!simResult && (
              <button onClick={runSimulation} disabled={simLoading}
                style={{ width:"100%", padding:"14px", borderRadius:12, border:"none",
                  background:simLoading?"#1a1a1a":"linear-gradient(135deg,#8B5CF6,#6D28D9)",
                  color:simLoading?C.g3:"#fff", fontSize:13, fontWeight:700, cursor:simLoading?"wait":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  boxShadow:simLoading?"none":"0 4px 20px rgba(139,92,246,0.3)", transition:"all 0.2s" }}>
                {simLoading ? (
                  <><div style={{ width:14, height:14, border:"2px solid rgba(139,92,246,0.3)", borderTopColor:"#8B5CF6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Analyse en cours…</>
                ) : (
                  <><I.Sparkles/> Simuler mon statut optimal</>
                )}
              </button>
            )}

            {/* Result card */}
            {simResult && (
              <div style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.03))", border:"1px solid rgba(139,92,246,0.2)", borderRadius:14, overflow:"hidden" }}>
                {/* Header */}
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(139,92,246,0.12)", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B5CF6" }}>
                    <I.Sparkles/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:"#8B5CF6" }}>PROFIL CONSEILLÉ</p>
                    <p style={{ fontSize:10, color:C.g3 }}>Analyse du {simResult.date} · {simResult.params.isMeuble?"Meublé":"Location nue"} · TMI {simResult.params.tmi}%</p>
                  </div>
                  <button onClick={()=>setSimResult(null)} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:0 }}><I.X/></button>
                </div>

                {/* Top 3 scenarios */}
                <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
                  {simResult.scenarios.map((s, i) => {
                    const medal = i===0?"🥇":i===1?"🥈":"🥉";
                    const isTop = i===0;
                    return (
                      <div key={s.id} style={{
                        background:isTop?"rgba(139,92,246,0.08)":"#0a0a0a",
                        border:`1.5px solid ${isTop?"rgba(139,92,246,0.3)":C.border}`,
                        borderRadius:11, padding:"12px 14px", transition:"all 0.15s",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:isTop?8:0 }}>
                          <span style={{ fontSize:16 }}>{medal}</span>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:isTop?14:12, fontWeight:isTop?800:600, color:isTop?"#8B5CF6":C.w, letterSpacing:isTop?"-0.02em":"0" }}>{s.nom}</p>
                            <p style={{ fontSize:10, color:C.g2, marginTop:1 }}>{s.description}</p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ fontSize:isTop?18:14, fontWeight:800, color:isTop?"#8B5CF6":C.g1, fontFamily:C.mono }}>{s.score}</p>
                            <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>SCORE</p>
                          </div>
                        </div>
                        {isTop && s.phases && (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginTop:6 }}>
                            {s.phases.detention?.fiscAnnuelle != null && (
                              <div style={{ background:"#0a0a0a", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                                <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:2 }}>FISCALITÉ /AN</p>
                                <p style={{ fontSize:13, fontWeight:800, color:C.w }}>{simFmt(s.phases.detention.fiscAnnuelle)}</p>
                              </div>
                            )}
                            {s.phases.detention?.rendement && (
                              <div style={{ background:"#0a0a0a", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                                <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:2 }}>RENDEMENT</p>
                                <p style={{ fontSize:13, fontWeight:800, color:C.green }}>{s.phases.detention.rendement}</p>
                              </div>
                            )}
                            {s.phases.detention?.cashflow != null && (
                              <div style={{ background:"#0a0a0a", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                                <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:2 }}>CASHFLOW /AN</p>
                                <p style={{ fontSize:13, fontWeight:800, color:s.phases.detention.cashflow>=0?C.green:C.red }}>{simFmt(s.phases.detention.cashflow)}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {isTop && s.avantages && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:8 }}>
                            {s.avantages.slice(0,4).map((a,j) => (
                              <span key={j} style={{ fontSize:8.5, fontFamily:C.mono, color:"#8B5CF6", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.18)", padding:"2px 7px", borderRadius:4 }}>{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ padding:"10px 18px", borderTop:"1px solid rgba(139,92,246,0.12)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:9, color:C.g3, fontStyle:"italic" }}>Simulation indicative · Consultez un expert-comptable</p>
                  <button onClick={runSimulation}
                    style={{ background:"none", border:`1px solid ${C.border2}`, borderRadius:7, padding:"4px 12px", color:C.g2, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}
                    onMouseEnter={e=>e.currentTarget.style.color="#8B5CF6"} onMouseLeave={e=>e.currentTarget.style.color=C.g2}>
                    <I.Sparkles/> Relancer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function MonComptePanel({ user, onClose, onLogout, onSave, kycData, onSaveKyc }) {
  const [tab,      setTab]      = useState("profil");
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ ...user });
  const [saved,    setSaved]    = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(()=>{ setSaved(false); setEditing(false); }, 1400);
  };

  const initials = ((form.prenom?.[0]||"") + (form.nom?.[0]||"")).toUpperCase() || "?";

  const PLAN_FEATURES = [
    { label:"Biens suivis",       value:"Illimité", ok:true  },
    { label:"Locataires",         value:"Illimité", ok:true  },
    { label:"Analyses IA / mois", value:"100",      ok:true  },
    { label:"Scan de documents",  value:"Illimité", ok:true  },
    { label:"Export PDF/Excel",   value:"✓",        ok:true  },
    { label:"Support prioritaire",value:"✓",        ok:true  },
  ];

  const MField = ({label,k,type="text",placeholder,full}) => (
    <div style={{ background: editing?"rgba(0,123,255,0.03)":"#0a0a0a", border:`1px solid ${editing?"rgba(0,123,255,0.25)":C.border}`, borderRadius:10, padding:"10px 14px", gridColumn:full?"span 2":"auto", transition:"all 0.15s" }}>
      <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:5 }}>{label.toUpperCase()}</p>
      <input
        type={type} value={form[k]||""} readOnly={!editing}
        onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        placeholder={placeholder||"—"}
        style={{ background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:600, color:editing?C.w:C.g1, width:"100%", cursor:editing?"text":"default" }}
      />
    </div>
  );

  return (
    <main style={{ flex:1, overflowY:"auto", background:C.bg, display:"flex", flexDirection:"column", animation:"fadeUp 0.3s ease" }}>
      <div style={{ maxWidth:620, width:"100%", margin:"0 auto", display:"flex", flexDirection:"column", flex:1 }}>

        {/* ── HEADER ── */}
        <div style={{ padding:"28px 32px 0", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <p style={{ fontSize:10, fontFamily:C.mono, letterSpacing:"0.14em", color:C.blue }}>MON COMPTE</p>
            <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", gap:6, fontSize:11, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              <I.X/> Fermer
            </button>
          </div>

          {/* Avatar + identity */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, flexShrink:0, boxShadow:"0 4px 16px rgba(99,102,241,0.35)" }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>{form.prenom} {form.nom}</p>
              <p style={{ fontSize:11, color:C.g2, marginBottom:4 }}>{form.email}</p>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", padding:"2px 8px", borderRadius:4 }}>PLAN {form.plan?.toUpperCase()}</span>
                <span style={{ fontSize:9, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"2px 8px", borderRadius:4 }}>● ACTIF</span>
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display:"flex", gap:0 }}>
            {[["profil","Profil"],["kyc","Mes informations"],["securite","Sécurité"],["plan","Mon plan"]].map(([k,l])=>{
              const active = tab===k;
              return (
                <button key={k} onClick={()=>setTab(k)} style={{ background:"transparent", border:"none", padding:"8px 14px", fontSize:11, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex:1, padding:"24px 32px 32px" }}>

          {/* ── PROFIL TAB ── */}
          {tab==="profil" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>INFORMATIONS PERSONNELLES</p>
                {!editing
                  ? <button onClick={()=>setEditing(true)} style={{ background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", borderRadius:7, padding:"5px 12px", color:C.blue, fontSize:11, fontWeight:600, cursor:"pointer" }}>Modifier</button>
                  : <div style={{ display:"flex", gap:7 }}>
                      <button onClick={()=>{setEditing(false);setForm({...user});}} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:7, padding:"5px 12px", color:C.g2, fontSize:11, cursor:"pointer" }}>Annuler</button>
                      <button onClick={handleSave} style={{ background:saved?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:7, padding:"5px 14px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.3s" }}>
                        {saved ? "✓ Sauvegardé" : "Enregistrer"}
                      </button>
                    </div>
                }
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <MField label="Prénom"    k="prenom"    placeholder="Thomas"/>
                <MField label="Nom"       k="nom"       placeholder="Dubois"/>
                <MField label="E-mail"    k="email"     type="email" placeholder="thomas@exemple.fr" full/>
                <MField label="Téléphone" k="telephone" type="tel"   placeholder="06 12 34 56 78"/>
                <MField label="Régime fiscal principal" k="regime"   placeholder="LMNP Réel"/>
              </div>

              {/* Member since */}
              <div style={{ marginTop:4, background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:C.g3 }}><I.Calendar/></span>
                  <span style={{ fontSize:11, color:C.g2 }}>Membre depuis</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:C.g1, fontFamily:C.mono }}>{user.dateInscription}</span>
              </div>
            </div>
          )}

          {/* ── KYC — MES INFORMATIONS ── */}
          {tab==="kyc" && (
            <KYCWizard kycData={kycData} onSave={onSaveKyc}/>
          )}

          {/* ── SÉCURITÉ TAB ── */}
          {tab==="securite" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:4 }}>SÉCURITÉ DU COMPTE</p>

              {[
                { label:"Mot de passe", sub:"Dernière modification : jamais", action:"Modifier", color:C.blue },
                { label:"Double authentification (2FA)", sub:"Non activée — recommandé", action:"Activer", color:C.green },
                { label:"Sessions actives", sub:"1 session ouverte (ce navigateur)", action:"Voir", color:C.blue },
              ].map((item,i)=>(
                <div key={i} style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:11, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:C.w, marginBottom:3 }}>{item.label}</p>
                    <p style={{ fontSize:11, color:C.g2 }}>{item.sub}</p>
                  </div>
                  <button style={{ background:`${item.color}15`, border:`1px solid ${item.color}30`, borderRadius:7, padding:"6px 14px", color:item.color, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${item.color}25`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${item.color}15`;}}>
                    {item.action}
                  </button>
                </div>
              ))}

              {/* Delete zone */}
              <div style={{ marginTop:8, background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:11, padding:"14px 16px" }}>
                <p style={{ fontSize:12, fontWeight:600, color:C.red, marginBottom:4 }}>Zone de danger</p>
                <p style={{ fontSize:11, color:C.g2, marginBottom:12 }}>La suppression du compte est irréversible. Toutes vos données seront effacées.</p>
                <button style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"7px 16px", color:C.red, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* ── PLAN TAB ── */}
          {tab==="plan" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* Current plan card */}
              <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.1),rgba(0,123,255,0.03))", border:"1px solid rgba(0,123,255,0.25)", borderRadius:14, padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:9, fontFamily:C.mono, color:C.blue, letterSpacing:"0.1em", marginBottom:4 }}>PLAN ACTUEL</p>
                    <p style={{ fontSize:22, fontWeight:800, color:C.w, letterSpacing:"-0.03em" }}>EQUITY Pro</p>
                  </div>
                  <span style={{ fontSize:18, fontWeight:800, color:C.blue }}>49 €<span style={{ fontSize:11, color:C.g2, fontWeight:400 }}>/mois</span></span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {PLAN_FEATURES.map((f,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      <span style={{ fontSize:11, color:C.g1 }}>{f.label}</span>
                      <span style={{ fontSize:10, color:C.blue, fontFamily:C.mono, marginLeft:"auto" }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g2;}}>
                Gérer l'abonnement →
              </button>
            </div>
          )}
        </div>

        {/* ── STICKY FOOTER — Déconnexion ── */}
        <div style={{ padding:"20px 32px 32px", marginTop:"auto" }}>
          <button
            onClick={onLogout}
            style={{ width:"100%", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:11, padding:"12px", color:C.red, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:9, letterSpacing:"0.04em", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.14)";e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.07)";e.currentTarget.style.borderColor="rgba(239,68,68,0.2)";}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}
