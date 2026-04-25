import { useState, useRef, useEffect } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";
import { FormField, FInput, FSelect, FTextarea, DPESelector, ColorDot } from "./ui/FormAtoms.jsx";
import { NbFieldAddress } from "./NbFieldAddress.jsx";

function AccessTile({ icon:TIcon, label, value, color }) {
  const [copied,setCopied] = useState(false);
  return (
    <div onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),1500)}}
      style={{ background:`${color}0d`, border:`1px solid ${color}28`, borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s" }}
      onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderColor=`${color}44`}}
      onMouseLeave={e=>{e.currentTarget.style.background=`${color}0d`;e.currentTarget.style.borderColor=`${color}28`}}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
        <span style={{ color }}><TIcon/></span>
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g2, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:20, fontWeight:800, color, letterSpacing:"0.08em", fontFamily:C.mono }}>{value}</span>
        <span style={{ fontSize:9, color:copied?"#22c55e":color, fontFamily:C.mono, opacity:.7 }}>{copied?"✓ Copié":"Tap pour copier"}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PROPERTY DETAIL SLIDE-OVER
════════════════════════════════════════ */

/* ── MAIN COMPLEMENTARY TAB ── */
const REFERENCE_COLORS = ["#007BFF","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#84CC16","#F97316","#6B7280"];

