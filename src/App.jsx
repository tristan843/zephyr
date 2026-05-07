import { useState, useRef, useEffect } from "react";
import { C } from "./tokens/colors.js";
import { I } from "./components/Icons.jsx";
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
import { TenantDetailPanel } from "./components/TenantDetailPanel.jsx";
import { MonComptePanel } from "./components/MonComptePanel.jsx";
import { AttachTenantPopup } from "./components/AttachTenantPopup.jsx";

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



const JOURS_NOMS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];


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
