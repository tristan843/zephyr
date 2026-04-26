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
import { LoginScreen } from "./components/LoginScreen.jsx";
import { OnboardingFlow } from "./components/OnboardingFlow.jsx";
import { NouveauBienPanel } from "./components/NouveauBienPanel.jsx";
import { NouveauLocatairePanel } from "./components/NouveauLocatairePanel.jsx";
import { GestionTab } from "./components/GestionTab.jsx";
import { TenantDetailPanel } from "./components/TenantDetailPanel.jsx";
import { MonComptePanel } from "./components/MonComptePanel.jsx";

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
   PATRIMOINE PAGE — LIST VIEW
════════════════════════════════════════ */




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