function CaractComplementaires({ asset }) {
  const [form, setForm] = useState({
    typeBien: asset.type==="Maison"?"Maison":asset.type==="Appartement"?"Appartement":asset.type==="Studio"?"Studio":"Autre",
    nomBien: asset.name,
    couleur: "#007BFF",
    dateConstruction: String(asset.year),
    adresse: asset.addr.split(",")[0]||"",
    complement: "",
    etage: "",
    ville: asset.addr.includes("Eysines")?"Eysines":asset.addr.includes("Bordeaux")?"Bordeaux":"Mérignac",
    codePostal: asset.addr.match(/\d{5}/)?.[0]||"",
    region: "Nouvelle-Aquitaine",
    pays: "France",
    superficie: asset.surface.replace(" m²",""),
    nbPieces: asset.rooms.split("P")[0]||"",
    nbChambres: asset.rooms.match(/(\d+)Ch/)?.[1]||"",
    nbSDB: asset.rooms.match(/(\d+)SDB/)?.[1]||"",
    description: "",
    etatLocatif: "Loué",
    typeLocation: asset.mode.includes("Meublée")||asset.mode.includes("meublée")?"Meublée":"Vide",
    loyerRef: String(asset.loyer||"").replace(" €","").replace(" / mois","").trim(),
    charges: "50",
    frequence: "Mensuel",
    classeEnergie: asset.dpe,
    indiceGES: asset.ges,
    depensesBasse: "1200",
    depensesHaute: "1500",
    anneeDPE: "2023",
  });
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm(f=>({...f, [k]: e.target ? e.target.value : e}));
  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const gridStyle = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };
  const sectionStyle = { display:"flex", flexDirection:"column", gap:14 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* ── SECTION 1 : Identité ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="1 · INFORMATIONS GÉNÉRALES"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <FormField label="Type de bien" icon={I.Building}>
              <FSelect value={form.typeBien} onChange={set("typeBien")} options={[
                {v:"",l:"Choisir..."},{v:"Appartement",l:"Appartement"},{v:"Maison",l:"Maison"},
                {v:"Immeuble",l:"Immeuble"},{v:"Studio",l:"Studio"},{v:"Loft",l:"Loft"},
                {v:"Local commercial",l:"Local commercial / professionnel"},{v:"Terrain",l:"Terrain"},
                {v:"Garage",l:"Garage / Parking"},{v:"Cave",l:"Cave"},{v:"Autre",l:"Autre"},
              ]}/>
            </FormField>
            <FormField label="Identifiant / Nom du bien" icon={I.Tag}>
              <FInput value={form.nomBien} onChange={set("nomBien")} placeholder="ex: Villa Eysines, Lot n°4"/>
            </FormField>
          </div>

          <FormField label="Couleur de référence (calendrier & dashboard)" icon={I.Palette}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {REFERENCE_COLORS.map(col=>(
                  <button key={col} onClick={()=>setForm(f=>({...f, couleur:col}))}
                    style={{ width:24, height:24, borderRadius:"50%", background:col, border:`2px solid ${form.couleur===col?"#fff":"transparent"}`, cursor:"pointer", transition:"all 0.15s", boxShadow: form.couleur===col?`0 0 10px ${col}70`:"none" }}/>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
                <ColorDot color={form.couleur}/>
                <span style={{ fontSize:11, fontFamily:C.mono, color:C.g2 }}>{form.couleur}</span>
              </div>
            </div>
          </FormField>

          <div style={gridStyle}>
            <FormField label="Année de construction" icon={I.Calendar}>
              <FInput value={form.dateConstruction} onChange={set("dateConstruction")} placeholder="ex: 1985" type="number"/>
            </FormField>
          </div>
        </div>
      </div>

      {/* ── SECTION 2 : Localisation ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="2 · LOCALISATION PRÉCISE"/>
        <div style={sectionStyle}>
          <FormField label="Adresse complète (N°, Rue)" icon={I.MapPin} col2>
            <FInput value={form.adresse} onChange={set("adresse")} placeholder="ex: 12 Allée des Chênes"/>
          </FormField>
          <div style={gridStyle}>
            <FormField label="Complément d'adresse" icon={I.Layers}>
              <FInput value={form.complement} onChange={set("complement")} placeholder="Résidence, Bâtiment, Escalier"/>
            </FormField>
            <FormField label="Étage / N° de porte" icon={I.Home2}>
              <FInput value={form.etage} onChange={set("etage")} placeholder="ex: 3ème · Porte 12"/>
            </FormField>
            <FormField label="Ville" icon={I.Globe}>
              <FInput value={form.ville} onChange={set("ville")} placeholder="ex: Bordeaux"/>
            </FormField>
            <FormField label="Code Postal" icon={I.MapPin}>
              <FInput value={form.codePostal} onChange={set("codePostal")} placeholder="ex: 33000" type="text"/>
            </FormField>
            <FormField label="Région / État" icon={I.Globe}>
              <FInput value={form.region} onChange={set("region")} placeholder="ex: Nouvelle-Aquitaine"/>
            </FormField>
            <FormField label="Pays" icon={I.Globe}>
              <FSelect value={form.pays} onChange={set("pays")} options={["France","Belgique","Suisse","Luxembourg","Espagne","Autre"]}/>
            </FormField>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 : ADN Technique ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="3 · ADN TECHNIQUE"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <FormField label="Superficie totale (m²)" icon={I.Ruler}>
              <FInput value={form.superficie} onChange={set("superficie")} placeholder="ex: 210" type="number"/>
            </FormField>
            <FormField label="Nombre de pièces (total)" icon={I.Grid}>
              <FInput value={form.nbPieces} onChange={set("nbPieces")} placeholder="ex: 8" type="number"/>
            </FormField>
            <FormField label="Nombre de chambres" icon={I.Home2}>
              <FInput value={form.nbChambres} onChange={set("nbChambres")} placeholder="ex: 4" type="number"/>
            </FormField>
            <FormField label="Salles de bain / Salles d'eau" icon={I.Layers}>
              <FInput value={form.nbSDB} onChange={set("nbSDB")} placeholder="ex: 2" type="number"/>
            </FormField>
          </div>
          <FormField label="Description libre (annonce & contrat)" icon={I.FileText} col2>
            <FTextarea value={form.description} onChange={set("description")} rows={4}
              placeholder="Décrivez le bien : situation géographique, atouts, prestations, environnement..."/>
          </FormField>
        </div>
      </div>

      {/* ── SECTION 4 : État locatif ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="4 · ÉTAT & CONFIGURATION LOCATIVE"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <FormField label="État locatif actuel" icon={I.Target}>
              <FSelect value={form.etatLocatif} onChange={set("etatLocatif")} options={[
                "Automatique","Disponible","Loué","En préavis","En recherche","Indisponible","En travaux"
              ]}/>
            </FormField>
            <FormField label="Type de location proposé" icon={I.Home2}>
              <FSelect value={form.typeLocation} onChange={set("typeLocation")} options={["Meublée","Vide","Saisonnière"]}/>
            </FormField>
          </div>
          <div style={gridStyle}>
            <FormField label="Loyer de référence HC (€)" icon={I.Euro}>
              <FInput value={form.loyerRef} onChange={set("loyerRef")} placeholder="ex: 3200" type="number"/>
            </FormField>
            <FormField label="Provisions sur charges (€)" icon={I.Euro}>
              <FInput value={form.charges} onChange={set("charges")} placeholder="ex: 50" type="number"/>
            </FormField>
          </div>
          <FormField label="Fréquence de paiement" icon={I.Repeat}>
            <div style={{ display:"flex", gap:6 }}>
              {["Mensuel","Bimestriel","Trimestriel","Semestriel","Annuel"].map(f=>{
                const active = form.frequence===f;
                return (
                  <button key={f} onClick={()=>setForm(fr=>({...fr,frequence:f}))}
                    style={{ flex:1, padding:"7px 4px", borderRadius:7, fontSize:10, fontFamily:C.mono, cursor:"pointer", transition:"all 0.15s",
                      background: active ? C.blueSub : "#0a0a0a",
                      border: `1px solid ${active ? C.blue : "#252525"}`,
                      color: active ? C.blue : C.g2,
                      fontWeight: active ? 600 : 400 }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>
      </div>

      {/* ── SECTION 5 : DPE ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="5 · PERFORMANCE ÉNERGÉTIQUE (DPE)"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <DPESelector label="Classe Énergie" value={form.classeEnergie} onChange={v=>setForm(f=>({...f,classeEnergie:v}))}/>
            <DPESelector label="Indice GES (Gaz à Effet de Serre)" value={form.indiceGES} onChange={v=>setForm(f=>({...f,indiceGES:v}))}/>
          </div>
          <div style={gridStyle}>
            <FormField label="Dépenses annuelles estimées — Basse (€)" icon={I.Zap}>
              <FInput value={form.depensesBasse} onChange={set("depensesBasse")} placeholder="ex: 1200" type="number"/>
            </FormField>
            <FormField label="Dépenses annuelles estimées — Haute (€)" icon={I.Zap}>
              <FInput value={form.depensesHaute} onChange={set("depensesHaute")} placeholder="ex: 1500" type="number"/>
            </FormField>
          </div>
          <FormField label="Année de référence du DPE" icon={I.Calendar}>
            <FSelect value={form.anneeDPE} onChange={set("anneeDPE")} options={
              ["2018","2019","2020","2021","2022","2023","2024","2025","2026"].map(y=>({v:y,l:y}))
            }/>
          </FormField>

          {/* Preview card */}
          <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              {[{k:"classeEnergie",label:"Énergie"},{k:"indiceGES",label:"GES"}].map(({k,label})=>{
                const col = {A:"#22c55e",B:"#84cc16",C:"#eab308",D:"#f97316",E:"#ef4444",F:"#dc2626",G:"#991b1b"}[form[k]]||"#6b7280";
                return (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:`${col}18`, border:`1.5px solid ${col}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:col, boxShadow:`0 0 10px ${col}30` }}>{form[k]||"?"}</div>
                    <div><p style={{ fontSize:9, color:C.g2, fontFamily:C.mono }}>{label}</p><p style={{ fontSize:11, fontWeight:600, color:C.w }}>{form.depensesBasse||"—"} — {form.depensesHaute||"—"} €/an</p></div>
                  </div>
                );
              })}
            </div>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>DPE {form.anneeDPE}</span>
          </div>
        </div>
      </div>

      {/* ── SAVE BUTTON ── */}
      <button onClick={handleSave} style={{
        width:"100%", background: saved ? "linear-gradient(135deg,#059669,#047857)" : `linear-gradient(135deg,${C.blue},#2563EB)`,
        border:"none", borderRadius:12, padding:"14px 24px", color:"#fff", fontSize:13, fontWeight:700,
        cursor:"pointer", letterSpacing:"0.04em", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        boxShadow: saved ? "0 4px 24px rgba(5,150,105,0.4)" : `0 4px 28px ${C.blueGlow}`,
        transition:"all 0.2s",
      }}
      onMouseEnter={e=>{ if(!saved){ e.currentTarget.style.boxShadow="0 6px 36px rgba(0,123,255,0.5)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow=saved?"0 4px 24px rgba(5,150,105,0.4)":`0 4px 28px ${C.blueGlow}`; e.currentTarget.style.transform="none"; }}>
        {saved ? <><span>✓</span> Modifications sauvegardées !</> : <><I.Save/> Enregistrer les modifications</>}
      </button>
    </div>
  );
}
/* ════════════════════════════════════════
   FINANCES & FISCALITÉ TAB
════════════════════════════════════════ */

/* Reusable editable field row */
function FField({ label, value, unit, accent, icon:TIcon, mono, placeholder }) {
  const [val, setVal] = useState(value || "");
  const [focus, setFocus] = useState(false);
  return (
    <div style={{
      background: focus ? "rgba(0,123,255,0.04)" : "#0a0a0a",
      border: `1px solid ${focus ? "rgba(0,123,255,0.3)" : C.border}`,
      borderRadius: 10, padding: "11px 14px",
      transition: "all 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {TIcon && <span style={{ color: C.g3 }}><TIcon /></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <input
          value={val}
          onChange={e=>setVal(e.target.value)}
          onFocus={()=>setFocus(true)}
          onBlur={()=>setFocus(false)}
          placeholder={placeholder || "—"}
          style={{
            flex:1, background:"transparent", border:"none", outline:"none",
            fontSize:13, fontWeight:700,
            color: accent ? C.blue : C.w,
            fontFamily: mono ? "monospace" : "inherit",
            letterSpacing: accent ? "-0.02em" : "normal",
          }}
        />
        {unit && <span style={{ fontSize:11, color:C.g2, flexShrink:0 }}>{unit}</span>}
      </div>
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
function PerfSH({label, icon}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0 8px" }}>
      <span style={{ fontSize:12 }}>{icon}</span>
      <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:C.blue, fontFamily:C.mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(59,130,246,0.15)" }}/>
    </div>
  );
}
function PerfInpRow({label, value, onChange, unit, step, min, max}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 0" }}>
      <span style={{ flex:1, fontSize:11, color:C.g2 }}>{label}</span>
      <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} step={step||1} min={min} max={max}
        style={{ width:80, background:"#111", border:"1px solid "+C.border, borderRadius:6, padding:"4px 8px", fontSize:12, fontWeight:700, color:C.blue, textAlign:"right", outline:"none" }}/>
      {unit && <span style={{ fontSize:10, color:C.g3, width:32, textAlign:"left" }}>{unit}</span>}
    </div>
  );
}
function PerfInfo({text}) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position:"relative", display:"inline-flex", marginLeft:4, cursor:"help" }}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <span style={{ width:14, height:14, borderRadius:"50%", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.25)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color:C.blue, fontFamily:C.mono, lineHeight:1 }}>i</span>
      {show && (
        <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", zIndex:100, width:260, background:"#1a1a2e", border:"1px solid rgba(59,130,246,0.25)", borderRadius:10, padding:"10px 12px", boxShadow:"0 8px 30px rgba(0,0,0,0.6)", pointerEvents:"none" }}>
          <p style={{ fontSize:10, color:"#d1d5db", lineHeight:1.6, fontFamily:C.mono, whiteSpace:"pre-wrap" }}>{text}</p>
          <div style={{ position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%) rotate(45deg)", width:8, height:8, background:"#1a1a2e", borderRight:"1px solid rgba(59,130,246,0.25)", borderBottom:"1px solid rgba(59,130,246,0.25)" }}/>
        </div>
      )}
    </span>
  );
}
function PerfMetric({label, value, color, sub, info}) {
  return (
    <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:9, padding:"10px 12px", textAlign:"center" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em", marginBottom:4 }}>{label}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}>
        <p style={{ fontSize:16, fontWeight:800, color:color||C.w, fontFamily:C.mono }}>{value}</p>
        {info && <PerfInfo text={info}/>}
      </div>
      {sub && <p style={{ fontSize:9, color:C.g3, marginTop:2 }}>{sub}</p>}
    </div>
  );
}

/* ── Performance Simulator Tab ── */
function PerformanceTab({ asset, onUpdate, kycData }) {
  const p = (v) => parseInt(String(v||"0").replace(/[^\d]/g,""),10)||0;
  const pf = (v) => parseFloat(String(v||"0").replace(",","."))||0;

  // Parse TMI from KYC data ("0 % — Non imposable" → 0)
  const parseTMI = (s) => { const m = String(s||"").match(/^(\d+)/); return m ? parseInt(m[1]) : null; };
  const kycTMI = parseTMI(kycData?.tmi);

  // ── Inputs with pre-fill from asset.perfSim or asset ──
  const saved = asset.perfSim || {};
  const initPrix = saved.prixBien ?? (p(asset.prixBien) || 200000);
  const [sim, setSim] = useState({
    prixBien: initPrix,
    fraisNotaire: saved.fraisNotaire ?? (p(asset.fraisNotaire) || Math.round(initPrix * 0.08)),
    travaux: saved.travaux ?? 0,
    mobilier: saved.mobilier ?? 0,
    apport: saved.apport ?? 40000,
    montantPret: saved.montantPret ?? 0,
    tauxInteret: saved.tauxInteret ?? 3.5,
    dureePret: saved.dureePret ?? 20,
    tauxAssurance: saved.tauxAssurance ?? 0.30,
    differe: saved.differe ?? 0,
    loyerMensuel: saved.loyerMensuel ?? (p(asset.loyer) || 800),
    vacance: saved.vacance ?? 5,
    tauxRevaloLoyer: saved.tauxRevaloLoyer ?? 1.5,
    taxeFonciere: saved.taxeFonciere ?? (p(asset.taxeFonciere) || 1200),
    chargesCopro: saved.chargesCopro ?? (p(asset.chargesCopro) || 1500),
    assurancePNO: saved.assurancePNO ?? 250,
    gestionLocative: saved.gestionLocative ?? 0,
    entretien: saved.entretien ?? 500,
    tmi: saved.tmi ?? kycTMI ?? 30,
    prelevementsSociaux: saved.prelevementsSociaux ?? 17.2,
    typeRegime: saved.typeRegime ?? "lmnp_reel",
    amortissement: saved.amortissement ?? 6800,
    tauxRevaloBien: saved.tauxRevaloBien ?? 2,
    dureeDetention: saved.dureeDetention ?? 15,
    tauxActualisation: saved.tauxActualisation ?? 3,
  });
  const u = (k,v) => setSim(s=>({...s,[k]:v}));
  const n = (k) => typeof sim[k]==="number" ? sim[k] : pf(sim[k]);

  // Auto-save sim data to asset.perfSim (debounced)
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!onUpdate) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Compute VL inline for persistence
      const ct = (sim.prixBien||0)+(sim.fraisNotaire||0)+(sim.travaux||0)+(sim.mobilier||0);
      const mp = sim.montantPret || Math.max(0, ct - (sim.apport||0));
      const ae = asset.anneesDetention || 0;
      const va = (sim.prixBien||0) * Math.pow(1 + (sim.tauxRevaloBien||2)/100, ae);
      const tm = (sim.tauxInteret||0)/100/12;
      const nM = (sim.dureePret||0)*12;
      const dM = Math.min(sim.differe||0, nM);
      const nA = nM - dM;
      const me = Math.max(0, ae * 12 - dM);
      let crdCalc = 0;
      if (mp > 0 && tm > 0 && nA > 0 && me < nA) { const fN = Math.pow(1+tm,nA); const fn = Math.pow(1+tm,me); crdCalc = Math.round(mp*(fN-fn)/(fN-1)); }
      const fv = Math.round(va * 0.03);
      const vlCalc = Math.round(va - crdCalc - fv);
      onUpdate({
        ...asset,
        perfSim: { ...sim },
        vl: Math.round(va),
        vlLiquidative: vlCalc,
        // Sync main asset fields from perfSim
        loyer: String(sim.loyerMensuel || asset.loyer || ""),
        loyerAnnuel: (sim.loyerMensuel || 0) * 12,
        prixBien: sim.prixBien || asset.prixBien,
        fraisNotaire: sim.fraisNotaire || asset.fraisNotaire,
        taxeFonciere: sim.taxeFonciere || asset.taxeFonciere,
        chargesCopro: sim.chargesCopro || asset.chargesCopro,
      });
    }, 600);
    return () => { if(saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [sim]);

  // Auto-calc frais de notaire = 8% du prix du bien
  const prevPrixRef = useRef(sim.prixBien);
  useEffect(() => {
    if (sim.prixBien !== prevPrixRef.current) {
      prevPrixRef.current = sim.prixBien;
      setSim(s => ({...s, fraisNotaire: Math.round(sim.prixBien * 0.08)}));
    }
  }, [sim.prixBien]);

  // Auto-calc montant du prêt = coût total - apport
  const coutTotalCalc = n("prixBien") + n("fraisNotaire") + n("travaux") + n("mobilier");
  const prevCoutRef = useRef(null);
  useEffect(() => {
    const mp = Math.max(0, coutTotalCalc - n("apport"));
    if (prevCoutRef.current === null) { prevCoutRef.current = mp; setSim(s=>({...s, montantPret:mp})); return; }
    if (mp !== prevCoutRef.current) { prevCoutRef.current = mp; setSim(s=>({...s, montantPret:mp})); }
  }, [sim.prixBien, sim.fraisNotaire, sim.travaux, sim.mobilier, sim.apport]);

  // ═══ All calculations ═══
  const coutTotal = coutTotalCalc;
  const montantPret = n("montantPret");
  const tauxM = n("tauxInteret")/100/12;
  const nbMens = n("dureePret")*12;
  const differeMois = Math.min(n("differe"), nbMens);
  // Mensualité pendant différé (intérêts seuls)
  const mensualiteDiffere = montantPret > 0 && tauxM > 0 ? montantPret * tauxM : 0;
  // Mensualité après différé (amortissement sur durée restante)
  const nbMensAmorties = nbMens - differeMois;
  const mensualiteCredit = montantPret > 0 && tauxM > 0 && nbMensAmorties > 0 ? montantPret * tauxM / (1 - Math.pow(1+tauxM, -nbMensAmorties)) : 0;
  // Assurance sur montant du prêt
  const mensualiteAssurance = montantPret * (n("tauxAssurance")/100) / 12;
  // Totaux
  const mensualiteTotaleDiffere = mensualiteDiffere + mensualiteAssurance;
  const mensualiteTotale = mensualiteCredit + mensualiteAssurance;
  const creditAnnuelNormal = mensualiteTotale * 12;
  const creditAnnuelDiffere = mensualiteTotaleDiffere * 12;
  const creditAnnuel = creditAnnuelNormal;
  const interetsDiffere = mensualiteDiffere * differeMois;
  const interetsAmort = creditAnnuelNormal * (n("dureePret") - differeMois/12) - montantPret;
  const interetsTotaux = interetsDiffere + Math.max(0, interetsAmort);

  const loyerBrut = n("loyerMensuel") * 12;
  const loyerVacance = loyerBrut * (1 - n("vacance")/100);
  const chargesTotales = n("taxeFonciere") + n("chargesCopro") + n("assurancePNO") + n("gestionLocative") + n("entretien");
  const revenuNetCharges = loyerVacance - chargesTotales;

  const interetsAnnuelsMoy = n("dureePret") > 0 ? interetsTotaux / n("dureePret") : 0;
  const resultatFiscal = loyerVacance - chargesTotales - interetsAnnuelsMoy - n("amortissement");
  const resultatFiscalPos = Math.max(0, resultatFiscal);
  const impot = resultatFiscalPos * (n("tmi") + n("prelevementsSociaux")) / 100;

  // Cash-flow Year 1 (accounts for différé)
  const moisDiffAn1 = Math.min(differeMois, 12);
  const creditAnnuelAn1 = moisDiffAn1 * mensualiteTotaleDiffere + (12 - moisDiffAn1) * mensualiteTotale;
  const cashflowAnnuel = loyerVacance - chargesTotales - creditAnnuelAn1 - impot;
  const cashflowMensuel = cashflowAnnuel / 12;
  const effortEpargne = cashflowAnnuel < 0 ? Math.abs(cashflowMensuel) : 0;

  // ── Dual metrics: Pendant différé vs Après différé ──
  const cfMensuelAvant = differeMois > 0 ? loyerVacance/12 - chargesTotales/12 - mensualiteTotaleDiffere - impot/12 : cashflowMensuel;
  const cfAnnuelAvant = cfMensuelAvant * 12;
  const effortAvant = cfAnnuelAvant < 0 ? Math.abs(cfMensuelAvant) : 0;
  const dscrAvant = creditAnnuelDiffere > 0 ? loyerVacance / creditAnnuelDiffere : 99;

  const cfMensuelApres = loyerVacance/12 - chargesTotales/12 - mensualiteTotale - impot/12;
  const cfAnnuelApres = cfMensuelApres * 12;
  const effortApres = cfAnnuelApres < 0 ? Math.abs(cfMensuelApres) : 0;
  const dscrApres = creditAnnuelNormal > 0 ? loyerVacance / creditAnnuelNormal : 99;

  const [viewPeriod, setViewPeriod] = useState("apres");

  const rdtBrut = coutTotal > 0 ? loyerBrut / coutTotal : 0;
  const rdtNet = coutTotal > 0 ? revenuNetCharges / coutTotal : 0;
  const rdtNetNet = coutTotal > 0 ? (revenuNetCharges - impot) / coutTotal : 0;
  const roe = n("apport") > 0 ? cashflowAnnuel / n("apport") : 0;
  const dscr = creditAnnuelAn1 > 0 ? loyerVacance / creditAnnuelAn1 : 99;
  const ltv = n("prixBien") > 0 ? montantPret / n("prixBien") : 0;

  const prixRevente = n("prixBien") * Math.pow(1 + n("tauxRevaloBien")/100, n("dureeDetention"));
  const pvBrute = prixRevente - n("prixBien");
  const fraisRevente = prixRevente * 0.03;
  const pvNette = pvBrute - fraisRevente;

  // ── Valeur Liquidative (instant T) ──
  // Capital Restant Dû (CRD) : simplifié — on calcule le CRD après X mois d'amortissement
  // Pour un prêt classique : CRD = Montant × [(1+tm)^N - (1+tm)^n] / [(1+tm)^N - 1]
  // où N = nb mensualités totales, n = nb mensualités déjà payées
  const anneesEcoulees = asset.anneesDetention || 0;
  const moisEcoules = Math.max(0, anneesEcoulees * 12 - differeMois); // mois d'amortissement réels
  const crd = (() => {
    if (montantPret <= 0 || tauxM <= 0 || nbMens <= 0) return 0;
    if (moisEcoules >= nbMens - differeMois) return 0; // prêt fini
    const nbAmort = nbMens - differeMois;
    if (nbAmort <= 0 || moisEcoules >= nbAmort) return 0;
    // CRD = P × [(1+r)^N - (1+r)^n] / [(1+r)^N - 1]
    const factN = Math.pow(1 + tauxM, nbAmort);
    const factn = Math.pow(1 + tauxM, moisEcoules);
    return Math.round(montantPret * (factN - factn) / (factN - 1));
  })();
  const valeurActuelle = n("prixBien") * Math.pow(1 + n("tauxRevaloBien")/100, anneesEcoulees);
  const fraisVenteVL = Math.round(valeurActuelle * 0.03);
  const valeurLiquidative = Math.round(valeurActuelle - crd - fraisVenteVL);
  const equityGain = valeurLiquidative - n("apport");

  // TRI / VAN / Multiple
  const flux = [-n("apport")];
  let sumCF = 0;
  for (let y = 1; y <= n("dureeDetention"); y++) {
    const loyAn = loyerVacance * Math.pow(1 + n("tauxRevaloLoyer")/100, y-1);
    // Différé: first N months = interest only, then normal
    const moisDebut = (y-1)*12;
    const moisFin = y*12;
    const moisDiffRestant = Math.max(0, differeMois - moisDebut);
    const moisDiffDansAnnee = Math.min(moisDiffRestant, 12);
    const moisNormDansAnnee = 12 - moisDiffDansAnnee;
    const credAn = y <= n("dureePret") ? (moisDiffDansAnnee * mensualiteTotaleDiffere + moisNormDansAnnee * mensualiteTotale) : 0;
    const impAn = Math.max(0, loyAn - chargesTotales - interetsAnnuelsMoy - n("amortissement")) * (n("tmi")+n("prelevementsSociaux"))/100;
    let cf = loyAn - chargesTotales - credAn - impAn;
    if (y === n("dureeDetention")) cf += prixRevente * 0.97;
    flux.push(cf);
    sumCF += (y < n("dureeDetention") ? cf : cf - prixRevente*0.97);
  }
  // IRR Newton
  const calcIRR = (f) => {
    let r = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0, dnpv = 0;
      for (let t = 0; t < f.length; t++) { npv += f[t]/Math.pow(1+r,t); dnpv -= t*f[t]/Math.pow(1+r,t+1); }
      if (Math.abs(dnpv) < 1e-10) break;
      const nr = r - npv/dnpv;
      if (Math.abs(nr-r) < 1e-8) { r = nr; break; }
      r = nr;
    }
    return isFinite(r) && r > -1 ? r : null;
  };
  const tri = calcIRR(flux);
  const van = flux.reduce((s, f, t) => s + f / Math.pow(1 + n("tauxActualisation")/100, t), 0);
  const multiple = n("apport") > 0 ? (sumCF + prixRevente*0.97) / n("apport") : 0;

  // ── Scenarios ──
  const runScenario = (loyerAdj, vacAdj, revalAdj) => {
    const lm = n("loyerMensuel") * (1 + loyerAdj/100);
    const lb = lm * 12; const lv = lb * (1 - vacAdj/100);
    const rn = lv - chargesTotales;
    const imp = Math.max(0, lv - chargesTotales - interetsAnnuelsMoy - n("amortissement")) * (n("tmi")+n("prelevementsSociaux"))/100;
    const cf = lv - chargesTotales - creditAnnuelAn1 - imp;
    const rb = coutTotal > 0 ? lb / coutTotal : 0;
    const rnn = coutTotal > 0 ? (rn - imp) / coutTotal : 0;
    return { loyerM: Math.round(lm), cf: Math.round(cf), rb, rnn };
  };
  const scePess = runScenario(-10, 10, 0);
  const sceReal = runScenario(0, n("vacance"), n("tauxRevaloBien"));
  const sceOpti = runScenario(5, 2, 3);

  // ── Format helpers ──
  const fmt = (v) => new Intl.NumberFormat("fr-FR", {style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v);
  const fmtD = (v) => new Intl.NumberFormat("fr-FR", {style:"currency",currency:"EUR",maximumFractionDigits:2}).format(v);
  const fmtP = (v) => (v*100).toFixed(2) + " %";

  // ── UI Helpers ──
  // ── UI Helpers (stable refs — no re-creation) ──
  const colorCF = (v) => v >= 0 ? C.green : v > -200*12 ? C.yellow : C.red;
  const colorDSCR = (v) => v >= 1.2 ? C.green : v >= 1 ? C.yellow : C.red;
  const colorRdt = (v) => v >= 0.07 ? C.green : v >= 0.04 ? C.yellow : C.red;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── INPUTS ── */}
      <PerfSH icon="📥" label="PARAMÈTRES DE L'INVESTISSEMENT"/>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>🏠 LE BIEN</p>
        <PerfInpRow label="Prix du bien" value={sim.prixBien} onChange={v=>u("prixBien",v)} unit="€"/>
        <PerfInpRow label="Frais de notaire" value={sim.fraisNotaire} onChange={v=>u("fraisNotaire",v)} unit="€"/>
        <PerfInpRow label="Travaux" value={sim.travaux} onChange={v=>u("travaux",v)} unit="€"/>
        <PerfInpRow label="Mobilier" value={sim.mobilier} onChange={v=>u("mobilier",v)} unit="€"/>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>🏦 FINANCEMENT</p>
        <PerfInpRow label="Apport personnel" value={sim.apport} onChange={v=>u("apport",v)} unit="€"/>
        <PerfInpRow label="Montant du prêt" value={sim.montantPret} onChange={v=>u("montantPret",v)} unit="€"/>
        <PerfInpRow label="Taux d'intérêt" value={sim.tauxInteret} onChange={v=>u("tauxInteret",v)} unit="%" step={0.1}/>
        <PerfInpRow label="Durée du prêt" value={sim.dureePret} onChange={v=>u("dureePret",v)} unit="ans"/>
        <PerfInpRow label="Taux assurance" value={sim.tauxAssurance} onChange={v=>u("tauxAssurance",v)} unit="%" step={0.01}/>
        <PerfInpRow label="Différé" value={sim.differe} onChange={v=>u("differe",v)} unit="mois" step={1} min={0} max={36}/>
        <div style={{ borderTop:"1px solid "+C.border, marginTop:6, paddingTop:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
            <span style={{ fontSize:10, color:C.g3 }}>Mensualité crédit</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{fmtD(mensualiteCredit)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
            <span style={{ fontSize:10, color:C.g3 }}>Assurance / mois</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{fmtD(mensualiteAssurance)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderTop:"1px dashed "+C.border, marginTop:2 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.w }}>Mensualité totale</span>
            <span style={{ fontSize:14, fontWeight:800, color:C.green, fontFamily:C.mono }}>{fmtD(mensualiteTotale)}</span>
          </div>
          {differeMois > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
              <span style={{ fontSize:10, color:"#F59E0B" }}>Pendant différé ({differeMois} mois)</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#F59E0B", fontFamily:C.mono }}>{fmtD(mensualiteTotaleDiffere)}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>💰 REVENUS LOCATIFS</p>
        <PerfInpRow label="Loyer mensuel HC" value={sim.loyerMensuel} onChange={v=>u("loyerMensuel",v)} unit="€"/>
        <PerfInpRow label="Vacance locative" value={sim.vacance} onChange={v=>u("vacance",v)} unit="%" step={1}/>
        <PerfInpRow label="Revalo loyer (IRL)" value={sim.tauxRevaloLoyer} onChange={v=>u("tauxRevaloLoyer",v)} unit="%" step={0.1}/>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>📋 CHARGES ANNUELLES</p>
        <PerfInpRow label="Taxe foncière" value={sim.taxeFonciere} onChange={v=>u("taxeFonciere",v)} unit="€"/>
        <PerfInpRow label="Charges copro" value={sim.chargesCopro} onChange={v=>u("chargesCopro",v)} unit="€"/>
        <PerfInpRow label="Assurance PNO" value={sim.assurancePNO} onChange={v=>u("assurancePNO",v)} unit="€"/>
        <PerfInpRow label="Gestion locative" value={sim.gestionLocative} onChange={v=>u("gestionLocative",v)} unit="€"/>
        <PerfInpRow label="Entretien / divers" value={sim.entretien} onChange={v=>u("entretien",v)} unit="€"/>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>🧾 FISCALITÉ & PROJECTION</p>
        <PerfInpRow label="TMI" value={sim.tmi} onChange={v=>u("tmi",v)} unit="%" step={1}/>
        <PerfInpRow label="Amortissement annuel" value={sim.amortissement} onChange={v=>u("amortissement",v)} unit="€"/>
        <PerfInpRow label="Revalo bien / an" value={sim.tauxRevaloBien} onChange={v=>u("tauxRevaloBien",v)} unit="%" step={0.1}/>
        <PerfInpRow label="Durée détention" value={sim.dureeDetention} onChange={v=>u("dureeDetention",v)} unit="ans"/>
      </div>

      {/* ── RÉSULTATS ── */}
      <PerfSH icon="📊" label="RÉSULTATS CLÉS"/>

      {/* Toggle Avant / Après différé */}
      {differeMois > 0 && (
        <div style={{ display:"flex", gap:0, marginBottom:10, background:"#0a0a0a", borderRadius:10, border:"1px solid "+C.border, padding:3, overflow:"hidden" }}>
          {[["avant","Pendant différé ("+differeMois+" mois)"],["apres","Après différé"]].map(([k,l])=>{
            const active = viewPeriod===k;
            return (
              <button key={k} onClick={()=>setViewPeriod(k)}
                style={{ flex:1, padding:"9px 14px", borderRadius:8, border:"none", background:active?"linear-gradient(135deg,#3B82F6,#2563EB)":"transparent",
                  color:active?"#fff":C.g2, fontSize:11, fontWeight:active?700:500, cursor:"pointer", transition:"all 0.2s",
                  boxShadow:active?"0 2px 10px rgba(59,130,246,0.3)":"none" }}>
                {l}
              </button>
            );
          })}
        </div>
      )}

      {/* Cash-flow hero */}
      {(()=>{
        const cf = differeMois > 0 ? (viewPeriod==="avant" ? cfAnnuelAvant : cfAnnuelApres) : cashflowAnnuel;
        const cfM = cf / 12;
        const eff = cf < 0 ? Math.abs(cfM) : 0;
        const mens = viewPeriod==="avant" && differeMois>0 ? mensualiteTotaleDiffere : mensualiteTotale;
        const dsc = viewPeriod==="avant" && differeMois>0 ? dscrAvant : (differeMois>0 ? dscrApres : (creditAnnuelAn1>0?loyerVacance/creditAnnuelAn1:99));
        const roeV = n("apport") > 0 ? cf / n("apport") : 0;
        const periodLabel = differeMois > 0 ? (viewPeriod==="avant" ? "PENDANT DIFFÉRÉ" : "APRÈS DIFFÉRÉ") : "";
        return (<>
          <div style={{ background:cf>=0?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)", border:"1.5px solid "+(cf>=0?C.greenBord:"rgba(239,68,68,0.2)"), borderRadius:12, padding:"16px", textAlign:"center", marginBottom:10, position:"relative" }}>
            {periodLabel && <span style={{ position:"absolute", top:8, right:12, fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:viewPeriod==="avant"?"#F59E0B":"#3B82F6", background:viewPeriod==="avant"?"rgba(245,158,11,0.1)":"rgba(59,130,246,0.1)", border:"1px solid "+(viewPeriod==="avant"?"rgba(245,158,11,0.2)":"rgba(59,130,246,0.2)"), padding:"2px 8px", borderRadius:4 }}>{periodLabel}</span>}
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:4 }}>CASH-FLOW MENSUEL</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <p style={{ fontSize:28, fontWeight:800, color:colorCF(cf), fontFamily:C.mono, letterSpacing:"-0.03em" }}>{fmtD(cfM)}</p>
              <PerfInfo text={"(Loyer - Charges - Crédit - Impôt) ÷ 12\n\n("+fmt(Math.round(loyerVacance))+" - "+fmt(chargesTotales)+" - "+fmt(Math.round(mens*12))+" - "+fmt(Math.round(impot))+") ÷ 12"}/>
            </div>
            <p style={{ fontSize:10, color:C.g2, marginTop:2 }}>Mensualité : {fmtD(mens)}</p>
            <p style={{ fontSize:11, color:C.g2, marginTop:4 }}>{cf>=0?"✅ Bien autofinancé":"⚠️ Effort d'épargne : "+fmtD(eff)+"/mois"}</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
            <PerfMetric label="RDT BRUT" value={fmtP(rdtBrut)} color={colorRdt(rdtBrut)} info={"Loyer annuel brut ÷ Coût total projet\n\n"+fmt(loyerBrut)+" ÷ "+fmt(coutTotal)}/>
            <PerfMetric label="RDT NET" value={fmtP(rdtNet)} color={colorRdt(rdtNet)} info={"(Loyer - Charges) ÷ Coût total\n\n("+fmt(Math.round(loyerVacance))+" - "+fmt(chargesTotales)+") ÷ "+fmt(coutTotal)}/>
            <PerfMetric label="RDT NET-NET" value={fmtP(rdtNetNet)} color={colorRdt(rdtNetNet)} info={"(Loyer - Charges - Impôt) ÷ Coût total\n\n("+fmt(Math.round(loyerVacance))+" - "+fmt(chargesTotales)+" - "+fmt(Math.round(impot))+") ÷ "+fmt(coutTotal)}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
            <PerfMetric label="ROE" value={fmtP(roeV)} color={roeV>0?C.green:C.red} sub="CF / Apport" info={"Cash-flow annuel ÷ Apport\n\n"+fmt(Math.round(cf))+" ÷ "+fmt(n("apport"))}/>
            <PerfMetric label="DSCR" value={dsc>10?"∞":dsc.toFixed(2)} color={colorDSCR(dsc)} sub={dsc>=1.2?"Solide":dsc>=1?"Limite":"Risqué"} info={"Loyer annuel ÷ Crédit annuel\n\n"+fmt(Math.round(loyerVacance))+" ÷ "+fmt(Math.round(creditAnnuelAn1))+"\n\n≥ 1.2 = solide\n< 1.0 = risqué"}/>
            <PerfMetric label="LTV" value={fmtP(ltv)} color={ltv>0.9?C.red:ltv>0.7?C.yellow:C.green} info={"Montant prêt ÷ Prix du bien\n\n"+fmt(montantPret)+" ÷ "+fmt(n("prixBien"))+"\n\n< 70% = sûr\n> 90% = risqué"}/>
          </div>

          {/* Comparaison rapide si différé actif */}
          {differeMois > 0 && (
            <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:10 }}>
              <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:8 }}>COMPARAISON AVANT / APRÈS DIFFÉRÉ</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:8, color:"#F59E0B", fontFamily:C.mono, marginBottom:4 }}>PENDANT ({differeMois} MOIS)</p>
                  <p style={{ fontSize:18, fontWeight:800, color:colorCF(cfAnnuelAvant), fontFamily:C.mono }}>{fmtD(cfMensuelAvant)}</p>
                  <p style={{ fontSize:9, color:C.g3 }}>CF/mois · Mens. {fmtD(mensualiteTotaleDiffere)}</p>
                </div>
                <div style={{ width:1, height:40, background:C.border }}/>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:8, color:"#3B82F6", fontFamily:C.mono, marginBottom:4 }}>APRÈS DIFFÉRÉ</p>
                  <p style={{ fontSize:18, fontWeight:800, color:colorCF(cfAnnuelApres), fontFamily:C.mono }}>{fmtD(cfMensuelApres)}</p>
                  <p style={{ fontSize:9, color:C.g3 }}>CF/mois · Mens. {fmtD(mensualiteTotale)}</p>
                </div>
              </div>
            </div>
          )}
        </>);
      })()}

      {/* ── VALEUR LIQUIDATIVE ── */}
      <PerfSH icon="💎" label="VALEUR LIQUIDATIVE (INSTANT T)"/>
      <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.06),rgba(59,130,246,0.03))", border:"1.5px solid rgba(99,102,241,0.2)", borderRadius:12, padding:"16px", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:4 }}>SI VOUS VENDIEZ AUJOURD'HUI</p>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:28, fontWeight:800, color:valeurLiquidative>=0?"#6366F1":C.red, fontFamily:C.mono, letterSpacing:"-0.03em" }}>{fmt(valeurLiquidative)}</span>
              <PerfInfo text={"Valeur actuelle - CRD - Frais vente (3%)\n\n"+fmt(Math.round(valeurActuelle))+" - "+fmt(crd)+" - "+fmt(fraisVenteVL)+"\n\nCe que vous récupéreriez net si vous vendiez le bien aujourd'hui, après remboursement du prêt restant."}/>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:4 }}>GAIN VS APPORT</p>
            <span style={{ fontSize:18, fontWeight:800, color:equityGain>=0?C.green:C.red, fontFamily:C.mono }}>
              {equityGain>=0?"+":""}{fmt(equityGain)}
            </span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6 }}>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>VALEUR BIEN</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.w, fontFamily:C.mono }}>{fmt(Math.round(valeurActuelle))}</p>
            <p style={{ fontSize:8, color:C.g3 }}>{anneesEcoulees>0?"+"+n("tauxRevaloBien")+"% × "+anneesEcoulees+" ans":"Prix actuel"}</p>
          </div>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>CAPITAL RESTANT DÛ</p>
            <p style={{ fontSize:13, fontWeight:700, color:crd>0?C.red:"#6366F1", fontFamily:C.mono }}>{crd>0?"-":""}{fmt(crd)}</p>
            <p style={{ fontSize:8, color:C.g3 }}>{crd>0?Math.round(moisEcoules)+" mois payés":"Prêt soldé"}</p>
          </div>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>FRAIS VENTE</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.red, fontFamily:C.mono }}>-{fmt(fraisVenteVL)}</p>
            <p style={{ fontSize:8, color:C.g3 }}>3% du prix de vente</p>
          </div>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>APPORT INITIAL</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.w, fontFamily:C.mono }}>{fmt(n("apport"))}</p>
            <p style={{ fontSize:8, color:equityGain>=0?C.green:C.red }}>{n("apport")>0?(equityGain>=0?"+":"")+(equityGain/n("apport")*100).toFixed(0)+"% retour":"—"}</p>
          </div>
        </div>
        {/* Progress bar: CRD remboursé */}
        {montantPret > 0 && (
          <div style={{ marginTop:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>CAPITAL REMBOURSÉ</span>
              <span style={{ fontSize:9, fontWeight:700, color:"#6366F1", fontFamily:C.mono }}>{montantPret>0?Math.round((1-crd/montantPret)*100):100}%</span>
            </div>
            <div style={{ height:4, background:"#1e1e1e", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:99, background:"linear-gradient(90deg,#6366F1,#3B82F6)", width:`${montantPret>0?Math.round((1-crd/montantPret)*100):100}%`, transition:"width 0.4s" }}/>
            </div>
          </div>
        )}
      </div>

      {/* Détail */}
      <PerfSH icon="📋" label="DÉTAIL FINANCIER"/>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        {(()=>{
          const isAvant = differeMois > 0 && viewPeriod==="avant";
          const cfShow = isAvant ? cfAnnuelAvant : (differeMois > 0 ? cfAnnuelApres : cashflowAnnuel);
          const mensShow = isAvant ? mensualiteTotaleDiffere : mensualiteTotale;
          const credShow = isAvant ? creditAnnuelDiffere : creditAnnuelNormal;
          const rows = [
            ["Coût total projet", fmt(coutTotal), "Prix + Notaire + Travaux + Mobilier"],
            ["Montant du prêt", fmt(montantPret), "Coût total - Apport"],
            ["Mensualité (crédit+assur.)", fmtD(mensShow), "Prêt × [taux/12 ÷ (1-(1+taux/12)^-n)] + assurance"],
            ...(differeMois > 0 ? [["Mensualité " + (isAvant?"(intérêts seuls)":"(amortissement)"), fmtD(mensShow), isAvant?"Prêt × taux/12 (capital non remboursé)":"Prêt × [taux/12 ÷ (1-(1+taux/12)^-n)]"]] : []),
            ["Crédit annuel", fmt(Math.round(credShow)), "Mensualité totale × 12"],
            ["Loyer annuel brut", fmt(loyerBrut), "Loyer mensuel × 12"],
            ["Loyer corrigé vacance", fmt(Math.round(loyerVacance)), "Loyer brut × (1 - vacance%)"],
            ["Charges totales / an", fmt(chargesTotales), "TF + Copro + PNO + Gestion + Entretien"],
            ["Résultat fiscal", fmt(Math.round(resultatFiscal)), "Loyer - Charges - Intérêts - Amortissement"],
            ["Impôt estimé", fmt(Math.round(impot)), "MAX(0, Résultat fiscal) × (TMI + 17.2%)"],
            ["Cash-flow annuel", fmt(Math.round(cfShow)), "Loyer - Charges - Crédit - Impôt"],
          ];
          return rows.map(([l,v,info],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i<rows.length-1?"1px solid "+C.border:"none" }}>
              <span style={{ fontSize:11, color:C.g2 }}>{l}</span>
              <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.w, fontFamily:C.mono }}>{v}</span>
                {info && <PerfInfo text={info}/>}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Revente */}
      <PerfSH icon="🔄" label={"MODULE REVENTE ("+n("dureeDetention")+" ANS)"}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
        <PerfMetric label="PRIX REVENTE" value={fmt(Math.round(prixRevente))} info={"Prix × (1 + taux revalo)^durée\n\n"+fmt(n("prixBien"))+" × (1 + "+n("tauxRevaloBien")+"%)^"+n("dureeDetention")+" ans"}/>
        <PerfMetric label="PLUS-VALUE NETTE" value={fmt(Math.round(pvNette))} color={pvNette>0?C.green:C.red} info={"(Prix revente - Prix achat) - Frais 3%\n\n("+fmt(Math.round(prixRevente))+" - "+fmt(n("prixBien"))+") - "+fmt(Math.round(fraisRevente))}/>
      </div>

      {/* TRI / VAN / Multiple */}
      <PerfSH icon="📐" label="TRI · VAN · MULTIPLE"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
        <PerfMetric label="TRI" value={tri!==null?fmtP(tri):"N/A"} color={tri&&tri>0.05?C.green:tri&&tri>0.02?C.yellow:C.red} sub="Taux rendement interne" info={"Taux qui annule la VAN des flux :\n\nAn 0 : -Apport ("+fmt(n("apport"))+")\nAn 1→N : Cash-flows annuels\nAn N : + Revente nette\n\nCalcul par méthode de Newton"}/>
        <PerfMetric label="VAN" value={fmt(Math.round(van))} color={van>0?C.green:C.red} sub={van>0?"Crée de la valeur":"Détruit de la valeur"} info={"Σ flux actualisés à "+n("tauxActualisation")+"%\n\nSi VAN > 0 → investissement\nrentable vs placement à "+n("tauxActualisation")+"%"}/>
        <PerfMetric label="MULTIPLE" value={multiple.toFixed(2)+"x"} color={multiple>2?C.green:multiple>1?C.yellow:C.red} sub="Capital × retour" info={"(Σ cash-flows + revente nette) ÷ Apport\n\n> 2x = très bon\n> 1x = positif\n< 1x = perte en capital"}/>
      </div>

      {/* Scénarios */}
      <PerfSH icon="🎯" label="SCÉNARIOS"/>
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
        {[
          { name:"😟 Pessimiste", data:scePess, desc:"Loyer -10%, vacance 10%", bg:"rgba(239,68,68,0.04)", border:"rgba(239,68,68,0.15)" },
          { name:"😐 Réaliste", data:sceReal, desc:"Paramètres actuels", bg:"rgba(245,158,11,0.04)", border:"rgba(245,158,11,0.15)" },
          { name:"😊 Optimiste", data:sceOpti, desc:"Loyer +5%, vacance 2%", bg:"rgba(16,185,129,0.04)", border:"rgba(16,185,129,0.15)" },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, border:"1px solid "+s.border, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ minWidth:90 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.w }}>{s.name}</p>
              <p style={{ fontSize:9, color:C.g3 }}>{s.desc}</p>
            </div>
            <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, textAlign:"center" }}>
              <div><p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>CF/AN</p><p style={{ fontSize:13, fontWeight:800, color:colorCF(s.data.cf), fontFamily:C.mono }}>{fmt(s.data.cf)}</p></div>
              <div><p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>RDT BRUT</p><p style={{ fontSize:13, fontWeight:800, color:colorRdt(s.data.rb), fontFamily:C.mono }}>{fmtP(s.data.rb)}</p></div>
              <div><p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>NET-NET</p><p style={{ fontSize:13, fontWeight:800, color:colorRdt(s.data.rnn), fontFamily:C.mono }}>{fmtP(s.data.rnn)}</p></div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize:9, color:C.g3, fontStyle:"italic", textAlign:"center", marginTop:4 }}>Simulation indicative · Les résultats dépendent des hypothèses saisies</p>
    </div>
  );
}


