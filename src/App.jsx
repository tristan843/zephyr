import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { C } from "./tokens/colors.js";
import { I } from "./components/Icons.jsx";
import { Sparkline } from "./components/ui/Sparkline.jsx";
import { Gauge } from "./components/ui/Gauge.jsx";
import { DpeBadge } from "./components/ui/DpeBadge.jsx";
import { DataTile } from "./components/ui/DataTile.jsx";
import { inputBase, FormField, FInput, FSelect, FTextarea, DPESelector, ColorDot } from "./components/ui/FormAtoms.jsx";
import { NbFieldAddress } from "./components/NbFieldAddress.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { PatrimoinePage } from "./components/PatrimoinePage.jsx";
import { LocatairesPage } from "./components/LocatairesPage.jsx";
import { SimulateurPage } from "./components/SimulateurPage.jsx";
import { PropertyDetail } from "./components/PropertyDetail.jsx";
import { FranceMapView } from "./components/FranceMapView.jsx";

/* Font Loader */
const _fontLink = typeof document !== 'undefined' && !document.getElementById('eq-fonts') && (() => {
  const l = document.createElement('link');
  l.id = 'eq-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
  document.head.appendChild(l);
  return true;
})();


/* ════════════════════════════════════════
   DATA
════════════════════════════════════════ */
const NAV = [
  { id:"pilotage",     label:"Pilotage",     Icon:I.Home      },
  { id:"patrimoine",   label:"Mes biens",    Icon:I.Immeuble    },
  { id:"locataires",   label:"Locataires",   Icon:I.Users     },
  { id:"finances",     label:"Finances",     Icon:I.Dollar    },
  { id:"coffre",       label:"Coffre",       Icon:I.Safe      },
  { id:"simulateurs",  label:"Simulateurs",  Icon:I.Simulator },
];

const INITIAL_ASSETS = [];

// daysLate: 0 = à jour, 1–9 = en retard (orange), 10+ = impayé (rouge)
const TENANTS_DEFAULT = [];

const DPE_MAP = {
  A:{ color:"#22c55e", score:{ A:"35", B:"70", C:"148", D:"210", E:"280" } },
  B:{ color:"#84cc16" },
  C:{ color:"#eab308" },
  D:{ color:"#f97316" },
  E:{ color:"#ef4444" },
};
const DPE_SCORES = { A:"12", B:"70", C:"148", D:"210", D2:"60", E:"280" };
const GES_SCORES = { A:"4", B:"12", C:"28", D:"44" };

/* ════════════════════════════════════════
   ACCESS TILE
════════════════════════════════════════ */




/* ════════════════════════════════════════
   NOUVEAU BIEN — SMART INTAKE PANEL
════════════════════════════════════════ */

const BIEN_OCR_SYSTEM_PROMPT = `Toute information absente ou incertaine doit être strictement retournée comme null. Toute hallucination est considérée comme une erreur critique.
Tu es un moteur d'extraction documentaire strictement déterministe pour des documents immobiliers.
Tu reçois des images ou PDF de documents liés à un bien immobilier : acte de vente, appels de fonds, diagnostics techniques, photos.
Ta mission : Extraire uniquement les informations explicitement présentes. Ne jamais compléter, deviner, corriger ou reformater si incertain. Si doute → null.

SCHÉMA JSON CIBLE :
{
  "identification": { "nom_bien": null, "type_bien": null, "identifiant": null, "adresse": null, "adresse_complement": null, "batiment_escalier_etage": null, "porte_lot": null, "ville": null, "code_postal": null, "region": null, "pays": null, "surface_carrez": null, "configuration": null, "chambres": null, "salles_de_bain": null, "annee_construction": null, "description": null },
  "performance_energetique": { "classe_dpe": null, "classe_ges": null, "depenses_energie_annuelles": null, "annee_reference_prix": null },
  "locatif": { "etat_locatif": null, "type_location": null, "mode_locatif": null, "loyer_hc": null, "charges_locatives": null, "frequence_paiement": null },
  "parties": { "vendeur": null, "notaire": null },
  "acquisition": { "date_acquisition": null, "prix_net_vendeur": null, "frais_notaire": null, "frais_agence": null, "ameublement_travaux": null },
  "charges": { "taxe_fonciere": null, "charges_copro": null },
  "regime_fiscal": null
}

RÈGLES PAR DOCUMENT :
ACTE DE VENTE — Extraire : prix, vendeur, acheteur, adresse complète, date de vente, surface, notaire. Prix = montant explicitement "prix de vente" ou "prix net vendeur". Ne pas confondre prix avec frais.
APPELS DE FONDS — Extraire : charges copropriété, taxe foncière, frais notaire. Montants = lignes explicitement libellées. Ne pas additionner des lignes.
DIAGNOSTICS — Extraire : classe DPE (A-G), classe GES (A-G), surface habitable, année de construction. Ne pas déduire la classe si seule la consommation est donnée.
PHOTOS — Extraire : type de bien visible (appartement/maison), état général, nombre de pièces visibles. Si incertain → null.

INTERDICTIONS : Ne pas calculer de totaux. Ne pas déduire un régime fiscal. Ne pas estimer une surface. Ne pas inventer une adresse. Ne pas corriger les fautes OCR.

FORMAT : Retourne UNIQUEMENT du JSON valide, sans backticks, sans commentaire, sans phrase. Respecte exactement le schéma ci-dessus.`;

const NB_AI_STEPS = [
  "Lecture de l'acte de vente...",
  "Extraction du prix et des parties...",
  "Analyse des diagnostics (DPE, amiante, plomb)...",
  "Traitement des appels de fonds...",
  "Reconnaissance des photos du bien...",
  "Calcul de la valeur liquidative...",
  "Génération de la fiche bien complète...",
];

const NB_DOC_ZONES = [
  {
    key:"acte",
    type:"ACTE DE VENTE",
    label:"Acte de vente",
    subLabel:"Acte authentique · Compromis · Avant-contrat",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    aiFields:["prix d'achat","vendeur","acheteur","adresse","date","surface"],
    color:"#007BFF",
  },
  {
    key:"fonds",
    type:"APPELS DE FONDS",
    label:"Appels de fonds",
    subLabel:"Appels notaire · Relevés de charges · Syndic",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    aiFields:["charges copro","taxe foncière","frais notaire","appels trimestriels"],
    color:"#10B981",
  },
  {
    key:"diag",
    type:"DIAGNOSTICS",
    label:"Diagnostics",
    subLabel:"DPE · Amiante · Plomb · Électricité · Gaz",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    aiFields:["DPE","GES","surface habitable","année construction","diagnostics réglementaires"],
    color:"#F59E0B",
  },
  {
    key:"photos",
    type:"PHOTOS",
    label:"Photos du bien",
    subLabel:"Façade · Intérieur · Plans · État général",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    aiFields:["état général","pièces détectées","luminosité","rénovation visible"],
    color:"#8B5CF6",
  },
];

function NbDropZone({ zone, files, onAddFile, analyzing, done, onRemoveFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const ZoneIcon = zone.icon;
  const fileList = files || [];
  const hasFiles = fileList.length > 0;

  const handleDrop = e => { e.preventDefault(); setDrag(false); [...e.dataTransfer.files].forEach(f=>onAddFile(f)); };
  const handleInput = e => { [...e.target.files].forEach(f=>onAddFile(f)); e.target.value=""; };
  const ac = zone.color;

  return (
    <div style={{ position:"relative", flex:1, minWidth:0 }}>
      <input ref={ref} type="file" multiple style={{ display:"none" }} onChange={handleInput}/>
      <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={handleDrop}
        style={{ border:`1.5px dashed ${done?C.green:drag?ac:"#2a2a2a"}`, borderRadius:14, padding:"18px 14px 14px", textAlign:"center", cursor:"pointer", background:done?"rgba(16,185,129,0.05)":drag?`${ac}12`:"transparent", transition:"all 0.25s", boxShadow:drag?`0 0 22px ${ac}20`:done?`0 0 18px ${C.green}12`:"none", position:"relative", overflow:"hidden", height:"100%", boxSizing:"border-box" }}>
        <div style={{ position:"absolute", top:-14, left:-14, width:36, height:36, borderRadius:"50%", background:done?`${C.green}18`:`${ac}10`, pointerEvents:"none" }}/>
        <div style={{ width:40, height:40, borderRadius:11, margin:"0 auto 10px", background:done?"rgba(16,185,129,0.12)":drag?`${ac}22`:`${ac}10`, border:`1px solid ${done?C.greenBord:drag?`${ac}50`:`${ac}25`}`, display:"flex", alignItems:"center", justifyContent:"center", color:done?C.green:ac, transition:"all 0.2s" }}>
          {analyzing?<div style={{ animation:"spin 1s linear infinite" }}><I.Loader/></div>:done?<I.CheckCircle/>:<ZoneIcon/>}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:done?C.green:C.w, marginBottom:2 }}>{done?`${fileList.length} fichier${fileList.length>1?"s":""}`:zone.label}</p>
        {!hasFiles&&<p style={{ fontSize:9, color:C.g2, lineHeight:1.5, marginBottom:6 }}>{zone.subLabel}</p>}
        {hasFiles&&(
          <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:2, textAlign:"left" }}>
            {fileList.map((f,fi)=>(
              <div key={fi} style={{ display:"flex", alignItems:"center", gap:4, background:"#0d0d0f", borderRadius:5, padding:"3px 6px" }}>
                <I.File/>
                <span style={{ fontSize:7.5, color:C.g1, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:C.mono }}>{f.name}</span>
                <button onClick={e=>{e.stopPropagation();onRemoveFile(fi);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, display:"flex", padding:0, flexShrink:0, opacity:0.6 }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}><I.X/></button>
              </div>
            ))}
          </div>
        )}
        {!hasFiles&&!analyzing&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:3, justifyContent:"center", marginBottom:6 }}>
            {zone.aiFields.slice(0,3).map(f=>(<span key={f} style={{ fontSize:7, fontFamily:C.mono, color:ac, background:`${ac}10`, border:`1px solid ${ac}20`, padding:"1px 4px", borderRadius:3 }}>{f}</span>))}
          </div>
        )}
        {analyzing&&<div style={{ height:2, background:"#1f1f1f", borderRadius:99, overflow:"hidden", marginTop:6 }}><div style={{ height:"100%", background:`linear-gradient(90deg,${ac},${ac}88)`, borderRadius:99, animation:"scanBar 1.4s ease-in-out infinite alternate", width:"60%" }}/></div>}
        {!analyzing&&<div style={{ marginTop:hasFiles?4:6, display:"flex", alignItems:"center", justifyContent:"center", gap:4, opacity:0.4 }}><I.Upload2/><span style={{ fontSize:8, color:C.g2 }}>{hasFiles?"+ Ajouter":"Glisser ou cliquer"}</span></div>}
      </div>
      <div style={{ position:"absolute", top:8, right:8, fontSize:7.5, fontFamily:C.mono, letterSpacing:"0.1em", color:done?C.green:ac, background:done?C.greenSub:`${ac}12`, border:`1px solid ${done?C.greenBord:`${ac}25`}`, padding:"2px 6px", borderRadius:4, lineHeight:1.5 }}>{zone.type}{hasFiles?` · ${fileList.length}`:""}</div>
    </div>
  );
}


/* Regime selector pill */
const REGIMES = [
  { id:"lmnp_reel",   label:"LMNP Réel",         sub:"BIC — Amortissement + charges" },
  { id:"lmnp_micro",  label:"LMNP Micro-BIC",     sub:"Abattement 50%" },
  { id:"rev_foncier", label:"Revenu Foncier Réel", sub:"Déficit foncier possible" },
  { id:"micro_fonc",  label:"Micro-Foncier",       sub:"Abattement 30%" },
  { id:"sci_is",      label:"SCI à l'IS",          sub:"Imposition société" },
  { id:"sci_ir",      label:"SCI à l'IR",          sub:"Transparence fiscale" },
  { id:"pinel",       label:"Pinel / Denormandie", sub:"Réduction d'impôt" },
  { id:"sarl",        label:"SARL de famille",     sub:"Statut libéral" },
  { id:"sas",         label:"SAS",                 sub:"Flexibilité statutaire" },
];

const TOP5 = ["lmnp_reel","lmnp_micro","rev_foncier","sci_is","pinel"];

/* ── Performance Simulator — Stable sub-components ── */
/* ── Custom DatePicker Calendar ── */
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

