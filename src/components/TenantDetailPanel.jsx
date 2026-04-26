import { useState, useRef, useEffect } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";
import { GestionTab } from "./GestionTab.jsx";

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

export { TenantDetailPanel };