function FinancesFiscaliteTab({ asset, kycData }) {
  const [regime,    setRegime]    = useState("lmnp_reel");
  const [showAll,   setShowAll]   = useState(false);
  const [focusCentre, setFocusCentre] = useState(false);

  // Parse TMI from KYC data
  const parseTMI = (s) => { const m = String(s||"").match(/^(\d+)/); return m ? parseInt(m[1]) : null; };
  const kycTMI = parseTMI(kycData?.tmi);

  const displayed = showAll ? REGIMES : REGIMES.filter(r=>TOP5.includes(r.id));
  const selected  = REGIMES.find(r=>r.id===regime);

  // Prefill from asset data
  const prixBien    = asset.prixBien?.toLocaleString("fr-FR") || "—";
  const fraisNot    = asset.fraisNotaire?.toLocaleString("fr-FR") || "—";
  const fraisAg     = asset.fraisAgence?.toLocaleString("fr-FR") || "—";
  const taxFonc     = asset.taxeFonciere?.toLocaleString("fr-FR") || "—";
  const vlVal       = asset.vl?.toLocaleString("fr-FR") || "—";

  const SecTitle = ({label, icon:TIcon}) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, marginTop:4 }}>
      {TIcon && <span style={{ color:C.blue }}><TIcon/></span>}
      <span style={{ fontSize:9, letterSpacing:"0.13em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

      {/* ── 1. VALORISATION ── */}
      <div>
        <SecTitle label="1 · Valorisation — Suivi de l'Equity" icon={I.TrendUp}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
              <span style={{ color:C.green }}><I.Sparkles/></span>
              <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.green, fontFamily:C.mono }}>VALEUR ACTUELLE ESTIMÉE (IA)</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontSize:20, fontWeight:800, color:C.w, letterSpacing:"-0.04em" }}>{vlVal}</span>
              <span style={{ fontSize:11, color:C.g2 }}>€</span>
              {asset.vlVar && <span style={{ fontSize:10, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"1px 7px", borderRadius:4 }}>▲ {asset.vlVar}/an</span>}
            </div>
            <p style={{ fontSize:9, color:C.g3, fontFamily:C.mono, marginTop:5 }}>DVF · Étalab · Notaires · Mise à jour mensuelle</p>
          </div>
          <FField icon={I.Target} label="Prix de vente cible" value="" unit="€" mono placeholder="Objectif de cession"/>
        </div>
        {/* Plus-value latente */}
        {asset.vl && asset.prixBien && (
          <div style={{ marginTop:8, background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>PLUS-VALUE LATENTE ESTIMÉE</span>
              <span style={{ fontSize:11, fontWeight:700, fontFamily:C.mono, color:C.green }}>
                +{(asset.vl - (asset.prixBien+asset.fraisNotaire+asset.fraisAgence+(asset.ameublement||0))).toLocaleString("fr-FR")} €
              </span>
            </div>
            <div style={{ height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${Math.min(((asset.prixBien)/(asset.vl))*100,100)}%`, height:"100%", background:`linear-gradient(90deg,${C.blue},#60a5fa)`, borderRadius:99 }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:8.5, color:C.g3, fontFamily:C.mono }}>Prix net vendeur</span>
              <span style={{ fontSize:8.5, color:C.g3, fontFamily:C.mono }}>Valeur liquidative</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. RÉGIME FISCAL ── */}
      <div>
        <SecTitle label="2 · Moteur fiscal — Régime & Structure" icon={I.Building}/>

        {/* Regime grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
          {displayed.map(r=>{
            const isTop = TOP5.includes(r.id);
            const active = regime===r.id;
            return (
              <button key={r.id} onClick={()=>setRegime(r.id)} style={{
                background: active ? "rgba(0,123,255,0.10)" : "#0a0a0a",
                border: `1.5px solid ${active ? C.blue : C.border}`,
                borderRadius: 10, padding:"11px 14px",
                cursor:"pointer", textAlign:"left",
                transition:"all 0.15s",
                boxShadow: active ? `0 0 14px rgba(0,123,255,0.15)` : "none",
              }}
              onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor="#2a2a2a"; e.currentTarget.style.background="#111"; } }}
              onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="#0a0a0a"; } }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color: active ? C.blue : C.w }}>{r.label}</span>
                  <div style={{ display:"flex", gap:4 }}>
                    {isTop && <span style={{ fontSize:8, fontFamily:C.mono, color:C.yellow, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", padding:"1px 5px", borderRadius:3 }}>TOP 5</span>}
                    {active && <span style={{ fontSize:8, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", padding:"1px 5px", borderRadius:3 }}>ACTIF</span>}
                  </div>
                </div>
                <span style={{ fontSize:10, color: active ? C.g1 : C.g3 }}>{r.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Show more toggle */}
        <button onClick={()=>setShowAll(s=>!s)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:10, cursor:"pointer", fontFamily:C.mono, letterSpacing:"0.08em", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g2;}}>
          {showAll ? "▲ Masquer les régimes avancés" : "▼ Voir tous les régimes (SAS, SARL…)"}
        </button>

        {/* Regime active banner */}
        <div style={{ marginTop:12, background:"linear-gradient(135deg,rgba(0,123,255,0.08),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.18)", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.w, marginBottom:2 }}>Régime sélectionné : <span style={{ color:C.blue }}>{selected?.label}</span></p>
            <p style={{ fontSize:11, color:C.g2 }}>{selected?.sub} · L'IA adaptera les calculs de rendement et déficit à ce régime.</p>
          </div>
        </div>

        {/* Identifiants fiscaux */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
          <FField icon={I.Building} label="SIRET / N° SIREN"             value=""       mono placeholder="XXX XXX XXX XXXXX"/>
          <FField icon={I.Tag}      label="Numéro fiscal du bien"         value=""       mono placeholder="Référence cadastrale"/>
          <FField icon={I.Calendar} label="Date de début d'activité"     value=""            placeholder="JJ/MM/AAAA"/>
          <FField icon={I.Lock}     label="Numéro de déclaration (CERFA)" value=""       mono placeholder="Formulaire 2031 / 2044"/>
        </div>
      </div>

      {/* ── 4. TAXES & ADMINISTRATION ── */}
      <div>
        <SecTitle label="4 · Taxes & Administration" icon={I.FileText}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
              <span style={{ color:C.g3 }}><I.Euro/></span>
              <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>TAXE FONCIÈRE</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontSize:18, fontWeight:800, color:C.w, letterSpacing:"-0.03em" }}>{taxFonc}</span>
              <span style={{ fontSize:11, color:C.g2 }}>€ / an</span>
            </div>
            <p style={{ fontSize:9, color:C.g3, marginTop:4, fontFamily:C.mono }}>≈ {asset.taxeFonciere ? Math.round(asset.taxeFonciere/12) : "—"} € / mois · Source : avis de taxe</p>
          </div>
          <FField icon={I.Building} label="Taxe d'habitation" value="" unit="€/an" mono placeholder="Résidence secondaire / vacance"/>
        </div>

        {/* Centre des impôts */}
        <div style={{ marginTop:8, background:"#08080A", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
            <span style={{ color:C.blue }}><I.Building/></span>
            <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue }}>CENTRE DES IMPÔTS COMPÉTENT</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 0.8fr", gap:8 }}>
            <FField icon={I.Building} label="Nom du centre" value="" placeholder="Ex : SIP Bordeaux Victoire"/>
            <FField icon={I.MapPin}   label="Ville"         value={asset.addr?.split(",")[1]?.trim()?.split(" ").slice(-1)[0] || ""} placeholder="Bordeaux"/>
            <FField icon={I.Globe}    label="Code Postal"   value={asset.addr?.match(/\d{5}/)?.[0] || ""} mono placeholder="33000"/>
          </div>
        </div>
      </div>

      {/* ── 3. ESTIMATION DE L'IMPACT FISCAL ── */}
      <div>
        <SecTitle label="3 · Estimation de l'impact fiscal" icon={I.Euro}/>

        {(()=>{
          const ps = asset.perfSim || {};
          const pf = v => parseFloat(String(v||"0").replace(",","."))||0;
          const pi = v => parseInt(String(v||"0").replace(/[^\d]/g,""),10)||0;

          // Pull real numbers from perfSim or asset
          const loyerMensuel = pf(ps.loyerMensuel) || pi(asset.loyer) || 0;
          const loyerBrut = loyerMensuel * 12;
          const vacance = pf(ps.vacance) || 5;
          const loyerNet = Math.round(loyerBrut * (1 - vacance/100));
          const taxFonciere = pf(ps.taxeFonciere) || pi(asset.taxeFonciere) || 0;
          const chargesCopro = pf(ps.chargesCopro) || pi(asset.chargesCopro) || 0;
          const assurancePNO = pf(ps.assurancePNO) || 250;
          const gestion = pf(ps.gestionLocative) || 0;
          const entretien = pf(ps.entretien) || 500;
          const chargesTotales = taxFonciere + chargesCopro + assurancePNO + gestion + entretien;
          const prixBienNum = pf(ps.prixBien) || pi(asset.prixBien) || 0;
          const fraisNotaireNum = pf(ps.fraisNotaire) || pi(asset.fraisNotaire) || 0;
          const montantPret = pf(ps.montantPret) || Math.max(0, prixBienNum + fraisNotaireNum - (pf(ps.apport)||40000));
          const tauxInteret = pf(ps.tauxInteret) || 3.5;
          const dureePret = pf(ps.dureePret) || 20;
          const amortissement = pf(ps.amortissement) || 0;
          const tmiPct = pf(ps.tmi) || kycTMI || 30;
          const psPct = 17.2;

          // Intérêts annuels moyens
          const tauxM = tauxInteret/100/12;
          const nbM = dureePret * 12;
          const mensualiteCredit = montantPret > 0 && tauxM > 0 && nbM > 0 ? montantPret * tauxM / (1 - Math.pow(1+tauxM, -nbM)) : 0;
          const interetsTotaux = mensualiteCredit * nbM - montantPret;
          const interetsAnnuelsMoy = dureePret > 0 ? Math.round(interetsTotaux / dureePret) : 0;
          const creditAnnuel = Math.round((mensualiteCredit + montantPret*(pf(ps.tauxAssurance)||0.3)/100/12) * 12);

          const fmtE = v => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v);
          const fmtE2 = v => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(v);

          // ── Calculate per regime ──
          let steps = [];
          let resultatFiscal = 0;
          let impotIR = 0;
          let impotPS = 0;
          let impotTotal = 0;
          let cotSociales = 0;
          let cashflowNet = 0;
          let regimeLabel = "";
          let regimeColor = "#3B82F6";
          let warning = null;

          if (regime === "lmnp_micro") {
            regimeLabel = "LMNP Micro-BIC";
            regimeColor = "#F59E0B";
            const abattement = Math.round(loyerNet * 0.50);
            resultatFiscal = loyerNet - abattement;
            impotIR = Math.round(resultatFiscal * tmiPct / 100);
            impotPS = Math.round(resultatFiscal * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            if (loyerBrut > 77700) warning = "⚠️ Recettes > 77 700 € → micro-BIC impossible, passage au réel obligatoire";
            steps = [
              { label:"Revenus locatifs bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative ("+vacance+"%)", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus nets encaissés", value:fmtE(loyerNet), type:"subtotal" },
              { label:"Abattement forfaitaire 50%", value:"-"+fmtE(abattement), type:"deduction", info:"Micro-BIC : abattement automatique de 50% sur les recettes. Aucune charge réelle déductible." },
              { label:"= Résultat fiscal (BIC)", value:fmtE(resultatFiscal), type:"result" },
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "lmnp_reel") {
            regimeLabel = "LMNP Réel BIC";
            regimeColor = "#D97706";
            resultatFiscal = loyerNet - chargesTotales - interetsAnnuelsMoy - amortissement;
            const resultatPos = Math.max(0, resultatFiscal);
            const deficit = resultatFiscal < 0 ? Math.abs(resultatFiscal) : 0;
            impotIR = Math.round(resultatPos * tmiPct / 100);
            impotPS = Math.round(resultatPos * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative ("+vacance+"%)", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus nets encaissés", value:fmtE(loyerNet), type:"subtotal" },
              { divider:true, label:"CHARGES DÉDUCTIBLES" },
              { label:"Taxe foncière", value:"-"+fmtE(taxFonciere), type:"deduction" },
              { label:"Charges copropriété", value:"-"+fmtE(chargesCopro), type:"deduction" },
              { label:"Assurance PNO", value:"-"+fmtE(assurancePNO), type:"deduction" },
              { label:"Gestion locative", value:"-"+fmtE(gestion), type:"deduction" },
              { label:"Entretien / divers", value:"-"+fmtE(entretien), type:"deduction" },
              { label:"Intérêts d'emprunt (moy.)", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction", info:"Moyenne annuelle des intérêts sur la durée du prêt. Déductibles en BIC réel." },
              { label:"Amortissement (bien + mobilier)", value:"-"+fmtE(amortissement), type:"deduction", info:"Amortissement linéaire du bien (~25-30 ans) + mobilier (~5-7 ans). Ne génère pas de déficit imputable." },
              { label:"= Résultat fiscal (BIC)", value:fmtE(resultatPos), type:"result" },
              ...(deficit > 0 ? [{ label:"Déficit BIC reportable (10 ans)", value:fmtE(deficit), type:"info", info:"Reportable uniquement sur revenus BIC meublés des 10 années suivantes." }] : []),
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "rev_foncier") {
            regimeLabel = "Revenu Foncier Réel";
            regimeColor = "#2563EB";
            resultatFiscal = loyerNet - chargesTotales - interetsAnnuelsMoy;
            const deficit = resultatFiscal < 0 ? Math.min(Math.abs(resultatFiscal), 10700) : 0;
            const resultatPos = Math.max(0, resultatFiscal);
            impotIR = Math.round(resultatPos * tmiPct / 100);
            impotPS = Math.round(resultatPos * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative ("+vacance+"%)", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus fonciers nets", value:fmtE(loyerNet), type:"subtotal" },
              { divider:true, label:"CHARGES DÉDUCTIBLES (art. 31 CGI)" },
              { label:"Taxe foncière", value:"-"+fmtE(taxFonciere), type:"deduction" },
              { label:"Charges copropriété", value:"-"+fmtE(chargesCopro), type:"deduction" },
              { label:"Assurance PNO", value:"-"+fmtE(assurancePNO), type:"deduction" },
              { label:"Gestion + entretien", value:"-"+fmtE(gestion + entretien), type:"deduction" },
              { label:"Intérêts d'emprunt", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction" },
              { label:"= Résultat foncier", value:fmtE(resultatFiscal), type:"result" },
              ...(deficit > 0 ? [{ label:"Déficit foncier imputable sur revenu global", value:"-"+fmtE(deficit), type:"info", info:"Plafonné à 10 700 €/an. Excédent reportable 10 ans sur revenus fonciers." }] : []),
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "micro_fonc") {
            regimeLabel = "Micro-Foncier";
            regimeColor = "#6366F1";
            const abattement = Math.round(loyerNet * 0.30);
            resultatFiscal = loyerNet - abattement;
            impotIR = Math.round(resultatFiscal * tmiPct / 100);
            impotPS = Math.round(resultatFiscal * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            if (loyerBrut > 15000) warning = "⚠️ Revenus fonciers > 15 000 € → micro-foncier impossible";
            steps = [
              { label:"Revenus fonciers bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus nets", value:fmtE(loyerNet), type:"subtotal" },
              { label:"Abattement forfaitaire 30%", value:"-"+fmtE(abattement), type:"deduction", info:"Micro-foncier : abattement automatique 30%. Aucune déduction de charges réelles." },
              { label:"= Résultat foncier imposable", value:fmtE(resultatFiscal), type:"result" },
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "sci_is") {
            regimeLabel = "SCI à l'IS";
            regimeColor = "#7C3AED";
            const amortIS = Math.round((prixBienNum * 0.85) / 30);
            const resultatIS = Math.max(0, loyerNet - chargesTotales - interetsAnnuelsMoy - amortIS - 2500);
            const isReduit = Math.min(resultatIS, 42500) * 0.15;
            const isNormal = Math.max(0, resultatIS - 42500) * 0.25;
            const totalIS = Math.round(isReduit + isNormal);
            const beneficeApresIS = resultatIS - totalIS;
            const flatTax = Math.round(beneficeApresIS * 0.30);
            impotTotal = totalIS + flatTax;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - totalIS;
            steps = [
              { label:"Revenus locatifs nets", value:fmtE(loyerNet), type:"neutral" },
              { divider:true, label:"CHARGES SOCIÉTÉ" },
              { label:"Charges d'exploitation", value:"-"+fmtE(chargesTotales), type:"deduction" },
              { label:"Intérêts d'emprunt", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction" },
              { label:"Amortissement immeuble (30 ans)", value:"-"+fmtE(amortIS), type:"deduction", info:"85% du prix (hors terrain) amorti sur 30 ans. Réduit le résultat imposable à l'IS." },
              { label:"Frais de structure (~2 500 €)", value:"-"+fmtE(2500), type:"deduction" },
              { label:"= Résultat imposable (IS)", value:fmtE(resultatIS), type:"result" },
              { divider:true, label:"IMPÔT SUR LES SOCIÉTÉS" },
              { label:"IS taux réduit 15% (≤ 42 500 €)", value:fmtE(Math.round(isReduit)), type:"tax" },
              ...(resultatIS > 42500 ? [{ label:"IS taux normal 25% (> 42 500 €)", value:fmtE(Math.round(isNormal)), type:"tax" }] : []),
              { label:"= Total IS", value:fmtE(totalIS), type:"total_tax" },
              { divider:true, label:"SI DISTRIBUTION (DIVIDENDES)" },
              { label:"Bénéfice après IS", value:fmtE(Math.round(beneficeApresIS)), type:"neutral" },
              { label:"Flat tax 30% (IR 12,8% + PS 17,2%)", value:fmtE(flatTax), type:"tax", info:"Précompte forfaitaire unique. S'applique si les bénéfices sont distribués aux associés." },
              { label:"= Net perçu par les associés", value:fmtE(Math.round(beneficeApresIS - flatTax)), type:"result" },
              { label:"= TOTAL FISCALITÉ (IS + flat tax)", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "sci_ir") {
            regimeLabel = "SCI à l'IR";
            regimeColor = "#059669";
            resultatFiscal = loyerNet - chargesTotales - interetsAnnuelsMoy;
            const resultatPos = Math.max(0, resultatFiscal);
            impotIR = Math.round(resultatPos * tmiPct / 100);
            impotPS = Math.round(resultatPos * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs nets", value:fmtE(loyerNet), type:"neutral" },
              { label:"Charges d'exploitation", value:"-"+fmtE(chargesTotales), type:"deduction" },
              { label:"Intérêts d'emprunt", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction" },
              { label:"Frais de structure (~1 500 €)", value:"-1 500 €", type:"deduction" },
              { label:"= Quote-part imposable (IR)", value:fmtE(Math.max(0,resultatFiscal)), type:"result", info:"Transparence fiscale : chaque associé déclare sa quote-part à l'IR. Pas d'amortissement possible." },
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS (par associé)", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else {
            // Pinel, SARL, SAS — simplified
            regimeLabel = selected?.label || regime;
            regimeColor = "#3B82F6";
            resultatFiscal = loyerNet - chargesTotales;
            impotTotal = Math.round(Math.max(0,resultatFiscal) * (tmiPct+psPct)/100);
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs nets", value:fmtE(loyerNet), type:"neutral" },
              { label:"Charges", value:"-"+fmtE(chargesTotales), type:"deduction" },
              { label:"= Résultat imposable", value:fmtE(Math.max(0,resultatFiscal)), type:"result" },
              { label:"Imposition estimée ("+tmiPct+"% + 17,2%)", value:fmtE(impotTotal), type:"total_tax" },
            ];
          }

          return (
            <div style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.04),rgba(99,102,241,0.02))", border:"1px solid rgba(59,130,246,0.15)", borderRadius:14, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(59,130,246,0.1)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:regimeColor+"18", border:"1px solid "+regimeColor+"35", display:"flex", alignItems:"center", justifyContent:"center", color:regimeColor }}>
                  <I.Euro/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:C.w }}>{regimeLabel}</p>
                  <p style={{ fontSize:10, color:C.g2 }}>Simulation basée sur les données réelles du bien</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>TMI</p>
                  <p style={{ fontSize:16, fontWeight:800, color:regimeColor, fontFamily:C.mono }}>{tmiPct}%</p>
                </div>
              </div>

              {/* Warning */}
              {warning && (
                <div style={{ margin:"12px 18px 0", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:10, color:C.red, fontWeight:600 }}>{warning}</p>
                </div>
              )}

              {/* Steps */}
              <div style={{ padding:"14px 18px" }}>
                {steps.map((s, i) => {
                  if (s.divider) return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, margin:"10px 0 6px" }}>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                      {s.label && <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>{s.label}</span>}
                      <div style={{ flex:1, height:1, background:C.border }}/>
                    </div>
                  );
                  const isResult = s.type === "result";
                  const isTotal = s.type === "total_tax";
                  const isTax = s.type === "tax";
                  const isDeduction = s.type === "deduction";
                  const isSubtotal = s.type === "subtotal";
                  const isInfo = s.type === "info";
                  return (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:6, padding:(isResult||isTotal)?"8px 10px":"5px 10px",
                      background:isTotal?"rgba(239,68,68,0.06)":isResult?"rgba(59,130,246,0.04)":isInfo?"rgba(245,158,11,0.04)":"transparent",
                      border:isTotal?"1px solid rgba(239,68,68,0.15)":isResult?"1px solid rgba(59,130,246,0.12)":"none",
                      borderRadius:(isResult||isTotal||isInfo)?8:0,
                      margin:(isResult||isTotal)?"4px 0":"0",
                    }}>
                      <span style={{ flex:1, fontSize:isTotal?12:11, fontWeight:(isResult||isTotal||isSubtotal)?700:400, color:isTotal?C.red:isResult?C.blue:isDeduction?C.g2:isInfo?"#F59E0B":C.g1 }}>{s.label}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                        <span style={{ fontSize:isTotal?14:12, fontWeight:(isResult||isTotal)?800:600, color:isTotal?C.red:isResult?C.w:isTax?C.red:isDeduction?"#F59E0B":isInfo?"#F59E0B":C.w, fontFamily:C.mono }}>{s.value}</span>
                        {s.info && <PerfInfo text={s.info}/>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom summary */}
              <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(59,130,246,0.1)", background:"#0a0a0a" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>IMPÔT TOTAL / AN</p>
                    <p style={{ fontSize:18, fontWeight:800, color:C.red, fontFamily:C.mono }}>{fmtE(impotTotal)}</p>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>PRESSION FISCALE</p>
                    <p style={{ fontSize:18, fontWeight:800, color:loyerNet>0?(impotTotal/loyerNet>0.3?C.red:impotTotal/loyerNet>0.15?C.yellow:C.green):C.g2, fontFamily:C.mono }}>{loyerNet>0?Math.round(impotTotal/loyerNet*100):0}%</p>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>CASH-FLOW NET / MOIS</p>
                    <p style={{ fontSize:18, fontWeight:800, color:cashflowNet>=0?C.green:C.red, fontFamily:C.mono }}>{fmtE2(cashflowNet/12)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Save CTA */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:4 }}>
        <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
          onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
          Annuler
        </button>
        <button style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:9, padding:"9px 22px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:`0 4px 18px ${C.blueGlow}`, transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(0,123,255,0.5)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 18px ${C.blueGlow}`;}}>
          <I.Save/> Enregistrer les données fiscales
        </button>
      </div>
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
function PropertyDetail({ asset, onClose, onDelete, onUpdate, kycData }) {
  const PROP_TABS = ["Caractéristiques","Caract. complémentaires","Finances & Performance","Fiscalité","Travaux"];
  const [tab,setTab]       = useState("Caractéristiques");
  const [aiLoad,setAiLoad] = useState(false);
  const [aiDone,setAiDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Editable Caractéristiques state ──
  const [editData, setEditData] = useState({
    name:asset.name||"",type:asset.type||"",identifiant:asset.identifiant||"",couleur:asset.couleur||"#3B82F6",
    addr:asset.addr||"",addr2:asset.addr2||"",batiment:asset.batiment||"",escalier:asset.escalier||"",etage:asset.etage||"",
    porteLot:asset.porteLot||"",ville:asset.ville||"",codePostal:asset.codePostal||"",region:asset.region||"",pays:asset.pays||"France",
    surface:asset.surface||"",rooms:asset.rooms||"",chambres:asset.chambres||"",sdb:asset.sdb||"",year:String(asset.year||""),description:asset.description||"",
    dpe:asset.dpe||"",ges:asset.ges||"",depensesEnergieMin:asset.depensesEnergieMin||"",depensesEnergieMax:asset.depensesEnergieMax||"",anneeRefPrix:asset.anneeRefPrix||"",
    etatLocatif:asset.etatLocatif||asset.statut||"",typeLocation:asset.typeLocation||"",dureeMin:asset.dureeMin||"",dureeMax:asset.dureeMax||"",
    mode:asset.mode||"",loyer:asset.perfSim?.loyerMensuel||asset.loyer||"",chargesLocatives:String(asset.perfSim?.chargesCopro||asset.chargesLocatives||""),depotGarantie:String(asset.depotGarantie||""),frequencePaiement:asset.frequencePaiement||"",
    vendeur:asset.vendeur||"",notaire:asset.notaire||"",taxeFonciere:String(asset.perfSim?.taxeFonciere||asset.taxeFonciere||""),
  });
  const upd = (k,v) => setEditData(f=>({...f,[k]:v}));
  const saveRef = useRef(null);
  useEffect(() => {
    if (!onUpdate) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      const p = s => parseInt(String(s||"0").replace(/[^\d]/g,""),10)||0;
      const loyer = editData.loyer || asset.loyer || "";
      const loyerNum = p(loyer);
      // Sync perfSim if it exists
      const syncPerf = asset.perfSim ? {
        ...asset.perfSim,
        prixBien: p(editData.prixBien || asset.prixBien) || asset.perfSim.prixBien,
        loyerMensuel: loyerNum || asset.perfSim.loyerMensuel,
        taxeFonciere: p(editData.taxeFonciere || asset.taxeFonciere) || asset.perfSim.taxeFonciere,
        chargesCopro: p(editData.chargesLocatives) || asset.perfSim.chargesCopro,
      } : undefined;
      onUpdate({
        ...asset, ...editData,
        year: parseInt(editData.year)||asset.year,
        chargesLocatives: p(editData.chargesLocatives),
        depotGarantie: p(editData.depotGarantie),
        statut: editData.etatLocatif || asset.statut,
        loyer: loyer,
        loyerAnnuel: loyerNum * 12 || asset.loyerAnnuel,
        taxeFonciere: p(editData.taxeFonciere || asset.taxeFonciere),
        ...(syncPerf ? { perfSim: syncPerf } : {}),
      });
    }, 800);
    return () => { if(saveRef.current) clearTimeout(saveRef.current); };
  }, [editData]);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      if (onDelete) onDelete(asset.id);
    }, 600);
  };
  const dpeScore = { A:"35",B:"70",C:"148",D:"210",E:"280" };
  const gesScore = { A:"4", B:"12",C:"28", D:"44"          };

  const handleAI = ()=>{
    if(aiDone||aiLoad) return;
    setAiLoad(true);
    setTimeout(()=>{setAiLoad(false);setAiDone(true)},2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}/>
      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:51, width:"100%", maxWidth:640, background:"#121212", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", boxShadow:"-32px 0 80px rgba(0,0,0,0.7)", animation:"slideIn 0.32s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* TOP HEADER */}
        <div style={{ padding:"20px 24px 0", borderBottom:`1px solid #1a1a1a`, flexShrink:0 }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.g3, fontFamily:C.mono }}>
              <button onClick={onClose} style={{ background:"none", border:"none", color:C.g2, cursor:"pointer", fontSize:11, fontFamily:C.mono, padding:0 }}>Patrimoine</button>
              <I.Chevron/>
              <span style={{ color:C.g2 }}>{asset.name}</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", color:C.g1, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1}}>
                <I.Edit/> Éditer
              </button>
              <button onClick={()=>setShowDeleteConfirm(true)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color=C.red;e.currentTarget.style.background="rgba(239,68,68,0.06)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g2;e.currentTarget.style.background="#1a1a1a";}}>
                <I.Trash/> Supprimer
              </button>
              <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44"}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2}}>
                <I.X/>
              </button>
            </div>
          </div>

          {/* Title + badge */}
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.04em", color:C.w }}>{asset.name}</h1>
              <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2 }}>{asset.surface}</span>
              <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:isLoue(asset.statut||asset.etatLocatif)?"#10b981":"#EF4444", background:isLoue(asset.statut||asset.etatLocatif)?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", border:"1px solid "+(isLoue(asset.statut||asset.etatLocatif)?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"), padding:"3px 9px", borderRadius:99, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:isLoue(asset.statut||asset.etatLocatif)?"#10b981":"#EF4444", display:"inline-block", animation:"pulse 2s infinite" }}/>{isLoue(asset.statut||asset.etatLocatif)?"LOUÉ":(asset.statut||asset.etatLocatif||"DISPONIBLE").toUpperCase()}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, color:C.g2, fontSize:12 }}>
              <I.MapPin/><span>{asset.addr}</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex" }}>
            {PROP_TABS.map(t=>{
              const active = tab===t;
              return (
                <button key={t} onClick={()=>setTab(t)} style={{ background:"transparent", border:"none", padding:"10px 18px", fontSize:12, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent", transition:"all 0.15s" }}
                  onMouseEnter={e=>{if(!active)e.currentTarget.style.color=C.g1}}
                  onMouseLeave={e=>{if(!active)e.currentTarget.style.color=C.g2}}>{t}</button>
              );
            })}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 24px 16px" }}>
          {tab==="Caract. complémentaires" ? (
            <CaractComplementaires asset={asset}/>
          ) : tab==="Caractéristiques" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"rgba(16,185,129,0.04)", border:`1px solid ${C.greenBord}`, borderRadius:10 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }}/>
                <span style={{ fontSize:10, color:C.green, fontFamily:C.mono }}>ÉDITION EN DIRECT</span>
                <span style={{ fontSize:10, color:C.g3, marginLeft:"auto" }}>Sauvegarde automatique</span>
              </div>
              <SecLabel label="1 · IDENTITÉ & TYPE DE BIEN"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbField icon={I.Home} label="Nom / Identifiant" value={editData.name} full placeholder="Ex : Le Loft d'Eysines" onChange={v=>upd("name",v)}/>
                <NbSelect icon={I.Home2} label="Type de bien" value={editData.type} onChange={v=>upd("type",v)} options={["Appartement","Maison","Studio","Loft","Chambre","Château","Mobil-Home","Caravane","Atelier","Boutique","Box de stockage","Bureaux","Bureau partagé","Cave","Chalet","Commerce","Entrepôt","Garage","Grenier","Hôtel Particulier","Local professionnel","Local commercial","Parking","Terrain","Autre"]}/>
                <NbField icon={I.Tag} label="Référence interne" value={editData.identifiant} placeholder="N° unique" onChange={v=>upd("identifiant",v)}/>
                <NbColor label="Couleur de référence" value={editData.couleur} onChange={v=>upd("couleur",v)}/>
              </div>
              <SecLabel label="2 · LOCALISATION"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbFieldAddress icon={I.MapPin} label="Adresse (n° et rue)" value={editData.addr} full placeholder="12 Rue de la République" onChange={v=>upd("addr",v)} onSelect={s=>{upd("addr",s.addr);upd("ville",s.ville);upd("codePostal",s.codePostal);if(s.region)upd("region",s.region);}}/>
                <NbField icon={I.MapPin} label="Complément" value={editData.addr2} full placeholder="Résidence, Adresse 2" onChange={v=>upd("addr2",v)}/>
                <NbField icon={I.Building} label="Bâtiment" value={editData.batiment} placeholder="Bât A" onChange={v=>upd("batiment",v)}/>
                <NbField icon={I.Building} label="Escalier" value={editData.escalier} placeholder="Esc 2" onChange={v=>upd("escalier",v)}/>
                <NbField icon={I.Building} label="Étage" value={editData.etage} placeholder="3e" onChange={v=>upd("etage",v)}/>
                <NbField icon={I.Grid} label="N° porte / lot" value={editData.porteLot} placeholder="Lot 45" onChange={v=>upd("porteLot",v)}/>
                <NbField icon={I.MapPin} label="Ville" value={editData.ville} placeholder="Bordeaux" onChange={v=>upd("ville",v)}/>
                <NbField icon={I.MapPin} label="Code postal" value={editData.codePostal} placeholder="33000" onChange={v=>upd("codePostal",v)}/>
                <NbField icon={I.MapPin} label="Région" value={editData.region} placeholder="Nouvelle-Aquitaine" onChange={v=>upd("region",v)}/>
                <NbSelect icon={I.Globe} label="Pays" value={editData.pays} onChange={v=>upd("pays",v)} options={["France","Belgique","Suisse","Luxembourg","Monaco","Canada","Maroc","Tunisie","Sénégal","Côte d'Ivoire","Autre"]}/>
              </div>
              <SecLabel label="3 · DESCRIPTIF TECHNIQUE"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbField icon={I.Ruler} label="Superficie" value={editData.surface} unit="m²" placeholder="65" onChange={v=>upd("surface",v)}/>
                <NbField icon={I.Grid} label="Nombre de pièces" value={editData.rooms} placeholder="T3" onChange={v=>upd("rooms",v)}/>
                <NbField icon={I.Grid} label="Chambres" value={editData.chambres} placeholder="2" onChange={v=>upd("chambres",v)}/>
                <NbField icon={I.Grid} label="Salles de bain" value={editData.sdb} placeholder="1" onChange={v=>upd("sdb",v)}/>
                <NbField icon={I.Calendar} label="Construction" value={editData.year} placeholder="1975" onChange={v=>upd("year",v)}/>
              </div>
              <NbTextarea icon={I.FileText} label="Description détaillée" value={editData.description} full placeholder="Descriptif pour annonces ou contrat…" rows={4} onChange={v=>upd("description",v)}/>
              <SecLabel label="4 · PARAMÈTRES DE LOCATION"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbSelect icon={I.Activity} label="État locatif" value={editData.etatLocatif} onChange={v=>upd("etatLocatif",v)} options={["Automatique","Disponible","Loué","Préavis / Départ","En recherche","Indisponible","Travaux"]}/>
                <NbSelect icon={I.Home2} label="Type de location" value={editData.typeLocation} onChange={v=>upd("typeLocation",v)} options={["Meublée","Vide","Saisonnière"]}/>
              </div>
              <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><I.Calendar/><span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DURÉES PROPOSÉES</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <NbSelect label="Durée minimale" value={editData.dureeMin} onChange={v=>upd("dureeMin",v)} options={["1 mois","2 mois","3 mois","6 mois","9 mois","12 mois","18 mois","24 mois","36 mois"]}/>
                  <NbSelect label="Durée maximale" value={editData.dureeMax} onChange={v=>upd("dureeMax",v)} options={["1 an","2 ans","3 ans","4 ans","5 ans","6 ans","7 ans","8 ans","9 ans"]}/>
                </div>
              </div>
              <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><I.Euro/><span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>CONDITIONS FINANCIÈRES CIBLES</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  <NbField icon={I.Euro} label="Loyer HC" value={editData.loyer} unit="€" accent placeholder="850" onChange={v=>upd("loyer",v)}/>
                  <NbField icon={I.Euro} label="Charges" value={editData.chargesLocatives} unit="€" placeholder="80" onChange={v=>upd("chargesLocatives",v)}/>
                  <NbField icon={I.Euro} label="Dépôt garantie" value={editData.depotGarantie} unit="€" placeholder="850" onChange={v=>upd("depotGarantie",v)}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbSelect icon={I.Calendar} label="Fréquence paiement" value={editData.frequencePaiement} onChange={v=>upd("frequencePaiement",v)} options={["Mensuel","Bimestriel","Trimestriel","Quadrimestriel","Semestriel","Annuel","Forfaitaire"]}/>
                <NbSelect icon={I.Users} label="Mode locatif" value={editData.mode} onChange={v=>upd("mode",v)} options={["LMNP (meublé)","Location nue","SCI à l'IR","SCI à l'IS","Colocation","Sous-location","Autre"]}/>
              </div>
              <SecLabel label="5 · PERFORMANCE ÉNERGÉTIQUE (DPE)"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbSelect icon={I.Leaf} label="Classe DPE" value={editData.dpe} onChange={v=>upd("dpe",v)} options={["A","B","C","D","E","F","G"]}/>
                <NbSelect icon={I.Leaf} label="Classe GES" value={editData.ges} onChange={v=>upd("ges",v)} options={["A","B","C","D","E","F","G"]}/>
              </div>
              <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><I.Euro/><span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DÉPENSES ANNUELLES D'ÉNERGIE</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  <NbField icon={I.Euro} label="Min" value={editData.depensesEnergieMin} unit="€/an" mono placeholder="800" onChange={v=>upd("depensesEnergieMin",v)}/>
                  <NbField icon={I.Euro} label="Max" value={editData.depensesEnergieMax} unit="€/an" mono placeholder="1 400" onChange={v=>upd("depensesEnergieMax",v)}/>
                  <NbSelect label="Année réf." value={editData.anneeRefPrix} onChange={v=>upd("anneeRefPrix",v)} options={["2021","2022","2023","2024","2025","2026"]}/>
                </div>
              </div>
              <SecLabel label="PARTIES ET INTERVENANTS"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbField icon={I.User} label="Vendeur" value={editData.vendeur} placeholder="Nom ou société" onChange={v=>upd("vendeur",v)}/>
                <NbField icon={I.Briefcase} label="Notaire" value={editData.notaire} placeholder="Maître…" onChange={v=>upd("notaire",v)}/>
              </div>
            </div>
          ) : tab==="Finances & Performance" ? (
            <PerformanceTab asset={asset} onUpdate={onUpdate} kycData={kycData}/>
          ) : tab==="Fiscalité" ? (
            <FinancesFiscaliteTab asset={asset} kycData={kycData}/>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:C.blueSub, border:"1px solid rgba(0,123,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.Sparkles/></div>
              <p style={{ fontSize:14, color:C.g2, textAlign:"center" }}>Onglet <strong style={{ color:C.g1 }}>{tab}</strong> — bientôt disponible</p>
              <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>EN COURS DE DÉVELOPPEMENT</span>
            </div>
          )}
        </div>

        {/* STICKY CTA */}
        <div style={{ padding:"16px 24px 24px", borderTop:`1px solid #1a1a1a`, background:"linear-gradient(to top,#121212 80%,transparent)", flexShrink:0 }}>
          <button onClick={handleAI} disabled={aiLoad}
            style={{ width:"100%", background:aiDone?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:12, padding:"15px 24px", color:"#fff", fontSize:13, fontWeight:700, cursor:aiLoad?"wait":"pointer", letterSpacing:"0.04em", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:aiDone?"0 4px 24px rgba(5,150,105,0.4)":`0 4px 28px ${C.blueGlow}`, transition:"all 0.2s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e=>{if(!aiLoad&&!aiDone){e.currentTarget.style.boxShadow="0 6px 36px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)"}}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=aiDone?"0 4px 24px rgba(5,150,105,0.4)":`0 4px 28px ${C.blueGlow}`;e.currentTarget.style.transform="none"}}>
            {aiLoad&&<div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)", backgroundSize:"200% 100%", animation:"shimmer 1.2s infinite" }}/>}
            {aiLoad?<><Spinner/>Génération en cours...</>:aiDone?<><span>✓</span>Annonce générée avec succès !</>:<><span>✨</span>Générer une annonce locative avec l'IA</>}
          </button>
          <p style={{ textAlign:"center", fontSize:10, color:C.g3, fontFamily:C.mono, marginTop:8 }}>Basé sur les données du bien · Prêt en ~10 secondes</p>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
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
            {/* Warning icon */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:C.redSub, border:"1.5px solid rgba(239,68,68,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red }}>
                <I.AlertTriangle/>
              </div>
            </div>

            {/* Title */}
            <h3 style={{ textAlign:"center", fontSize:17, fontWeight:800, letterSpacing:"-0.02em", color:C.w, marginBottom:8 }}>
              Supprimer ce bien ?
            </h3>
            <p style={{ textAlign:"center", fontSize:13, color:C.g2, lineHeight:1.65, marginBottom:6 }}>
              Vous allez supprimer <strong style={{ color:C.w }}>{asset.name}</strong> de votre patrimoine.
            </p>
            <p style={{ textAlign:"center", fontSize:11, color:C.g3, lineHeight:1.6, marginBottom:22 }}>
              Cette action supprimera toutes les données associées (caractéristiques, finances, fiscalité). Cette action est irréversible.
            </p>

            {/* Asset summary card */}
            <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:C.redSub, border:"1px solid rgba(239,68,68,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0 }}>
                <I.Home/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:2 }}>{asset.name}</p>
                <p style={{ fontSize:11, color:C.g2 }}>{asset.type} · {asset.surface} · {asset.addr}</p>
              </div>
            </div>

            {/* Buttons */}
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
function SectionTitle({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
      <span style={{ fontSize:9, letterSpacing:"0.14em", color:C.g3, fontFamily:C.mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function Spinner() {
  return <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>;
}
function isLoue(statut) {
  if (!statut) return false;
  const s = statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return s === "loue" || s === "loue" || s.includes("loue") || s.includes("lou");
}

export { PropertyDetail };