/* ── Editable field for the new-asset form ── */
function NbField({ label, value, unit, icon:TIcon, mono, placeholder, accent, full, readOnly, onChange, ocrFilled, type }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ background: focus ? "rgba(0,123,255,0.04)" : "#0a0a0a", border:`1px solid ${focus?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", transition:"all 0.15s", gridColumn:full?"span 2":"span 1", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
        {ocrFilled && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {type==="date" ? (
          <DatePickerInput value={value||""} onChange={v=>!readOnly&&onChange&&onChange(v)} placeholder={placeholder}/>
        ) : (
          <input type={type||"text"}
            value={value||""} onChange={e=>!readOnly&&onChange&&onChange(e.target.value)}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            placeholder={placeholder||"—"} readOnly={readOnly}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:700, color:accent?C.blue:C.w, fontFamily:mono?"monospace":"inherit" }}
          />
        )}
        {unit&&<span style={{ fontSize:11, color:C.g2, flexShrink:0 }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ── Select dropdown for the new-asset form ── */
function NbSelect({ label, value, options, icon:TIcon, full, onChange, ocrFilled, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(()=>{
    if(!open) return;
    const close = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return ()=>document.removeEventListener("mousedown", close);
  },[open]);
  return (
    <div ref={ref} style={{ position:"relative", gridColumn:full?"span 2":"span 1" }}>
      <div onClick={()=>setOpen(!open)} style={{ background:open?"rgba(0,123,255,0.04)":"#0a0a0a", border:`1px solid ${open?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", cursor:"pointer", transition:"all 0.15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
          {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
          <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
          {ocrFilled && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ flex:1, fontSize:13, fontWeight:700, color:value?C.w:C.g3 }}>{value||placeholder||"Sélectionner…"}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2" strokeLinecap="round" style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:50, marginTop:4, background:"#111", border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 12px 40px rgba(0,0,0,0.6)", maxHeight:220, overflowY:"auto", animation:"fadeUp 0.15s ease" }}>
          {options.map(opt => {
            const isSelected = value === opt;
            return (
              <div key={opt} onClick={()=>{onChange(opt);setOpen(false);}}
                style={{ padding:"9px 14px", fontSize:12, fontWeight:isSelected?700:500, color:isSelected?C.blue:C.g1, background:isSelected?"rgba(0,123,255,0.06)":"transparent", cursor:"pointer", borderBottom:`1px solid ${C.border}`, transition:"background 0.1s" }}
                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background="#1a1a1a";}}
                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background="transparent";}}>
                {isSelected && <span style={{ marginRight:6, color:C.blue }}>✓</span>}{opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Textarea for the new-asset form ── */
function NbTextarea({ label, value, icon:TIcon, full, onChange, ocrFilled, placeholder, rows }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ background:focus?"rgba(0,123,255,0.04)":"#0a0a0a", border:`1px solid ${focus?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", transition:"all 0.15s", gridColumn:full?"span 2":"span 1" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
        {ocrFilled && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
      </div>
      <textarea value={value||""} onChange={e=>onChange&&onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        placeholder={placeholder||"—"} rows={rows||3}
        style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:600, color:C.w, resize:"vertical", lineHeight:1.6, fontFamily:"inherit" }}/>
    </div>
  );
}

/* ── Color picker for the new-asset form ── */
function NbColor({ label, value, onChange }) {
  const PRESET = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316","#84CC16","#6366F1"];
  return (
    <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 13px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
        <I.Palette/>
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
        {PRESET.map(col=>(
          <div key={col} onClick={()=>onChange(col)}
            style={{ width:22, height:22, borderRadius:6, background:col, cursor:"pointer", border:value===col?"2px solid #fff":`2px solid transparent`, boxShadow:value===col?`0 0 8px ${col}60`:"none", transition:"all 0.15s" }}/>
        ))}
        <input type="color" value={value||"#3B82F6"} onChange={e=>onChange(e.target.value)}
          style={{ width:22, height:22, borderRadius:6, border:`1px solid ${C.border}`, cursor:"pointer", background:"transparent", padding:0 }}/>
      </div>
    </div>
  );
}

/* ── Section Label ── */
const SecLabel = ({label})=>(
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, marginTop:2 }}>
    <span style={{ fontSize:9, letterSpacing:"0.12em", color:C.g3, fontFamily:C.mono }}>{label}</span>
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

function NouveauBienPanel({ onClose, onCreateAsset }) {
  const [files,     setFiles]     = useState({ acte:[], fonds:[], diag:[], photos:[] });
  const [filesB64,  setFilesB64]  = useState({ acte:[], fonds:[], diag:[], photos:[] });
  const [analyzing, setAnalyzing] = useState({ acte:false, fonds:false, diag:false, photos:false });
  const [done,      setDone]      = useState({ acte:false, fonds:false, diag:false, photos:false });
  const [phase,     setPhase]     = useState("intake"); // intake | analyzing | done
  const [aiStep,    setAiStep]    = useState(0);
  const [aiLabel,   setAiLabel]   = useState(NB_AI_STEPS[0]);
  const [formTab,   setFormTab]   = useState("Caractéristiques");
  const [confirmed, setConfirmed] = useState(false);
  const [bienOcr,   setBienOcr]   = useState(null);
  const [bienErr,   setBienErr]   = useState(null);
  const [bienConf,  setBienConf]  = useState(0);

  // Read file as base64
  const readB64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const handleFile = async (key, file) => {
    setFiles(f=>({...f,[key]:[...f[key],file]}));
    setAnalyzing(a=>({...a,[key]:true}));
    try {
      const b64 = await readB64(file);
      setFilesB64(f=>({...f,[key]:[...f[key],b64]}));
    } catch(e) { console.error("File read error:", e); }
    setTimeout(()=>{ setAnalyzing(a=>({...a,[key]:false})); setDone(d=>({...d,[key]:true})); }, 1800 + Math.random()*800);
  };

  const removeFile = (key, index) => {
    setFiles(f=>{
      const arr = f[key].filter((_,i)=>i!==index);
      if(arr.length===0) setDone(d=>({...d,[key]:false}));
      return {...f,[key]:arr};
    });
    setFilesB64(f=>({...f,[key]:f[key].filter((_,i)=>i!==index)}));
  };

  const allDone = Object.values(done).every(Boolean);
  const someFiles = Object.values(files).some(a=>a.length>0);

  // Editable form state — initialized empty, filled by OCR
  const EMPTY_FORM = { name:"",type:"",identifiant:"",couleur:"#3B82F6",addr:"",addr2:"",batiment:"",escalier:"",etage:"",porteLot:"",ville:"",codePostal:"",region:"",pays:"France",surface:"",rooms:"",chambres:"",sdb:"",year:"",description:"",dpe:"",ges:"",depensesEnergieMin:"",depensesEnergieMax:"",anneeRefPrix:"",etatLocatif:"",typeLocation:"",dureeMin:"",dureeMax:"",mode:"",loyer:"",chargesLocatives:"",depotGarantie:"",frequencePaiement:"",prixBien:"",fraisNotaire:"",fraisAgence:"",ameublement:"",dateAcq:"",vendeur:"",notaire:"",taxeFonciere:"",chargesCopro:"",regime:"" };
  const [formData, setFormData] = useState({...EMPTY_FORM});
  const [ocrFields, setOcrFields] = useState({}); // tracks which fields came from OCR
  const upd = (k,v) => setFormData(f=>({...f,[k]:v}));

  // Sync OCR results into formData when extraction finishes
  useEffect(()=>{
    if(!bienOcr) return;
    const d = bienOcr;
    const id = d.identification || {};
    const pe = d.performance_energetique || {};
    const lo = d.locatif || {};
    const pa = d.parties || {};
    const aq = d.acquisition || {};
    const ch = d.charges || {};
    const mapping = {
      name: id.nom_bien, type: id.type_bien, identifiant: id.identifiant,
      addr: id.adresse, addr2: id.adresse_complement, batiment: id.batiment_escalier_etage,
      porteLot: id.porte_lot, ville: id.ville, codePostal: id.code_postal, region: id.region, pays: id.pays,
      surface: id.surface_carrez, rooms: id.configuration, chambres: id.chambres, sdb: id.salles_de_bain,
      year: id.annee_construction, description: id.description,
      dpe: pe.classe_dpe, ges: pe.classe_ges, depensesEnergieMin: null, depensesEnergieMax: pe.depenses_energie_annuelles, anneeRefPrix: pe.annee_reference_prix,
      etatLocatif: lo.etat_locatif, typeLocation: lo.type_location, mode: lo.mode_locatif,
      loyer: lo.loyer_hc, chargesLocatives: lo.charges_locatives, depotGarantie: null, dureeMin: null, dureeMax: null, frequencePaiement: lo.frequence_paiement,
      prixBien: aq.prix_net_vendeur, fraisNotaire: aq.frais_notaire, fraisAgence: aq.frais_agence, ameublement: aq.ameublement_travaux,
      dateAcq: aq.date_acquisition, vendeur: pa.vendeur, notaire: pa.notaire,
      taxeFonciere: ch.taxe_fonciere, chargesCopro: ch.charges_copro, regime: d.regime_fiscal,
    };
    const filled = {};
    const ocrF = {};
    for (const [k,v] of Object.entries(mapping)) {
      filled[k] = (v !== null && v !== undefined && v !== "") ? String(v) : "";
      if (v !== null && v !== undefined && v !== "") ocrF[k] = true;
    }
    setFormData(prev => {
      const merged = {...prev};
      for (const [k,v] of Object.entries(filled)) { if(v) merged[k] = v; }
      return merged;
    });
    setOcrFields(ocrF);
  }, [bienOcr]);

  // OCR extraction
  const runBienOCR = useCallback(async () => {
    setPhase("analyzing");
    setAiStep(0); setAiLabel(NB_AI_STEPS[0]);
    let step = 0;
    const iv = setInterval(() => { step++; if(step<NB_AI_STEPS.length){setAiStep(step);setAiLabel(NB_AI_STEPS[step]);} }, 600);

    const addDoc = (arr, b64, name, mimeHint) => {
      if(!b64) return;
      const isPdf = name?.toLowerCase().endsWith(".pdf");
      const mime = isPdf ? "application/pdf" : (mimeHint || "image/jpeg");
      arr.push(isPdf ? {type:"document",source:{type:"base64",media_type:mime,data:b64}} : {type:"image",source:{type:"base64",media_type:mime,data:b64}});
    };

    try {
      const docs = [];
      ["acte","fonds","diag","photos"].forEach(k => {
        filesB64[k].forEach((b,i) => addDoc(docs, b, files[k][i]?.name, files[k][i]?.type));
      });
      docs.push({type:"text",text:"Extrais les données de ces documents immobiliers selon le schéma JSON défini. Retourne uniquement le JSON."});

      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-5-20250514", max_tokens:2048, system:BIEN_OCR_SYSTEM_PROMPT, messages:[{role:"user",content:docs}] })
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setBienOcr(parsed);

      // Confidence
      const flatten = obj => { let vals=[]; for(const v of Object.values(obj||{})){if(v&&typeof v==="object"&&!Array.isArray(v)) vals.push(...flatten(v)); else vals.push(v);} return vals; };
      const all = flatten(parsed);
      const filled = all.filter(v=>v!==null&&v!=="").length;
      setBienConf(all.length>0?Math.round(filled/all.length*100):0);
    } catch(e) {
      console.error("Bien OCR error:", e);
      setBienErr(e.message);
      setBienOcr({});
      setBienConf(0);
    } finally {
      clearInterval(iv);
      setAiStep(NB_AI_STEPS.length-1);
      setAiLabel(NB_AI_STEPS[NB_AI_STEPS.length-1]);
      setTimeout(()=>setPhase("done"), 500);
    }
  }, [filesB64, files]);

  // Skip to empty form without docs
  const skipToEmpty = () => { setBienOcr({}); setBienConf(0); setPhase("done"); };

  useEffect(()=>{
    if (allDone && phase==="intake") {
      setTimeout(()=>runBienOCR(), 700);
    }
  },[done, allDone, runBienOCR]);

  const pct = Math.round((aiStep/NB_AI_STEPS.length)*100);
  const FORM_TABS = ["Caractéristiques","Finances & Fiscalité"];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)" }}/>

      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:201, width:"min(820px,92vw)", background:"#0d0d0d", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", animation:"slideIn 0.32s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"-24px 0 64px rgba(0,0,0,0.7)", overflowY:"auto" }}>

        {/* ── STICKY HEADER ── */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14, background:"#08080A", position:"sticky", top:0, zIndex:10, flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
            <I.X/>
          </button>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.14em", color:C.blue, marginBottom:2 }}>EQUITY · NOUVEAU BIEN</p>
            <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>
              {phase==="done" ? (formData.name || "Nouveau bien") : "Créer une fiche bien"}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {[
              {n:1,l:"Documents",  done:phase!=="intake",          act:phase==="intake"},
              {n:2,l:"Analyse IA", done:phase==="done",            act:phase==="analyzing"},
              {n:3,l:"Fiche bien", done:false,                     act:phase==="done"},
            ].map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", background:s.done?C.green:s.act?C.blue:"#1a1a1a", border:`1.5px solid ${s.done?C.green:s.act?C.blue:"#2a2a2a"}`, color:s.done||s.act?"#fff":C.g3, boxShadow:s.act?`0 0 10px ${C.blueGlow}`:"none", transition:"all 0.4s" }}>
                  {s.done?"✓":s.n}
                </div>
                <span style={{ fontSize:10, color:s.done?C.green:s.act?C.w:C.g3, fontWeight:s.act?600:400, transition:"color 0.3s" }}>{s.l}</span>
                {i<2&&<div style={{ width:18, height:1, background:C.border }}/>}
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding:"22px 24px 32px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* ══ PHASE: INTAKE ══ */}
          {(phase==="intake"||phase==="analyzing") && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Smart intake zone */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:18, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <span style={{ color:C.blue }}><I.Sparkles/></span>
                  <div>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue }}>SMART INTAKE · DÉPOSEZ VOS DOCUMENTS</p>
                    <p style={{ fontSize:11, color:C.g2, marginTop:2 }}>L'IA scannera vos documents et pré-remplira automatiquement la fiche du bien</p>
                  </div>
                </div>

                {/* 4 drop zones in a 2x2 grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {NB_DOC_ZONES.map(zone=>(
                    <NbDropZone key={zone.key} zone={zone} files={files[zone.key]} onAddFile={f=>handleFile(zone.key,f)} analyzing={analyzing[zone.key]} done={done[zone.key]} onRemoveFile={i=>removeFile(zone.key,i)}/>
                  ))}
                </div>

                {/* Progress dots */}
                <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
                  {NB_DOC_ZONES.map(z=>(
                    <div key={z.key} style={{ flex:1, height:3, borderRadius:99, background: done[z.key]?C.green:files[z.key].length>0?z.color:"#1e1e1e", transition:"background 0.4s" }}/>
                  ))}
                  <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>
                    {Object.values(done).filter(Boolean).length}/4
                  </span>
                </div>

                {!allDone && (
                  <div style={{ textAlign:"center", marginTop:10 }}>
                    <button onClick={skipToEmpty}
                      style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", color:C.g2, fontSize:10, cursor:"pointer", fontFamily:C.mono, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g2;}}>
                      Continuer sans documents → fiche vide
                    </button>
                  </div>
                )}
              </div>

              {/* Hint: what IA will extract */}
              {!allDone && (
                <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:10 }}>CE QUE L'IA VA EXTRAIRE AUTOMATIQUEMENT</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                    {NB_DOC_ZONES.map(z=>(
                      <div key={z.key}>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                          <div style={{ width:3, height:12, borderRadius:99, background:z.color }}/>
                          <span style={{ fontSize:9, fontWeight:700, color:C.g1, fontFamily:C.mono }}>{z.type}</span>
                        </div>
                        {z.aiFields.map(f=>(
                          <div key={f} style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
                            <span style={{ width:4, height:4, borderRadius:"50%", background:`${z.color}50`, flexShrink:0 }}/>
                            <span style={{ fontSize:9.5, color:C.g3 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IA global progress bar */}
              {phase==="analyzing" && (
                <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 20px", animation:"fadeUp 0.3s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, animation:"spin 1.2s linear infinite" }}><I.Loader/></div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue, marginBottom:2 }}>ANALYSE IA EN COURS</p>
                      <p style={{ fontSize:12, fontWeight:600, color:C.w }}>{aiLabel}</p>
                    </div>
                    <span style={{ fontSize:15, fontWeight:800, color:C.blue, fontFamily:C.mono }}>{pct}%</span>
                  </div>
                  <div style={{ height:4, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:10 }}>
                    <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.blue},#60a5fa,${C.blue})`, backgroundSize:"200% 100%", width:`${pct}%`, transition:"width 0.45s ease", animation:"shimmer 2s linear infinite" }}/>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {NB_AI_STEPS.map((s,i)=>(
                      <span key={i} style={{ fontSize:9, fontFamily:C.mono, color:i<aiStep?C.green:i===aiStep?C.blue:C.g3, transition:"color 0.3s" }}>
                        {i<aiStep?"✓ ":i===aiStep?"● ":"○ "}{i===aiStep?s.replace("...",""):""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skip CTA */}
              {phase==="intake" && (
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button onClick={()=>setPhase("done")} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"8px 18px", color:C.g2, fontSize:11, cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                    onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                    Passer → Fiche vide
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ PHASE: DONE — FICHE BIEN ══ */}
          {phase==="done" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.45s cubic-bezier(0.2,0.8,0.2,1)" }}>

              {/* Success banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:13, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:bienErr?C.yellow:C.green, marginBottom:2 }}>{bienErr?"Extraction partielle":"Scan terminé"} — {Object.values(files).reduce((s,a)=>s+a.length,0)} document{Object.values(files).reduce((s,a)=>s+a.length,0)>1?"s":""} traité{Object.values(files).reduce((s,a)=>s+a.length,0)>1?"s":""}</p>
                  <p style={{ fontSize:11, color:C.g2 }}>Vérifiez et complétez les champs vides avant de valider.</p>
                </div>
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <p style={{ fontSize:20, fontWeight:800, color:bienConf>=70?C.green:bienConf>=40?C.yellow:C.red }}>{bienConf}%</p>
                  <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>CONFIANCE</p>
                </div>
              </div>

              {/* Bien header */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:C.blueSub, border:"1.5px solid rgba(0,123,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>
                    <I.Home/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <input value={formData.name} onChange={e=>upd("name",e.target.value)} placeholder="Nom du bien" style={{ background:"transparent", border:"none", outline:"none", fontSize:17, fontWeight:800, color:C.w, letterSpacing:"-0.02em", width:"100%" }}/>
                    </div>
                    <p style={{ fontSize:11, color:C.g2 }}>{[formData.addr, formData.ville, formData.surface?formData.surface+" m²":null, formData.year?"Construit en "+formData.year:null].filter(Boolean).join(" · ")||"Complétez les informations ci-dessous"}</p>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["Nouveau","Non loué"].map((b,i)=>(
                      <span key={i} style={{ fontSize:9, fontFamily:C.mono, color:i===0?C.blue:C.yellow, background:i===0?C.blueSub:"rgba(245,158,11,0.1)", border:`1px solid ${i===0?"rgba(0,123,255,0.25)":"rgba(245,158,11,0.25)"}`, padding:"3px 8px", borderRadius:4 }}>{b}</span>
                    ))}
                  </div>
                </div>

                {/* Form sub-tabs */}
                <div style={{ display:"flex", gap:2, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                  {FORM_TABS.map(t=>{
                    const active=formTab===t;
                    return(
                      <button key={t} onClick={()=>setFormTab(t)} style={{ background:active?C.blueSub:"transparent", border:active?"1px solid rgba(0,123,255,0.25)":"1px solid transparent", borderRadius:7, padding:"6px 14px", fontSize:11, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", transition:"all 0.15s" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TAB: CARACTÉRISTIQUES ── */}
              {formTab==="Caractéristiques" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                  {/* ═══ 1. IDENTITÉ & TYPE DE BIEN ═══ */}
                  <SecLabel label="1 · IDENTITÉ & TYPE DE BIEN"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Home} label="Nom / Identifiant" value={formData.name} full placeholder="Ex : Le Loft d'Eysines" onChange={v=>upd("name",v)} ocrFilled={ocrFields.name}/>
                    <NbSelect icon={I.Home2} label="Type de bien" value={formData.type} onChange={v=>upd("type",v)} ocrFilled={ocrFields.type}
                      options={["Appartement","Maison","Studio","Loft","Chambre","Château","Mobil-Home","Caravane","Atelier","Boutique","Box de stockage","Bureaux","Bureau partagé","Cave","Chalet","Commerce","Entrepôt","Garage","Grenier","Hôtel Particulier","Local professionnel","Local commercial","Parking","Terrain","Autre"]}/>
                    <NbField icon={I.Tag} label="Référence interne" value={formData.identifiant} placeholder="N° unique ou code" onChange={v=>upd("identifiant",v)} ocrFilled={ocrFields.identifiant}/>
                    <NbColor label="Couleur de référence" value={formData.couleur} onChange={v=>upd("couleur",v)}/>
                  </div>

                  {/* ═══ 2. LOCALISATION COMPLÈTE ═══ */}
                  <SecLabel label="2 · LOCALISATION"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbFieldAddress icon={I.MapPin} label="Adresse (n° et rue)" value={formData.addr} full placeholder="12 Rue de la République" onChange={v=>upd("addr",v)} ocrFilled={ocrFields.addr} onSelect={s=>{upd("addr",s.addr);upd("ville",s.ville);upd("codePostal",s.codePostal);if(s.region)upd("region",s.region);}}/>
                    <NbField icon={I.MapPin} label="Complément d'adresse" value={formData.addr2} full placeholder="Résidence, Adresse 2" onChange={v=>upd("addr2",v)} ocrFilled={ocrFields.addr2}/>
                    <NbField icon={I.Building} label="Bâtiment" value={formData.batiment} placeholder="Bât A" onChange={v=>upd("batiment",v)} ocrFilled={ocrFields.batiment}/>
                    <NbField icon={I.Building} label="Escalier" value={formData.escalier} placeholder="Esc 2" onChange={v=>upd("escalier",v)}/>
                    <NbField icon={I.Building} label="Étage" value={formData.etage} placeholder="3e étage" onChange={v=>upd("etage",v)}/>
                    <NbField icon={I.Grid} label="N° de porte / lot" value={formData.porteLot} placeholder="Porte 12 / Lot 45" onChange={v=>upd("porteLot",v)} ocrFilled={ocrFields.porteLot}/>
                    <NbField icon={I.MapPin} label="Ville" value={formData.ville} placeholder="Bordeaux" onChange={v=>upd("ville",v)} ocrFilled={ocrFields.ville}/>
                    <NbField icon={I.MapPin} label="Code postal" value={formData.codePostal} placeholder="33000" onChange={v=>upd("codePostal",v)} ocrFilled={ocrFields.codePostal}/>
                    <NbField icon={I.MapPin} label="Région" value={formData.region} placeholder="Nouvelle-Aquitaine" onChange={v=>upd("region",v)} ocrFilled={ocrFields.region}/>
                    <NbSelect icon={I.Globe} label="Pays" value={formData.pays} onChange={v=>upd("pays",v)} ocrFilled={ocrFields.pays}
                      options={["France","Belgique","Suisse","Luxembourg","Monaco","Canada","Maroc","Tunisie","Sénégal","Côte d'Ivoire","Autre"]}/>
                  </div>

                  {/* ═══ 3. DESCRIPTIF TECHNIQUE ═══ */}
                  <SecLabel label="3 · DESCRIPTIF TECHNIQUE"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Ruler} label="Superficie" value={formData.surface} unit="m²" placeholder="65" onChange={v=>upd("surface",v)} ocrFilled={ocrFields.surface}/>
                    <NbField icon={I.Grid} label="Nombre de pièces" value={formData.rooms} placeholder="T1, T2, T3…" onChange={v=>upd("rooms",v)} ocrFilled={ocrFields.rooms}/>
                    <NbField icon={I.Grid} label="Nombre de chambres" value={formData.chambres} placeholder="2" onChange={v=>upd("chambres",v)} ocrFilled={ocrFields.chambres}/>
                    <NbField icon={I.Grid} label="Salles de bain" value={formData.sdb} placeholder="1" onChange={v=>upd("sdb",v)} ocrFilled={ocrFields.sdb}/>
                    <NbField icon={I.Calendar} label="Année de construction" value={formData.year} placeholder="1975" onChange={v=>upd("year",v)} ocrFilled={ocrFields.year}/>
                  </div>
                  <NbTextarea icon={I.FileText} label="Description détaillée" value={formData.description} full placeholder="Texte descriptif pour les annonces ou le contrat de location : confort, particularités, équipements…" rows={4} onChange={v=>upd("description",v)} ocrFilled={ocrFields.description}/>

                  {/* ═══ 4. PARAMÈTRES DE LOCATION ═══ */}
                  <SecLabel label="4 · PARAMÈTRES DE LOCATION"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbSelect icon={I.Activity} label="État locatif" value={formData.etatLocatif} onChange={v=>upd("etatLocatif",v)} ocrFilled={ocrFields.etatLocatif}
                      options={["Automatique","Disponible","Loué","Préavis / Départ","En recherche de locataire","Indisponible","Travaux"]}/>
                    <NbSelect icon={I.Home2} label="Type de location" value={formData.typeLocation} onChange={v=>upd("typeLocation",v)} ocrFilled={ocrFields.typeLocation}
                      options={["Meublée","Vide","Saisonnière"]}/>
                  </div>
                  {/* Durées */}
                  <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                      <I.Calendar/>
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DURÉES PROPOSÉES</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <NbSelect label="Durée minimale" value={formData.dureeMin} onChange={v=>upd("dureeMin",v)}
                        options={["1 mois","2 mois","3 mois","6 mois","9 mois","12 mois","18 mois","24 mois","36 mois"]}/>
                      <NbSelect label="Durée maximale" value={formData.dureeMax} onChange={v=>upd("dureeMax",v)}
                        options={["1 an","2 ans","3 ans","4 ans","5 ans","6 ans","7 ans","8 ans","9 ans"]}/>
                    </div>
                  </div>
                  {/* Conditions financières cibles */}
                  <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                      <I.Euro/>
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>CONDITIONS FINANCIÈRES CIBLES</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      <NbField icon={I.Euro} label="Loyer hors charges" value={formData.loyer} unit="€" accent placeholder="850" onChange={v=>upd("loyer",v)} ocrFilled={ocrFields.loyer}/>
                      <NbField icon={I.Euro} label="Charges locatives" value={formData.chargesLocatives} unit="€" placeholder="80" onChange={v=>upd("chargesLocatives",v)} ocrFilled={ocrFields.chargesLocatives}/>
                      <NbField icon={I.Euro} label="Dépôt de garantie" value={formData.depotGarantie} unit="€" placeholder="850" onChange={v=>upd("depotGarantie",v)}/>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbSelect icon={I.Calendar} label="Fréquence de paiement" value={formData.frequencePaiement} onChange={v=>upd("frequencePaiement",v)} ocrFilled={ocrFields.frequencePaiement}
                      options={["Mensuel","Bimestriel","Trimestriel","Quadrimestriel","Semestriel","Annuel","Forfaitaire"]}/>
                    <NbSelect icon={I.Users} label="Mode locatif / fiscal" value={formData.mode} onChange={v=>upd("mode",v)} ocrFilled={ocrFields.mode}
                      options={["LMNP (meublé)","Location nue","SCI à l'IR","SCI à l'IS","Colocation","Sous-location","Autre"]}/>
                  </div>

                  {/* ═══ 5. PERFORMANCE ÉNERGÉTIQUE ═══ */}
                  <SecLabel label="5 · PERFORMANCE ÉNERGÉTIQUE (DPE)"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbSelect icon={I.Leaf} label="Classe énergie (DPE)" value={formData.dpe} onChange={v=>upd("dpe",v)} ocrFilled={ocrFields.dpe}
                      options={["A","B","C","D","E","F","G"]}/>
                    <NbSelect icon={I.Leaf} label="Gaz à effet de serre (GES)" value={formData.ges} onChange={v=>upd("ges",v)} ocrFilled={ocrFields.ges}
                      options={["A","B","C","D","E","F","G"]}/>
                  </div>
                  <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                      <I.Euro/>
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DÉPENSES ANNUELLES D'ÉNERGIE (FOURCHETTE)</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      <NbField icon={I.Euro} label="Estimation basse" value={formData.depensesEnergieMin} unit="€/an" mono placeholder="800" onChange={v=>upd("depensesEnergieMin",v)}/>
                      <NbField icon={I.Euro} label="Estimation haute" value={formData.depensesEnergieMax} unit="€/an" mono placeholder="1 400" onChange={v=>upd("depensesEnergieMax",v)} ocrFilled={ocrFields.depensesEnergieMax}/>
                      <NbSelect label="Année de référence" value={formData.anneeRefPrix} onChange={v=>upd("anneeRefPrix",v)} ocrFilled={ocrFields.anneeRefPrix}
                        options={["2021","2022","2023","2024","2025","2026"]}/>
                    </div>
                  </div>

                  {/* ═══ PARTIES ET INTERVENANTS ═══ */}
                  <SecLabel label="PARTIES ET INTERVENANTS"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.User}     label="Vendeur"          value={formData.vendeur}  placeholder="Nom ou société" onChange={v=>upd("vendeur",v)} ocrFilled={ocrFields.vendeur}/>
                    <NbField icon={I.Briefcase} label="Notaire en charge" value={formData.notaire} placeholder="Maître…" onChange={v=>upd("notaire",v)} ocrFilled={ocrFields.notaire}/>
                  </div>
                </div>
              )}

              {/* ── TAB: FINANCES & FISCALITÉ ── */}
              {formTab==="Finances & Fiscalité" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <SecLabel label="Coût d'acquisition"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Calendar} label="Date d'acquisition"      value={formData.dateAcq}      type="date" placeholder="" onChange={v=>upd("dateAcq",v)} ocrFilled={ocrFields.dateAcq}/>
                    <NbField icon={I.Euro}     label="Prix net vendeur"         value={formData.prixBien} unit="€" accent mono onChange={v=>upd("prixBien",v)} ocrFilled={ocrFields.prixBien}/>
                    <NbField icon={I.FileText} label="Frais de notaire"         value={formData.fraisNotaire} unit="€" mono onChange={v=>upd("fraisNotaire",v)} ocrFilled={ocrFields.fraisNotaire}/>
                    <NbField icon={I.Tag}      label="Frais d'agence"           value={formData.fraisAgence}  unit="€" mono onChange={v=>upd("fraisAgence",v)} ocrFilled={ocrFields.fraisAgence}/>
                    <NbField icon={I.Ruler}    label="Ameublement / travaux"    value={formData.ameublement}  unit="€" mono onChange={v=>upd("ameublement",v)} ocrFilled={ocrFields.ameublement}/>
                    {/* Total */}
                    <div style={{ gridColumn:"span 2", background:"rgba(0,123,255,0.05)", border:"1px solid rgba(0,123,255,0.18)", borderRadius:10, padding:"10px 13px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, letterSpacing:"0.1em" }}>COÛT TOTAL CALCULÉ</span>
                      <span style={{ fontSize:15, fontWeight:800, color:C.w, fontFamily:C.mono }}>
                        {(()=>{ const parse=s=>parseInt(String(s||"0").replace(/[^\d]/g,""),10)||0; return (parse(formData.prixBien)+parse(formData.fraisNotaire)+parse(formData.fraisAgence)+parse(formData.ameublement)).toLocaleString("fr-FR"); })()} €
                      </span>
                    </div>
                  </div>

                  <SecLabel label="Charges & Fiscalité"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Euro}     label="Taxe foncière"         value={formData.taxeFonciere}  unit="€/an" mono onChange={v=>upd("taxeFonciere",v)} ocrFilled={ocrFields.taxeFonciere}/>
                    <NbField icon={I.Building} label="Charges de copropriété" value={formData.chargesCopro} unit="€/an" mono onChange={v=>upd("chargesCopro",v)} ocrFilled={ocrFields.chargesCopro}/>
                  </div>

                  <SecLabel label="Régime fiscal"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {REGIMES.filter(r=>TOP5.includes(r.id)).map(r=>{
                      const active = formData.regime && r.id===formData.regime; const isOcr = ocrFields.regime && active;
                      return(
                        <div key={r.id} onClick={()=>upd("regime",r.id)} style={{ background:active?"rgba(0,123,255,0.10)":"#0a0a0a", border:`1.5px solid ${active?C.blue:C.border}`, borderRadius:9, padding:"10px 12px", cursor:"pointer", transition:"all 0.15s" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:active?C.blue:C.w }}>{r.label}</span>
                            {isOcr&&<span style={{ fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
                          </div>
                          <span style={{ fontSize:9.5, color:active?C.g1:C.g3 }}>{r.sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validate CTA */}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
                <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"10px 20px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                  Annuler
                </button>
                <button
                  disabled={confirmed}
                  onClick={()=>{
                    if(confirmed) return;
                    // Build structured asset from OCR data
                    const parse = s => parseInt(String(s||"0").replace(/[^\d]/g,""),10)||0;
                    const p = parse(formData.prixBien);
                    const fn= parse(formData.fraisNotaire);
                    const fa= parse(formData.fraisAgence);
                    const am= parse(formData.ameublement);
                    const tc= parse(formData.taxeFonciere);
                    const cc= parse(formData.chargesCopro);
                    const loyer= parse(formData.loyer);
                    const cl = parse(formData.chargesLocatives);
                    const newAsset = {
                      name:      formData.name,
                      type:      formData.type,
                      identifiant: formData.identifiant,
                      couleur:   formData.couleur,
                      addr:      formData.addr,
                      addr2:     formData.addr2,
                      batiment:  formData.batiment,
                      porteLot:  formData.porteLot,
                      ville:     formData.ville,
                      codePostal: formData.codePostal,
                      region:    formData.region,
                      pays:      formData.pays,
                      surface:   formData.surface,
                      escalier:  formData.escalier,
                      etage:     formData.etage,
                      rooms:     formData.rooms,
                      chambres:  formData.chambres,
                      sdb:       formData.sdb,
                      year:      parseInt(formData.year)||new Date().getFullYear(),
                      description: formData.description,
                      dpe:       formData.dpe,
                      ges:       formData.ges,
                      depensesEnergie: formData.depensesEnergie,
                      anneeRefPrix: formData.anneeRefPrix,
                      etatLocatif: formData.etatLocatif,
                      typeLocation: formData.typeLocation,
                      loyer:     formData.loyer,
                      chargesLocatives: cl,
                      depotGarantie: parse(formData.depotGarantie),
                      dureeMin:  formData.dureeMin,
                      dureeMax:  formData.dureeMax,
                      depensesEnergieMin: formData.depensesEnergieMin,
                      depensesEnergieMax: formData.depensesEnergieMax,
                      frequencePaiement: formData.frequencePaiement,
                      mode:      formData.mode,
                      rent:      formData.loyer,
                      capital:   "+0 €",
                      ltv:       0,
                      statut:    formData.etatLocatif||"Disponible",
                      prixBien:     p,
                      fraisAgence:  fa,
                      ameublement:  am,
                      fraisNotaire: fn,
                      vl:           Math.round((p+fn+fa+am)*1.05),
                      vlVar:        "+2.5%",
                      loyerAnnuel:  loyer*12,
                      chargesCopro: cc,
                      taxeFonciere: tc,
                    };
                    setConfirmed(true);
                    setTimeout(()=>{ onCreateAsset(newAsset); }, 900);
                  }}
                  style={{ background: confirmed ? "linear-gradient(135deg,#059669,#047857)" : `linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"10px 28px", color:"#fff", fontSize:12, fontWeight:700, cursor: confirmed?"default":"pointer", display:"flex", alignItems:"center", gap:8, boxShadow: confirmed?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`, transition:"all 0.35s", letterSpacing:"0.04em" }}
                  onMouseEnter={e=>{if(!confirmed){e.currentTarget.style.boxShadow="0 6px 32px rgba(0,123,255,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow=confirmed?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
                  {confirmed
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Bien ajouté au patrimoine !</>
                    : <><I.Save/> Créer la fiche bien</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}




/* ════════════════════════════════════════
   PATRIMOINE PAGE — LIST VIEW
════════════════════════════════════════ */

/* ════════════════════════════════════════
   NOUVEAU LOCATAIRE — SLIDE-OVER
════════════════════════════════════════ */


const OCR_SYSTEM_PROMPT = `Toute information absente ou incertaine doit être strictement retournée comme null. Toute hallucination est considérée comme une erreur critique.
Tu es un moteur d'extraction documentaire strictement déterministe.
Tu reçois du texte OCR brut ou des images de documents locataire : Carte d'identité, Fiche de paie, Justificatif de domicile.
Ta mission : Extraire uniquement les informations explicitement présentes. Ne jamais compléter, deviner, corriger ou reformater si incertain. Si doute → null. Si contradictoire → null. Si plusieurs valeurs possibles → null.

RÈGLES PAR TYPE DE DOCUMENT :
CARTE D'IDENTITÉ — Champs : nom, prenom, sexe, date_naissance, lieu_naissance, nationalite, numero_document, date_expiration. Nom = champ NOM uniquement. Prénom = champ PRÉNOM uniquement. Ne pas recalculer âge. Ne pas déduire sexe si non mentionné. Si MRZ illisible → ignorer.

FICHE DE PAIE — Champs : employeur, type_contrat, date_fiche_paie, salaire_brut, salaire_net, net_imposable, cumul_annuel_net, anciennete. Salaire brut = ligne explicitement "Brut". Salaire net = ligne explicitement "Net à payer". Ne pas calculer moyenne. Ne pas deviner CDI/CDD si absent.

JUSTIFICATIF DE DOMICILE — Champs : nom_titulaire, adresse_complete, date_document, organisme_emetteur. Adresse complète = bloc texte unique. Ne pas reconstituer code postal. Si plusieurs adresses → null.

INTERDICTIONS : Ne pas compléter un prénom abrégé. Ne pas deviner un sexe. Ne pas déduire un contrat. Ne pas calculer un revenu. Ne pas corriger une date mal lue.

FORMAT DE SORTIE : Retourne UNIQUEMENT du JSON valide, sans backticks, sans commentaire, sans phrase :
{"carte_identite":{"nom":null,"prenom":null,"sexe":null,"date_naissance":null,"lieu_naissance":null,"nationalite":null,"numero_document":null,"date_expiration":null},"fiche_paie":{"employeur":null,"type_contrat":null,"date_fiche_paie":null,"salaire_brut":null,"salaire_net":null,"net_imposable":null,"cumul_annuel_net":null,"anciennete":null},"justificatif_domicile":{"nom_titulaire":null,"adresse_complete":null,"date_document":null,"organisme_emetteur":null}}`;
const NL_AI_STEPS = [
  "Lecture des métadonnées du fichier...",
  "Extraction des données biométriques...",
  "Vérification de la cohérence des informations...",
  "Analyse de l'authenticité du document...",
  "Croisement avec les données de revenus...",
  "Calcul du score de solvabilité...",
  "Génération de la fiche locataire...",
];

/* Drop Zone */
function NLDropZone({ type, label, subLabel, Icon, files, onAddFile, analyzing, done, onRemoveFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const fileList = files || [];
  const hasFiles = fileList.length > 0;
  const handleDrop = (e) => { e.preventDefault(); setDrag(false); const dropped=[...e.dataTransfer.files]; dropped.forEach(f=>onAddFile(f)); };
  const handleInput = (e) => { [...e.target.files].forEach(f=>onAddFile(f)); e.target.value=""; };
  const stateBg = done?"rgba(16,185,129,0.06)":drag?"rgba(0,123,255,0.08)":"transparent";
  return (
    <div style={{ flex:1, position:"relative" }}>
      <input ref={ref} type="file" multiple style={{ display:"none" }} onChange={handleInput}/>
      <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={handleDrop}
        style={{ border:`1.5px dashed ${done?C.green:drag?C.blue:"#2a2a2a"}`, borderRadius:14, padding:"18px 14px 14px", textAlign:"center", cursor:"pointer", background:stateBg, transition:"all 0.25s ease", boxShadow:drag?`0 0 24px rgba(0,123,255,0.12)`:done?`0 0 16px rgba(16,185,129,0.07)`:"none", position:"relative", overflow:"hidden" }}>
        <div style={{ width:38, height:38, borderRadius:10, margin:"0 auto 10px", background:done?"rgba(16,185,129,0.12)":drag?"rgba(0,123,255,0.15)":C.blueSub, border:`1px solid ${done?"rgba(16,185,129,0.25)":drag?"rgba(0,123,255,0.35)":"rgba(0,123,255,0.18)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:done?C.green:C.blue, transition:"all 0.25s" }}>
          {analyzing ? <div style={{ animation:"spin 1s linear infinite", color:C.blue }}><I.Loader/></div> : done ? <I.CheckCircle/> : <Icon/>}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:done?C.green:C.w, marginBottom:2 }}>{done?`${fileList.length} fichier${fileList.length>1?"s":""}`:label}</p>
        {!hasFiles&&<p style={{ fontSize:9, color:C.g2, lineHeight:1.5 }}>{subLabel}</p>}
        {hasFiles&&(
          <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3, textAlign:"left" }}>
            {fileList.map((f,fi)=>(
              <div key={fi} style={{ display:"flex", alignItems:"center", gap:5, background:"#0d0d0f", borderRadius:6, padding:"4px 6px" }}>
                <I.File/>
                <span style={{ fontSize:8, color:C.g1, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:C.mono }}>{f.name}</span>
                <button onClick={(e)=>{e.stopPropagation();onRemoveFile(fi);}}
                  style={{ background:"none", border:"none", cursor:"pointer", color:C.red, display:"flex", alignItems:"center", padding:0, flexShrink:0, opacity:0.6, transition:"opacity 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>
                  <I.X/>
                </button>
              </div>
            ))}
          </div>
        )}
        {analyzing&&<div style={{ marginTop:8 }}><div style={{ height:2, background:"#1f1f1f", borderRadius:99, overflow:"hidden" }}><div style={{ height:"100%", background:`linear-gradient(90deg,${C.blue},#60a5fa)`, borderRadius:99, animation:"scanBar 1.4s ease-in-out infinite alternate", width:"60%" }}/></div></div>}
        {!analyzing&&<div style={{ marginTop:hasFiles?6:10, display:"flex", alignItems:"center", justifyContent:"center", gap:4, opacity:.4 }}><I.Upload2/><span style={{ fontSize:8, color:C.g2 }}>{hasFiles?"+ Ajouter":"Glisser ou cliquer"}</span></div>}
      </div>
      <div style={{ position:"absolute", top:8, right:8, fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:done?C.green:C.blue, background:done?C.greenSub:C.blueSub, border:`1px solid ${done?"rgba(16,185,129,0.22)":"rgba(0,123,255,0.2)"}`, padding:"2px 6px", borderRadius:4 }}>{type}{hasFiles?` · ${fileList.length}`:""}</div>
    </div>
  );
}

/* AI Progress */
function NLAIProgress({ step, total, label }) {
  const pct = Math.round((step/total)*100);
  return (
    <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{ width:26, height:26, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, animation:"spin 1.2s linear infinite" }}><I.Loader/></div>
        <div><p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue, marginBottom:1 }}>ANALYSE IA EN COURS</p><p style={{ fontSize:12, color:C.w, fontWeight:600 }}>{label}</p></div>
        <span style={{ marginLeft:"auto", fontSize:13, fontWeight:800, color:C.blue, fontFamily:C.mono }}>{pct}%</span>
      </div>
      <div style={{ height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:8 }}>
        <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.blue},#60a5fa,${C.blue})`, backgroundSize:"200% 100%", width:`${pct}%`, transition:"width 0.4s ease", animation:"shimmer 2s linear infinite" }}/>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {NL_AI_STEPS.map((s,i)=>(
          <span key={i} style={{ fontSize:9, fontFamily:C.mono, color:i<step?C.green:i===step?C.blue:C.g3, transition:"color 0.3s" }}>
            {i<step?"✓ ":i===step?"● ":"○ "}{i===step?s.split("...")[0]:""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* NL DataTile */
function NLDataTile({ icon:TIcon, label, value, accent, full, highlight }) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ background:highlight?"rgba(0,123,255,0.05)":"#0a0a0a", border:`1px solid ${highlight?"rgba(0,123,255,0.2)":C.border}`, borderRadius:10, padding:"12px 14px", gridColumn:full?"span 2":"span 1", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, fontWeight:700, color:accent?C.blue:C.w }}>{value}</span>
        <div style={{ position:"relative" }} onMouseEnter={()=>setTip(true)} onMouseLeave={()=>setTip(false)}>
          <div style={{ width:16, height:16, borderRadius:"50%", background:C.blueSub, border:"1px solid rgba(0,123,255,0.22)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"default", color:C.blue }}><I.Check/></div>
          {tip&&<div style={{ position:"absolute", bottom:"calc(100% + 6px)", right:0, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:6, padding:"4px 8px", fontSize:9, color:C.g1, whiteSpace:"nowrap", zIndex:100, boxShadow:"0 8px 24px rgba(0,0,0,0.5)", pointerEvents:"none" }}>✓ Extrait par IA · OCR vérifié</div>}
        </div>
      </div>
    </div>
  );
}

/* NL SectionTitle */
function NLSectionTitle({ label, icon:TIcon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
      {TIcon&&<span style={{ color:C.blue }}><TIcon/></span>}
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

/* Profile Tab */
function NLProfileTab({ data, confidence }) {
  const ci = data?.carte_identite || {};
  const fp = data?.fiche_paie || {};
  const v = (x) => x || "—";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.07),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.14)", borderRadius:11, padding:"13px 15px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:24, height:24, borderRadius:6, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
        <div style={{ flex:1 }}><p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue, marginBottom:1 }}>EXTRACTION IA · CONFIANCE {confidence||0}%</p><p style={{ fontSize:11, color:C.g1 }}>Données extraites par OCR déterministe. Les champs « — » n'ont pas été trouvés.</p></div>
        <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:7, padding:"4px 10px", color:C.g2, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}><I.Edit/> Éditer</button>
      </div>
      <div>
        <NLSectionTitle label="Identité civile" icon={I.Users}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          <NLDataTile icon={I.Users}    label="Sexe"              value={v(ci.sexe)}/>
          <NLDataTile icon={I.Users}    label="Prénom"            value={v(ci.prenom)} highlight={!!ci.prenom}/>
          <NLDataTile icon={I.Users}    label="Nom de famille"    value={v(ci.nom)} highlight={!!ci.nom}/>
          <NLDataTile icon={I.Calendar} label="Date de naissance" value={v(ci.date_naissance)}/>
          <NLDataTile icon={I.MapPin}   label="Lieu de naissance" value={v(ci.lieu_naissance)}/>
          <NLDataTile icon={I.Globe}    label="Nationalité"       value={v(ci.nationalite)}/>
          <NLDataTile icon={I.ID}       label="N° document"       value={v(ci.numero_document)}/>
          <NLDataTile icon={I.Calendar} label="Expiration"        value={v(ci.date_expiration)}/>
        </div>
      </div>
      <div>
        <NLSectionTitle label="Situation professionnelle" icon={I.Briefcase}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          <NLDataTile icon={I.Briefcase} label="Employeur"         value={v(fp.employeur)} full/>
          <NLDataTile icon={I.Briefcase} label="Type de contrat"   value={v(fp.type_contrat)}/>
          <NLDataTile icon={I.Euro}      label="Salaire net"       value={v(fp.salaire_net)} accent/>
          <NLDataTile icon={I.Euro}      label="Salaire brut"      value={v(fp.salaire_brut)}/>
          <NLDataTile icon={I.Euro}      label="Net imposable"     value={v(fp.net_imposable)}/>
          <NLDataTile icon={I.Euro}      label="Ancienneté"        value={v(fp.anciennete)}/>
          <NLDataTile icon={I.Calendar}  label="Date fiche"        value={v(fp.date_fiche_paie)}/>
          <NLDataTile icon={I.Euro}      label="Cumul annuel net"  value={v(fp.cumul_annuel_net)}/>
        </div>
      </div>
    </div>
  );
}

/* Documents Tab */
function NLDocumentsTab({ files }) {
  const [hovD, setHovD] = useState(null);
  const fmtSize = (f) => { if(!f) return "—"; const kb = f.size/1024; return kb>1024? (kb/1024).toFixed(1)+" Mo" : Math.round(kb)+" Ko"; };
  const docList = [
    ...(files?.cni||[]).map((f,i)=>({ id:`cni-${i}`, file:f, type:"CNI", label:"Carte d'identité" })),
    ...(files?.revenus||[]).map((f,i)=>({ id:`rev-${i}`, file:f, type:"Revenus", label:"Fiche de paie" })),
    ...(files?.domicile||[]).map((f,i)=>({ id:`dom-${i}`, file:f, type:"Domicile", label:"Justificatif domicile" })),
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <NLSectionTitle label={`Dossier numérique · ${docList.length} document${docList.length>1?"s":""}`} icon={I.File}/>
      <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"28px 2fr 0.7fr 0.7fr 1fr", gap:10, padding:"9px 14px", background:"#080808", borderBottom:`1px solid ${C.border}` }}>
          {["","Fichier","Type","Taille","Statut"].map((h,i)=><span key={i} style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, textTransform:"uppercase" }}>{h}</span>)}
        </div>
        {docList.map(d=>(
          <div key={d.id} onMouseEnter={()=>setHovD(d.id)} onMouseLeave={()=>setHovD(null)}
            style={{ display:"grid", gridTemplateColumns:"28px 2fr 0.7fr 0.7fr 1fr", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:`1px solid ${C.border}`, background:hovD===d.id?"#111":"transparent", transition:"background 0.15s" }}>
            <div style={{ width:28, height:28, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.File/></div>
            <div><p style={{ fontSize:11, fontWeight:600, color:C.w, marginBottom:1 }}>{d.file.name}</p><p style={{ fontSize:9, color:C.g2, fontFamily:C.mono }}>{d.label}</p></div>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.18)", padding:"2px 6px", borderRadius:4 }}>{d.type}</span>
            <span style={{ fontSize:10, color:C.g1, fontFamily:C.mono }}>{fmtSize(d.file)}</span>
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.greenSub, border:`1px solid ${C.greenBord}`, borderRadius:99, padding:"3px 8px" }}>
              <I.Shield/><span style={{ fontSize:8, fontFamily:C.mono, color:C.green, letterSpacing:"0.06em", fontWeight:700 }}>TRAITÉ</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Coordonnées Tab */
function NLCoordonneesTab({ data }) {
  const jd = data?.justificatif_domicile || {};
  const v = (x) => x || "—";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <NLSectionTitle label="Adresse actuelle (extraite du justificatif)" icon={I.MapPin}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <NLDataTile icon={I.Users}  label="Nom titulaire"    value={v(jd.nom_titulaire)} full/>
        <NLDataTile icon={I.MapPin} label="Adresse complète" value={v(jd.adresse_complete)} full/>
        <NLDataTile icon={I.Calendar} label="Date document"  value={v(jd.date_document)}/>
        <NLDataTile icon={I.Building} label="Émetteur"       value={v(jd.organisme_emetteur)}/>
      </div>
    </div>
  );
}

/* Garants Tab */
// NL_GARANT: now extracted dynamically via OCR

function NLGarantsTab({ garantsOcr, garants }) {
  if (!garantsOcr || garantsOcr.length === 0) {
    return (
      <div style={{ padding:"32px 0", textAlign:"center" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#818cf8", marginBottom:12 }}><I.Users/></div>
        <p style={{ fontSize:13, color:C.g2 }}>Aucun garant ajouté</p>
        <p style={{ fontSize:11, color:C.g3, marginTop:4 }}>Les garants peuvent être ajoutés lors du dépôt des documents.</p>
      </div>
    );
  }
  const v = (x) => x || "—";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {garantsOcr.map((gd, gi) => {
        const ci = gd?.carte_identite || {};
        const fp = gd?.fiche_paie || {};
        const jd = gd?.justificatif_domicile || {};
        const initials = (ci.prenom||"?")[0].toUpperCase() + (ci.nom||"?")[0].toUpperCase();
        const allVals = [...Object.values(ci),...Object.values(fp),...Object.values(jd)];
        const conf = allVals.length>0 ? Math.round(allVals.filter(x=>x!==null&&x!=="").length/allVals.length*100) : 0;
        const score = conf>=70?"A+":conf>=50?"B+":conf>=30?"C":"—";
        const col = conf>=50?"#10B981":"#F59E0B";
        return (
          <div key={gi} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"16px 18px", background:"rgba(99,102,241,0.03)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#818cf8", flexShrink:0 }}>{initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>{v(ci.prenom)} {v(ci.nom)}</span>
                  <span style={{ fontSize:8, fontFamily:C.mono, color:"#818cf8", background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", padding:"2px 7px", borderRadius:4 }}>GARANT {gi+1}</span>
                </div>
                <span style={{ fontSize:11, color:C.g2 }}>{[fp.employeur, fp.salaire_net?fp.salaire_net+"/mois":null, fp.type_contrat].filter(Boolean).join(" · ")||"Données extraites par OCR"}</span>
              </div>
              <div style={{ width:38, height:38, borderRadius:"50%", background:`${col}18`, border:`1px solid ${col}40`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:13, fontWeight:800, color:col }}>{score}</span></div>
            </div>
            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
              <NLSectionTitle label="Identité civile" icon={I.Users}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <NLDataTile icon={I.Users}    label="Sexe"              value={v(ci.sexe)}/>
                <NLDataTile icon={I.Users}    label="Prénom"            value={v(ci.prenom)} highlight={!!ci.prenom}/>
                <NLDataTile icon={I.Users}    label="Nom de famille"    value={v(ci.nom)} highlight={!!ci.nom}/>
                <NLDataTile icon={I.Calendar} label="Date naissance"    value={v(ci.date_naissance)}/>
                <NLDataTile icon={I.MapPin}   label="Lieu naissance"    value={v(ci.lieu_naissance)}/>
                <NLDataTile icon={I.Globe}    label="Nationalité"       value={v(ci.nationalite)}/>
              </div>
              <NLSectionTitle label="Situation professionnelle" icon={I.Briefcase}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <NLDataTile icon={I.Briefcase} label="Employeur"         value={v(fp.employeur)} full/>
                <NLDataTile icon={I.Briefcase} label="Type de contrat"   value={v(fp.type_contrat)}/>
                <NLDataTile icon={I.Euro}      label="Salaire net"       value={v(fp.salaire_net)} accent/>
                <NLDataTile icon={I.Euro}      label="Ancienneté"        value={v(fp.anciennete)}/>
              </div>
              <NLSectionTitle label="Domicile" icon={I.MapPin}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <NLDataTile icon={I.MapPin}    label="Adresse"           value={v(jd.adresse_complete)} full/>
                <NLDataTile icon={I.Building}  label="Émetteur"          value={v(jd.organisme_emetteur)}/>
                <NLDataTile icon={I.Calendar}  label="Date document"     value={v(jd.date_document)}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const NL_SUBTABS = ["Profil & Identité","Garants","Dossier Numérique","Coordonnées"];

/* ── NouveauLocataire Slide-Over ── */
function NouveauLocatairePanel({ onClose, onSave }) {
  const [files,     setFiles]     = useState({ cni:[], revenus:[], domicile:[] });
  const [filesB64,  setFilesB64]  = useState({ cni:[], revenus:[], domicile:[] });
  const [phase,     setPhase]     = useState("intake");
  const [aiStep,    setAiStep]    = useState(0);
  const [aiLabel,   setAiLabel]   = useState(NL_AI_STEPS[0]);
  const [subtab,    setSubtab]    = useState("Profil & Identité");
  const [validated, setValidated] = useState(false);
  const [analyzing, setAnalyzing] = useState({ cni:false, revenus:false, domicile:false });
  const [done,      setDone]      = useState({ cni:false, revenus:false, domicile:false });
  const [ocrData,   setOcrData]   = useState(null);
  const [ocrError,  setOcrError]  = useState(null);
  const [ocrConf,   setOcrConf]   = useState(0);

  // Read file as base64
  const readB64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const handleFile = async (zone, file) => {
    setFiles(f=>({...f,[zone]:[...f[zone], file]}));
    setAnalyzing(a=>({...a,[zone]:true}));
    try {
      const b64 = await readB64(file);
      setFilesB64(f=>({...f,[zone]:[...f[zone], b64]}));
    } catch(e) { console.error("File read error:", e); }
    setTimeout(()=>{ setAnalyzing(a=>({...a,[zone]:false})); setDone(d=>({...d,[zone]:true})); }, 1800);
  };

  const removeFile = (zone, index) => {
    setFiles(f=>{
      const arr = f[zone].filter((_,i)=>i!==index);
      if(arr.length===0) setDone(d=>({...d,[zone]:false}));
      return {...f,[zone]:arr};
    });
    setFilesB64(f=>({...f,[zone]:f[zone].filter((_,i)=>i!==index)}));
  };

  // ── GARANTS STATE ──
  const emptyG = () => ({ id:Date.now(), files:{cni:[],revenus:[],domicile:[]}, filesB64:{cni:[],revenus:[],domicile:[]}, analyzing:{cni:false,revenus:false,domicile:false}, done:{cni:false,revenus:false,domicile:false} });
  const [garants, setGarants] = useState([]);
  const [garantsOcr, setGarantsOcr] = useState([]);

  const addGarant = () => setGarants(g=>[...g, emptyG()]);

  const removeGarant = (gid) => setGarants(g=>g.filter(x=>x.id!==gid));

  const handleGarantFile = async (gid, zone, file) => {
    setGarants(g=>g.map(x=>x.id!==gid?x:{...x, files:{...x.files,[zone]:[...x.files[zone],file]}, analyzing:{...x.analyzing,[zone]:true}}));
    try {
      const b64 = await readB64(file);
      setGarants(g=>g.map(x=>x.id!==gid?x:{...x, filesB64:{...x.filesB64,[zone]:[...x.filesB64[zone],b64]}}));
    } catch(e) { console.error("Garant file read error:", e); }
    setTimeout(()=>{
      setGarants(g=>g.map(x=>x.id!==gid?x:{...x, analyzing:{...x.analyzing,[zone]:false}, done:{...x.done,[zone]:true}}));
    }, 1800);
  };

  const removeGarantFile = (gid, zone, index) => {
    setGarants(g=>g.map(x=>{
      if(x.id!==gid) return x;
      const arr = x.files[zone].filter((_,i)=>i!==index);
      const b64arr = x.filesB64[zone].filter((_,i)=>i!==index);
      return {...x, files:{...x.files,[zone]:arr}, filesB64:{...x.filesB64,[zone]:b64arr}, done:{...x.done,[zone]:arr.length>0}, analyzing:{...x.analyzing,[zone]:false}};
    }));
  };

  const isGarantReady = (g) => g.done.cni && g.done.revenus && g.done.domicile && g.filesB64.cni.length>0 && g.filesB64.revenus.length>0 && g.filesB64.domicile.length>0;
  const allGarantsReady = garants.length === 0 || garants.every(isGarantReady);
  const totalDocs = 3 + garants.length * 3;
  const doneDocs = [files.cni,files.revenus,files.domicile].filter(a=>a.length>0).length + garants.reduce((s,g)=>[g.files.cni,g.files.revenus,g.files.domicile].filter(a=>a.length>0).length+s,0);

  // Call Claude API for OCR extraction when all docs are ready
  const runOCR = useCallback(async () => {
    setPhase("analyzing");
    setAiStep(0); setAiLabel(NL_AI_STEPS[0]);

    // Progress animation
    let step = 0;
    const iv = setInterval(() => {
      step++;
      if (step < NL_AI_STEPS.length) { setAiStep(step); setAiLabel(NL_AI_STEPS[step]); }
    }, 600);

    // Helper for garant docs (must be outside try for finally access)
    const addDoc2 = (arr, b64, name, mimeHint) => {
      if (!b64) return;
      const isPdf = name?.toLowerCase().endsWith(".pdf");
      const mime = isPdf ? "application/pdf" : (mimeHint || "image/jpeg");
      arr.push(isPdf ? { type: "document", source: { type: "base64", media_type: mime, data: b64 } } : { type: "image", source: { type: "base64", media_type: mime, data: b64 } });
    };

    try {
      const docs = [];
      const addDoc = (b64, name, mimeHint) => {
        if (!b64) return;
        const isPdf = name?.toLowerCase().endsWith(".pdf");
        const mime = isPdf ? "application/pdf" : (mimeHint || "image/jpeg");
        if (isPdf) {
          docs.push({ type: "document", source: { type: "base64", media_type: mime, data: b64 } });
        } else {
          docs.push({ type: "image", source: { type: "base64", media_type: mime, data: b64 } });
        }
      };

      // Tenant documents (multiple per zone)
      filesB64.cni.forEach((b,i) => addDoc(b, files.cni[i]?.name, files.cni[i]?.type));
      filesB64.revenus.forEach((b,i) => addDoc(b, files.revenus[i]?.name, files.revenus[i]?.type));
      filesB64.domicile.forEach((b,i) => addDoc(b, files.domicile[i]?.name, files.domicile[i]?.type));

      docs.push({ type: "text", text: "Extrais les données de ces 3 documents (locataire principal) selon le schéma JSON défini. Retourne uniquement le JSON." });

      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250514",
          max_tokens: 2048,
          system: OCR_SYSTEM_PROMPT,
          messages: [{ role: "user", content: docs }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setOcrData(parsed);

      // Compute confidence: count non-null fields
      const all = [
        ...Object.values(parsed.carte_identite || {}),
        ...Object.values(parsed.fiche_paie || {}),
        ...Object.values(parsed.justificatif_domicile || {}),
      ];
      const filled = all.filter(v => v !== null && v !== "").length;
      setOcrConf(all.length > 0 ? Math.round(filled / all.length * 100) : 0);

    } catch(e) {
      console.error("OCR extraction error:", e);
      setOcrError(e.message);
      // Fallback: empty extraction
      setOcrData({
        carte_identite: { nom:null,prenom:null,sexe:null,date_naissance:null,lieu_naissance:null,nationalite:null,numero_document:null,date_expiration:null },
        fiche_paie: { employeur:null,type_contrat:null,date_fiche_paie:null,salaire_brut:null,salaire_net:null,net_imposable:null,cumul_annuel_net:null,anciennete:null },
        justificatif_domicile: { nom_titulaire:null,adresse_complete:null,date_document:null,organisme_emetteur:null }
      });
      setOcrConf(0);
    } finally {
      // Run garant OCR calls sequentially
      const gResults = [];
      for (let gi = 0; gi < garants.length; gi++) {
        const g = garants[gi];
        try {
          const gDocs = [];
          g.filesB64.cni.forEach((b,i) => addDoc2(gDocs, b, g.files.cni[i]?.name, g.files.cni[i]?.type));
          g.filesB64.revenus.forEach((b,i) => addDoc2(gDocs, b, g.files.revenus[i]?.name, g.files.revenus[i]?.type));
          g.filesB64.domicile.forEach((b,i) => addDoc2(gDocs, b, g.files.domicile[i]?.name, g.files.domicile[i]?.type));
          gDocs.push({ type: "text", text: `Extrais les données de ces 3 documents (garant ${gi+1}) selon le schéma JSON défini. Retourne uniquement le JSON.` });
          const gResp = await fetch("/api/claude", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 2048, system: OCR_SYSTEM_PROMPT, messages: [{ role: "user", content: gDocs }] })
          });
          const gData = await gResp.json();
          const gText = gData.content?.map(b => b.text || "").join("") || "";
          const gClean = gText.replace(/```json|```/g, "").trim();
          gResults.push(JSON.parse(gClean));
        } catch(ge) {
          console.error(`Garant ${gi+1} OCR error:`, ge);
          gResults.push({ carte_identite:{nom:null,prenom:null,sexe:null,date_naissance:null,lieu_naissance:null,nationalite:null,numero_document:null,date_expiration:null}, fiche_paie:{employeur:null,type_contrat:null,date_fiche_paie:null,salaire_brut:null,salaire_net:null,net_imposable:null,cumul_annuel_net:null,anciennete:null}, justificatif_domicile:{nom_titulaire:null,adresse_complete:null,date_document:null,organisme_emetteur:null} });
        }
      }
      setGarantsOcr(gResults);
      clearInterval(iv);
      setAiStep(NL_AI_STEPS.length - 1);
      setAiLabel(NL_AI_STEPS[NL_AI_STEPS.length - 1]);
      setTimeout(() => setPhase("done"), 500);
    }
  }, [filesB64, files, garants]);

  useEffect(()=>{
    const tenantReady = done.cni&&done.revenus&&done.domicile&&filesB64.cni.length>0&&filesB64.revenus.length>0&&filesB64.domicile.length>0;
    if(tenantReady && allGarantsReady && phase==="intake"){
      setTimeout(()=>runOCR(), 600);
    }
  },[done, filesB64, garants, allGarantsReady, runOCR]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}/>

      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:201, width:"min(780px,90vw)", background:"#0d0d0d", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", animation:"slideIn 0.32s cubic-bezier(0.2,0.8,0.2,1)", overflowY:"auto", boxShadow:"-20px 0 60px rgba(0,0,0,0.6)" }}>

        {/* Panel header */}
        <div style={{ padding:"20px 24px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:"#08080A", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              <I.X/>
            </button>
            <div>
              <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue, marginBottom:2 }}>EQUITY · NOUVEAU LOCATAIRE</p>
              <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>Créer un dossier locataire</p>
            </div>
          </div>
          {/* Step pills */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {[{n:1,l:"Dépôt",done:phase==="done"||phase==="analyzing",act:phase==="intake"||phase==="analyzing"},{n:2,l:"Analyse IA",done:phase==="done",act:phase==="analyzing"},{n:3,l:"Fiche",done:validated,act:phase==="done"}].map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", background:s.done?C.green:s.act?C.blue:"#1a1a1a", border:`1.5px solid ${s.done?C.green:s.act?C.blue:"#2a2a2a"}`, color:s.done||s.act?"#fff":C.g3, boxShadow:s.act?`0 0 10px ${C.blueGlow}`:"none", transition:"all 0.4s" }}>
                  {s.done?"✓":s.n}
                </div>
                <span style={{ fontSize:10, color:s.done?C.green:s.act?C.w:C.g3, fontWeight:s.act?600:400, transition:"color 0.3s" }}>{s.l}</span>
                {i<2&&<div style={{ width:20, height:1, background:C.border }}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Panel body */}
        <div style={{ padding:"24px", flex:1 }}>

          {/* ── INTAKE PHASE ── */}
          {(phase==="intake"||phase==="analyzing")&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.3s ease" }}>
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                  <span style={{ color:C.blue }}><I.Sparkles/></span>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue }}>SMART INTAKE · DÉPOSEZ VOS 3 DOCUMENTS</p>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <NLDropZone type="CNI"     label="Pièce d'identité"       subLabel="Recto · Verso · Passeport" Icon={I.ID}      files={files.cni}     onAddFile={f=>handleFile("cni",f)}     analyzing={analyzing.cni}     done={done.cni}     onRemoveFile={i=>removeFile("cni",i)}/>
                  <NLDropZone type="REVENUS" label="Justificatifs de revenus" subLabel="Bulletins de salaire · Avis d'imposition" Icon={I.Receipt} files={files.revenus} onAddFile={f=>handleFile("revenus",f)} analyzing={analyzing.revenus} done={done.revenus} onRemoveFile={i=>removeFile("revenus",i)}/>
                  <NLDropZone type="DOMICILE" label="Justificatif de domicile" subLabel="Facture énergie · Quittance · Avis taxe"       Icon={I.HomeDoc} files={files.domicile} onAddFile={f=>handleFile("domicile",f)} analyzing={analyzing.domicile} done={done.domicile} onRemoveFile={i=>removeFile("domicile",i)}/>
                </div>
                <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
                  {["cni","revenus","domicile"].map((k,i)=>(
                    <div key={i} style={{ flex:1, height:2, borderRadius:99, background:files[k].length>0?(done[k]?C.green:C.blue):"#1e1e1e", transition:"background 0.4s" }}/>
                  ))}
                  <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{doneDocs}/{totalDocs}</span>
                </div>
              </div>

              {/* ── GARANTS SECTIONS ── */}
              {garants.map((g, gi) => (
                <div key={g.id} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"20px", animation:"fadeUp 0.3s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#818cf8" }}>{gi+1}</div>
                      <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:"#818cf8" }}>GARANT {gi+1} · DÉPOSEZ 3 DOCUMENTS</p>
                    </div>
                    <button onClick={()=>removeGarant(g.id)}
                      style={{ width:26, height:26, borderRadius:7, background:C.redSub, border:`1px solid rgba(239,68,68,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.red, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.25)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=C.redSub;}}>
                      <I.Trash/>
                    </button>
                  </div>
                  <div style={{ display:"flex", gap:12 }}>
                    <NLDropZone type="CNI"      label="Pièce d'identité"       subLabel="Recto · Verso · Passeport" Icon={I.ID}      files={g.files.cni}      onAddFile={f=>handleGarantFile(g.id,"cni",f)}      analyzing={g.analyzing.cni}      done={g.done.cni}      onRemoveFile={i=>removeGarantFile(g.id,"cni",i)}/>
                    <NLDropZone type="REVENUS"  label="Justificatifs de revenus" subLabel="Bulletins de salaire · Avis d'imposition" Icon={I.Receipt} files={g.files.revenus}  onAddFile={f=>handleGarantFile(g.id,"revenus",f)}  analyzing={g.analyzing.revenus}  done={g.done.revenus}  onRemoveFile={i=>removeGarantFile(g.id,"revenus",i)}/>
                    <NLDropZone type="DOMICILE" label="Justificatif de domicile" subLabel="Facture énergie · Quittance · Avis taxe"       Icon={I.HomeDoc} files={g.files.domicile} onAddFile={f=>handleGarantFile(g.id,"domicile",f)} analyzing={g.analyzing.domicile} done={g.done.domicile} onRemoveFile={i=>removeGarantFile(g.id,"domicile",i)}/>
                  </div>
                  <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
                    {["cni","revenus","domicile"].map((k,i)=>(
                      <div key={i} style={{ flex:1, height:2, borderRadius:99, background:g.files[k].length>0?(g.done[k]?C.green:C.blue):"#1e1e1e", transition:"background 0.4s" }}/>
                    ))}
                    <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{["cni","revenus","domicile"].filter(k=>g.files[k].length>0).length}/3</span>
                  </div>
                </div>
              ))}

              {/* ── ADD GARANT BUTTON ── */}
              {phase==="intake"&&(
                <button onClick={addGarant}
                  style={{ width:"100%", padding:"14px", borderRadius:12, border:`1.5px dashed rgba(99,102,241,0.3)`, background:"rgba(99,102,241,0.04)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.6)";e.currentTarget.style.background="rgba(99,102,241,0.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.3)";e.currentTarget.style.background="rgba(99,102,241,0.04)";}}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:"#818cf8", fontSize:14, fontWeight:700 }}>+</div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#818cf8" }}>Ajouter un garant</span>
                  {garants.length>0&&<span style={{ fontSize:9, fontFamily:C.mono, color:"#818cf899" }}>({garants.length} ajouté{garants.length>1?"s":""})</span>}
                </button>
              )}

              {phase==="analyzing"&&<div style={{ animation:"fadeUp 0.3s ease" }}><NLAIProgress step={aiStep} total={NL_AI_STEPS.length} label={aiLabel}/></div>}
              {phase==="intake"&&doneDocs<totalDocs&&<p style={{ textAlign:"center", fontSize:10, color:C.g3, fontFamily:C.mono }}>{totalDocs===3?"Déposez les 3 documents pour lancer l'analyse automatique":`Déposez tous les documents (${doneDocs}/${totalDocs}) pour lancer l'analyse`}</p>}
            </div>
          )}

          {/* ── DONE PHASE ── */}
          {phase==="done"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.4s cubic-bezier(0.2,0.8,0.2,1)" }}>
              {/* Success banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><I.CheckCircle/></div>
                <div><p style={{ fontSize:11, fontWeight:700, color:ocrError?C.yellow:C.green, marginBottom:1 }}>{ocrError?"Extraction partielle — erreur API":`Analyse complète — ${totalDocs} document${totalDocs>1?"s":""} traité${totalDocs>1?"s":""}`}</p><p style={{ fontSize:10, color:C.g2 }}>{ocrError?"Certaines données n'ont pas pu être extraites.":"Données extraites par OCR. Valeurs null = non trouvées. Relisez et validez."}</p></div>
                <div style={{ marginLeft:"auto", textAlign:"center", flexShrink:0 }}><p style={{ fontSize:18, fontWeight:800, color:ocrConf>=70?C.green:ocrConf>=40?C.yellow:C.red }}>{ocrConf}%</p><p style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>CONFIANCE</p></div>
              </div>

              {/* Tenant card header */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:50, height:50, borderRadius:"50%", background:"rgba(0,123,255,0.12)", border:"1.5px solid rgba(0,123,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, color:C.blue, flexShrink:0 }}>{(ocrData?.carte_identite?.prenom||"?")[0]+(ocrData?.carte_identite?.nom||"?")[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <h2 style={{ fontSize:17, fontWeight:800, letterSpacing:"-0.03em" }}>{ocrData?.carte_identite?.prenom||"Prénom"} {ocrData?.carte_identite?.nom||"Nom"}</h2>
                      <span style={{ fontSize:8, fontFamily:C.mono, color:ocrConf>=50?C.green:C.yellow, background:ocrConf>=50?C.greenSub:C.yellowSub, border:`1px solid ${ocrConf>=50?C.greenBord:"rgba(245,158,11,0.25)"}`, padding:"2px 7px", borderRadius:4 }}>{ocrConf>=50?"DOSSIER COMPLET":"EXTRACTION PARTIELLE"}</span>
                    </div>
                    <p style={{ fontSize:11, color:C.g2 }}>{[ocrData?.carte_identite?.date_naissance, ocrData?.carte_identite?.lieu_naissance, ocrData?.fiche_paie?.type_contrat, ocrData?.fiche_paie?.employeur, ocrData?.fiche_paie?.salaire_net].filter(Boolean).join(" · ")||"Données en cours d'extraction..."}</p>
                  </div>
                </div>
                {/* Subtabs */}
                <div style={{ display:"flex", gap:4, borderTop:`1px solid ${C.border}`, paddingTop:12, flexWrap:"wrap" }}>
                  {NL_SUBTABS.map(t=>{
                    const active=subtab===t;
                    return(
                      <button key={t} onClick={()=>setSubtab(t)} style={{ background:active?C.blueSub:"transparent", border:active?"1px solid rgba(0,123,255,0.25)":"1px solid transparent", borderRadius:7, padding:"6px 13px", fontSize:11, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div style={{ animation:"fadeUp 0.2s ease" }}>
                {subtab==="Profil & Identité" &&<NLProfileTab data={ocrData} confidence={ocrConf}/>}
                {subtab==="Garants"           &&<NLGarantsTab garantsOcr={garantsOcr} garants={garants}/>}
                {subtab==="Dossier Numérique" &&<NLDocumentsTab files={files}/>}
                {subtab==="Coordonnées"       &&<NLCoordonneesTab data={ocrData}/>}
              </div>
            </div>
          )}
        </div>

        {/* Panel footer CTA */}
        {phase==="done"&&(
          <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}`, background:"#08080A", display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0, position:"sticky", bottom:0 }}>
            <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"10px 20px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              Annuler
            </button>
            <button onClick={()=>{
              if(!validated){
                setValidated(true);
                const ci = ocrData?.carte_identite || {};
                const fp = ocrData?.fiche_paie || {};
                const jd = ocrData?.justificatif_domicile || {};
                if(onSave) onSave({
                  nom: ci.nom || "Inconnu",
                  prenom: ci.prenom || "Inconnu",
                  adresse: jd.adresse_complete || "",
                  ville: "",
                  tel: "",
                  mail: "",
                  loyer: "— €",
                  echeance: "1er du mois",
                  sexe: ci.sexe,
                  dateNaissance: ci.date_naissance,
                  lieuNaissance: ci.lieu_naissance,
                  nationalite: ci.nationalite,
                  employeur: fp.employeur,
                  typeContrat: fp.type_contrat,
                  salaireNet: fp.salaire_net,
                  salaireBrut: fp.salaire_brut,
                  ocrData: ocrData,
                  garantsOcr: garantsOcr,
                  nbGarants: garants.length,
                });
              }
            }}
              style={{ background:validated?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"10px 28px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, letterSpacing:"0.04em", boxShadow:validated?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`, transition:"all 0.2s" }}
              onMouseEnter={e=>{if(!validated){e.currentTarget.style.boxShadow="0 6px 30px rgba(0,123,255,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=validated?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
              {validated?<><I.CheckCircle/> Locataire validé !</>:<><I.Check/> Valider le locataire</>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   TENANT DETAIL PANEL (slide-over fiche)
════════════════════════════════════════ */

/* ── Gestion Tab: 5-Step Onboarding Stepper ── */
const GESTION_STEPS = [
  {
    id: "accord",
    label: "Accord de principe",
    icon: "Handshake",
    color: "#3B82F6",
    desc: "Validation des conditions d'entrée : loyer, date, dossier.",
    customRender: true,
    actions: [
      { label:"Envoi d'accord de principe", primary:true, key:"sendAccord" },
    ],
  },
  {
    id: "bail",
    label: "Signature du Bail",
    icon: "FileSignature",
    color: "#8B5CF6",
    desc: "Génération, envoi et suivi de la signature du contrat de bail mobilité.",
    customRender: true,
    actions: [
      { label:"Envoyer le bail à la signature", primary:true, key:"sendBail" },
    ],
  },
  {
    id: "paiement",
    label: "Paiement Initial",
    icon: "CreditCard",
    color: "#10B981",
    desc: "Encaissement du dépôt de garantie et du premier loyer.",
    fields: [
      { key:"depotGarantie", label:"Dépôt de garantie", placeholder:"Ex : 850 €", type:"text" },
      { key:"premierLoyer", label:"1er loyer", placeholder:"Ex : 850 €", type:"text" },
      { key:"modeReglement", label:"Mode de règlement", placeholder:"Virement / Chèque / CB", type:"text" },
    ],
    actions: [
      { label:"Marquer le paiement reçu", primary:true, key:"confirmPayment" },
      { label:"Envoyer un rappel de paiement", secondary:true, key:"reminderPayment" },
    ],
  },
  {
    id: "conformite",
    label: "Conformité",
    icon: "ShieldCheck",
    color: "#F59E0B",
    desc: "Collecte de l'Assurance Habitation et du justificatif Énergie.",
    documents: [
      { key:"assurance", label:"Attestation d'assurance habitation", subLabel:"PDF ou scan de l'attestation" },
      { key:"energie", label:"Justificatif d'ouverture de compteur", subLabel:"EDF, Engie, Total Energies…" },
    ],
    actions: [
      { label:"Valider la conformité", primary:true, key:"validateConf" },
    ],
  },
  {
    id: "edl",
    label: "État des lieux",
    icon: "Key",
    color: "#EC4899",
    desc: "Constat d'état détaillé, inventaire mobilier, photos et signature.",
    customRender: true,
    actions: [
      { label:"Clore et signer l'état des lieux", primary:true, key:"confirmKeys" },
    ],
  },
];

const GESTION_ICONS = {
  Handshake: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m11 17 2 2a1 1 0 0 0 3-1l-2-3"/><path d="m14 14 2.5 2.5a1 1 0 0 0 3-1L15 11l-1-1"/><path d="M2 2h4l2.5 2.5L5 8h8l3 3M7 8v8"/><path d="m22 22-5-10 3-3L12 1"/></svg>,
  FileSignature: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18c-2.67 0-5.33-1.33-5.33-4s2.67-4 5.33-4 5.33 1.33 5.33 4"/></svg>,
  CreditCard: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  ShieldCheck: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Key: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
};


/* ── Accord de Principe — Rich Section ── */
function AccordSection({ tenant, bien, user, stepData, setField }) {
  const ci = tenant.ocrData?.carte_identite || {};
  const fp = tenant.ocrData?.fiche_paie || {};
  const garants = tenant.garantsOcr || [];

  // Pre-fill computed values
  const loyerHC = bien?.loyer || tenant.loyerHC || tenant.loyer || "";
  const loyerNum = parseInt(String(loyerHC).replace(/[^\d]/g,""),10) || 0;
  const isVide = (bien?.typeLocation||tenant.bienTypeLocation||"").toLowerCase().includes("vide");
  const depotGarantie = tenant.depotGarantieCalc || (loyerNum > 0 ? (isVide ? loyerNum : loyerNum * 2) : "");
  const chargesLoc = bien?.chargesLocatives || tenant.chargesLoc || "";
  const dureeBail = tenant.dureeBail || (isVide ? "3 ans renouvelable" : "1 an renouvelable");
  const adresseBien = [bien?.addr||"", bien?.addr2||"", bien?.batiment||"", bien?.porteLot||"", bien?.ville||"", bien?.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || "";
  const descBien = [bien?.type||tenant.bienType, (bien?.surface||tenant.bienSurface) ? (bien?.surface||tenant.bienSurface)+" m²" : null, bien?.rooms||tenant.bienRooms].filter(Boolean).join(" · ");
  const annexes = [(bien?.porteLot) ? "Lot "+bien.porteLot : null].filter(Boolean).join(", ") || "—";
  const prenomNom = `${tenant.prenom||""} ${tenant.nom||""}`.trim();
  const bailleur = `${user?.prenom||""} ${user?.nom||""}`.trim() || "—";

  const today = new Date();
  const validite72h = new Date(today.getTime() + 72*60*60*1000).toLocaleDateString("fr-FR");

  const SL = ({label}) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 10px" }}>
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:"#3B82F6", fontFamily:C.mono, fontWeight:700 }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(59,130,246,0.15)" }}/>
    </div>
  );

  const RoField = ({label, value, full, accent, mono}) => (
    <div style={{ background:"#0d0d0f", border:`1px solid ${value&&value!=="—"?"rgba(59,130,246,0.15)":C.border}`, borderRadius:10, padding:"10px 12px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:4, textTransform:"uppercase" }}>{label}</p>
      <p style={{ fontSize:13, fontWeight:700, color:accent?"#3B82F6":value&&value!=="—"?C.w:C.g3, fontFamily:mono?C.mono:"inherit" }}>{value||"—"}</p>
    </div>
  );

  const EdField = ({label, k, placeholder, full, unit, type}) => (
    <div style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:4, textTransform:"uppercase" }}>{label}</p>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {type==="date" ? (
          <DatePickerInput value={stepData[k]||""} onChange={v=>setField(k,v)} placeholder={placeholder}/>
        ) : (
          <input type="text" value={stepData[k]||""} onChange={e=>setField(k,e.target.value)} placeholder={placeholder}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:600, color:C.w }}/>
        )}
        {unit&&<span style={{ fontSize:11, color:C.g2, flexShrink:0 }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:16 }}>

      {/* ═══ 1. IDENTIFICATION DES PARTIES ═══ */}
      <SL label="1 · IDENTIFICATION DES PARTIES"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <RoField label="Le Bailleur" value={bailleur} accent/>
        <RoField label="Adresse de gestion" value={user?.email||"—"}/>
        <RoField label="Le Preneur" value={prenomNom} accent/>
        <RoField label="Date de naissance" value={ci.date_naissance||tenant.dateNaissance||"—"}/>
        <RoField label="Nationalité" value={ci.nationalite||tenant.nationalite||"—"}/>
        <RoField label="Employeur" value={fp.employeur||tenant.employeur||"—"}/>
      </div>
      {garants.length > 0 && (
        <div style={{ marginTop:8 }}>
          <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:"#818cf8", marginBottom:6 }}>GARANT(S)</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {garants.map((g, i) => {
              const gci = g?.carte_identite || {};
              const gfp = g?.fiche_paie || {};
              return (
                <div key={i} style={{ background:"#0d0d0f", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, padding:"10px 12px" }}>
                  <p style={{ fontSize:8, fontFamily:C.mono, color:"#818cf8", marginBottom:3 }}>GARANT {i+1}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:C.w }}>{gci.prenom||"?"} {gci.nom||"?"}</p>
                  <p style={{ fontSize:10, color:C.g2, marginTop:2 }}>{[gfp.employeur, gfp.salaire_net].filter(Boolean).join(" · ")||"—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ 2. DÉSIGNATION DU BIEN ═══ */}
      <SL label="2 · DÉSIGNATION DU BIEN"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <RoField label="Adresse exacte" value={adresseBien} full/>
        <RoField label="Description" value={descBien}/>
        <RoField label="Bâtiment / Étage / Lot" value={[bien?.batiment, bien?.porteLot].filter(Boolean).join(" · ")||tenant.bienAddr||"—"}/>
        <RoField label="Année de construction" value={bien?.year||tenant.bienYear||"—"}/>
        <RoField label="DPE" value={bien?.dpe||tenant.bienDpe||"—"}/>
        <RoField label="Usage" value="Habitation exclusivement" full/>
      </div>

      {/* ═══ 3. CONDITIONS FINANCIÈRES ═══ */}
      <SL label="3 · CONDITIONS FINANCIÈRES"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
        {[
          { poste:"Loyer hors charges", detail:loyerHC ? loyerHC+" €/mois" : "—", accent:true },
          { poste:"Provisions sur charges", detail:chargesLoc ? chargesLoc+" €/mois" : "À définir" },
          { poste:"Dépôt de garantie", detail:depotGarantie ? depotGarantie+" €" : "—", sub:isVide?"(1 mois HC — location vide)":"(2 mois HC — location meublée)" },
          { poste:"Honoraires / Frais", detail:"—" },
        ].map((r, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"10px 14px", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
            <span style={{ flex:1, fontSize:12, fontWeight:600, color:C.g1 }}>{r.poste}</span>
            <div style={{ textAlign:"right" }}>
              <span style={{ fontSize:13, fontWeight:800, color:r.accent?"#3B82F6":C.w, fontFamily:C.mono }}>{r.detail}</span>
              {r.sub && <p style={{ fontSize:9, color:C.g3, marginTop:1 }}>{r.sub}</p>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <EdField label="Loyer convenu (ajuster)" k="loyerAccorde" placeholder={loyerHC||"Montant"} unit="€/mois"/>
        <EdField label="Honoraires locataire" k="honoraires" placeholder="0" unit="€"/>
      </div>

      {/* ═══ 4. CALENDRIER D'ENTRÉE ═══ */}
      <SL label="4 · CALENDRIER D'ENTRÉE"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <EdField label="Date de prise d'effet" k="datePriseEffet" type="date" placeholder="JJ/MM/AAAA"/>
        <RoField label="Durée du bail" value={dureeBail}/>
        <EdField label="Date de remise des clés" k="dateRemiseCles" type="date" placeholder="JJ/MM/AAAA"/>
        <EdField label="Date de signature prévue" k="dateSignature" type="date" placeholder="JJ/MM/AAAA"/>
      </div>

      {/* ═══ 5. CONDITIONS SUSPENSIVES ═══ */}
      <SL label="5 · CONDITIONS SUSPENSIVES"/>
      <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:12, padding:"14px 16px" }}>
        <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.yellow, marginBottom:10, fontWeight:700 }}>L'ACCORD EST CONDITIONNÉ À :</p>
        {[
          { label:"Attestation d'assurance habitation", sub:"Couvrant les risques locatifs, à fournir avant la remise des clés." },
          { label:"Paiement du premier virement", sub:`Dépôt de garantie (${depotGarantie||"—"} €) + 1er mois de loyer (${loyerHC||"—"} €).` },
          { label:"Validation définitive de la caution", sub:"Réception de l'acte de cautionnement signé" + (garants.length>0 ? ` (${garants.length} garant${garants.length>1?"s":""}).` : " (si applicable).") },
        ].map((cond, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:i<2?10:0 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.yellow, fontSize:10, fontWeight:800, flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.w, marginBottom:2 }}>{cond.label}</p>
              <p style={{ fontSize:10, color:C.g2, lineHeight:1.5 }}>{cond.sub}</p>
            </div>
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
          <EdField label="Date limite de réalisation" k="dateLimiteConditions" type="date" placeholder="JJ/MM/AAAA"/>
        </div>
      </div>

      {/* ═══ 6. VALIDITÉ ET DÉSENGAGEMENT ═══ */}
      <SL label="6 · VALIDITÉ ET DÉSENGAGEMENT"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0 }}><I.AlertTriangle/></div>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:C.w }}>Durée de validité : 72 heures</p>
            <p style={{ fontSize:10, color:C.g2 }}>Cet accord est valable jusqu'au <strong style={{ color:C.w }}>{validite72h}</strong>. Passé ce délai, le bien est remis sur le marché.</p>
          </div>
        </div>
        <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.1)", borderRadius:8, padding:"10px 12px" }}>
          <p style={{ fontSize:10, color:C.g3, lineHeight:1.6, fontStyle:"italic" }}>
            Cet accord de principe ne vaut pas bail et ne constitue pas un engagement définitif.
            L'entrée dans les lieux est strictement conditionnée à la signature du contrat de location définitif
            et à la réalisation de l'ensemble des conditions suspensives mentionnées ci-dessus.
          </p>
        </div>
      </div>
    </div>
  );
}


/* ── Signature Pad Modal ── */
function SignaturePadModal({ tenant, onSign, onClose }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const confirm = () => {
    if (!hasDrawn) return;
    const data = canvasRef.current.toDataURL("image/png");
    onSign(data);
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}/>
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:401, width:"min(520px,92vw)", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#3B82F6" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22c-4 0-8-2-8-6V8l8-4 8 4v8c0 4-4 6-8 6z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>Signature de l'accord</p>
              <p style={{ fontSize:11, color:C.g2 }}>Signez ci-dessous pour accepter les conditions de l'accord de principe.</p>
            </div>
          </div>
        </div>

        {/* Signer info */}
        <div style={{ padding:"12px 24px", background:"#0d0d0f", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#3B82F6" }}>
            {(tenant.prenom||"?")[0]}{(tenant.nom||"?")[0]}
          </div>
          <div>
            <p style={{ fontSize:12, fontWeight:700 }}>{tenant.prenom} {tenant.nom}</p>
            <p style={{ fontSize:10, color:C.g3 }}>Signataire · Preneur</p>
          </div>
          <span style={{ marginLeft:"auto", fontSize:9, fontFamily:C.mono, color:C.g3 }}>{new Date().toLocaleDateString("fr-FR")}</span>
        </div>

        {/* Canvas */}
        <div style={{ padding:"20px 24px" }}>
          <div style={{ background:"#fafafa", borderRadius:12, border:"2px dashed #d1d5db", position:"relative", overflow:"hidden" }}>
            <canvas ref={canvasRef} width={472} height={180}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
              style={{ display:"block", width:"100%", height:180, cursor:"crosshair", touchAction:"none" }}/>
            {!hasDrawn && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <p style={{ fontSize:13, color:"#9ca3af", fontStyle:"italic" }}>Dessinez votre signature ici</p>
              </div>
            )}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
            <button onClick={clearCanvas} style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4 }}
              onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
              <I.X/> Effacer
            </button>
            <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>Tracez à la souris ou au doigt</span>
          </div>
        </div>

        {/* Legal */}
        <div style={{ padding:"0 24px 16px" }}>
          <p style={{ fontSize:10, color:C.g3, lineHeight:1.6, fontStyle:"italic" }}>
            En signant, je confirme avoir pris connaissance de l'ensemble des conditions de l'accord de principe
            et j'accepte les termes énoncés. Cette signature électronique a valeur d'engagement.
          </p>
        </div>

        {/* Actions */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 0", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            Annuler
          </button>
          <button onClick={confirm} disabled={!hasDrawn}
            style={{ flex:1, background:hasDrawn?"linear-gradient(135deg,#3B82F6,#2563EB)":"#1a1a1a", border:"none", borderRadius:10, padding:"11px 0", color:hasDrawn?"#fff":C.g3, fontSize:12, fontWeight:700, cursor:hasDrawn?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:hasDrawn?"0 4px 18px rgba(59,130,246,0.35)":"none", transition:"all 0.2s" }}>
            <I.CheckCircle/> Valider ma signature
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Bail Mobilité Section (Step 2) ── */
function BailMobiliteSection({ tenant, bien, user, stepData, setField }) {
  const ci = tenant.ocrData?.carte_identite || {};
  const garants = tenant.garantsOcr || [];
  const bailleurName = `${user?.prenom||""} ${user?.nom||""}`.trim() || "—";
  const bailleurAddr = user?.email || "—";
  const prenomNom = `${tenant.prenom||""} ${tenant.nom||""}`.trim();
  const bienAddr = [bien?.addr||"", bien?.addr2||"", bien?.batiment||"", bien?.ville||"", bien?.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || "";
  const loyerVal = bien?.loyer || tenant.loyerHC || "";
  const chargesVal = String(bien?.chargesLocatives || tenant.chargesLoc || "");
  const surface = bien?.surface || tenant.bienSurface || "";
  const rooms = bien?.rooms || tenant.bienRooms || "";
  const bienType = bien?.type || tenant.bienType || "";
  const bienYear = bien?.year || tenant.bienYear || "";
  const dpe = bien?.dpe || tenant.bienDpe || "";
  const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10)||0;
  const chargesNum = parseInt(String(chargesVal).replace(/[^\d]/g,""),10)||0;
  const totalMensuel = loyerNum + chargesNum;

  const MOTIFS = ["Formation professionnelle","Études supérieures","Contrat d'apprentissage","Stage","Engagement volontaire (service civique)","Mutation professionnelle","Mission temporaire"];

  const SL = ({label}) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0 8px" }}>
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:"#8B5CF6", fontFamily:C.mono, fontWeight:700 }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(139,92,246,0.15)" }}/>
    </div>
  );

  const RoField = ({label, value, full, accent, mono}) => (
    <div style={{ background:"#0d0d0f", border:`1px solid ${value&&value!=="—"?"rgba(139,92,246,0.12)":C.border}`, borderRadius:9, padding:"8px 11px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, marginBottom:3 }}>{label}</p>
      <p style={{ fontSize:12, fontWeight:600, color:accent?"#8B5CF6":value&&value!=="—"?C.w:C.g3, fontFamily:mono?C.mono:"inherit" }}>{value||"—"}</p>
    </div>
  );

  const EdField = ({label, k, placeholder, full, unit, type}) => (
    <div style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 11px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, marginBottom:3 }}>{label}</p>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        {type==="date" ? (
          <DatePickerInput value={stepData[k]||""} onChange={v=>setField(k,v)} placeholder={placeholder}/>
        ) : (
          <input type="text" value={stepData[k]||""} onChange={e=>setField(k,e.target.value)} placeholder={placeholder}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:600, color:C.w }}/>
        )}
        {unit&&<span style={{ fontSize:10, color:C.g2 }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:14 }}>
      {/* Bail type badge */}
      <div style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B5CF6" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:12, fontWeight:800, color:"#8B5CF6" }}>BAIL MOBILITÉ</p>
          <p style={{ fontSize:10, color:C.g2 }}>Conforme Loi ELAN & ALUR · Durée 1 à 10 mois · Non renouvelable · Sans dépôt de garantie</p>
        </div>
        <span style={{ fontSize:8, fontFamily:C.mono, color:"#8B5CF6", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", padding:"3px 8px", borderRadius:4 }}>LOI ELAN</span>
      </div>

      {/* I. Parties */}
      <SL label="I · DÉSIGNATION DES PARTIES"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <RoField label="Bailleur" value={bailleurName} accent/>
        <RoField label="Adresse / Siège" value={bailleurAddr}/>
        <RoField label="Locataire (Preneur)" value={prenomNom} accent/>
        <RoField label="E-mail locataire" value={tenant.mail||"—"}/>
        {garants.length>0 && <RoField label="Garant(s)" value={garants.map((g,i)=>`${g?.carte_identite?.prenom||"?"} ${g?.carte_identite?.nom||"?"}`).join(", ")} full/>}
      </div>

      {/* II. Objet — Motif */}
      <SL label="II · OBJET DU CONTRAT — MOTIF"/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
        {MOTIFS.map(m=>{
          const sel = stepData.bailMotif===m;
          return <button key={m} onClick={()=>setField("bailMotif",m)} style={{ background:sel?"rgba(139,92,246,0.12)":"#0d0d0f", border:`1.5px solid ${sel?"#8B5CF6":C.border}`, borderRadius:8, padding:"6px 12px", fontSize:10, fontWeight:sel?700:500, color:sel?"#8B5CF6":C.g2, cursor:"pointer", transition:"all 0.15s" }}>{m}</button>;
        })}
      </div>

      {/* II-A. Consistance du logement */}
      <SL label="II-A · CONSISTANCE DU LOGEMENT"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <RoField label="Adresse du logement" value={bienAddr} full/>
        <RoField label="Type" value={bienType}/>
        <RoField label="Surface habitable" value={surface?surface+" m²":"—"}/>
        <RoField label="Pièces principales" value={rooms}/>
        <RoField label="Période de construction" value={bienYear}/>
        <RoField label="Classe DPE" value={dpe?`Classe ${dpe}`:"—"}/>
        <EdField label="Équipements du logement" k="bailEquipements" placeholder="Cuisine équipée, sanitaires…" full/>
        <EdField label="Chauffage" k="bailChauffage" placeholder="Individuel électrique"/>
        <EdField label="Eau chaude" k="bailEauChaude" placeholder="Individuel"/>
      </div>

      {/* III. Date et durée */}
      <SL label="III · DATE ET DURÉE DU CONTRAT"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <EdField label="Date de prise d'effet" k="bailDateEffet" type="date" placeholder="JJ/MM/AAAA"/>
        <EdField label="Durée du bail (1 à 10 mois)" k="bailDuree" placeholder="Ex : 6 mois"/>
      </div>
      <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.12)", borderRadius:8, padding:"8px 12px", marginTop:6 }}>
        <p style={{ fontSize:10, color:C.yellow, lineHeight:1.5 }}>⚠ Le bail mobilité est conclu pour 1 à 10 mois maximum, non renouvelable et non reconductible. La durée peut être modifiée une fois par avenant sans dépasser 10 mois.</p>
      </div>

      {/* IV. Conditions financières */}
      <SL label="IV · CONDITIONS FINANCIÈRES"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden", marginBottom:6 }}>
        {[
          { poste:"Loyer mensuel", detail:loyerVal?loyerVal+" €":"—", accent:true },
          { poste:"Forfait de charges", detail:chargesVal?chargesVal+" €/mois":"—" },
          { poste:"Total mensuel dû", detail:totalMensuel>0?totalMensuel+" €":"—", accent:true },
          { poste:"Dépôt de garantie", detail:"INTERDIT (bail mobilité)", warn:true },
        ].map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"8px 14px", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
            <span style={{ flex:1, fontSize:11, fontWeight:600, color:r.warn?C.red:C.g1 }}>{r.poste}</span>
            <span style={{ fontSize:12, fontWeight:700, color:r.warn?C.red:r.accent?"#8B5CF6":C.w, fontFamily:C.mono }}>{r.detail}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <EdField label="Périodicité de paiement" k="bailPeriodicite" placeholder="Mensuel"/>
        <EdField label="Date / jour de paiement" k="bailDatePaiement" placeholder="Le 1er de chaque mois"/>
      </div>

      {/* Résiliation */}
      <SL label="RÉSILIATION"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px" }}>
        <p style={{ fontSize:10, color:C.g2, lineHeight:1.6 }}>Le locataire peut résilier à tout moment avec un préavis d'<strong style={{ color:C.w }}>1 mois</strong> par lettre recommandée avec accusé de réception. Le bailleur ne peut pas donner congé avant le terme du bail.</p>
      </div>

      {/* Conditions particulières */}
      <SL label="CONDITIONS PARTICULIÈRES"/>
      <EdField label="Conditions particulières (optionnel)" k="bailConditions" placeholder="Clauses spécifiques, inventaire mobilier…" full/>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   DIGITAL EDL — État des Lieux Numérique
═══════════════════════════════════════════════════════════════ */
const EDL_PIECES = [
  { id:"entree", label:"Entrée / Couloir", icon:"🚪" },
  { id:"sejour", label:"Séjour / Salon", icon:"🛋️" },
  { id:"cuisine", label:"Cuisine", icon:"🍳" },
  { id:"chambre1", label:"Chambre 1", icon:"🛏️" },
  { id:"chambre2", label:"Chambre 2", icon:"🛏️" },
  { id:"sdb", label:"Salle de bain", icon:"🚿" },
  { id:"wc", label:"WC", icon:"🚽" },
  { id:"balcon", label:"Balcon / Terrasse", icon:"🌿" },
  { id:"cave", label:"Cave / Parking", icon:"🅿️" },
];
const EDL_ELEMENTS = ["Sols","Murs","Plafonds","Fenêtres","Portes","Prises / Interrupteurs","Éclairage","Placards"];
const EDL_SCORES = [{id:"TB",label:"TB",color:"#10B981",bg:"rgba(16,185,129,0.12)"},{id:"B",label:"B",color:"#3B82F6",bg:"rgba(59,130,246,0.12)"},{id:"P",label:"P",color:"#F59E0B",bg:"rgba(245,158,11,0.12)"},{id:"M",label:"M",color:"#EF4444",bg:"rgba(239,68,68,0.12)"}];
const EDL_INVENTAIRE = [
  { cat:"Literie", items:["Lit (cadre)","Matelas","Couette","Oreillers","Draps / housse","Table de chevet"] },
  { cat:"Mobilier séjour", items:["Canapé","Table basse","Meuble TV","Table à manger","Chaises","Étagère / Bibliothèque","Bureau","Chaise bureau"] },
  { cat:"Électroménager", items:["Réfrigérateur","Four / Mini-four","Micro-ondes","Plaque de cuisson","Lave-linge","Aspirateur","Bouilloire","Grille-pain","Cafetière"] },
  { cat:"Vaisselle", items:["Assiettes plates","Assiettes creuses","Verres","Tasses / Mugs","Couverts (lot)","Casseroles","Poêle","Saladier","Planche à découper"] },
  { cat:"Équipements", items:["Rideaux / Voilages","Luminaires","Tapis","Miroir","Poubelle","Fer à repasser","Séchoir à linge","Balai / Serpillière"] },
];
const EDL_CLES_TYPES = ["Porte d'entrée immeuble","Porte appartement","Boîte aux lettres","Cave","Parking","Badge / Bip","Autre"];

function EdlSectionTitle({label, icon, color}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 8px" }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.12em", color:color||"#EC4899", fontFamily:C.mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(236,72,153,0.15)" }}/>
    </div>
  );
}

function EdlScoreBtn({score, selected, onClick}) {
  const s = EDL_SCORES.find(x=>x.id===score);
  const active = selected === score;
  return (
    <button onClick={onClick} style={{ width:36, height:32, borderRadius:7, border:active?`2px solid ${s.color}`:`1px solid ${C.border}`, background:active?s.bg:"transparent", color:active?s.color:C.g3, fontSize:11, fontWeight:active?800:600, cursor:"pointer", transition:"all 0.12s", fontFamily:C.mono }}>
      {s.label}
    </button>
  );
}

function EdlPhotoZone({photos, onAdd, label}) {
  const ref = useRef(null);
  const handleFiles = (files) => {
    [...files].forEach(f => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => onAdd(e.target.result);
      reader.readAsDataURL(f);
    });
  };
  return (
    <div style={{ marginTop:8 }}>
      <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>{label||"PHOTOS"}</p>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
        {(photos||[]).map((p,i) => (
          <div key={i} style={{ width:56, height:56, borderRadius:8, overflow:"hidden", border:"1px solid "+C.border, transition:"border-color 0.15s", cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#EC4899"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <img src={p} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
        ))}
        <input ref={ref} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>handleFiles(e.target.files)}/>
        <button onClick={()=>ref.current.click()} style={{ width:56, height:56, borderRadius:8, border:"1.5px dashed rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.04)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, cursor:"pointer", color:"#EC4899", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#EC4899";e.currentTarget.style.background="rgba(236,72,153,0.08)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(236,72,153,0.3)";e.currentTarget.style.background="rgba(236,72,153,0.04)";}}>
          <I.Camera/>
          <span style={{ fontSize:7, fontFamily:C.mono }}>Ajouter</span>
        </button>
      </div>
    </div>
  );
}

function DigitalEDL({ tenant, bien, user, stepData, setField, onSign }) {
  const [openPiece, setOpenPiece] = useState("entree");
  const [showInventaire, setShowInventaire] = useState(false);
  const [showEdlPreview, setShowEdlPreview] = useState(false);
  const [edlHtml, setEdlHtml] = useState("");
  const edlIframeRef = useRef(null);

  // Helpers to read/write nested EDL data in stepData
  const edl = stepData._edl || {};
  const setEdl = (path, val) => {
    const next = JSON.parse(JSON.stringify(edl));
    const keys = path.split(".");
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
    obj[keys[keys.length-1]] = val;
    setField("_edl", next);
  };
  const getEdl = (path, def) => {
    let obj = edl;
    for (const k of path.split(".")) { if (!obj || obj[k] === undefined) return def; obj = obj[k]; }
    return obj;
  };

  const bienAddr = bien?.addr || tenant?.bienAddr || "";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>

      {/* ── INFO BANNER ── */}
      <div style={{ background:"linear-gradient(135deg,rgba(236,72,153,0.06),rgba(236,72,153,0.02))", border:"1px solid rgba(236,72,153,0.18)", borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#EC4899" }}><I.Key/></div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:"#EC4899", marginBottom:1 }}>ÉTAT DES LIEUX D'ENTRÉE</p>
          <p style={{ fontSize:11, color:C.g2 }}>Constat contradictoire — {bienAddr}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>ENTRÉE</p>
          <span style={{ fontSize:9, fontWeight:700, color:"#EC4899", fontFamily:C.mono, background:"rgba(236,72,153,0.1)", border:"1px solid rgba(236,72,153,0.2)", padding:"2px 8px", borderRadius:4 }}>En cours</span>
        </div>
      </div>

      {/* ── 1. DATE & LIEU ── */}
      <EdlSectionTitle icon="📅" label="DATE & LIEU"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:4 }}>
        <div style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"10px 12px" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em", marginBottom:4 }}>DATE</p>
          <DatePickerInput value={getEdl("date","")} onChange={v=>setEdl("date",v)}/>
        </div>
        <div style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"10px 12px" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em", marginBottom:4 }}>LIEU</p>
          <input value={getEdl("lieu",bienAddr)} onChange={e=>setEdl("lieu",e.target.value)} placeholder="Adresse du bien"
            style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:600, color:C.w }}/>
        </div>
      </div>

      {/* ── 2. COMPTEURS ── */}
      <EdlSectionTitle icon="⚡" label="RELEVÉS DES COMPTEURS"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:4 }}>
        {[
          {k:"elecHP",label:"Électricité HP",unit:"kWh",icon:"⚡"},
          {k:"elecHC",label:"Électricité HC",unit:"kWh",icon:"⚡"},
          {k:"gaz",label:"Gaz",unit:"m³",icon:"🔥"},
          {k:"eauFroide",label:"Eau froide",unit:"m³",icon:"💧"},
          {k:"eauChaude",label:"Eau chaude",unit:"m³",icon:"♨️"},
        ].map(c => (
          <div key={c.k} style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:9, padding:"8px 10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
              <span style={{ fontSize:10 }}>{c.icon}</span>
              <span style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>{c.label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <input value={getEdl("compteurs."+c.k,"")} onChange={e=>setEdl("compteurs."+c.k,e.target.value)} placeholder="—"
                style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:700, color:C.w, fontFamily:C.mono, width:"100%" }}/>
              <span style={{ fontSize:9, color:C.g3 }}>{c.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. CLÉS ── */}
      <EdlSectionTitle icon="🔑" label="CLÉS REMISES"/>
      <div style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"10px 12px", marginBottom:4 }}>
        {EDL_CLES_TYPES.map(type => {
          const val = getEdl("cles."+type.replace(/[^a-zA-Z]/g,""), 0);
          return (
            <div key={type} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid "+C.border }}>
              <span style={{ fontSize:11, color:C.g1 }}>{type}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button onClick={()=>setEdl("cles."+type.replace(/[^a-zA-Z]/g,""), Math.max(0, val-1))}
                  style={{ width:24, height:24, borderRadius:6, border:"1px solid "+C.border, background:"transparent", color:C.g2, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>-</button>
                <span style={{ fontSize:14, fontWeight:800, color:C.w, fontFamily:C.mono, width:20, textAlign:"center" }}>{val}</span>
                <button onClick={()=>setEdl("cles."+type.replace(/[^a-zA-Z]/g,""), val+1)}
                  style={{ width:24, height:24, borderRadius:6, border:"1px solid rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.06)", color:"#EC4899", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
              </div>
            </div>
          );
        })}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#EC4899", fontFamily:C.mono }}>
            Total : {EDL_CLES_TYPES.reduce((s,t) => s + (getEdl("cles."+t.replace(/[^a-zA-Z]/g,""), 0)), 0)} clé(s)
          </span>
        </div>
      </div>

      {/* ── 4. ÉTAT DES PIÈCES ── */}
      <EdlSectionTitle icon="🏠" label="ÉTAT DES PIÈCES"/>

      {/* Piece tabs */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
        {EDL_PIECES.map(p => {
          const active = openPiece === p.id;
          const filled = EDL_ELEMENTS.filter(el => getEdl("pieces."+p.id+"."+el.replace(/[^a-zA-Z]/g,""),"")).length;
          return (
            <button key={p.id} onClick={()=>setOpenPiece(p.id)} style={{
              padding:"6px 12px", borderRadius:8, border:active?"1.5px solid #EC4899":"1px solid "+C.border,
              background:active?"rgba(236,72,153,0.08)":"transparent", color:active?"#EC4899":C.g2,
              fontSize:10, fontWeight:active?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:"all 0.12s" }}>
              <span style={{ fontSize:12 }}>{p.icon}</span> {p.label}
              {filled>0 && <span style={{ fontSize:7, fontFamily:C.mono, background:active?"rgba(236,72,153,0.15)":"#1a1a1a", padding:"1px 5px", borderRadius:3, color:active?"#EC4899":C.g3 }}>{filled}/{EDL_ELEMENTS.length}</span>}
            </button>
          );
        })}
      </div>

      {/* Active piece detail */}
      {EDL_PIECES.filter(p=>p.id===openPiece).map(piece => (
        <div key={piece.id} style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:12, padding:"14px 16px", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:18 }}>{piece.icon}</span>
            <span style={{ fontSize:13, fontWeight:800, color:C.w }}>{piece.label}</span>
            <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
              <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>ENTRÉE</span>
            </div>
          </div>

          {/* Elements grid */}
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {/* Header */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 36px 36px 36px 36px", gap:4, padding:"0 0 4px", borderBottom:"1px solid "+C.border }}>
              <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>ÉLÉMENT</span>
              {EDL_SCORES.map(s => <span key={s.id} style={{ fontSize:8, fontFamily:C.mono, color:s.color, textAlign:"center" }}>{s.label}</span>)}
            </div>
            {EDL_ELEMENTS.map(el => {
              const elKey = el.replace(/[^a-zA-Z]/g,"");
              const current = getEdl("pieces."+piece.id+"."+elKey, "");
              return (
                <div key={el} style={{ display:"grid", gridTemplateColumns:"1fr 36px 36px 36px 36px", gap:4, alignItems:"center", padding:"4px 0" }}>
                  <span style={{ fontSize:11, color:C.g1 }}>{el}</span>
                  {EDL_SCORES.map(s => <EdlScoreBtn key={s.id} score={s.id} selected={current} onClick={()=>setEdl("pieces."+piece.id+"."+elKey, current===s.id?"":s.id)}/>)}
                </div>
              );
            })}
          </div>

          {/* Observation per room */}
          <div style={{ marginTop:8 }}>
            <input value={getEdl("pieces."+piece.id+".obs","")} onChange={e=>setEdl("pieces."+piece.id+".obs",e.target.value)}
              placeholder="Observation pour cette pièce…"
              style={{ width:"100%", background:"#111", border:"1px solid "+C.border, borderRadius:8, padding:"7px 10px", fontSize:11, color:C.w, outline:"none" }}/>
          </div>

          {/* Photos per room */}
          <EdlPhotoZone
            photos={getEdl("photos."+piece.id, [])}
            onAdd={(base64) => {
              const arr = getEdl("photos."+piece.id, []);
              setEdl("photos."+piece.id, [...arr, base64]);
            }}
            label={"PHOTOS — "+piece.label}
          />
        </div>
      ))}

      {/* ── 5. INVENTAIRE MOBILIER ── */}
      <EdlSectionTitle icon="📦" label="INVENTAIRE MOBILIER (MEUBLÉ)"/>
      <button onClick={()=>setShowInventaire(!showInventaire)}
        style={{ width:"100%", padding:"10px", borderRadius:10, border:"1px solid "+C.border, background:showInventaire?"rgba(236,72,153,0.04)":"transparent", color:showInventaire?"#EC4899":C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.15s" }}>
        <I.FileText/> {showInventaire ? "▲ Masquer l'inventaire" : "▼ Afficher l'inventaire mobilier complet"}
      </button>

      {showInventaire && (
        <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:10 }}>
          {EDL_INVENTAIRE.map(cat => (
            <div key={cat.cat} style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"12px 14px" }}>
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.1em", color:"#EC4899", fontFamily:C.mono, marginBottom:8 }}>{cat.cat.toUpperCase()}</p>
              {/* Header */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 60px 80px", gap:6, padding:"0 0 4px", borderBottom:"1px solid "+C.border, marginBottom:4 }}>
                <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>ARTICLE</span>
                <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3, textAlign:"center" }}>QTÉ</span>
                <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3, textAlign:"center" }}>ÉTAT</span>
              </div>
              {cat.items.map(item => {
                const ik = "inv."+cat.cat.replace(/[^a-zA-Z]/g,"")+"."+item.replace(/[^a-zA-Z]/g,"");
                return (
                  <div key={item} style={{ display:"grid", gridTemplateColumns:"1fr 60px 80px", gap:6, alignItems:"center", padding:"3px 0" }}>
                    <span style={{ fontSize:11, color:C.g1 }}>{item}</span>
                    <input value={getEdl(ik+".qty","")} onChange={e=>setEdl(ik+".qty",e.target.value)} placeholder="0"
                      style={{ width:"100%", background:"#111", border:"1px solid "+C.border, borderRadius:6, padding:"3px 6px", fontSize:11, fontWeight:700, color:C.w, textAlign:"center", outline:"none", fontFamily:C.mono }}/>
                    <div style={{ display:"flex", gap:2, justifyContent:"center" }}>
                      {EDL_SCORES.map(s => {
                        const cur = getEdl(ik+".etat","");
                        const active = cur === s.id;
                        return <button key={s.id} onClick={()=>setEdl(ik+".etat",active?"":s.id)}
                          style={{ width:18, height:18, borderRadius:4, border:active?"1.5px solid "+s.color:"1px solid "+C.border, background:active?s.bg:"transparent", color:active?s.color:C.g3, fontSize:8, fontWeight:700, cursor:"pointer", fontFamily:C.mono, padding:0 }}>{s.label}</button>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── 6. OBSERVATIONS GÉNÉRALES ── */}
      <EdlSectionTitle icon="📝" label="OBSERVATIONS & RÉSERVES"/>
      <textarea value={getEdl("observations","")} onChange={e=>setEdl("observations",e.target.value)}
        placeholder="Réserves générales, remarques, éléments non conformes…"
        rows={4}
        style={{ width:"100%", background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"12px 14px", fontSize:12, color:C.w, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }}/>

      {/* ── 7. SIGNATURES ── */}
      <EdlSectionTitle icon="✍️" label="SIGNATURES"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {/* Bailleur */}
        <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>BAILLEUR</p>
          <p style={{ fontSize:11, fontWeight:700, color:C.w, marginBottom:8 }}>{user?.prenom||""} {user?.nom||""}</p>
          {getEdl("signBailleur","") ? (
            <div>
              <img src={getEdl("signBailleur","")} style={{ height:50, border:"1px solid "+C.border, borderRadius:6, padding:3, background:"#fff" }}/>
              <p style={{ fontSize:9, color:C.green, fontFamily:C.mono, marginTop:4 }}>✓ Signé</p>
            </div>
          ) : (
            <button onClick={()=>onSign && onSign("bailleur", (sig)=>setEdl("signBailleur",sig))}
              style={{ padding:"8px 16px", borderRadius:8, border:"1.5px dashed rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.04)", color:"#EC4899", fontSize:10, fontWeight:700, cursor:"pointer" }}>
              Signer
            </button>
          )}
        </div>
        {/* Locataire */}
        <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>LOCATAIRE</p>
          <p style={{ fontSize:11, fontWeight:700, color:C.w, marginBottom:8 }}>{tenant?.prenom||""} {tenant?.nom||""}</p>
          {getEdl("signLocataire","") ? (
            <div>
              <img src={getEdl("signLocataire","")} style={{ height:50, border:"1px solid "+C.border, borderRadius:6, padding:3, background:"#fff" }}/>
              <p style={{ fontSize:9, color:C.green, fontFamily:C.mono, marginTop:4 }}>✓ Signé</p>
            </div>
          ) : (
            <button onClick={()=>onSign && onSign("locataire", (sig)=>setEdl("signLocataire",sig))}
              style={{ padding:"8px 16px", borderRadius:8, border:"1.5px dashed rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.04)", color:"#EC4899", fontSize:10, fontWeight:700, cursor:"pointer" }}>
              Signer
            </button>
          )}
        </div>
      </div>

            {/* ── 8. GÉNÉRER LE DOCUMENT ── */}
      <EdlSectionTitle icon="📄" label="GÉNÉRER LE DOCUMENT"/>
      <button onClick={()=>{
        const MR = '<span style="color:#999;font-style:italic">[information requise]</span>';
        const v = (val) => val || MR;
        const fmtDate = (d) => { if (!d) return MR; const dt = new Date(d); if (isNaN(dt)) return d; return dt.toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" }); };
        const scoreColor = (s) => s==="TB"?"#059669":s==="B"?"#2563EB":s==="P"?"#D97706":s==="M"?"#DC2626":"#999";
        const scoreLabel = (s) => s==="TB"?"Très bon":s==="B"?"Bon":s==="P"?"Passable":s==="M"?"Mauvais":MR;
        const bailleurNom = ((user?.prenom||"") + " " + (user?.nom||"")).trim() || MR;
        const locataireNom = ((tenant?.prenom||"") + " " + (tenant?.nom||"")).trim() || MR;
        const bienNom = bien?.name || tenant?.bienName || MR;
        const bienAddress = bien?.addr || tenant?.bienAddr || MR;
        const bienVille = bien?.ville || tenant?.bienVille || "";
        const cptRows = [["\u00c9lectricit\u00e9 HP",getEdl("compteurs.elecHP",""),"kWh"],["\u00c9lectricit\u00e9 HC",getEdl("compteurs.elecHC",""),"kWh"],["Gaz",getEdl("compteurs.gaz",""),"m\u00b3"],["Eau froide",getEdl("compteurs.eauFroide",""),"m\u00b3"],["Eau chaude",getEdl("compteurs.eauChaude",""),"m\u00b3"]].map(r=>"<tr><td style=\"padding:6px 10px;border:1px solid #e5e7eb\">"+r[0]+"</td><td style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center;font-weight:700\">"+(r[1]||MR)+"</td><td style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center;color:#666\">"+r[2]+"</td></tr>").join("");
        const cleRows = EDL_CLES_TYPES.map(t=>{const val=getEdl("cles."+t.replace(/[^a-zA-Z]/g,""),0);return "<tr><td style=\"padding:5px 10px;border:1px solid #e5e7eb\">"+t+"</td><td style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:center;font-weight:700\">"+val+"</td></tr>";}).join("");
        const cleTotal = EDL_CLES_TYPES.reduce((s,t)=>s+(getEdl("cles."+t.replace(/[^a-zA-Z]/g,""),0)),0);
        const piecesHtml = EDL_PIECES.map(piece=>{const rows=EDL_ELEMENTS.map(el=>{const elKey=el.replace(/[^a-zA-Z]/g,"");const score=getEdl("pieces."+piece.id+"."+elKey,"");return "<tr><td style=\"padding:4px 10px;border:1px solid #e5e7eb\">"+el+"</td><td style=\"padding:4px 10px;border:1px solid #e5e7eb;text-align:center;font-weight:700;color:"+scoreColor(score)+"\">"+scoreLabel(score)+"</td></tr>";}).join("");const obs=getEdl("pieces."+piece.id+".obs","");const photos=getEdl("photos."+piece.id,[]);return "<div style=\"margin-bottom:16px;page-break-inside:avoid\"><h3 style=\"font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 6px\">"+piece.icon+" "+piece.label+"</h3><table style=\"width:100%;border-collapse:collapse;font-size:12px;margin-bottom:6px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:left\">\u00c9l\u00e9ment</th><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:center;width:120px\">\u00c9tat (Entr\u00e9e)</th></tr></thead><tbody>"+rows+"</tbody></table>"+(obs?"<p style=\"font-size:11px;color:#374151;margin:4px 0\"><strong>Observations :</strong> "+obs+"</p>":"")+(photos.length>0?"<div style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:4px\">"+photos.map(p=>"<img src=\""+p+"\" style=\"width:80px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb\"/>").join("")+"</div>":"")+"</div>";}).join("");
        const invHtml = EDL_INVENTAIRE.map(cat=>{const rows=cat.items.map(item=>{const ik="inv."+cat.cat.replace(/[^a-zA-Z]/g,"")+"."+item.replace(/[^a-zA-Z]/g,"");const qty=getEdl(ik+".qty","");const etat=getEdl(ik+".etat","");if(!qty&&!etat)return "";return "<tr><td style=\"padding:3px 10px;border:1px solid #e5e7eb\">"+item+"</td><td style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center\">"+(qty||"\u2014")+"</td><td style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center;color:"+scoreColor(etat)+";font-weight:600\">"+scoreLabel(etat)+"</td></tr>";}).filter(Boolean).join("");if(!rows)return "";return "<div style=\"margin-bottom:12px\"><h4 style=\"font-size:12px;color:#4B5563;margin:0 0 4px\">"+cat.cat+"</h4><table style=\"width:100%;border-collapse:collapse;font-size:11px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:left\">Article</th><th style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center;width:50px\">Qt\u00e9</th><th style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center;width:80px\">\u00c9tat</th></tr></thead><tbody>"+rows+"</tbody></table></div>";}).filter(Boolean).join("");
        const observations = getEdl("observations","");
        const signB = getEdl("signBailleur","");
        const signL = getEdl("signLocataire","");
        const h = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>EDL</title><style>@media print{body{margin:0;padding:15px 25px}.no-print,.print-btn{display:none!important}@page{margin:10mm 12mm;size:A4}img{max-width:100%!important}table{page-break-inside:avoid}}body{font-family:-apple-system,system-ui,sans-serif;color:#111;line-height:1.5;max-width:780px;margin:0 auto;padding:32px;font-size:12px;background:#fff}h1{font-size:20px;font-weight:800;margin:0 0 2px}h2{font-size:14px;font-weight:700;color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:3px;margin:20px 0 10px;page-break-after:avoid}h3{page-break-after:avoid}.header{text-align:center;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px}.badge{display:inline-block;background:#EFF6FF;color:#2563EB;font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px}.sig-box{border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center;min-height:100px}table{width:100%}</style></head><body>"
          +"<div class=\"header\"><div style=\"display:inline-block;width:32px;height:32px;background:#2563EB;border-radius:7px;color:#fff;font-weight:800;font-size:14px;line-height:32px;text-align:center;margin-bottom:6px\">E</div><h1>\u00c9TAT DES LIEUX D\u2019ENTR\u00c9E</h1><p style=\"color:#6b7280;font-size:11px;margin:4px 0\">EQUITY \u2014 "+new Date().toLocaleDateString("fr-FR")+"</p><span class=\"badge\">CONSTAT CONTRADICTOIRE</span></div>"
          +"<div style=\"display:flex;gap:24px;margin-bottom:16px\"><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">BAILLEUR</p><p style=\"font-weight:700\">"+v(bailleurNom)+"</p></div><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">LOCATAIRE</p><p style=\"font-weight:700\">"+v(locataireNom)+"</p></div></div>"
          +"<div style=\"display:flex;gap:24px;margin-bottom:16px\"><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">BIEN</p><p style=\"font-weight:700\">"+v(bienNom)+"</p><p style=\"color:#374151\">"+v(bienAddress)+" "+bienVille+"</p></div><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">DATE</p><p style=\"font-weight:700\">"+fmtDate(getEdl("date",""))+"</p></div></div>"
          +"<h2>\u26a1 Relev\u00e9s des compteurs</h2><table style=\"width:100%;border-collapse:collapse;font-size:12px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:left\">Compteur</th><th style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center\">Relev\u00e9</th><th style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center\">Unit\u00e9</th></tr></thead><tbody>"+cptRows+"</tbody></table>"
          +"<h2>\U0001f511 Cl\u00e9s remises</h2><table style=\"width:100%;border-collapse:collapse;font-size:12px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:left\">Type</th><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:center;width:60px\">Nombre</th></tr></thead><tbody>"+cleRows+"</tbody></table><p style=\"text-align:right;font-weight:700;margin-top:4px\">Total : "+cleTotal+" cl\u00e9(s)</p>"
          +"<h2>\U0001f3e0 \u00c9tat des pi\u00e8ces</h2>"+piecesHtml
          +(invHtml?"<h2>\U0001f4e6 Inventaire mobilier</h2>"+invHtml:"")
          +(observations?"<h2>\U0001f4dd Observations</h2><div style=\"background:#FEF3C7;border:1px solid #FCD34D;border-radius:6px;padding:10px 14px;font-size:12px\">"+observations+"</div>":"")
          +"<h2>\u270d\ufe0f Signatures</h2><div style=\"display:flex;gap:20px\"><div style=\"flex:1\" class=\"sig-box\"><p style=\"font-size:10px;color:#6b7280\">LE BAILLEUR</p><p style=\"font-weight:700;margin-bottom:8px\">"+v(bailleurNom)+"</p>"+(signB?"<img src=\""+signB+"\" style=\"height:60px;border:1px solid #e5e7eb;border-radius:4px;padding:4px;background:#fff\"/><p style=\"font-size:10px;color:#059669;margin-top:4px\">\u2713 Sign\u00e9</p>":"<div style=\"height:60px;border:2px dashed #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:11px\">Signature du bailleur</div>")+"</div>"
          +"<div style=\"flex:1\" class=\"sig-box\"><p style=\"font-size:10px;color:#6b7280\">LE LOCATAIRE</p><p style=\"font-weight:700;margin-bottom:8px\">"+v(locataireNom)+"</p>"+(signL?"<img src=\""+signL+"\" style=\"height:60px;border:1px solid #e5e7eb;border-radius:4px;padding:4px;background:#fff\"/><p style=\"font-size:10px;color:#059669;margin-top:4px\">\u2713 Sign\u00e9</p>":"<div style=\"height:60px;border:2px dashed #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:11px\">Signature du locataire</div>")+"</div></div>"
          +"<div style=\"text-align:center;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px\"><button onclick=\"this.style.display='none';window.print();setTimeout(function(){document.querySelector('.print-btn').style.display='inline-flex'},1000)\" class=\"print-btn\" style=\"display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;border:none;background:#EC4899;color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:12px\">\ud83d\udda8\ufe0f Imprimer / Enregistrer en PDF</button><p style=\"color:#9ca3af;font-size:10px\">EQUITY \u2014 "+new Date().toLocaleString("fr-FR")+"<br/>Constat amiable de l\u2019\u00e9tat du logement.</p></div></body></html>";
        setEdlHtml(h);
        setShowEdlPreview(true);
      }}
        style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#EC4899,#BE185D)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 20px rgba(236,72,153,0.3)", transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(236,72,153,0.5)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(236,72,153,0.3)";}}>
        <I.FileText/> G\u00e9n\u00e9rer l'\u00e9tat des lieux (PDF)
      </button>

      {/* EDL Preview Modal */}
      {showEdlPreview && (<>
        <div onClick={()=>setShowEdlPreview(false)} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)" }}/>
        <div style={{ position:"fixed", top:"3vh", left:"50%", transform:"translateX(-50%)", zIndex:401, width:"min(820px,94vw)", height:"94vh", background:"#111", border:"1px solid "+C.border, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.7)", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"#0a0a0a" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#EC4899" }}><I.FileText/></div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:800, color:C.w }}>\u00c9tat des lieux d'entr\u00e9e</p>
              <p style={{ fontSize:10, color:C.g2 }}>Ctrl+P ou bouton Imprimer \u2192 Enregistrer en PDF</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>{try{edlIframeRef.current.contentWindow.print();}catch(e){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([edlHtml],{type:"text/html"}));a.download="EDL_"+new Date().toISOString().slice(0,10)+".html";a.click();}}}
                style={{ padding:"8px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#EC4899,#BE185D)", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 12px rgba(236,72,153,0.3)" }}>
                <I.FileText/> Imprimer / PDF
              </button>
              <button onClick={()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([edlHtml],{type:"text/html"}));a.download="EDL_"+new Date().toISOString().slice(0,10)+".html";a.click();}}
                style={{ padding:"8px 14px", borderRadius:9, border:"1px solid "+C.border2, background:"#1a1a1a", color:C.g1, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <I.Download/> HTML
              </button>
              <button onClick={()=>setShowEdlPreview(false)}
                style={{ width:32, height:32, borderRadius:8, border:"1px solid "+C.border2, background:"#1a1a1a", color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I.X/>
              </button>
            </div>
          </div>
          <iframe ref={edlIframeRef} srcDoc={edlHtml} style={{ flex:1, border:"none", width:"100%", background:"#fff", borderRadius:"0 0 18px 18px" }} title="EDL" sandbox="allow-same-origin allow-modals allow-scripts"/>
        </div>
      </>)}
    </div>
  );
}

function GestionTab({ tenant, assets, user, onUpdateTenant }) {
  const [activeStep, setActiveStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [stepStatus, setStepStatus] = useState({}); // step.id → "pending"|"inprogress"|"done"
  const [confFiles, setConfFiles] = useState({ assurance:[], energie:[] });
  const [confAnalyzing, setConfAnalyzing] = useState({ assurance:false, energie:false });
  const [confDone, setConfDone] = useState({ assurance:false, energie:false });
  const [showAttachPicker, setShowAttachPicker] = useState(false);
  const [attachSearch, setAttachSearch] = useState("");
  const [showDetachConfirm, setShowDetachConfirm] = useState(false);

  // ── Accord de principe flow ──
  const [accordEmail, setAccordEmail] = useState(tenant.mail || "");
  const [editingEmail, setEditingEmail] = useState(false);
  const [accordStatus, setAccordStatus] = useState(null); // null → "sending" → "sent" → "signed"
  const [accordSignature, setAccordSignature] = useState(null); // base64 signature
  const [accordSentDate, setAccordSentDate] = useState(null);
  const [accordSignedDate, setAccordSignedDate] = useState(null);
  const [showAccordPreview, setShowAccordPreview] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showBailPreview, setShowBailPreview] = useState(false);
  const [signatureCallback, setSignatureCallback] = useState(null);

  const saveEmail = (newEmail) => {
    setAccordEmail(newEmail);
    setEditingEmail(false);
    if (onUpdateTenant && newEmail !== tenant.mail) {
      onUpdateTenant({ ...tenant, mail: newEmail });
    }
  };

  const buildBailHtml = (mode) => {
    const preview = mode === "preview";
    const MISSING = '<span style="color:#888;font-style:italic;font-size:11px">[information requise]</span>';
    const M = (v, label) => {
      if (v && v !== "\u2014" && v !== "") return v;
      if (preview) return '<span style="color:#EF4444;font-weight:700;font-style:italic;font-size:11px">\u26a0 info manquante' + (label ? ' (' + label + ')' : '') + '</span>';
      return MISSING;
    };
    const bailleurName = (user?.prenom||"") + " " + (user?.nom||"");
    const bailleurNameD = bailleurName.trim() || MISSING;
    const prenomNom = (tenant.prenom||"") + " " + (tenant.nom||"");
    const prenomNomD = prenomNom.trim() || MISSING;
    const ci = tenant.ocrData?.carte_identite || {};
    const garants = tenant.garantsOcr || [];
    const bienAddr = [bien?.addr||"",bien?.addr2||""].filter(Boolean).join(", ") || tenant.bienAddr || "";
    const bienVille = bien?.ville || tenant.bienVille || "";
    const bienCP = bien?.codePostal || tenant.bienCodePostal || "";
    const loyerVal = bien?.loyer || tenant.loyerHC || "";
    const chargesVal = String(bien?.chargesLocatives || tenant.chargesLoc || "");
    const surface = bien?.surface || tenant.bienSurface || "";
    const rooms = bien?.rooms || tenant.bienRooms || "";
    const bienType = bien?.type || tenant.bienType || "";
    const etage = bien?.etage || "";
    const dpe = bien?.dpe || tenant.bienDpe || "";
    const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10) || 0;
    const chargesNum = parseInt(String(chargesVal).replace(/[^\d]/g,""),10) || 0;
    const totalMensuel = loyerNum + chargesNum;
    const today = new Date().toLocaleDateString("fr-FR");
    const motif = stepData.bailMotif || "";
    const duree = stepData.bailDuree || "";
    const dateEffet = stepData.bailDateEffet || "";
    const equipements = stepData.bailEquipements || "";
    const conditions = stepData.bailConditions || "";
    const periodicite = stepData.bailPeriodicite || "Mensuel";
    const datePaiement = stepData.bailDatePaiement || "le 1er de chaque mois";
    const garantsStr = garants.length > 0 ? garants.map(function(g){ return (g?.carte_identite?.prenom||"?") + " " + (g?.carte_identite?.nom||"?"); }).join(", ") : "";

    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bail Mobilit\u00e9 \u2014 EQUITY</title>' +
'<style>' +
'@media print{body{margin:0;padding:20px 35px}.no-print{display:none!important}@page{margin:14mm 18mm;size:A4}}' +
'body{font-family:Georgia,"Times New Roman",serif;color:#1a1a2e;line-height:1.65;max-width:700px;margin:0 auto;padding:40px;font-size:12.5px;background:#fff}' +
'h1{font-family:-apple-system,system-ui,sans-serif;font-size:22px;font-weight:800;text-align:center;letter-spacing:0.18em;margin:0 0 2px;text-transform:uppercase;color:#1a1a2e}' +
'.header-sub{font-family:-apple-system,system-ui,sans-serif;text-align:center;font-size:10px;color:#6b7280;letter-spacing:0.04em;margin-bottom:4px}' +
'.header-ref{font-family:-apple-system,system-ui,sans-serif;text-align:center;font-size:10px;color:#1a1a2e;font-weight:600;margin-bottom:4px}' +
'.header-line{width:100%;height:2px;background:linear-gradient(90deg,transparent,#1a1a2e,transparent);margin:10px 0 20px}' +
'.section-title{font-family:-apple-system,system-ui,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.14em;color:#6b7280;text-transform:uppercase;margin:24px 0 8px;padding:6px 0;border-bottom:1px solid #e5e7eb}' +
'h2{font-family:-apple-system,system-ui,sans-serif;font-size:13px;font-weight:700;color:#1a1a2e;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.02em}' +
'.party-block{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px 18px;margin:8px 0}' +
'.party-block .role{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.12em;color:#2563EB;text-transform:uppercase;margin-bottom:8px}' +
'.field-row{display:flex;margin-bottom:3px;font-size:12px}.field-row .lbl{color:#6b7280;min-width:160px;flex-shrink:0}.field-row .val{font-weight:600;color:#111}' +
'.article{margin:16px 0}.article p{margin:4px 0;text-align:justify}' +
'.article ul{margin:4px 0 4px 20px}.article li{margin-bottom:3px}' +
'.warn-box{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;font-size:11px;color:#92400e;margin:8px 0}' +
'.red-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:10px 14px;font-size:11px;color:#991b1b;margin:8px 0}' +
'.fin-table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12px}' +
'.fin-table td{padding:7px 12px;border-bottom:1px solid #f3f4f6}.fin-table td:last-child{font-weight:700;text-align:right;font-family:monospace;color:#1a1a2e}' +
'.fin-table tr.total td{border-top:2px solid #1a1a2e;font-weight:800;font-size:13px}' +
'.sig-block{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:36px;padding-top:20px;border-top:2px solid #1a1a2e}' +
'.sig-col{text-align:center}.sig-col .role{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.1em;color:#1a1a2e;text-transform:uppercase;margin-bottom:6px}' +
'.sig-col .name{font-size:13px;font-weight:700;margin-bottom:4px}' +
'.sig-col .mention{font-size:10px;color:#6b7280;font-style:italic;margin-bottom:10px}' +
'.sig-box{width:100%;height:80px;border:1.5px dashed #d1d5db;border-radius:6px}' +
'.footer{text-align:center;font-family:-apple-system,system-ui,sans-serif;color:#9ca3af;font-size:8.5px;margin-top:28px;padding-top:10px;border-top:1px solid #e5e7eb;letter-spacing:0.02em}' +
'.footer strong{color:#6b7280}' +
'.print-btn{position:fixed;top:16px;right:16px;background:#1a1a2e;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:100;font-family:-apple-system,system-ui,sans-serif}' +
'</style></head><body>' +
(preview ? "" : '<button class="no-print print-btn" onclick="window.print()">Imprimer / PDF</button>') +

'<h1>BAIL MOBILIT\u00c9</h1>' +
'<div class="header-ref">Loi n\u00b089-462 du 6 juillet 1989 \u2014 Articles 25-3 \u00e0 25-11</div>' +
'<div class="header-sub">Modifi\u00e9e par la loi ELAN n\u00b02018-1021 du 23 novembre 2018</div>' +
'<div class="header-sub">Logement meubl\u00e9 \u00e0 usage de r\u00e9sidence temporaire</div>' +
'<div class="header-line"></div>' +

'<div class="section-title">ENTRE LES SOUSSIGN\u00c9S</div>' +

'<div class="party-block"><div class="role">LE BAILLEUR</div>' +
'<div class="field-row"><div class="lbl">Nom / Raison sociale :</div><div class="val">' + M(bailleurNameD,"nom bailleur") + '</div></div>' +
'<div class="field-row"><div class="lbl">Adresse :</div><div class="val">' + M(user?.email,"adresse bailleur") + '</div></div>' +
'<div class="field-row"><div class="lbl">T\u00e9l\u00e9phone :</div><div class="val">' + M(user?.telephone,"t\u00e9l\u00e9phone bailleur") + '</div></div>' +
'<div class="field-row"><div class="lbl">Email :</div><div class="val">' + M(user?.email,"email bailleur") + '</div></div>' +
'</div>' +

'<div class="party-block"><div class="role">LE LOCATAIRE</div>' +
'<div class="field-row"><div class="lbl">Nom & Pr\u00e9nom :</div><div class="val">' + M(prenomNomD,"nom locataire") + '</div></div>' +
'<div class="field-row"><div class="lbl">Date de naissance :</div><div class="val">' + M(ci.date_naissance || tenant.dateNaissance,"date de naissance") + '</div></div>' +
'<div class="field-row"><div class="lbl">Lieu de naissance :</div><div class="val">' + M(ci.lieu_naissance || tenant.lieuNaissance,"lieu de naissance") + '</div></div>' +
'<div class="field-row"><div class="lbl">Nationalit\u00e9 :</div><div class="val">' + M(ci.nationalite || tenant.nationalite,"nationalit\u00e9") + '</div></div>' +
'<div class="field-row"><div class="lbl">Adresse actuelle :</div><div class="val">' + M(tenant.adresse,"adresse locataire") + '</div></div>' +
'<div class="field-row"><div class="lbl">Code postal / Ville :</div><div class="val">' + M(tenant.ville,"ville locataire") + '</div></div>' +
'</div>' +

(garantsStr ? '<div class="party-block"><div class="role">GARANT(S)</div><div class="field-row"><div class="lbl">Nom(s) :</div><div class="val">' + garantsStr + '</div></div></div>' : "") +

'<p style="text-align:center;font-weight:600;margin:16px 0">Il a \u00e9t\u00e9 convenu et arr\u00eat\u00e9 ce qui suit :</p>' +

'<h2>ARTICLE 1 \u2013 OBJET DU CONTRAT</h2>' +
'<div class="article"><p>Le bailleur loue au locataire le logement meubl\u00e9 d\u00e9sign\u00e9 ci-apr\u00e8s, \u00e0 titre de r\u00e9sidence temporaire, conform\u00e9ment aux articles 25-3 \u00e0 25-11 de la loi n\u00b089-462 du 6 juillet 1989 modifi\u00e9e par la loi ELAN n\u00b02018-1021 du 23 novembre 2018. Le pr\u00e9sent contrat est conclu en consid\u00e9ration de la situation de mobilit\u00e9 du locataire, laquelle constitue une condition essentielle et d\u00e9terminante dudit bail.</p></div>' +

'<h2>ARTICLE 2 \u2013 D\u00c9SIGNATION DU LOGEMENT</h2>' +
'<div class="article">' +
'<div class="field-row"><div class="lbl">Adresse :</div><div class="val">' + M(bienAddr,"adresse logement") + '</div></div>' +
'<div class="field-row"><div class="lbl">Code postal / Ville :</div><div class="val">' + M(bienCP,"code postal") + ' ' + M(bienVille,"ville") + '</div></div>' +
'<div class="field-row"><div class="lbl">Nature du bien :</div><div class="val">' + M(bienType,"type de bien") + '</div></div>' +
'<div class="field-row"><div class="lbl">Surface habitable :</div><div class="val">' + M(surface ? surface + " m\u00b2" : "","surface") + '</div></div>' +
'<div class="field-row"><div class="lbl">Nombre de pi\u00e8ces :</div><div class="val">' + M(rooms,"nb pi\u00e8ces") + '</div></div>' +
'<div class="field-row"><div class="lbl">\u00c9tage :</div><div class="val">' + M(etage,"\u00e9tage") + '</div></div>' +
'<div class="field-row"><div class="lbl">DPE :</div><div class="val">' + M(dpe ? "Classe " + dpe : "","DPE") + '</div></div>' +
'<div class="field-row"><div class="lbl">\u00c9quipements :</div><div class="val">' + M(equipements,"\u00e9quipements") + '</div></div>' +
'</div>' +

'<h2>ARTICLE 3 \u2013 DESTINATION DES LIEUX</h2>' +
'<div class="article"><p>Le logement est lou\u00e9 \u00e0 usage exclusif d\u2019habitation meubl\u00e9e, \u00e0 titre de r\u00e9sidence temporaire. Il ne pourra \u00eatre utilis\u00e9 \u00e0 des fins commerciales, artisanales ou professionnelles. Toute sous-location totale ou partielle ainsi que toute cession du bail sont interdites sans l\u2019accord expr\u00e8s et \u00e9crit pr\u00e9alable du bailleur.</p></div>' +

'<h2>ARTICLE 4 \u2013 DUR\u00c9E DU BAIL</h2>' +
'<div class="article"><p>Le pr\u00e9sent bail est consenti pour une dur\u00e9e de <strong>' + M(duree,"dur\u00e9e") + '</strong>, prenant effet le <strong>' + M(dateEffet,"date d\u2019effet") + '</strong>.</p>' +
'<p>Conform\u00e9ment \u00e0 l\u2019article 25-7 de la loi du 6 juillet 1989, le pr\u00e9sent bail ne peut \u00eatre ni renouvel\u00e9, ni reconduit. \u00c0 son terme, si le locataire maintient l\u2019occupation des lieux, le bailleur peut saisir la juridiction comp\u00e9tente afin d\u2019obtenir la lib\u00e9ration des lieux sans qu\u2019il soit n\u00e9cessaire de d\u00e9livrer un cong\u00e9 pr\u00e9alable.</p></div>' +

'<h2>ARTICLE 5 \u2013 LOYER ET CHARGES</h2>' +
'<div class="article">' +
'<table class="fin-table">' +
'<tr><td>Loyer mensuel hors charges</td><td>' + M(loyerVal ? loyerVal + " \u20ac" : "","loyer") + '</td></tr>' +
'<tr><td>Forfait de charges locatives</td><td>' + M(chargesVal ? chargesVal + " \u20ac/mois" : "","charges") + '</td></tr>' +
'<tr class="total"><td>Montant mensuel total (loyer + charges)</td><td>' + (totalMensuel > 0 ? totalMensuel + " \u20ac" : M("","montant total")) + '</td></tr>' +
'</table>' +
'<p>Le loyer est payable ' + periodicite.toLowerCase() + ', ' + datePaiement + ', d\u2019avance et sans escompte.</p>' +
'</div>' +

'<h2>ARTICLE 6 \u2013 D\u00c9P\u00d4T DE GARANTIE</h2>' +
'<div class="red-box"><strong>Conform\u00e9ment \u00e0 l\u2019article 25-7 de la loi n\u00b089-462 du 6 juillet 1989, aucun d\u00e9p\u00f4t de garantie ne peut \u00eatre exig\u00e9 du locataire dans le cadre du pr\u00e9sent bail mobilit\u00e9.</strong> Le bailleur peut recourir au dispositif Visale propos\u00e9 par Action Logement (visale.fr).</div>' +

'<h2>ARTICLE 7 \u2013 MOTIF DE MOBILIT\u00c9</h2>' +
'<div class="article"><p>Le locataire justifie sa situation de mobilit\u00e9 professionnelle ou de formation au titre de : <strong>' + M(motif,"motif de mobilit\u00e9") + '</strong>.</p>' +
'<p>Le locataire s\u2019engage \u00e0 produire au bailleur, dans les quinze (15) jours suivant la signature des pr\u00e9sentes, tout justificatif attestant de ladite situation de mobilit\u00e9.</p></div>' +

'<h2>ARTICLE 8 \u2013 OBLIGATIONS DU BAILLEUR</h2>' +
'<div class="article"><p>Le bailleur s\u2019engage \u00e0 :</p><ul>' +
'<li>D\u00e9livrer un logement d\u00e9cent (d\u00e9cret n\u00b02002-120 du 30 janvier 2002) en bon \u00e9tat d\u2019usage et de r\u00e9paration ;</li>' +
'<li>Assurer au locataire la jouissance paisible du logement et le garantir des vices ou d\u00e9fauts ;</li>' +
'<li>Entretenir les locaux en \u00e9tat de servir \u00e0 l\u2019usage pr\u00e9vu ;</li>' +
'<li>Remettre gratuitement un exemplaire original du pr\u00e9sent contrat.</li>' +
'</ul></div>' +

'<h2>ARTICLE 9 \u2013 OBLIGATIONS DU LOCATAIRE</h2>' +
'<div class="article"><p>Le locataire s\u2019engage \u00e0 :</p><ul>' +
'<li>Payer le loyer et les charges aux termes convenus ;</li>' +
'<li>User paisiblement des locaux lou\u00e9s suivant la destination pr\u00e9vue ;</li>' +
'<li>R\u00e9pondre des d\u00e9gradations et pertes survenues pendant la dur\u00e9e du contrat ;</li>' +
'<li>Souscrire une assurance contre les risques locatifs et en justifier \u00e0 la remise des cl\u00e9s ;</li>' +
'<li>Ne pas transformer les lieux lou\u00e9s sans l\u2019accord \u00e9crit pr\u00e9alable du bailleur ;</li>' +
'<li>Laisser ex\u00e9cuter les travaux d\u2019am\u00e9lioration ou de mise en conformit\u00e9.</li>' +
'</ul></div>' +

(conditions ? '<h2>ARTICLE 10 \u2013 CLAUSES PARTICULI\u00c8RES</h2><div class="article"><p>' + conditions + '</p></div>' : '') +

'<h2>ARTICLE ' + (conditions ? "11" : "10") + ' \u2013 DISPOSITIONS G\u00c9N\u00c9RALES</h2>' +
'<div class="article"><p>Le pr\u00e9sent bail est soumis aux dispositions d\u2019ordre public de la loi n\u00b089-462 du 6 juillet 1989, notamment ses articles 25-3 \u00e0 25-11 relatifs au bail mobilit\u00e9 tels qu\u2019issus de la loi ELAN n\u00b02018-1021 du 23 novembre 2018.</p>' +
'<p>Pour tout litige relatif \u00e0 l\u2019ex\u00e9cution ou \u00e0 l\u2019interpr\u00e9tation du pr\u00e9sent contrat, les parties s\u2019engagent \u00e0 rechercher une solution amiable pr\u00e9alablement \u00e0 tout recours judiciaire. Le locataire fait \u00e9lection de domicile dans le logement lou\u00e9 pour la dur\u00e9e du pr\u00e9sent bail.</p></div>' +

'<div class="section-title">FAIT ET SIGN\u00c9</div>' +
'<p style="text-align:center;margin-bottom:24px">Fait \u00e0 ' + M(bienVille,"ville") + ', le ' + today + ', en deux (2) exemplaires originaux, dont un remis \u00e0 chacune des parties.</p>' +

'<div class="sig-block">' +
'<div class="sig-col"><div class="role">LE BAILLEUR</div><div class="name">' + bailleurNameD + '</div><div class="mention">Pr\u00e9c\u00e9d\u00e9 de la mention \u00ab Lu et approuv\u00e9 \u00bb</div><div class="sig-box"></div></div>' +
'<div class="sig-col"><div class="role">LE LOCATAIRE</div><div class="name">' + prenomNomD + '</div><div class="mention">Pr\u00e9c\u00e9d\u00e9 de la mention \u00ab Lu et approuv\u00e9 \u00bb</div><div class="sig-box"></div></div>' +
'</div>' +

'<div class="footer">BAIL MOBILIT\u00c9 \u00b7 Loi n\u00b089-462 du 6 juillet 1989 modifi\u00e9e par loi ELAN n\u00b02018-1021 du 23 novembre 2018 \u00b7 <strong>G\u00e9n\u00e9r\u00e9 par EQUITY</strong> \u00b7 ' + today + '</div>' +
'</body></html>';
  };

  const downloadBailMobilite = () => {
    const html = buildBailHtml("download");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const bienName = bien?.name||tenant.bienName||"bien";
    a.download = "Bail_Mobilite_" + (tenant.nom||"locataire").replace(/\s/g,"_") + "_" + bienName.replace(/\s/g,"_") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };


  const downloadAccordPDF = () => {
    const MR = '<span style="color:#888;font-style:italic">[information requise]</span>';
    const bailleurName = `${user?.prenom||""} ${user?.nom||""}`.trim() || MR;
    const bienName = bien?.name || tenant.bienName || MR;
    const bienAddress = [bien?.addr||"", bien?.addr2||"", bien?.batiment||"", bien?.ville||"", bien?.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || MR;
    const loyerVal = bien?.loyer || tenant.loyerHC || MR;
    const chargesVal = bien?.chargesLocatives || tenant.chargesLoc || MR;
    const depotVal = tenant.depotGarantieCalc || MR;
    const bailDuree = tenant.dureeBail || MR;
    const bienType = bien?.type || tenant.bienType || MR;
    const bienSurface = bien?.surface || tenant.bienSurface || MR;
    const bienDpe = bien?.dpe || tenant.bienDpe || MR;
    const prenomNom = `${tenant.prenom||""} ${tenant.nom||""}`.trim();
    const ci = tenant.ocrData?.carte_identite || {};
    const garants = tenant.garantsOcr || [];
    const today = new Date().toLocaleDateString("fr-FR");
    const expiry = new Date(Date.now() + 72*3600000).toLocaleDateString("fr-FR");
    const signatureHtml = accordSignature
      ? "<div style=\"margin-top:8px\"><img src=\""+accordSignature+"\" style=\"height:60px;border:1px solid #e5e7eb;border-radius:4px;padding:4px;background:#fff\"/></div><p style=\"font-size:11px;color:#10B981;margin-top:4px\">✓ Signé le "+(accordSignedDate||today)+"</p>"
      : `<div style="width:100%;height:80px;border:2px dashed #d1d5db;border-radius:8px;margin-top:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:13px">Signature du preneur</div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Accord de Principe — ${bienName}</title>
<style>
@media print { body{margin:0;padding:20px 40px} .no-print{display:none!important} @page{margin:15mm 20mm} }
body{font-family:-apple-system,system-ui,sans-serif;color:#111;line-height:1.6;max-width:720px;margin:0 auto;padding:40px;font-size:13px}
h1{font-size:22px;font-weight:800;letter-spacing:-0.03em;margin:0 0 4px}
h2{font-size:14px;font-weight:700;color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:4px;margin:24px 0 12px;letter-spacing:0.02em}
.header{text-align:center;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px}
.header .logo{display:inline-block;width:36px;height:36px;background:#2563EB;border-radius:8px;color:#fff;font-weight:800;font-size:16px;line-height:36px;text-align:center;margin-bottom:8px}
.header .sub{color:#6b7280;font-size:11px;letter-spacing:0.1em;text-transform:uppercase}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}
.field{margin-bottom:4px}.field .lbl{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1px}.field .val{font-size:13px;font-weight:600}
.table{width:100%;border-collapse:collapse;margin:8px 0}
.table th{text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;border-bottom:1px solid #e5e7eb}
.table td{padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}
.table td:last-child{font-weight:700;text-align:right;font-family:monospace}
.conditions{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin:8px 0}
.conditions li{margin-bottom:6px}
.legal{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-size:11px;color:#6b7280;font-style:italic;margin-top:12px}
.sig-block{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb}
.sig-col{text-align:center}
.sig-col .role{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}
.sig-col .name{font-size:13px;font-weight:700;margin-bottom:8px}
.print-btn{position:fixed;top:20px;right:20px;background:#2563EB;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,0.3)}
.print-btn:hover{background:#1d4ed8}
</style></head><body>
<button class="no-print print-btn" onclick="window.print()">Imprimer / Enregistrer PDF</button>
<div class="header">
<div class="logo">E</div>
<h1>Accord de Principe</h1>
<div class="sub">EQUITY · Gestion Patrimoniale · ${today}</div>
</div>

<h2>1 · Identification des Parties</h2>
<div class="grid">
<div class="field"><div class="lbl">Le Bailleur</div><div class="val">${bailleurName}</div></div>
<div class="field"><div class="lbl">Adresse de gestion</div><div class="val">${user?.email||"—"}</div></div>
<div class="field"><div class="lbl">Le Preneur</div><div class="val">${prenomNom}</div></div>
<div class="field"><div class="lbl">Date de naissance</div><div class="val">${ci.date_naissance||tenant.dateNaissance||"—"}</div></div>
<div class="field"><div class="lbl">Nationalité</div><div class="val">${ci.nationalite||tenant.nationalite||"—"}</div></div>
<div class="field"><div class="lbl">Employeur</div><div class="val">${ci.employeur||tenant.employeur||"—"}</div></div>
</div>
${garants.length>0?"<p style=\"font-size:11px;color:#6b7280;margin-top:8px\"><strong>Garant(s) :</strong> "+garants.map((g,i)=>(g?.carte_identite?.prenom||"?")+" "+(g?.carte_identite?.nom||"?")).join(", ")+"</p>":""}

<h2>2 · Désignation du Bien</h2>
<div class="grid">
<div class="field" style="grid-column:span 2"><div class="lbl">Adresse exacte</div><div class="val">${bienAddress}</div></div>
<div class="field"><div class="lbl">Type / Description</div><div class="val">${bienType} · ${bienSurface} m²</div></div>
<div class="field"><div class="lbl">DPE</div><div class="val">Classe ${bienDpe}</div></div>
<div class="field" style="grid-column:span 2"><div class="lbl">Usage</div><div class="val">Habitation exclusivement</div></div>
</div>

<h2>3 · Conditions Financières</h2>
<table class="table">
<thead><tr><th>Poste</th><th>Détail</th></tr></thead>
<tbody>
<tr><td>Loyer hors charges</td><td>${loyerVal} €/mois</td></tr>
<tr><td>Provisions sur charges</td><td>${chargesVal} €/mois</td></tr>
<tr><td>Dépôt de garantie</td><td>${depotVal} €</td></tr>
<tr><td>Honoraires / Frais</td><td>—</td></tr>
</tbody>
</table>

<h2>4 · Calendrier d'Entrée</h2>
<div class="grid">
<div class="field"><div class="lbl">Durée du bail</div><div class="val">${bailDuree}</div></div>
<div class="field"><div class="lbl">Date de prise d'effet</div><div class="val">${stepData.datePriseEffet||"À définir"}</div></div>
</div>

<h2>5 · Conditions Suspensives</h2>
<div class="conditions">
<p style="font-size:11px;font-weight:700;margin-bottom:8px">L'accord est conditionné à la réalisation des éléments suivants :</p>
<ol style="margin:0;padding-left:20px">
<li>Fourniture de l'<strong>attestation d'assurance habitation</strong> couvrant les risques locatifs.</li>
<li>Paiement du <strong>dépôt de garantie</strong> (${depotVal} €) et du <strong>1er loyer</strong> (${loyerVal} €).</li>
<li>Validation définitive de la <strong>caution</strong> (acte de cautionnement signé).</li>
</ol>
</div>

<h2>6 · Validité et Désengagement</h2>
<p>Cet accord est valable <strong>72 heures</strong>, soit jusqu'au <strong>${expiry}</strong>. Passé ce délai, le bien sera remis sur le marché.</p>
<div class="legal">
Cet accord de principe ne vaut pas bail et ne constitue pas un engagement définitif. L'entrée dans les lieux est strictement conditionnée à la signature du contrat de location définitif et à la réalisation de l'ensemble des conditions suspensives mentionnées ci-dessus.
</div>

<div class="sig-block">
<div class="sig-col">
<div class="role">Le Bailleur</div>
<div class="name">${bailleurName}</div>
<div style="width:100%;height:80px;border:2px dashed #d1d5db;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:12px">Signature du bailleur</div>
<p style="font-size:11px;color:#9ca3af;margin-top:6px">Fait à ____________, le ${today}</p>
</div>
<div class="sig-col">
<div class="role">Le Preneur</div>
<div class="name">${prenomNom}</div>
${signatureHtml}
<p style="font-size:11px;color:#9ca3af;margin-top:6px">Fait à ____________, le ${today}</p>
</div>
</div>

<p style="text-align:center;color:#9ca3af;font-size:10px;margin-top:30px;border-top:1px solid #e5e7eb;padding-top:12px">
Document généré par EQUITY · Gestion Patrimoniale Intelligente · ${today}
</p>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Accord_Principe_${(tenant.nom||"locataire").replace(/\s/g,"_")}_${(bien?.name||tenant.bienName||"bien").replace(/\s/g,"_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const sendAccord = () => {
    if (!accordEmail) return;
    // Build email content
    const bailleurName = `${user?.prenom||""} ${user?.nom||""}`.trim() || "Le bailleur";
    const bienName = bien?.name || tenant.bienName || "le bien";
    const bienAddress = [bien?.addr||"", bien?.ville||tenant.bienVille||""].filter(Boolean).join(", ");
    const loyerVal = bien?.loyer || tenant.loyerHC || "—";
    const chargesVal = bien?.chargesLocatives || tenant.chargesLoc || "—";
    const depotVal = tenant.depotGarantieCalc || "—";
    const bailDuree = tenant.dureeBail || "—";
    const today = new Date().toLocaleDateString("fr-FR");
    const expiry = new Date(Date.now() + 72*3600000).toLocaleDateString("fr-FR");

    const subject = `Accord de Principe — ${bienName} — EQUITY`;
    const body = [
      `Bonjour ${tenant.prenom||""},`,
      ``,
      `Suite à notre échange, nous avons le plaisir de vous transmettre l'accord de principe pour votre future location.`,
      ``,
      `═══════════════════════════════`,
      `BIEN CONCERNÉ`,
      `═══════════════════════════════`,
      `Bien : ${bienName}`,
      `Adresse : ${bienAddress}`,
      `Type : ${bien?.type||tenant.bienType||"—"}`,
      `Surface : ${bien?.surface||tenant.bienSurface||"—"} m²`,
      ``,
      `═══════════════════════════════`,
      `CONDITIONS FINANCIÈRES`,
      `═══════════════════════════════`,
      `Loyer hors charges : ${loyerVal} €/mois`,
      `Charges locatives : ${chargesVal} €/mois`,
      `Dépôt de garantie : ${depotVal} €`,
      `Durée du bail : ${bailDuree}`,
      ``,
      `═══════════════════════════════`,
      `PARTIES`,
      `═══════════════════════════════`,
      `Bailleur : ${bailleurName}`,
      `Preneur : ${tenant.prenom||""} ${tenant.nom||""}`,
      tenant.garantsOcr?.length > 0 ? "Garant(s) : "+tenant.garantsOcr.map((g,i)=>(g?.carte_identite?.prenom||"?")+" "+(g?.carte_identite?.nom||"?")).join(", ") : "",
      ``,
      `═══════════════════════════════`,
      `CONDITIONS SUSPENSIVES`,
      `═══════════════════════════════`,
      `Cet accord est conditionné à :`,
      `1. Fourniture de l'attestation d'assurance habitation`,
      `2. Paiement du dépôt de garantie (${depotVal} €) + 1er loyer (${loyerVal} €)`,
      `3. Validation de la caution (acte de cautionnement signé)`,
      ``,
      `═══════════════════════════════`,
      `VALIDITÉ`,
      `═══════════════════════════════`,
      `Cet accord est valable 72 heures, soit jusqu'au ${expiry}.`,
      `Passé ce délai, le bien sera remis sur le marché.`,
      ``,
      `Cet accord de principe ne vaut pas bail et ne constitue pas un engagement définitif. L'entrée dans les lieux est strictement conditionnée à la signature du contrat de location définitif.`,
      ``,
      `Pour accepter cet accord, veuillez répondre à cet e-mail en confirmant votre accord et en joignant votre signature.`,
      ``,
      `Cordialement,`,
      `${bailleurName}`,
      `EQUITY — Gestion Patrimoniale`,
    ].filter(l => l !== undefined).join("\n");

    // Open mailto
    const mailto = `mailto:${encodeURIComponent(accordEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");

    // Update status
    setAccordStatus("sending");
    setTimeout(() => {
      setAccordStatus("sent");
      setAccordSentDate(new Date().toLocaleString("fr-FR"));
    }, 1500);
  };

  const simulateSignature = (signatureData) => {
    if (signatureCallback) {
      signatureCallback(signatureData);
      setSignatureCallback(null);
      setShowSignaturePad(false);
      return;
    }
    setAccordSignature(signatureData);
    setAccordStatus("signed");
    setAccordSignedDate(new Date().toLocaleString("fr-FR"));
    setShowSignaturePad(false);
    markDone("accord");
  };

  const readB64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=()=>rej(new Error("Read failed")); r.readAsDataURL(file); });

  const setField = (key, val) => setStepData(d=>({...d,[key]:val}));

  const bien = assets?.find(a=>a.id===tenant.bienId);

  // ── Pre-fill stepData from bien + tenant data on mount ──
  useEffect(() => {
    if (!bien && !tenant.bienId) return;
    const b = bien || {};
    const loyerVal = b.loyer || tenant.loyerHC || "";
    const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10) || 0;
    const isVide = (b.typeLocation||tenant.bienTypeLocation||"").toLowerCase().includes("vide");
    const depotCalc = tenant.depotGarantieCalc || (loyerNum > 0 ? String(isVide ? loyerNum : loyerNum * 2) : "");
    const chargesVal = String(b.chargesLocatives || tenant.chargesLoc || "");
    const adresseComplete = [b.addr||"", b.addr2||"", b.batiment||"", b.ville||"", b.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || "";

    setStepData(prev => {
      const d = {...prev};
      // Accord
      if (!d.loyerAccorde && loyerVal) d.loyerAccorde = String(loyerVal);
      // Bail
      if (!d.bailType) d.bailType = isVide ? "Location vide — 3 ans renouvelable" : "Meublé — 1 an renouvelable";
      // Paiement
      if (!d.depotGarantie && depotCalc) d.depotGarantie = depotCalc + " €";
      if (!d.premierLoyer && loyerVal) d.premierLoyer = loyerVal + " €";
      // Bail mobilité
      if (!d.bailMotif) d.bailMotif = "";
      if (!d.bailDuree) d.bailDuree = "";
      if (!d.bailDateEffet) d.bailDateEffet = d.datePriseEffet || "";
      if (!d.bailChargesForfait && chargesVal) d.bailChargesForfait = chargesVal;
      if (!d.bailPeriodicite) d.bailPeriodicite = b.frequencePaiement || "Mensuel";
      if (!d.bailDatePaiement) d.bailDatePaiement = "Le 1er de chaque mois";
      // EDL
      if (!d.lieuRdv && adresseComplete) d.lieuRdv = adresseComplete;
      return d;
    });
  }, [bien, tenant.bienId]);

  const getStatus = (idx) => {
    const sid = GESTION_STEPS[idx].id;
    if (stepStatus[sid]==="done") return "done";
    if (stepStatus[sid]==="inprogress") return "inprogress";
    // Auto-detect: first non-done step is current
    for (let i=0; i<GESTION_STEPS.length; i++) {
      if (stepStatus[GESTION_STEPS[i].id]!=="done") return i===idx ? "current" : i<idx ? "done" : "future";
    }
    return "future";
  };

  const markDone = (stepId) => {
    setStepStatus(s=>({...s,[stepId]:"done"}));
    // Auto-advance to next step
    const idx = GESTION_STEPS.findIndex(s=>s.id===stepId);
    if (idx < GESTION_STEPS.length - 1) setTimeout(()=>setActiveStep(idx+1), 400);
  };

  const handleConfFile = async (zone, file) => {
    setConfFiles(f=>({...f,[zone]:[...f[zone],file]}));
    setConfAnalyzing(a=>({...a,[zone]:true}));
    setTimeout(()=>{ setConfAnalyzing(a=>({...a,[zone]:false})); setConfDone(d=>({...d,[zone]:true})); }, 2200);
  };

  const removeConfFile = (zone, index) => {
    setConfFiles(f=>{
      const arr = f[zone].filter((_,i)=>i!==index);
      if(arr.length===0) setConfDone(d=>({...d,[zone]:false}));
      return {...f,[zone]:arr};
    });
  };

  const step = GESTION_STEPS[activeStep];
  const StepIcon = GESTION_ICONS[step.icon];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp 0.25s ease" }}>

      {/* ── Bien rattaché banner ── */}
      {bien ? (
        <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><I.Home/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.green, marginBottom:1 }}>BIEN RATTACHÉ</p>
            <p style={{ fontSize:12, fontWeight:700 }}>{bien.name||tenant.bienName||"Bien"} <span style={{ fontWeight:400, color:C.g2 }}>— {bien.addr||bien.ville||tenant.bienAddr||""}</span></p>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {(bien.loyer||tenant.loyerHC) && <span style={{ fontSize:11, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{bien.loyer||tenant.loyerHC} €/mois</span>}
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"3px 8px", borderRadius:5 }}>Actif</span>
            <button onClick={()=>setShowDetachConfirm(true)}
              style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:7, padding:"4px 10px", color:C.red, fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:C.mono, letterSpacing:"0.05em", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.12)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.06)";}}>
              Détacher
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:14, padding:"20px", textAlign:"center" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.yellow, margin:"0 auto 12px" }}><I.Home/></div>
          <p style={{ fontSize:14, fontWeight:700, color:C.w, marginBottom:4 }}>Aucun bien rattaché</p>
          <p style={{ fontSize:11, color:C.g2, marginBottom:14 }}>Sélectionnez un bien pour démarrer la gestion locative de ce dossier.</p>
          <button onClick={()=>setShowAttachPicker(true)}
            style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#F59E0B,#D97706)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 4px 16px rgba(245,158,11,0.3)" }}>
            <I.Home/> Sélectionner un bien
          </button>

          {/* Attach picker modal */}
          {showAttachPicker && (
            <div style={{ marginTop:16, textAlign:"left", background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:12, padding:"14px", maxHeight:320, overflowY:"auto" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <input type="text" value={attachSearch} onChange={e=>setAttachSearch(e.target.value)} placeholder="Rechercher un bien…"
                  style={{ flex:1, background:"#111", border:"1px solid "+C.border, borderRadius:8, padding:"7px 12px", fontSize:12, color:C.w, outline:"none" }}/>
                <button onClick={()=>{setShowAttachPicker(false);setAttachSearch("");}}
                  style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:4 }}><I.X/></button>
              </div>
              {(assets||[]).filter(a => {
                if (!attachSearch) return true;
                const s = attachSearch.toLowerCase();
                return (a.name||"").toLowerCase().includes(s) || (a.addr||"").toLowerCase().includes(s) || (a.ville||"").toLowerCase().includes(s);
              }).length === 0 ? (
                <p style={{ fontSize:11, color:C.g3, textAlign:"center", padding:12 }}>Aucun bien trouvé. Créez d’abord un bien dans Patrimoine.</p>
              ) : (assets||[]).filter(a => {
                if (!attachSearch) return true;
                const s = attachSearch.toLowerCase();
                return (a.name||"").toLowerCase().includes(s) || (a.addr||"").toLowerCase().includes(s) || (a.ville||"").toLowerCase().includes(s);
              }).map(a => (
                <button key={a.id} onClick={()=>{
                  if (!onUpdateTenant) return;
                  onUpdateTenant({
                    ...tenant,
                    bienId:a.id, bienName:a.name, bienType:a.type, bienAddr:a.addr, bienVille:a.ville, bienCodePostal:a.codePostal,
                    bienSurface:a.surface, bienRooms:a.rooms, bienDpe:a.dpe, bienYear:a.year, bienTypeLocation:a.typeLocation, bienMode:a.mode,
                    loyerHC:a.loyer, chargesLoc:a.chargesLocatives, depotGarantieCalc:a.depotGarantie, frequencePaiement:a.frequencePaiement, dureeBail:a.dureeBail,
                    loyer: tenant.loyer === "\u2014 \u20ac" ? (a.loyer||tenant.loyer) : tenant.loyer,
                  });
                  setShowAttachPicker(false); setAttachSearch("");
                }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"transparent", border:"1px solid "+C.border, borderRadius:10, cursor:"pointer", marginBottom:6, textAlign:"left", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.border;}}>
                  <div style={{ width:32, height:32, borderRadius:8, background:C.blueSub, border:"1px solid rgba(59,130,246,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Home/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:C.w, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                    <p style={{ fontSize:10, color:C.g2 }}>{a.addr} {a.ville} · {a.surface} · {a.type}</p>
                  </div>
                  {a.loyer && <span style={{ fontSize:11, fontWeight:700, color:C.blue, fontFamily:C.mono, flexShrink:0 }}>{a.loyer} €</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {bien && (<>

      {/* Detach confirmation */}
      {showDetachConfirm && (
        <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:12, padding:"16px", marginBottom:8 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.w, marginBottom:4 }}>Détacher ce locataire ?</p>
          <p style={{ fontSize:11, color:C.g2, marginBottom:12 }}>{tenant.prenom} {tenant.nom} sera détaché(e) de {bien?.name||"ce bien"}. La gestion locative sera réinitialisée.</p>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setShowDetachConfirm(false)}
              style={{ background:"#1a1a1a", border:"1px solid "+C.border2, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:11, cursor:"pointer" }}>Annuler</button>
            <button onClick={()=>{
              setShowDetachConfirm(false);
              if (onUpdateTenant) onUpdateTenant({ ...tenant, bienId:null, bienName:null, bienType:null, bienAddr:null, bienVille:null, bienCodePostal:null, bienSurface:null, bienRooms:null, bienDpe:null, bienYear:null, bienTypeLocation:null, bienMode:null, loyerHC:null, chargesLoc:null, depotGarantieCalc:null, frequencePaiement:null, dureeBail:null });
            }}
              style={{ background:"linear-gradient(135deg,#EF4444,#DC2626)", border:"none", borderRadius:8, padding:"6px 16px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Confirmer</button>
          </div>
        </div>
      )}

      {/* ── 5-STEP STEPPER ── */}
      <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 28px 20px" }}>
        {/* Step nodes + connectors */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative", marginBottom:28 }}>
          {/* Background connector line */}
          <div style={{ position:"absolute", top:20, left:40, right:40, height:2, background:"#1e1e1e", zIndex:0 }}/>
          {/* Progress line */}
          <div style={{ position:"absolute", top:20, left:40, height:2, background:`linear-gradient(90deg,${C.green},${C.blue})`, zIndex:1, transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)", width:`${Math.max(0, (Object.values(stepStatus).filter(v=>v==="done").length / (GESTION_STEPS.length-1)) * (100 - 16))}%`, borderRadius:99 }}/>

          {GESTION_STEPS.map((s, i) => {
            const status = getStatus(i);
            const isActive = i === activeStep;
            const isDone = status === "done" || stepStatus[s.id]==="done";
            const SIcon = GESTION_ICONS[s.icon];
            const col = isDone ? C.green : isActive ? s.color : "#333";
            return (
              <div key={s.id} onClick={()=>setActiveStep(i)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, cursor:"pointer", zIndex:2, flex:1, minWidth:0 }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%",
                  background: isDone ? "rgba(16,185,129,0.15)" : isActive ? `${s.color}18` : "#141414",
                  border: `2px solid ${isDone ? C.green : isActive ? s.color : "#2a2a2a"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color: isDone ? C.green : isActive ? s.color : C.g3,
                  boxShadow: isActive ? `0 0 20px ${s.color}30` : isDone ? `0 0 12px ${C.green}25` : "none",
                  transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}>
                  {isDone
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <SIcon/>
                  }
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:9, fontWeight:isActive?800:600, color: isDone ? C.green : isActive ? s.color : C.g3, fontFamily:C.mono, letterSpacing:"0.04em", transition:"color 0.3s", lineHeight:1.3, maxWidth:90 }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Active Step Detail Card ── */}
        <div key={step.id} style={{ background:"#0a0a0a", border:`1px solid ${step.color}22`, borderRadius:14, padding:"22px 20px", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)" }}>
          {/* Step header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${step.color}14`, border:`1px solid ${step.color}30`, display:"flex", alignItems:"center", justifyContent:"center", color:step.color }}>
              <StepIcon/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.01em" }}>{step.label}</span>
                <span style={{ fontSize:8, fontFamily:C.mono, color:step.color, background:`${step.color}12`, border:`1px solid ${step.color}25`, padding:"2px 7px", borderRadius:4 }}>ÉTAPE {activeStep+1}/{GESTION_STEPS.length}</span>
                {stepStatus[step.id]==="done"&&<span style={{ fontSize:8, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"2px 7px", borderRadius:4 }}>COMPLÉTÉ</span>}
              </div>
              <p style={{ fontSize:11, color:C.g2, lineHeight:1.5 }}>{step.desc}</p>
            </div>
          </div>

          {/* ── Custom Accord Section ── */}
          {step.customRender && step.id==="accord" && (
            <AccordSection tenant={tenant} bien={bien} user={user} stepData={stepData} setField={setField}/>
          )}

          {/* ── Custom Bail Mobilité Section ── */}
          {step.customRender && step.id==="bail" && (
            <BailMobiliteSection tenant={tenant} bien={bien} user={user} stepData={stepData} setField={setField}/>
          )}

          {/* ── Custom EDL Section ── */}
          {step.customRender && step.id==="edl" && (
            <DigitalEDL tenant={tenant} bien={bien} user={user} stepData={stepData} setField={setField}
              onSign={(role, cb) => {
                setShowSignaturePad(true);
                setSignatureCallback(() => cb);
              }}/>
          )}

          {/* ── Fields ── */}
          {step.fields && !step.customRender && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {step.fields.map(f => (
                <div key={f.key} style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, marginBottom:5, textTransform:"uppercase" }}>{f.label}</p>
                  {f.type==="date" ? (
                    <DatePickerInput value={stepData[f.key]||""} onChange={v=>!f.readOnly&&setField(f.key,v)} placeholder={f.placeholder}/>
                  ) : (
                    <input type="text"
                      value={stepData[f.key]||""} onChange={e=>!f.readOnly&&setField(f.key,e.target.value)}
                      placeholder={f.placeholder} readOnly={f.readOnly}
                      style={{ background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:600, color:C.w, width:"100%" }}
                  />
                  )}
                </div>
              ))}
            </div>
          )}



          {/* ── Document upload (conformité step) ── */}
          {step.documents && (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              {step.documents.map(doc => {
                const fileList = confFiles[doc.key]||[];
                const isAnalyzing = confAnalyzing[doc.key];
                const isDone = confDone[doc.key];
                const inputId = `conf-upload-${doc.key}`;
                return (
                  <div key={doc.key} style={{ background:"#0d0d0f", border:`1px dashed ${isDone?C.green:step.color+"40"}`, borderRadius:12, padding:"16px", transition:"all 0.2s" }}>
                    <input id={inputId} type="file" multiple style={{ display:"none" }} onChange={e=>{[...e.target.files].forEach(f=>handleConfFile(doc.key,f));e.target.value="";}}/>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:fileList.length>0?10:0 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:isDone?"rgba(16,185,129,0.12)":`${step.color}10`, border:`1px solid ${isDone?C.greenBord:step.color+"25"}`, display:"flex", alignItems:"center", justifyContent:"center", color:isDone?C.green:step.color }}>
                        {isDone ? <I.CheckCircle/> : isAnalyzing ? <div style={{ animation:"spin 1s linear infinite" }}><I.Loader/></div> : <I.Upload2/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:12, fontWeight:700, color:isDone?C.green:C.w, marginBottom:1 }}>{isDone?"Document vérifié ✓":doc.label}</p>
                        <p style={{ fontSize:10, color:C.g2 }}>{doc.subLabel}</p>
                      </div>
                      {isAnalyzing && <span style={{ fontSize:8, fontFamily:C.mono, color:step.color, background:`${step.color}12`, border:`1px solid ${step.color}25`, padding:"3px 8px", borderRadius:5, animation:"pulse 1.5s infinite" }}>Analyse IA en cours…</span>}
                      <button onClick={()=>document.getElementById(inputId).click()} style={{ background:`${step.color}10`, border:`1px solid ${step.color}25`, borderRadius:7, padding:"6px 12px", color:step.color, fontSize:10, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                        <I.Upload2/> {fileList.length>0?"+ Ajouter":"Déposer"}
                      </button>
                    </div>
                    {fileList.length>0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        {fileList.map((f,fi)=>(
                          <div key={fi} style={{ display:"flex", alignItems:"center", gap:6, background:"#0a0a0a", borderRadius:6, padding:"5px 8px" }}>
                            <I.File/><span style={{ fontSize:9, color:C.g1, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:C.mono }}>{f.name}</span>
                            <button onClick={()=>removeConfFile(doc.key,fi)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, display:"flex", padding:0, opacity:0.6 }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}><I.X/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Accord: Custom action flow ── */}
          {step.id==="accord" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Status tracker */}
              {accordStatus && (
                <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue }}>SUIVI DE L'ACCORD</span>
                  </div>
                  <div style={{ display:"flex", gap:0 }}>
                    {[
                      { id:"sent", label:"Envoyé", sub:accordSentDate||"—", icon:"mail" },
                      { id:"pending", label:"En attente", sub:"Signature locataire", icon:"clock" },
                      { id:"signed", label:"Signé", sub:accordSignedDate||"—", icon:"check" },
                    ].map((s,i) => {
                      const isDone = s.id==="sent" ? !!accordSentDate : s.id==="signed" ? accordStatus==="signed" : accordStatus==="sent";
                      const isCurrent = s.id==="pending" && accordStatus==="sent";
                      const col = isDone ? C.green : isCurrent ? C.yellow : C.g3;
                      return (
                        <div key={s.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, position:"relative" }}>
                          {i>0 && <div style={{ position:"absolute", top:12, right:"50%", width:"100%", height:2, background:isDone?C.green:"#1e1e1e", zIndex:0 }}/>}
                          <div style={{ width:26, height:26, borderRadius:"50%", background:isDone?`${C.green}18`:isCurrent?`${C.yellow}18`:"#141414", border:`2px solid ${col}`, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, transition:"all 0.3s" }}>
                            {isDone ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                              : isCurrent ? <div style={{ width:8, height:8, borderRadius:"50%", background:C.yellow, animation:"pulse 1.5s infinite" }}/>
                              : <div style={{ width:6, height:6, borderRadius:"50%", background:C.g3 }}/>}
                          </div>
                          <p style={{ fontSize:10, fontWeight:700, color:col, textAlign:"center" }}>{s.label}</p>
                          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, textAlign:"center" }}>{isDone?s.sub:isCurrent?"En cours…":"—"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Signature display if signed */}
              {accordSignature && (
                <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <I.CheckCircle/>
                    <span style={{ fontSize:11, fontWeight:700, color:C.green }}>Accord signé par {tenant.prenom} {tenant.nom}</span>
                    <span style={{ marginLeft:"auto", fontSize:9, fontFamily:C.mono, color:C.g3 }}>{accordSignedDate}</span>
                  </div>
                  <div style={{ background:"#fff", borderRadius:8, padding:"8px", display:"inline-block" }}>
                    <img src={accordSignature} alt="Signature" style={{ height:60, display:"block" }}/>
                  </div>
                </div>
              )}

              {/* Destinataire email */}
              {!accordSignature && (
                <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}>
                    <I.Mail/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:3 }}>DESTINATAIRE</p>
                    {editingEmail ? (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input
                          autoFocus
                          value={accordEmail}
                          onChange={e=>setAccordEmail(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter") saveEmail(accordEmail); if(e.key==="Escape") { setAccordEmail(tenant.mail||""); setEditingEmail(false); }}}
                          onBlur={()=>saveEmail(accordEmail)}
                          placeholder="adresse@email.com"
                          style={{ flex:1, background:"#111", border:`1px solid ${C.blue}`, borderRadius:6, padding:"5px 10px", fontSize:13, fontWeight:600, color:C.w, outline:"none" }}
                        />
                        <button onClick={()=>saveEmail(accordEmail)} style={{ background:C.blueSub, border:`1px solid rgba(0,123,255,0.25)`, borderRadius:6, padding:"5px 10px", color:C.blue, fontSize:10, fontWeight:700, cursor:"pointer" }}>OK</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:accordEmail?C.w:C.red }}>{accordEmail || "Aucune adresse e-mail"}</span>
                        <button onClick={()=>setEditingEmail(true)} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:0, display:"flex", transition:"color 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                          <I.Edit/>
                        </button>
                      </div>
                    )}
                  </div>
                  {accordSentDate && <span style={{ fontSize:9, fontFamily:C.mono, color:C.green, flexShrink:0 }}>Envoyé le {accordSentDate}</span>}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:"flex", gap:8 }}>
                {!accordStatus && (
                  <>
                    <button onClick={()=>setShowAccordPreview(true)}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Eye/> Aperçu
                    </button>
                    <button onClick={downloadAccordPDF}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Download/> Télécharger PDF
                    </button>
                    <button onClick={sendAccord} disabled={!accordEmail}
                      style={{ flex:1, background:accordEmail?"linear-gradient(135deg,#3B82F6,#2563EB)":"#1a1a1a", border:"none", borderRadius:10, padding:"11px 20px", color:accordEmail?"#fff":C.g3, fontSize:12, fontWeight:700, cursor:accordEmail?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:accordEmail?"0 4px 18px rgba(59,130,246,0.35)":"none", transition:"all 0.2s", letterSpacing:"0.02em" }}
                      onMouseEnter={e=>{if(accordEmail){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(59,130,246,0.5)";}}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=accordEmail?"0 4px 18px rgba(59,130,246,0.35)":"none";}}>
                      <I.Send/> Envoyer par e-mail
                    </button>
                  </>
                )}
                {accordStatus==="sending" && (
                  <div style={{ flex:1, background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <div style={{ width:16, height:16, border:"2px solid rgba(59,130,246,0.3)", borderTopColor:"#3B82F6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    <span style={{ fontSize:12, fontWeight:600, color:C.blue }}>Envoi à <strong>{accordEmail}</strong> en cours…</span>
                  </div>
                )}
                {accordStatus==="sent" && !accordSignature && (
                  <>
                    <button onClick={downloadAccordPDF}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", flexShrink:0 }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Download/> PDF
                    </button>
                    <div style={{ flex:1, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:10, padding:"11px 18px", display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:C.yellow, animation:"pulse 1.5s infinite" }}/>
                      <span style={{ fontSize:11, color:C.yellow, fontWeight:600 }}>En attente de la signature du locataire</span>
                    </div>
                    <button onClick={()=>setShowSignaturePad(true)}
                      style={{ background:"linear-gradient(135deg,#F59E0B,#D97706)", border:"none", borderRadius:10, padding:"11px 18px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(245,158,11,0.3)", transition:"all 0.2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
                      <I.Edit/> Signer maintenant
                    </button>
                  </>
                )}
                {accordStatus==="signed" && (
                  <>
                    <button onClick={downloadAccordPDF}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", flexShrink:0 }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Download/> Télécharger PDF signé
                    </button>
                    <div style={{ flex:1, background:"rgba(16,185,129,0.06)", border:`1px solid ${C.greenBord}`, borderRadius:10, padding:"11px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <I.CheckCircle/>
                      <span style={{ fontSize:12, fontWeight:700, color:C.green }}>Accord signé — Étape complétée</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Bail Mobilité: Custom action flow ── */}
          {step.id==="bail" && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={()=>setShowBailPreview(true)}
                style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                <I.Eye/> Consulter
              </button>
              <button onClick={downloadBailMobilite}
                style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                <I.Download/> Télécharger le bail
              </button>
              {stepStatus[step.id]!=="done" && (
                <button onClick={()=>markDone(step.id)}
                  style={{ flex:1, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", borderRadius:10, padding:"11px 20px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 18px rgba(139,92,246,0.35)", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(139,92,246,0.5)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 18px rgba(139,92,246,0.35)";}}>
                  <I.Send/> Envoyer le bail à la signature
                </button>
              )}
              {stepStatus[step.id]==="done" && (
                <div style={{ flex:1, background:"rgba(16,185,129,0.06)", border:`1px solid ${C.greenBord}`, borderRadius:10, padding:"11px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <I.CheckCircle/><span style={{ fontSize:12, fontWeight:700, color:C.green }}>Bail signé — Étape complétée</span>
                </div>
              )}
            </div>
          )}

                    {/* ── Generic action buttons (non-accord steps) ── */}
          {step.actions && step.id!=="accord" && step.id!=="bail" && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {step.actions.map(a => a.primary ? (
                <button key={a.key} onClick={()=>markDone(step.id)}
                  disabled={stepStatus[step.id]==="done"}
                  style={{
                    flex:1, background: stepStatus[step.id]==="done" ? "linear-gradient(135deg,#059669,#047857)" : `linear-gradient(135deg,${step.color},${step.color}CC)`,
                    border:"none", borderRadius:10, padding:"11px 20px", color:"#fff", fontSize:12, fontWeight:700,
                    cursor: stepStatus[step.id]==="done" ? "default" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    boxShadow:`0 4px 18px ${step.color}35`, transition:"all 0.2s", letterSpacing:"0.02em",
                  }}
                  onMouseEnter={e=>{if(stepStatus[step.id]!=="done"){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 6px 26px ${step.color}50`;}}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 18px ${step.color}35`;}}>
                  {stepStatus[step.id]==="done" ? <><I.CheckCircle/> Complété</> : a.label}
                </button>
              ) : (
                <button key={a.key}
                  style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Overall progress summary ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:16 }}>
          <div style={{ flex:1, height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.green},${C.blue})`, width:`${(Object.values(stepStatus).filter(v=>v==="done").length/GESTION_STEPS.length)*100}%`, transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)" }}/>
          </div>
          <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{Object.values(stepStatus).filter(v=>v==="done").length}/{GESTION_STEPS.length} étapes</span>
        </div>
      </div>

      {/* ── Signature Pad Modal ── */}
      {showSignaturePad && <SignaturePadModal tenant={tenant} onSign={simulateSignature} onClose={()=>setShowSignaturePad(false)}/>}

      {/* ── Bail Mobilité Preview Modal ── */}
      {/* ── Bail Preview (iframe) ── */}
      {showBailPreview && (()=>{
        const html = buildBailHtml("preview");
        return (
          <>
            <div onClick={()=>setShowBailPreview(false)} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)" }}/>
            <div style={{ position:"fixed", top:"3vh", left:"50%", transform:"translateX(-50%)", zIndex:401, width:"min(780px,94vw)", height:"94vh", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.7)", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"#0d0d0f" }}>
                <div style={{ width:32, height:32, borderRadius:9, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B5CF6" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>Bail Mobilité — Aperçu du document</p>
                  <p style={{ fontSize:10, color:C.g2 }}>Les champs manquants sont affichés en <span style={{ color:C.red, fontWeight:700 }}>rouge</span></p>
                </div>
                <button onClick={()=>setShowBailPreview(false)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:30, height:30, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><I.X/></button>
              </div>
              <iframe srcDoc={html} style={{ flex:1, border:"none", width:"100%", background:"#fff", borderRadius:"0 0 18px 18px" }} title="Bail Mobilité" sandbox="allow-same-origin"/>
              <div style={{ padding:"12px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8, justifyContent:"flex-end", flexShrink:0, background:"#0d0d0f" }}>
                <button onClick={()=>setShowBailPreview(false)}
                  style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"8px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  Fermer
                </button>
                <button onClick={()=>{setShowBailPreview(false);downloadBailMobilite();}}
                  style={{ background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", borderRadius:9, padding:"8px 20px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(139,92,246,0.35)" }}>
                  <I.Download/> Télécharger
                </button>
              </div>
            </div>
          </>
        );
      })()}

            {/* ── Email Preview Modal ── */}
      {showAccordPreview && (
        <>
          <div onClick={()=>setShowAccordPreview(false)} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:401, width:"min(560px,92vw)", maxHeight:"80vh", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:800 }}>Aperçu de l'e-mail</p>
                <p style={{ fontSize:10, color:C.g2 }}>Envoi à <strong style={{ color:C.w }}>{accordEmail}</strong> — {tenant.prenom} {tenant.nom}</p>
              </div>
              <button onClick={()=>setShowAccordPreview(false)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:28, height:28, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center" }}><I.X/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
              <div style={{ background:"#fafafa", borderRadius:12, padding:"28px 24px", color:"#111" }}>
                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:"#2563EB", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", marginBottom:10 }}>E</div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:4 }}>Accord de Principe</h2>
                  <p style={{ fontSize:12, color:"#6b7280" }}>EQUITY · Gestion Patrimoniale</p>
                </div>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:16 }}>
                  Bonjour <strong>{tenant.prenom}</strong>,<br/><br/>
                  Suite à notre échange, nous avons le plaisir de vous transmettre l'accord de principe pour votre future location au <strong>{bien?.name||tenant.bienName||"bien"}</strong> situé au <strong>{bien?.addr||tenant.bienAddr||"—"}, {bien?.ville||tenant.bienVille||""}</strong>.
                </p>
                <div style={{ background:"#f3f4f6", borderRadius:8, padding:"14px 16px", marginBottom:16 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#111", marginBottom:8 }}>Conditions proposées :</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {[
                      ["Loyer HC", (bien?.loyer||tenant.loyerHC||"—") + " €/mois"],
                      ["Charges", (bien?.chargesLocatives||tenant.chargesLoc||"—") + " €/mois"],
                      ["Dépôt de garantie", (tenant.depotGarantieCalc||"—") + " €"],
                      ["Type de bail", tenant.dureeBail||"—"],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#374151" }}>
                        <span>{k}</span><strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:16 }}>
                  Pour accepter cet accord, veuillez cliquer sur le bouton ci-dessous et apposer votre signature électronique.
                </p>
                <div style={{ textAlign:"center" }}>
                  <div style={{ display:"inline-block", background:"#2563EB", color:"#fff", borderRadius:8, padding:"12px 32px", fontSize:13, fontWeight:700, cursor:"default" }}>
                    ✓ Accepter et signer l'accord
                  </div>
                </div>
                <p style={{ fontSize:10, color:"#9ca3af", textAlign:"center", marginTop:16, lineHeight:1.6 }}>
                  Cet accord est valable 72 heures. Passé ce délai, le bien sera remis sur le marché.<br/>
                  Cet accord ne vaut pas bail et ne constitue pas un engagement définitif.
                </p>
              </div>
            </div>
            <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowAccordPreview(false)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer" }}>Fermer</button>
              <button onClick={()=>{setShowAccordPreview(false);sendAccord();}}
                style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)", border:"none", borderRadius:9, padding:"9px 22px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(59,130,246,0.35)" }}>
                <I.Send/> Envoyer maintenant
              </button>
            </div>
          </div>
        </>
      )}
      </>)}
    </div>
  );
}

const TD_SUBTABS = ["Gestion","Profil & Identité","Garants","Dossier Numérique","Coordonnées"];

function TenantDetailTile({ label, value, accent, icon:TIcon, full, onChange, placeholder, type }) {
  return (
    <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", gridColumn:full?"span 2":"span 1" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      {onChange ? (
        type==="date" ? (
          <DatePickerInput value={value||""} onChange={onChange} placeholder={placeholder}/>
        ) : (
          <input type="text" value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"—"}
            style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:700, color:accent?C.blue:C.w, padding:0 }}/>
        )
      ) : (
        <span style={{ fontSize:13, fontWeight:700, color:accent?C.blue:C.w }}>{value||"—"}</span>
      )}
    </div>
  );
}

function TenantDetailSecTitle({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, marginTop:4 }}>
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function TenantDetailPanel({ tenant, onClose, onDelete, onUpdateTenant, initialTab, assets, user }) {
  const [subtab, setSubtab] = useState(initialTab || "Profil & Identité");
  const st = getStatut(tenant.daysLate);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Editable tenant data ──
  const [ed, setEd] = useState({
    prenom: tenant.prenom||"", nom: tenant.nom||"", civilite: tenant.civilite||"", dateNaissance: tenant.dateNaissance||"",
    lieuNaissance: tenant.lieuNaissance||"", nationalite: tenant.nationalite||"Française",
    employeur: tenant.employeur||"", contrat: tenant.contrat||"", revenus: tenant.revenus||tenant.loyer||"", anciennete: tenant.anciennete||"",
    mail: tenant.mail||"", tel: tenant.tel||"", tel2: tenant.tel2||"",
    adresse: tenant.adresse||"", ville: tenant.ville||"", codePostal: tenant.codePostal||"", region: tenant.region||"", pays: tenant.pays||"France",
    garantNom: tenant.garantNom||"", garantPrenom: tenant.garantPrenom||"", garantLien: tenant.garantLien||"", garantRevenus: tenant.garantRevenus||"", garantEmployeur: tenant.garantEmployeur||"",
  });
  const upd = (k,v) => setEd(s=>({...s,[k]:v}));

  // Auto-save debounced
  const saveRef = useRef(null);
  useEffect(() => {
    if (!onUpdateTenant) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      onUpdateTenant({ ...tenant, ...ed });
    }, 600);
    return () => { if(saveRef.current) clearTimeout(saveRef.current); };
  }, [ed]);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      if (onDelete) onDelete(tenant.id);
      setShowDeleteConfirm(false);
    }, 600);
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.72)", backdropFilter:"blur(8px)" }}/>

      {/* Slide-over panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:201, width:"min(700px,90vw)", background:"#0d0d0d", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", animation:"slideIn 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"-20px 0 60px rgba(0,0,0,0.6)" }}>

        {/* ── Sticky Header ── */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14, background:"#08080A", position:"sticky", top:0, zIndex:10, flexShrink:0 }}>
          {/* Back / close */}
          <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
            <I.X/>
          </button>

          {/* Avatar + name */}
          <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, background:`linear-gradient(135deg,${st.color}28,${st.color}14)`, border:`1.5px solid ${st.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:st.color }}>
            {(ed.prenom||"?")[0]}{(ed.nom||"?")[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.02em" }}>{ed.prenom} {ed.nom}</span>
              {/* Statut pill */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:st.bg, border:`1px solid ${st.border}`, borderRadius:99, padding:"2px 9px", flexShrink:0 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, animation:st.pulse?"pulse 1.8s infinite":"none" }}/>
                <span style={{ fontSize:9, fontWeight:700, color:st.color, fontFamily:C.mono, letterSpacing:"0.04em" }}>{st.label}{tenant.daysLate>0?` · J+${tenant.daysLate}`:""}</span>
              </div>
            </div>
            <p style={{ fontSize:11, color:C.g2 }}>{[tenant.bienName, tenant.bienAddr||tenant.adresse, tenant.bienVille||tenant.ville, (tenant.loyerHC||tenant.loyer)?(tenant.loyerHC||tenant.loyer)+" €/mois":null].filter(Boolean).join(" · ")}</p>
          </div>
          {/* Breadcrumb + delete */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <button onClick={()=>setShowDeleteConfirm(true)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.red;e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              <I.Trash/> Supprimer
            </button>
            <div style={{ width:1, height:20, background:C.border }}/>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={onClose} style={{ background:"none", border:"none", color:C.g2, fontSize:11, cursor:"pointer", padding:0, transition:"color 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.blue}
              onMouseLeave={e=>e.currentTarget.style.color=C.g2}>
              Locataires
            </button>
            <span style={{ color:C.g3, fontSize:11 }}>›</span>
            <span style={{ fontSize:11, color:C.w, fontWeight:600 }}>{ed.prenom} {ed.nom}</span>
            </div>
          </div>
        </div>

        {/* ── Sub-tabs ── */}
        <div style={{ display:"flex", gap:2, padding:"12px 24px 0", borderBottom:`1px solid ${C.border}`, background:"#0d0d0d", flexShrink:0 }}>
          {TD_SUBTABS.map(t=>{
            const active=subtab===t;
            return(
              <button key={t} onClick={()=>setSubtab(t)} style={{
                background:"transparent", border:"none",
                borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent",
                padding:"8px 14px 10px", fontSize:11.5, fontWeight:active?700:500,
                color:active?C.blue:C.g2, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
              }}>
                {t}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 40px" }}>

          {/* ─── PROFIL & IDENTITÉ ─── */}
          {subtab==="Gestion"&&<GestionTab tenant={tenant} assets={assets||[]} user={user||{}} onUpdateTenant={onUpdateTenant}/>}

          {subtab==="Profil & Identité"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp 0.2s ease" }}>
              {/* AI banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.07),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.15)", borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:24, height:24, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue, marginBottom:1 }}>DOSSIER IA · CONFIANCE 97%</p>
                  <p style={{ fontSize:11, color:C.g1 }}>Données extraites et vérifiées automatiquement. Survolez les tuiles pour les détails.</p>
                </div>
                <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:7, padding:"4px 10px", color:C.g2, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  <I.Edit/> Éditer
                </button>
              </div>

              <div>
                <TenantDetailSecTitle label="Identité civile"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <TenantDetailTile icon={I.User}     label="Civilité"          value={ed.civilite} onChange={v=>upd("civilite",v)} placeholder="Madame / Monsieur"/>
                  <TenantDetailTile icon={I.User}     label="Prénom"            value={ed.prenom} onChange={v=>upd("prenom",v)}/>
                  <TenantDetailTile icon={I.User}     label="Nom de famille"    value={ed.nom} onChange={v=>upd("nom",v)}/>
                  <TenantDetailTile icon={I.Calendar} label="Date de naissance" value={ed.dateNaissance} onChange={v=>upd("dateNaissance",v)} type="date"/>
                  <TenantDetailTile icon={I.MapPin}   label="Lieu de naissance" value={ed.lieuNaissance} onChange={v=>upd("lieuNaissance",v)} placeholder="Ville (département)"/>
                  <TenantDetailTile icon={I.Globe}    label="Nationalité"       value={ed.nationalite} onChange={v=>upd("nationalite",v)}/>
                </div>
              </div>

              <div>
                <TenantDetailSecTitle label="Situation professionnelle"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <TenantDetailTile icon={I.Briefcase} label="Employeur"            value={ed.employeur} onChange={v=>upd("employeur",v)} full/>
                  <TenantDetailTile icon={I.Briefcase} label="Type de contrat"      value={ed.contrat} onChange={v=>upd("contrat",v)} placeholder="CDI / CDD…"/>
                  <TenantDetailTile icon={I.Euro}      label="Revenus nets/mois"    value={ed.revenus} onChange={v=>upd("revenus",v)} accent placeholder="ex: 2 800 €"/>
                  <TenantDetailTile icon={I.Clock}     label="Ancienneté"           value={ed.anciennete} onChange={v=>upd("anciennete",v)} placeholder="ex: 4 ans 2 mois"/>
                </div>
              </div>

              {/* Solvabilité */}
              <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:11, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:3 }}>SCORE DE SOLVABILITÉ IA</p>
                    <p style={{ fontSize:13, fontWeight:700, color:C.w }}>Ratio loyer/revenus : <span style={{ color:C.green }}>24,7%</span> <span style={{ fontSize:11, color:C.g2, fontWeight:400 }}>(seuil max 33%)</span></p>
                  </div>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:800, color:C.green }}>A</span>
                  </div>
                </div>
                <div style={{ height:4, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ width:"75%", height:"100%", background:`linear-gradient(90deg,${C.green},#34d399)`, borderRadius:99, boxShadow:`0 0 8px ${C.green}50` }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>0%</span>
                  <span style={{ fontSize:9, color:C.yellow, fontFamily:C.mono }}>⚠ 33%</span>
                  <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>100%</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── GARANTS ─── */}
          {subtab==="Garants"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.2s ease" }}>
              {/* Garant card */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, background:"rgba(99,102,241,0.04)" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#818cf8" }}>{(ed.garantPrenom||"P")[0]}{(ed.garantNom||"D")[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ fontSize:14, fontWeight:800 }}>{ed.garantPrenom||"—"} {ed.garantNom||"—"}</span>
                      <span style={{ fontSize:8, fontFamily:C.mono, color:"#818cf8", background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", padding:"2px 7px", borderRadius:4 }}>GARANT 1 · {ed.garantLien||"PARENT"}</span>
                    </div>
                    <span style={{ fontSize:11, color:C.g2 }}>{ed.garantEmployeur||"—"} · {ed.garantRevenus||"—"}/mois</span>
                  </div>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:800, color:C.green }}>A+</span>
                  </div>
                </div>
                <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <TenantDetailSecTitle label="Identité civile"/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <TenantDetailTile icon={I.User}     label="Prénom"            value={ed.garantPrenom} onChange={v=>upd("garantPrenom",v)}/>
                      <TenantDetailTile icon={I.User}     label="Nom"               value={ed.garantNom} onChange={v=>upd("garantNom",v)}/>
                      <TenantDetailTile icon={I.Briefcase} label="Lien"             value={ed.garantLien} onChange={v=>upd("garantLien",v)} placeholder="Père / Mère…"/>
                      <TenantDetailTile icon={I.Globe}    label="Nationalité"       value="Française"/>
                    </div>
                  </div>
                  <div>
                    <TenantDetailSecTitle label="Situation professionnelle"/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <TenantDetailTile icon={I.Briefcase} label="Employeur"         value={ed.garantEmployeur} onChange={v=>upd("garantEmployeur",v)} full/>
                      <TenantDetailTile icon={I.Briefcase} label="Type de contrat"   value={tenant.garantContrat||""} />
                      <TenantDetailTile icon={I.Euro}      label="Revenus nets/mois" value={ed.garantRevenus} onChange={v=>upd("garantRevenus",v)} accent placeholder="ex: 5 200 €"/>
                      <TenantDetailTile icon={I.Clock}     label="Ancienneté"        value={tenant.garantAnciennete||""}/>
                    </div>
                  </div>
                  {/* Ratio */}
                  <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div>
                        <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:2 }}>SCORE SOLVABILITÉ · GARANT</p>
                        <p style={{ fontSize:12, fontWeight:700, color:C.w }}>Ratio : <span style={{ color:C.green }}>18,1%</span> <span style={{ fontSize:10, color:C.g2, fontWeight:400 }}>(seuil max 33%)</span></p>
                      </div>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:12, fontWeight:800, color:C.green }}>A+</span>
                      </div>
                    </div>
                    <div style={{ height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ width:"18%", height:"100%", background:`linear-gradient(90deg,${C.green},#34d399)`, borderRadius:99, boxShadow:`0 0 8px ${C.green}50` }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>0%</span>
                      <span style={{ fontSize:9, color:C.yellow, fontFamily:C.mono }}>⚠ 33%</span>
                      <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>100%</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Global summary */}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:11, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}><I.Shield/></div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:C.green, marginBottom:2 }}>Couverture de garantie solide</p>
                  <p style={{ fontSize:10, color:C.g2 }}>Revenus garant : <strong style={{ color:C.w }}>5 200 €/mois</strong> · Ratio global : <strong style={{ color:C.green }}> 18,1%</strong></p>
                </div>
                <div style={{ textAlign:"right" }}><p style={{ fontSize:18, fontWeight:800, color:C.green, letterSpacing:"-0.03em" }}>A+</p><p style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>SCORE GLOBAL</p></div>
              </div>
            </div>
          )}

          {/* ─── DOSSIER NUMÉRIQUE ─── */}
          {subtab==="Dossier Numérique"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.2s ease" }}>
              <TenantDetailSecTitle label="Dossier numérique · 5 documents"/>
              {[
                { name:`CNI_${tenant.nom}_2024.pdf`,       type:"CNI",     expiry:"15/06/2029" },
                { name:`Bulletin_Salaire_Jan2025.pdf`,      type:"Revenus", expiry:"—" },
                { name:`Bulletin_Salaire_Fev2025.pdf`,      type:"Revenus", expiry:"—" },
                { name:`Bulletin_Salaire_Mar2025.pdf`,      type:"Revenus", expiry:"—" },
                { name:`Quittance_EDF_Mars2025.pdf`,        type:"Domicile",expiry:"Valide" },
              ].map((d,i)=>(
                <div key={i} style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.File/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:C.w, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</p>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.18)", padding:"1px 6px", borderRadius:4 }}>{d.type}</span>
                      <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>Exp. : {d.expiry}</span>
                    </div>
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.greenSub, border:`1px solid ${C.greenBord}`, borderRadius:99, padding:"3px 9px", flexShrink:0 }}>
                    <I.Shield/><span style={{ fontSize:9, fontFamily:C.mono, color:C.green, fontWeight:700, letterSpacing:"0.06em" }}>AUTHENTIFIÉ</span>
                  </div>
                </div>
              ))}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><I.Shield/></div>
                <div><p style={{ fontSize:11, fontWeight:700, color:C.green, marginBottom:1 }}>Dossier certifié · Authenticité 100%</p><p style={{ fontSize:10, color:C.g2 }}>Analyse IA du 01/03/2026 à 14h32.</p></div>
              </div>
            </div>
          )}

          {/* ─── COORDONNÉES ─── */}
          {subtab==="Coordonnées"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.2s ease" }}>
              <TenantDetailSecTitle label="Contact"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <TenantDetailTile icon={I.Mail}   label="Adresse e-mail"      value={ed.mail} onChange={v=>upd("mail",v)} full placeholder="email@exemple.fr"/>
                <TenantDetailTile icon={I.Phone}  label="Téléphone principal" value={ed.tel} onChange={v=>upd("tel",v)} placeholder="06 12 34 56 78"/>
                <TenantDetailTile icon={I.Phone}  label="Téléphone secondaire" value={ed.tel2} onChange={v=>upd("tel2",v)} placeholder="—"/>
              </div>
              <TenantDetailSecTitle label="Adresse actuelle"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <TenantDetailTile icon={I.MapPin} label="Adresse"      value={ed.adresse} onChange={v=>upd("adresse",v)} full placeholder="Numéro, rue"/>
                <TenantDetailTile icon={I.Globe}  label="Ville"        value={ed.ville} onChange={v=>upd("ville",v)}/>
                <TenantDetailTile icon={I.Globe}  label="Code Postal"  value={ed.codePostal} onChange={v=>upd("codePostal",v)} placeholder="33000"/>
                <TenantDetailTile icon={I.Globe}  label="Région"       value={ed.region} onChange={v=>upd("region",v)} placeholder="Nouvelle-Aquitaine"/>
                <TenantDetailTile icon={I.Globe}  label="Pays"         value={ed.pays} onChange={v=>upd("pays",v)}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.border}`, background:"#08080A", display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
            Fermer
          </button>
          <button style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:9, padding:"9px 20px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:`0 4px 18px ${C.blueGlow}`, transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 26px rgba(0,123,255,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 18px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
            <I.Edit/> Modifier le dossier
          </button>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div onClick={()=>!deleting&&setShowDeleteConfirm(false)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"fadeUp 0.2s ease" }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"#111113", border:`1px solid ${C.border}`, borderRadius:18,
            width:"100%", maxWidth:420, padding:"28px 28px 24px",
            boxShadow:"0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03)",
            animation:"fadeUp 0.25s cubic-bezier(0.2,0.8,0.2,1)",
            opacity: deleting ? 0.6 : 1, transform: deleting ? "scale(0.97)" : "scale(1)",
            transition:"opacity 0.4s, transform 0.4s",
          }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:C.redSub, border:"1.5px solid rgba(239,68,68,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red }}>
                <I.AlertTriangle/>
              </div>
            </div>
            <h3 style={{ textAlign:"center", fontSize:17, fontWeight:800, letterSpacing:"-0.02em", color:C.w, marginBottom:8 }}>
              Supprimer ce locataire ?
            </h3>
            <p style={{ textAlign:"center", fontSize:13, color:C.g2, lineHeight:1.65, marginBottom:6 }}>
              Vous allez supprimer <strong style={{ color:C.w }}>{tenant.prenom} {tenant.nom}</strong> de votre liste de locataires.
            </p>
            <p style={{ textAlign:"center", fontSize:11, color:C.g3, lineHeight:1.6, marginBottom:22 }}>
              Cette action supprimera toutes les données associées (identité, documents, garants). Cette action est irréversible.
            </p>
            <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:C.redSub, border:"1px solid rgba(239,68,68,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0, fontSize:13, fontWeight:800 }}>
                {(tenant.prenom||"?")[0]}{(tenant.nom||"?")[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:2 }}>{tenant.prenom} {tenant.nom}</p>
                <p style={{ fontSize:11, color:C.g2 }}>{[tenant.adresse, tenant.ville, tenant.loyer?tenant.loyer+"/mois":null].filter(Boolean).join(" · ")||"Aucune info"}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowDeleteConfirm(false)} disabled={deleting}
                style={{ flex:1, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 0", color:C.g1, fontSize:12, fontWeight:600, cursor:deleting?"not-allowed":"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!deleting){e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1;}}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{
                  flex:1, background:deleting?"linear-gradient(135deg,#991B1B,#7F1D1D)":"linear-gradient(135deg,#EF4444,#DC2626)",
                  border:"none", borderRadius:10, padding:"11px 0",
                  color:"#fff", fontSize:12, fontWeight:700, cursor:deleting?"not-allowed":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 20px rgba(239,68,68,0.35)", transition:"all 0.2s",
                  letterSpacing:"0.02em",
                }}
                onMouseEnter={e=>{if(!deleting){e.currentTarget.style.boxShadow="0 6px 28px rgba(239,68,68,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(239,68,68,0.35)";e.currentTarget.style.transform="none";}}>
                {deleting
                  ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Suppression...</>
                  : <><I.Trash/> Confirmer la suppression</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   LOCATAIRES PAGE
════════════════════════════════════════ */
function getStatut(daysLate) {
  if (daysLate === 0)  return { label:"À jour",  color:"#10B981", bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.22)", dot:"#10B981" };
  if (daysLate < 10)   return { label:"En retard", color:"#F59E0B", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.22)",  dot:"#F59E0B", pulse:true };
  return               { label:"Impayé",  color:"#EF4444", bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.22)",  dot:"#EF4444", pulse:true };
}

/* ════════════════════════════════════════
   ONBOARDING FLOW
════════════════════════════════════════ */
const ONBOARDING_STEPS = [
  {
    id: "bienvenue",
    emoji: "👋",
    title: "Bienvenue sur EQUITY",
    sub: "Votre espace de gestion patrimoniale intelligent. En 4 étapes, nous allons configurer votre compte.",
    cta: "C'est parti →",
    skip: false,
    fields: null,
  },
  {
    id: "profil",
    emoji: "👤",
    title: "Votre profil",
    sub: "Ces informations nous permettent de personnaliser votre expérience.",
    cta: "Continuer",
    skip: true,
    fields: [
      { key:"prenom",    label:"Prénom",              placeholder:"Thomas",            type:"text"   },
      { key:"nom",       label:"Nom",                 placeholder:"Dubois",            type:"text"   },
      { key:"email",     label:"Adresse e-mail",      placeholder:"thomas@exemple.fr", type:"email"  },
      { key:"telephone", label:"Téléphone",           placeholder:"06 12 34 56 78",    type:"tel"    },
    ],
  },
  {
    id: "situation",
    emoji: "🏠",
    title: "Votre situation",
    sub: "Dites-nous en plus sur votre patrimoine actuel.",
    cta: "Continuer",
    skip: true,
    choices: [
      {
        key:"nb_biens",
        label:"Combien de biens immobiliers possédez-vous ?",
        options:["Je débute (0 bien)","1 bien","2 à 5 biens","6 biens et plus"],
      },
      {
        key:"objectif",
        label:"Quel est votre objectif principal ?",
        options:["Cash-flow mensuel","Plus-value à la revente","Réduction fiscale","Constitution de patrimoine"],
      },
      {
        key:"regime",
        label:"Régime fiscal principal ?",
        options:["LMNP (meublé)","Location nue","SCI","Je ne sais pas encore"],
      },
    ],
  },
  {
    id: "premier_bien",
    emoji: "🏗️",
    title: "Ajoutez votre premier bien",
    sub: "Commencez à construire votre portefeuille. Vous pouvez le faire maintenant ou plus tard.",
    cta: "Ajouter mon premier bien",
    ctaSecondary: "Je le ferai plus tard",
    skip: true,
    isBienStep: true,
  },
  {
    id: "pret",
    emoji: "🚀",
    title: "Tout est prêt !",
    sub: "Votre espace est configuré. Voici ce que vous pouvez faire dès maintenant.",
    cta: "Accéder au tableau de bord",
    skip: false,
    isLast: true,
    features: [
      { icon:"📊", label:"Pilotage",    desc:"Suivez vos KPIs en temps réel" },
      { icon:"🏠", label:"Mes biens",   desc:"Gérez et valorisez chaque actif" },
      { icon:"👥", label:"Locataires",  desc:"Suivez loyers et dossiers" },
      { icon:"🤖", label:"IA intégrée", desc:"Scan docs, analyses, suggestions" },
    ],
  },
];

function OnboardingFlow({ onComplete, onAddBien }) {
  const [stepIdx, setStepIdx]   = useState(0);
  const [formData, setFormData] = useState({});
  const [choices,  setChoices]  = useState({});
  const [exiting,  setExiting]  = useState(false);

  const step    = ONBOARDING_STEPS[stepIdx];
  const total   = ONBOARDING_STEPS.length;
  const isFirst = stepIdx === 0;
  const isLast  = step.isLast;

  const goNext = () => {
    if (isLast) { finish(); return; }
    setExiting(true);
    setTimeout(()=>{ setStepIdx(i=>i+1); setExiting(false); }, 220);
  };

  const goPrev = () => {
    if (isFirst) return;
    setExiting(true);
    setTimeout(()=>{ setStepIdx(i=>i-1); setExiting(false); }, 220);
  };

  const finish = () => { setExiting(true); setTimeout(()=>onComplete({ formData, choices }), 300); };

  const setChoice = (key, val) => setChoices(c=>({...c,[key]:val}));
  const setField  = (key, val) => setFormData(f=>({...f,[key]:val}));

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999,
      background:"#080808",
      display:"flex", flexDirection:"column",
      fontFamily:C.font, color:C.w,
      opacity: exiting ? 0 : 1,
      transform: exiting ? "scale(0.98)" : "scale(1)",
      transition:"opacity 0.22s ease, transform 0.22s ease",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 32px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${C.blue},#1D4ED8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, boxShadow:`0 4px 12px ${C.blueGlow}` }}>E</div>
          <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>EQUITY</span>
        </div>

        {/* Breadcrumb / stepper */}
        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
          {ONBOARDING_STEPS.map((s,i)=>{
            const done    = i < stepIdx;
            const current = i === stepIdx;
            const future  = i > stepIdx;
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
                {/* Connector */}
                {i > 0 && (
                  <div style={{ width:32, height:1.5, background: done ? C.green : current ? C.blue : "#2a2a2a", transition:"background 0.4s" }}/>
                )}
                {/* Node */}
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:800,
                  background: done ? C.green : current ? C.blue : "#1a1a1a",
                  border:`1.5px solid ${done ? C.green : current ? C.blue : "#2a2a2a"}`,
                  color: done||current ? "#fff" : C.g3,
                  boxShadow: current ? `0 0 14px ${C.blueGlow}` : done ? "0 0 10px rgba(16,185,129,0.3)" : "none",
                  transition:"all 0.35s",
                  cursor: done ? "pointer" : "default",
                  flexShrink:0,
                }}
                onClick={()=>{ if(done){ setExiting(true); setTimeout(()=>{ setStepIdx(i); setExiting(false); },200); } }}
                title={s.title}>
                  {done
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <span>{i+1}</span>
                  }
                </div>
                {/* Label under node — only current */}
                {current && (
                  <div style={{ position:"absolute", marginTop:42, fontSize:8.5, fontFamily:C.mono, color:C.blue, letterSpacing:"0.08em", whiteSpace:"nowrap", transform:"translateX(-50%)", pointerEvents:"none" }}>
                    {s.title.toUpperCase().slice(0,12)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step counter + Passer */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>
            {stepIdx+1} / {total}
          </span>
          <button onClick={finish}
            style={{ background:"none", border:"none", color:C.g3, fontSize:11, fontFamily:C.mono, cursor:"pointer", padding:"4px 0", letterSpacing:"0.06em", transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.g1}
            onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
            Passer
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px", overflowY:"auto" }}>
        <div style={{
          width:"100%", maxWidth:560,
          display:"flex", flexDirection:"column", gap:28,
          animation:"fadeUp 0.35s cubic-bezier(0.2,0.8,0.2,1)",
        }}>
          {/* Emoji + heading */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16, lineHeight:1 }}>{step.emoji}</div>
            <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.04em", marginBottom:10 }}>{step.title}</h1>
            <p style={{ fontSize:14, color:C.g2, lineHeight:1.7, maxWidth:440, margin:"0 auto" }}>{step.sub}</p>
          </div>

          {/* ── STEP: PROFIL (fields) ── */}
          {step.fields && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {step.fields.map(f=>{
                const focused = false;
                return (
                  <div key={f.key} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", transition:"border-color 0.15s" }}>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:6 }}>{f.label.toUpperCase()}</p>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={formData[f.key]||""}
                      onChange={e=>setField(f.key,e.target.value)}
                      onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
                      onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
                      style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%", colorScheme:"dark" }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP: SITUATION (choices) ── */}
          {step.choices && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {step.choices.map(q=>(
                <div key={q.key}>
                  <p style={{ fontSize:11, color:C.g2, marginBottom:8, fontWeight:600 }}>{q.label}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {q.options.map(opt=>{
                      const sel = choices[q.key]===opt;
                      return (
                        <button key={opt} onClick={()=>setChoice(q.key,opt)} style={{
                          background: sel ? C.blueSub : "#111",
                          border:`1.5px solid ${sel ? C.blue : "#252525"}`,
                          borderRadius:10, padding:"8px 16px",
                          fontSize:12, fontWeight:sel?700:500,
                          color:sel?C.blue:C.g1,
                          cursor:"pointer", transition:"all 0.15s",
                          boxShadow: sel ? `0 0 12px ${C.blueGlow}` : "none",
                        }}
                        onMouseEnter={e=>{ if(!sel){ e.currentTarget.style.borderColor="#3B3B44"; e.currentTarget.style.color=C.w; }}}
                        onMouseLeave={e=>{ if(!sel){ e.currentTarget.style.borderColor="#252525"; e.currentTarget.style.color=C.g1; }}}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP: PREMIER BIEN ── */}
          {step.isBienStep && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.08),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.2)", borderRadius:14, padding:"22px 24px", display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ width:48, height:48, borderRadius:12, background:C.blueSub, border:"1px solid rgba(0,123,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0, fontSize:22 }}>🏠</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:4 }}>Import intelligent par IA</p>
                  <p style={{ fontSize:12, color:C.g2, lineHeight:1.6 }}>Déposez votre acte de vente et vos diagnostics — EQUITY remplit automatiquement votre fiche bien en quelques secondes.</p>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {["Acte de vente","Diagnostics","Photos"].map((d,i)=>(
                  <div key={d} style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px", textAlign:"center" }}>
                    <p style={{ fontSize:18, marginBottom:6 }}>{["📄","🔬","📷"][i]}</p>
                    <p style={{ fontSize:11, color:C.g2, fontWeight:500 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: PRÊT (features grid) ── */}
          {step.features && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {step.features.map((f,i)=>(
                <div key={i} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px", display:"flex", gap:12, alignItems:"flex-start", animation:`fadeUp ${0.3+i*0.07}s ease both` }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{f.icon}</span>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:C.w, marginBottom:3 }}>{f.label}</p>
                    <p style={{ fontSize:11, color:C.g2 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CTAs ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:4 }}>
            {/* Primary CTA */}
            <button
              onClick={step.isBienStep ? ()=>{ finish(); setTimeout(()=>onAddBien(),400); } : goNext}
              style={{
                background:`linear-gradient(135deg,${C.blue},#2563EB)`,
                border:"none", borderRadius:12, padding:"14px 0",
                color:"#fff", fontSize:14, fontWeight:700,
                cursor:"pointer", letterSpacing:"0.03em",
                boxShadow:`0 6px 28px ${C.blueGlow}`,
                transition:"all 0.2s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 36px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 6px 28px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
              {step.cta}
            </button>

            {/* Secondary CTA */}
            {step.ctaSecondary && (
              <button onClick={goNext} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 0", color:C.g2, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border;}}>
                {step.ctaSecondary}
              </button>
            )}

            {/* Back + Skip row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {!isFirst && !isLast
                ? <button onClick={goPrev} style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=C.g1}
                    onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                    ← Retour
                  </button>
                : <span/>
              }
              {step.skip && !isLast && (
                <button onClick={goNext} style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, transition:"color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.g1}
                  onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                  Passer cette étape →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PROGRESS BAR ── */}
      <div style={{ height:3, background:"#111", flexShrink:0 }}>
        <div style={{ height:"100%", width:`${((stepIdx)/(total-1))*100}%`, background:`linear-gradient(90deg,${C.blue},#60a5fa)`, borderRadius:99, transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)" }}/>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   AUTH — LOGIN SCREEN
════════════════════════════════════════ */

function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [prenom,   setPrenom]   = useState("");
  const [nom,      setNom]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mode,     setMode]     = useState("login"); // login | signup

  const handleSubmit = () => {
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    if (mode==="signup" && (!prenom || !nom)) { setError("Veuillez renseigner votre prénom et nom."); return; }
    setError(""); setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      const p = mode==="signup" ? prenom : (email.split("@")[0].split(".")[0] || "Utilisateur");
      const n = mode==="signup" ? nom    : (email.split("@")[0].split(".")[1] || "");
      onLogin({
        prenom: p.charAt(0).toUpperCase()+p.slice(1),
        nom:    n.charAt(0).toUpperCase()+n.slice(1),
        email,
        plan:   "Pro",
        dateInscription: new Date().toLocaleDateString("fr-FR"),
        telephone: "",
        regime: "LMNP",
        avatar: (p[0]||"?").toUpperCase() + (n[0]||"").toUpperCase(),
      });
    }, 1100);
  };

  const EyeIcon = ()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {showPass
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:998, background:"#080808", display:"flex", fontFamily:C.font, color:C.w, animation:"fadeUp 0.4s ease" }}>

      {/* Left panel — branding */}
      <div style={{ flex:1, background:"linear-gradient(145deg,#0a0a0a 0%,#0d1117 100%)", borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        {/* Ambient glow */}
        <div style={{ position:"absolute", top:-80, left:-80, width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle,${C.blueGlow} 0%,transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents:"none" }}/>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative", zIndex:1 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${C.blue},#1D4ED8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, boxShadow:`0 4px 20px ${C.blueGlow}` }}>E</div>
          <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em" }}>EQUITY</span>
        </div>

        {/* Headline */}
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ fontSize:10, fontFamily:C.mono, letterSpacing:"0.14em", color:C.blue, marginBottom:14 }}>GESTION PATRIMONIALE INTELLIGENTE</p>
          <h2 style={{ fontSize:34, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.2, marginBottom:16 }}>
            Votre patrimoine,<br/><span style={{ color:C.blue }}>piloté par l'IA</span>
          </h2>
          <p style={{ fontSize:14, color:C.g2, lineHeight:1.75, maxWidth:360 }}>
            Centralisez vos biens, suivez vos locataires, optimisez votre fiscalité — le tout automatisé par l'intelligence artificielle.
          </p>

          {/* Social proof */}
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:10 }}>
            {[
              "📊 Analyse IA de vos documents en quelques secondes",
              "🏠 Valorisation temps réel via DVF & Étalab",
              "💶 Optimisation fiscale LMNP / SCI / Pinel",
            ].map((item,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, animation:`fadeUp ${0.4+i*0.1}s ease both` }}>
                <span style={{ fontSize:14 }}>{item.split(" ")[0]}</span>
                <span style={{ fontSize:13, color:C.g1 }}>{item.slice(item.indexOf(" ")+1)}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:10, color:C.g3, fontFamily:C.mono, position:"relative", zIndex:1 }}>© 2026 EQUITY — Tous droits réservés</p>
      </div>

      {/* Right panel — form */}
      <div style={{ width:460, flexShrink:0, display:"flex", flexDirection:"column", padding:"48px 52px", background:"#08080A", overflowY:"auto" }}>
        <div style={{ margin:"auto 0" }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", marginBottom:6 }}>
            {mode==="login" ? "Connexion" : "Créer un compte"}
          </h1>
          <p style={{ fontSize:13, color:C.g2 }}>
            {mode==="login"
              ? <>Pas encore de compte ? <button onClick={()=>{setMode("signup");setError("");}} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:13, fontWeight:600, padding:0 }}>S'inscrire</button></>
              : <>Déjà un compte ? <button onClick={()=>{setMode("login");setError("");}} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:13, fontWeight:600, padding:0 }}>Se connecter</button></>
            }
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Signup extra fields */}
          {mode==="signup" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[{l:"Prénom",k:"prenom",ph:"Prénom",val:prenom,set:setPrenom},{l:"Nom",k:"nom",ph:"Nom",val:nom,set:setNom}].map(f=>(
                <div key={f.k} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px 16px" }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:5, letterSpacing:"0.1em" }}>{f.l.toUpperCase()}</p>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%" }}
                    onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
                    onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Email */}
          <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px 16px", transition:"border-color 0.15s" }}>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:5, letterSpacing:"0.1em" }}>ADRESSE E-MAIL</p>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="thomas.dubois@exemple.fr"
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
              onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
              style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%" }}
            />
          </div>

          {/* Password */}
          <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:8, transition:"border-color 0.15s" }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:5, letterSpacing:"0.1em" }}>MOT DE PASSE</p>
              <input
                type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
                onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
                style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%" }}
              />
            </div>
            <button onClick={()=>setShowPass(s=>!s)} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:0, display:"flex", transition:"color 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.g1} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
              <EyeIcon/>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:9, padding:"10px 14px" }}>
              <p style={{ fontSize:12, color:C.red }}>{error}</p>
            </div>
          )}

          {mode==="login" && (
            <div style={{ textAlign:"right" }}>
              <button style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, transition:"color 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:12, padding:"14px", color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"wait":"pointer", letterSpacing:"0.03em", boxShadow:`0 6px 28px ${C.blueGlow}`, transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:10, position:"relative", overflow:"hidden", marginTop:4 }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.boxShadow="0 8px 36px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)";}}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 6px 28px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
            {loading && <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)", backgroundSize:"200% 100%", animation:"shimmer 1.2s infinite" }}/>}
            {loading
              ? <><div style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Connexion en cours…</>
              : mode==="login" ? "Se connecter →" : "Créer mon compte →"
            }
          </button>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:C.border }}/>
          <span style={{ fontSize:10, color:C.g3, fontFamily:C.mono }}>OU</span>
          <div style={{ flex:1, height:1, background:C.border }}/>
        </div>

        {/* Demo access */}
        <button onClick={()=>onLogin({ prenom:"Thomas", nom:"Dubois", email:"thomas.dubois@equity.fr", plan:"Pro", dateInscription:"01/01/2026", telephone:"06 12 34 56 78", regime:"LMNP Réel", avatar:"TD" })}
          style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"13px", color:C.g1, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s", letterSpacing:"0.02em" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g1;}}>
          ⚡ Accès démo — Thomas Dubois
        </button>

        <p style={{ fontSize:10, color:C.g3, textAlign:"center", marginTop:20, lineHeight:1.6, fontFamily:C.mono }}>
          En vous connectant, vous acceptez les<br/>Conditions d'utilisation et la Politique de confidentialité.
        </p>
        </div>{/* end margin wrapper */}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MON COMPTE — PAGE COMPLÈTE
════════════════════════════════════════ */
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


function MonComptePanel({ user, onClose, onLogout, onSave, kycData, onSaveKyc }) {
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

/* ════════════════════════════════════════
   ROOT APP
════════════════════════════════════════ */




/* ════════════════════════════════════════
   PERSISTENT STORAGE HELPERS
════════════════════════════════════════ */
async function storageGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch(e) { return null; }
}
async function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch(e) { console.error("Storage set error:", e); return false; }
}
async function storageDel(key) {
  try { localStorage.removeItem(key); return true; }
  catch(e) { return false; }
}

/* ── Attach Tenant to Property Popup ── */
function AttachTenantPopup({ tenant, assets, onAttach, onSkip }) {
  const [hoveredId, setHoveredId] = useState(null);
  const name = `${tenant?.prenom||""} ${tenant?.nom||""}`.trim() || "Ce locataire";
  return (
    <>
      <div onClick={onSkip} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)" }}/>
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:301, width:"min(480px,90vw)", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div style={{ padding:"22px 24px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.blueSub, border:`1px solid rgba(0,123,255,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Link/></div>
            <div>
              <p style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>Rattacher à un bien</p>
              <p style={{ fontSize:11, color:C.g2, marginTop:2 }}>{name} a été créé avec succès. Souhaitez-vous le rattacher à un bien ?</p>
            </div>
          </div>
        </div>
        {/* Property list */}
        <div style={{ padding:"12px 16px", maxHeight:320, overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {assets.map(a => {
              const hovered = hoveredId === a.id;
              return (
                <button key={a.id} onClick={()=>onAttach(a.id)}
                  onMouseEnter={()=>setHoveredId(a.id)} onMouseLeave={()=>setHoveredId(null)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:hovered?"rgba(0,123,255,0.06)":"#0a0a0a", border:`1.5px solid ${hovered?C.blue:C.border}`, borderRadius:12, cursor:"pointer", transition:"all 0.15s", textAlign:"left", width:"100%" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:hovered?C.blueSub:"#151515", border:`1px solid ${hovered?"rgba(0,123,255,0.3)":C.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:hovered?C.blue:C.g2, transition:"all 0.15s" }}>
                    <I.Home/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:hovered?C.w:C.g1, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name||"Bien sans nom"}</p>
                    <p style={{ fontSize:10, color:C.g3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{[a.type, a.addr||a.ville, a.surface?a.surface+" m²":null].filter(Boolean).join(" · ")||"Aucune adresse"}</p>
                  </div>
                  {a.tenantName && <span style={{ fontSize:8, fontFamily:C.mono, color:C.yellow, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", padding:"2px 7px", borderRadius:4, flexShrink:0 }}>Occupé</span>}
                  {!a.tenantName && <span style={{ fontSize:8, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"2px 7px", borderRadius:4, flexShrink:0 }}>Disponible</span>}
                  <div style={{ color:hovered?C.blue:C.g3, flexShrink:0, transition:"color 0.15s" }}><I.ChevronRight/></div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onSkip}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 20px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border;}}>
            Ne pas rattacher
          </button>
        </div>
      </div>
    </>
  );
}

export default function EquityApp() {
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [user,           setUser]           = useState(null);
  const [showMonCompte,  setShowMonCompte]  = useState(false);
  const [nav,            setNav]            = useState("pilotage");
  const [viewMode,       setViewMode]       = useState("standard"); // "standard" | "map"
  const [assets,         setAssets]         = useState([]);
  const [tenants,        setTenants]        = useState([]);
  const [selectedAsset,  setSelectedAsset]  = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showNewTenant,  setShowNewTenant]  = useState(false);
  const [showNewAsset,   setShowNewAsset]   = useState(false);
  const [pendingTenant,  setPendingTenant]  = useState(null); // tenant awaiting property attachment
  const [tenantInitialTab, setTenantInitialTab] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [kycData,        setKycData]        = useState({});
  const [storageReady,   setStorageReady]   = useState(false);

  const handleLogin = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Load saved data from persistent storage
    try {
      const email = userData.email || "default";
      const saved = await storageGet(`equity-data:${email}`);
      if (saved) {
        if (saved.assets) setAssets(saved.assets);
        if (saved.tenants) setTenants(saved.tenants);
        if (saved.kycData) setKycData(saved.kycData);
        if (saved.onboardingDone) setOnboardingDone(true);
        if (!saved.onboardingDone) setShowOnboarding(true);
      } else {
        // First time: start empty, show onboarding
        setAssets([]);
        setTenants([]);
        setShowOnboarding(true);
      }
    } catch(e) {
      console.error("Load error:", e);
      setShowOnboarding(true);
    }
    setStorageReady(true);
  };

  const handleLogout = () => {
    setShowMonCompte(false);
    setIsLoggedIn(false);
    setUser(null);
    setNav("pilotage");
    setAssets([]);
    setTenants([]);
    setSelectedAsset(null);
    setSelectedTenant(null);
    setShowNewTenant(false);
    setShowNewAsset(false);
    setShowOnboarding(false);
    setStorageReady(false);
  };

  const handleOnboardingComplete = () => { setShowOnboarding(false); setOnboardingDone(true); };

  const handleSaveUser = (updated) => setUser(updated);

  // ── AUTO-SAVE to persistent storage ──
  useEffect(() => {
    if (!storageReady || !user) return;
    const email = user.email || "default";
    const data = { assets, tenants, kycData, onboardingDone, savedAt: Date.now() };
    storageSet(`equity-data:${email}`, data);
  }, [assets, tenants, kycData, onboardingDone, storageReady, user]);

  // Save user profile separately
  useEffect(() => {
    if (!storageReady || !user) return;
    const email = user.email || "default";
    storageSet(`equity-user:${email}`, user);
  }, [user, storageReady]);

  const handleAddAsset = (newAsset) => {
    const withId = { ...newAsset, id: Date.now() };
    setAssets(prev => [...prev, withId]);
    setShowNewAsset(false);
    setNav("patrimoine");   // navigate to patrimoine after creation
  };

  const handleSelectAsset  = (asset)  => { setSelectedAsset(asset); setShowNewAsset(false); };
  const handleNewAsset     = ()       => { setShowNewAsset(true); setSelectedAsset(null); };
  const handleCloseAsset   = ()       => { setShowNewAsset(false); setSelectedAsset(null); };
  const handleUpdateAsset = (updatedAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setSelectedAsset(updatedAsset);
  };
  const handleDeleteAsset  = (assetId) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setSelectedAsset(null);
    setShowNewAsset(false);
  };
  const handleAddTenant = (newTenant) => {
    const withId = { ...newTenant, id: Date.now(), daysLate: 0 };
    setTenants(prev => [...prev, withId]);
    setShowNewTenant(false);
    // Show attach-to-property popup if there are existing assets
    if (assets.length > 0) {
      setPendingTenant(withId);
    }
  };

  const handleAttachTenant = (assetId) => {
    if (!pendingTenant) return;
    const bien = assets.find(a=>a.id===assetId);
    if (!bien) return;
    const loyerVal = bien.loyer || "";
    const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10) || 0;
    const isVide = (bien.typeLocation||"").toLowerCase().includes("vide");
    const depotCalc = loyerNum > 0 ? (isVide ? loyerNum : loyerNum * 2) : "";
    const updatedTenant = {
      ...pendingTenant,
      bienId: assetId,
      bienName: bien.name || "",
      bienType: bien.type || "",
      bienAddr: [bien.addr, bien.addr2, bien.batiment, bien.porteLot].filter(Boolean).join(", "),
      bienVille: bien.ville || "",
      bienCodePostal: bien.codePostal || "",
      bienSurface: bien.surface || "",
      bienRooms: bien.rooms || "",
      bienDpe: bien.dpe || "",
      bienYear: bien.year || "",
      bienTypeLocation: bien.typeLocation || "",
      bienMode: bien.mode || "",
      loyerHC: loyerVal,
      chargesLoc: String(bien.chargesLocatives || ""),
      depotGarantieCalc: String(depotCalc),
      frequencePaiement: bien.frequencePaiement || "",
      dureeBail: isVide ? "3 ans renouvelable" : "1 an renouvelable",
      loyer: (pendingTenant.loyer && pendingTenant.loyer !== "\u2014 \u20ac") ? pendingTenant.loyer : (loyerVal ? loyerVal + " \u20ac" : pendingTenant.loyer),
    };
    setTenants(prev => prev.map(t => t.id === pendingTenant.id ? updatedTenant : t));
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, statut: "Loué", etatLocatif: "Loué", tenantId: pendingTenant.id, tenantName: `${pendingTenant.prenom||""} ${pendingTenant.nom||""}`.trim() } : a));
    setPendingTenant(null);
    setTenantInitialTab("Gestion");
    setSelectedTenant(updatedTenant);
    setNav("locataires");
  };

  const handleSkipAttach = () => { setPendingTenant(null); };
  const handleUpdateTenant = (updatedTenant) => {
    const prevTenant = tenants.find(t => t.id === updatedTenant.id);
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    if (selectedTenant?.id === updatedTenant.id) setSelectedTenant(updatedTenant);
    // Sync asset on detach (bienId removed)
    if (prevTenant?.bienId && !updatedTenant.bienId) {
      setAssets(prev => prev.map(a => a.id === prevTenant.bienId ? { ...a, statut:"Disponible", etatLocatif:"Disponible", tenantId:null, tenantName:null } : a));
      if (selectedAsset?.id === prevTenant.bienId) setSelectedAsset(a => a ? { ...a, statut:"Disponible", etatLocatif:"Disponible", tenantId:null, tenantName:null } : a);
    }
    // Sync asset on attach (bienId added from tenant side)
    if (!prevTenant?.bienId && updatedTenant.bienId) {
      const tn = `${updatedTenant.prenom||""} ${updatedTenant.nom||""}`.trim();
      setAssets(prev => prev.map(a => a.id === updatedTenant.bienId ? { ...a, statut:"Loué", etatLocatif:"Loué", tenantId:updatedTenant.id, tenantName:tn } : a));
    }
  };
  const handleDeleteTenant = (tenantId) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    setSelectedTenant(null);
  };
  const handleSelectTenant = (tenant) => { setTenantInitialTab(null); setSelectedTenant(tenant); setShowNewTenant(false); };
  const handleNewTenant    = ()       => { setShowNewTenant(true); setSelectedTenant(null); };
  const handleCloseTenant  = ()       => { setTenantInitialTab(null); setSelectedTenant(null); setShowNewTenant(false); };

  const handleNav = (id) => {
    setNav(id);
    setSelectedAsset(null);
    setShowNewAsset(false);
    if (id !== "locataires") setSelectedTenant(null);
    setShowNewTenant(false);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:C.font, color:C.w }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        *{font-family:'Outfit',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#27272A;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#3F3F46}
        ::selection{background:rgba(59,130,246,0.25);color:#fff}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes scanBar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.5;cursor:pointer}
        input[type=date]::-webkit-calendar-picker-indicator:hover{opacity:0.8}
        input[type=date]{cursor:pointer}
      `}</style>

      {/* ── LOGIN SCREEN ── */}
      {!isLoggedIn && <LoginScreen onLogin={handleLogin}/>}

      {/* ── ONBOARDING ── */}
      {isLoggedIn && showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onAddBien={()=>{ setShowOnboarding(false); setOnboardingDone(true); setNav("patrimoine"); setShowNewAsset(true); }}
        />
      )}

      {/* ── SIDEBAR ── */}
      {isLoggedIn && !showOnboarding && (<>
      <aside style={{ width:64, flexShrink:0, background:"#08080A", borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0", position:"sticky", top:0, height:"100vh" }}>
        {/* Logo — toggle map/standard */}
        <button onClick={()=>setViewMode(v=>v==="standard"?"map":"standard")} title={viewMode==="map"?"Retour gestion":"Vue investissement"}
          style={{ width:32, height:32, borderRadius:8, marginBottom:32, background:viewMode==="map"?"linear-gradient(135deg,#1D4ED8,#7C3AED)":`linear-gradient(135deg,${C.blue},#1D4ED8)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:viewMode==="map"?"0 0 20px rgba(124,58,237,0.5),0 0 40px rgba(59,130,246,0.2)":`0 4px 16px ${C.blueGlow}`, fontSize:13, fontWeight:800, border:viewMode==="map"?"2px solid rgba(124,58,237,0.6)":"2px solid transparent", cursor:"pointer", color:"#fff", transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)", animation:viewMode==="map"?"pulse 2s infinite":undefined }}>E</button>

        <nav style={{ display:"flex", flexDirection:"column", gap:4, width:"100%", alignItems:"center" }}>
          {NAV.map(({ id, label, Icon })=>{
            const active = nav===id;
            return (
              <button key={id} title={label} onClick={()=>handleNav(id)} style={{ background:active?C.blueSub:"transparent", border:"none", borderLeft:active?`2px solid ${C.blue}`:"2px solid transparent", width:"100%", padding:"12px 0", cursor:"pointer", color:active?C.blue:C.g2, display:"flex", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!active)e.currentTarget.style.color=C.w}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.color=C.g2}}>
                <Icon/>
              </button>
            );
          })}
        </nav>

        {/* Avatar — Mon Compte */}
        <button
          title="Mon compte"
          onClick={()=>setShowMonCompte(true)}
          style={{ marginTop:"auto", width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, border:"2px solid transparent", cursor:"pointer", transition:"all 0.2s", color:"#fff", flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.border="2px solid #8b5cf6";e.currentTarget.style.boxShadow="0 0 16px rgba(139,92,246,0.4)";e.currentTarget.style.transform="scale(1.08)";}}
          onMouseLeave={e=>{e.currentTarget.style.border="2px solid transparent";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
          {user ? ((user.prenom?.[0]||"")+(user.nom?.[0]||"")).toUpperCase() || "?" : "?"}
        </button>
      </aside>

      {/* ── MAP VIEW ── */}
      {viewMode==="map" && (
        <FranceMapView assets={assets} onSelectAsset={handleSelectAsset}/>
      )}

      {/* ── PAGE CONTENT ── */}
      {viewMode==="standard" && (showMonCompte && user
        ? <MonComptePanel user={user} onClose={()=>setShowMonCompte(false)} onLogout={handleLogout} onSave={handleSaveUser} kycData={kycData} onSaveKyc={setKycData}/>
        : <>
      {nav==="pilotage"    && <Dashboard onSelectAsset={handleSelectAsset} onNav={handleNav} onNewTenant={handleNewTenant} onSelectTenant={handleSelectTenant} assets={assets} tenants={tenants} user={user}/>}
      {nav==="patrimoine"  && <PatrimoinePage onSelectAsset={handleSelectAsset} onNewAsset={handleNewAsset} assets={assets}/>}
      {nav==="locataires"  && <LocatairesPage onNewTenant={handleNewTenant} onSelectTenant={handleSelectTenant} tenants={tenants}/>}
      {nav==="simulateurs" && <SimulateurPage/>}
      {!["pilotage","patrimoine","locataires","simulateurs"].includes(nav) && (
        <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.Sparkles/></div>
          <p style={{ fontSize:14, color:C.g2 }}>Section <strong style={{ color:C.g1 }}>{NAV.find(n=>n.id===nav)?.label}</strong> — bientôt disponible</p>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>EN COURS DE DÉVELOPPEMENT</span>
        </main>
      )}

      </>)}

      {/* ── SLIDE-OVERS ── */}
      {selectedAsset   && <PropertyDetail asset={selectedAsset} onClose={handleCloseAsset} onDelete={handleDeleteAsset} onUpdate={handleUpdateAsset} kycData={kycData}/>}
      {showNewAsset    && <NouveauBienPanel onClose={handleCloseAsset} onCreateAsset={handleAddAsset}/>}
      {selectedTenant  && <TenantDetailPanel tenant={selectedTenant} onClose={handleCloseTenant} onDelete={handleDeleteTenant} onUpdateTenant={handleUpdateTenant} initialTab={tenantInitialTab} assets={assets} user={user}/>}
      {showNewTenant   && <NouveauLocatairePanel onClose={handleCloseTenant} onSave={handleAddTenant}/>}
      {pendingTenant   && <AttachTenantPopup tenant={pendingTenant} assets={assets} onAttach={handleAttachTenant} onSkip={handleSkipAttach}/>}
      </>)}
    </div>
  );
}
