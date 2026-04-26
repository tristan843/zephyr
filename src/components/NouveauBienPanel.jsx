import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";
import { NbFieldAddress } from "./NbFieldAddress.jsx";

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

export { NouveauBienPanel };
