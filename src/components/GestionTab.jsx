import { useState, useRef, useEffect } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

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

export { GestionTab };
