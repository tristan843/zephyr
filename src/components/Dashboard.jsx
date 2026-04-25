import { useState, useRef } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";
import { Sparkline } from "./ui/Sparkline.jsx";
import { Gauge } from "./ui/Gauge.jsx";

const ALERTS_DEMO = [];

/* ════════════════════════════════════════
   SMART INTAKE MODAL
════════════════════════════════════════ */
function SmartIntakeModal({ onClose }) {
  const [drag, setDrag]   = useState(false);
  const [file, setFile]   = useState(null);
  const ref = useRef();
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:18, width:"100%", maxWidth:520, padding:"32px 32px 28px", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue, boxShadow:`0 0 8px ${C.blue}` }}/>
              <span style={{ fontSize:10, fontFamily:C.mono, color:C.blue, letterSpacing:"0.12em" }}>SMART INTAKE</span>
            </div>
            <h2 style={{ fontSize:20, fontWeight:700, color:C.w, letterSpacing:"-0.02em" }}>Nouveau dossier</h2>
            <p style={{ fontSize:12, color:C.g2, marginTop:4 }}>Déposez vos documents — l'IA s'occupe du reste.</p>
          </div>
          <button onClick={onClose} style={{ background:"#1f1f1f", border:`1px solid ${C.border}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center" }}><I.X/></button>
        </div>
        <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);setFile(e.dataTransfer.files[0])}} onClick={()=>ref.current.click()}
          style={{ border:`1.5px dashed ${drag?C.blue:file?C.green:"#2a2a2a"}`, borderRadius:14, padding:"36px 24px", textAlign:"center", cursor:"pointer", background:drag?"rgba(0,123,255,0.05)":file?"rgba(16,185,129,0.05)":"#0a0a0a", transition:"all 0.2s", boxShadow:drag?`0 0 24px rgba(0,123,255,0.15)`:"none" }}>
          <input ref={ref} type="file" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])}/>
          <div style={{ color:file?C.green:drag?C.blue:C.g2, marginBottom:12, display:"flex", justifyContent:"center" }}><I.Upload/></div>
          {file ? <><p style={{ fontSize:13, color:C.green, fontWeight:600 }}>{file.name}</p><p style={{ fontSize:11, color:C.g2, marginTop:4 }}>Prêt pour analyse IA</p></>
                : <><p style={{ fontSize:13, color:C.w, fontWeight:600 }}>Glissez votre document ici</p><p style={{ fontSize:11, color:C.g2, marginTop:4 }}>PDF, Image, Contrat · Analyse IA automatique</p></>}
        </div>
        <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {["Bail","Quittance","Assurance","Diagnostic","Facture","Autre"].map(t=>(
            <button key={t} style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 4px", color:C.g2, fontSize:11, cursor:"pointer", fontFamily:C.mono, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.blue;e.target.style.color=C.blue}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.g2}}>{t}</button>
          ))}
        </div>
        <button style={{ marginTop:20, width:"100%", background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"13px 0", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:"0.04em", boxShadow:`0 4px 24px ${C.blueGlow}` }}
          onMouseEnter={e=>e.target.style.opacity="0.88"} onMouseLeave={e=>e.target.style.opacity="1"}>
          ⚡ ANALYSER AVEC L'IA
        </button>
      </div>
    </div>
  );
}

function isLoue(statut) {
  if (!statut) return false;
  const s = statut.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return s === "loue" || s === "loue" || s.includes("loue") || s.includes("lou");
}

function getStatut(daysLate) {
  if (daysLate === 0)  return { label:"À jour",  color:"#10B981", bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.22)", dot:"#10B981" };
  if (daysLate < 10)   return { label:"En retard", color:"#F59E0B", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.22)",  dot:"#F59E0B", pulse:true };
  return               { label:"Impayé",  color:"#EF4444", bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.22)",  dot:"#EF4444", pulse:true };
}

/* ════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════ */
function Dashboard({ onSelectAsset, onNav, onNewTenant, onSelectTenant, assets, tenants=[], user }) {
  const [hovAlert, setHovAlert]   = useState(null);
  const [hovAsset, setHovAsset]   = useState(null);
  const [hovTenant, setHovTenant] = useState(null);
  const [modal,    setModal]      = useState(false);

  // Computed KPIs from assets
  const totalVL = assets.reduce((s,a) => s + (a.vl || a.prixBien || 0), 0);
  const totalLoyerAn = assets.reduce((s,a) => s + (a.loyerAnnuel || 0), 0);
  const totalCharges = assets.reduce((s,a) => s + (a.chargesCopro||0) + (a.taxeFonciere||0), 0);
  const cashFlowNet = Math.round((totalLoyerAn - totalCharges) / 12);
  const avgLTV = assets.length ? Math.round(assets.reduce((s,a) => s + (a.ltv||0), 0) / assets.length) : 0;
  const fmtK = (n) => n >= 1000 ? new Intl.NumberFormat("fr-FR").format(n) + " €" : n + " €";
  const nbImpayes = tenants.filter(t=>t.daysLate>=10).length;

  return (
    <main style={{ flex:1, overflowY:"auto", padding:"28px 32px 40px" }}>

      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
        <div>
          <p style={{ fontSize:11, color:C.g2, fontFamily:C.mono, letterSpacing:"0.1em", marginBottom:6 }}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()}</p>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>Bonjour{user?.prenom ? `, ${user.prenom}` : ""} 👋</h1>
          <p style={{ fontSize:13, color:C.g2, marginTop:4 }}>{assets.length>0?"Votre patrimoine en un coup d'œil.":"Ajoutez votre premier bien pour commencer."}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 14px", color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
            <I.Search/><span style={{ fontFamily:C.mono }}>Rechercher...</span>
          </button>
          <button style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <I.Bell/>
            <span style={{ position:"absolute", top:8, right:8, width:6, height:6, borderRadius:"50%", background:C.red, animation:"pulse 2s infinite" }}/>
          </button>
          <button onClick={()=>setModal(true)}
            style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, letterSpacing:"0.06em", boxShadow:`0 4px 20px ${C.blueGlow}`, transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${C.blueGlow}`;e.currentTarget.style.transform="none"}}>
            <I.Plus/> + NOUVEAU
          </button>
        </div>
      </div>

      {/* HERO METRICS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"PATRIMOINE ESTIMÉ", value:fmtK(totalVL), sub:assets.length+" bien(s) en portefeuille", subC:C.g2, badge:{ color:assets.length?C.green:C.g3, text:assets.length?"● Actif":"—" }, extra:assets.length?<Sparkline color={C.green}/>:null },
          { label:"CASH-FLOW NET / MOIS", value:cashFlowNet>0?"+ "+fmtK(cashFlowNet):cashFlowNet===0?"0 €":fmtK(cashFlowNet), sub:totalLoyerAn>0?"Loyers "+fmtK(totalLoyerAn)+"/an":"Aucun revenu locatif", subC:cashFlowNet>0?C.green:C.g2, badge:{ color:cashFlowNet>0?C.blue:C.g3, text:cashFlowNet>0?Math.round(cashFlowNet/500*100)+"% objectif":"—" }, extra:cashFlowNet>0?<Gauge value={Math.min(100,Math.round(cashFlowNet/500*100))} color={C.blue}/>:null },
          { label:"RATIO LTV MOYEN", value:avgLTV?avgLTV+" %":"— %", sub:avgLTV>0?(avgLTV<70?"Risque faible · seuil < 70%":"Risque élevé · seuil > 70%"):"Aucun bien", subC:C.g2, badge:{ color:avgLTV>0?(avgLTV<70?C.green:C.red):C.g3, text:avgLTV>0?(avgLTV<70?"✓ Sain":"⚠ Élevé"):"—" }, extra:avgLTV>0?<Gauge value={avgLTV} color={avgLTV<70?C.green:C.red}/>:null },
        ].map((card,i)=>(
          <div key={i}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px 22px 18px", transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#3B3B44"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em" }}>{card.label}</span>
              <span style={{ fontSize:9, fontFamily:C.mono, color:card.badge.color, background:`${card.badge.color}18`, padding:"2px 7px", borderRadius:4 }}>{card.badge.text}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.04em", marginBottom:4 }}>{card.value}</div>
            <div style={{ fontSize:11, color:card.subC, marginBottom:8 }}>{card.sub}</div>
            {card.extra}
          </div>
        ))}
      </div>

      {/* 2-COL */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16 }}>

        {/* ALERTS */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:4 }}>CENTRE D'INTELLIGENCE</p>
              <h2 style={{ fontSize:14, fontWeight:700 }}>Priorités du jour</h2>
            </div>
            <span style={{ fontSize:9, fontFamily:C.mono, background:nbImpayes?C.redSub:C.greenSub, color:nbImpayes?C.red:C.green, padding:"3px 8px", borderRadius:4 }}>{nbImpayes?nbImpayes+" IMPAYÉ"+(nbImpayes>1?"S":""):"✓ RAS"}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {ALERTS_DEMO.length===0?<div style={{padding:"20px 0",textAlign:"center"}}><p style={{fontSize:12,color:C.g2}}>Aucune alerte</p><p style={{fontSize:10,color:C.g3}}>Les alertes apparaîtront quand vous aurez des biens et locataires.</p></div>:ALERTS_DEMO.map((a,i)=>(
              <div key={i} onMouseEnter={()=>setHovAlert(i)} onMouseLeave={()=>setHovAlert(null)}
                style={{ background:hovAlert===i?`${a.color}08`:"transparent", border:`1px solid ${hovAlert===i?a.border:"transparent"}`, borderRadius:12, padding:"12px 14px", transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  {a.dot&&<span style={{ width:6, height:6, borderRadius:"50%", background:a.color, animation:"pulse 1.5s infinite" }}/>}
                  <span style={{ fontSize:8.5, fontFamily:C.mono, color:a.color, letterSpacing:"0.1em" }}>
                    {a.type}{a.aiTag&&<span style={{ fontSize:7.5, background:C.blueSub, padding:"1px 5px", borderRadius:3, marginLeft:4 }}>IA</span>}
                  </span>
                </div>
                <p style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{a.title}</p>
                <p style={{ fontSize:10.5, color:C.g2, marginBottom:10 }}>{a.sub}</p>
                <button style={{ background:`${a.color}18`, border:`1px solid ${a.color}44`, borderRadius:7, padding:"5px 12px", color:a.color, fontSize:10.5, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.target.style.background=`${a.color}30`;e.target.style.borderColor=a.color}}
                  onMouseLeave={e=>{e.target.style.background=`${a.color}18`;e.target.style.borderColor=`${a.color}44`}}>
                  {a.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ASSETS TABLE */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:4 }}>LISTE DES ACTIFS</p>
              <h2 style={{ fontSize:14, fontWeight:700 }}>Portefeuille immobilier</h2>
            </div>
            <button
              onClick={()=>onNav("patrimoine")}
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 12px", color:C.g2, fontSize:10.5, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.blue;e.target.style.color=C.blue}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.g2}}>
              Voir tout →
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", padding:"0 8px 10px", borderBottom:`1px solid ${C.border}`, gap:8 }}>
            {["Bien","Type","Loyer","Capital / mois","LTV"].map(h=>(
              <span key={h} style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.08em" }}>{h}</span>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:2, marginTop:4 }}>
            {assets.length===0?(
              <div style={{ padding:"32px 24px", textAlign:"center" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.blue, marginBottom:12 }}><I.Building/></div>
                <p style={{ fontSize:13, color:C.g2 }}>Aucun bien immobilier</p>
                <p style={{ fontSize:11, color:C.g3, marginTop:4 }}>Cliquez sur « + NOUVEAU » pour ajouter votre premier bien.</p>
              </div>
            ):assets.map((a,i)=>(
              <div key={i} onMouseEnter={()=>setHovAsset(i)} onMouseLeave={()=>setHovAsset(null)}
                onClick={()=>onSelectAsset(a)}
                style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", padding:"13px 8px", borderRadius:10, gap:8, background:hovAsset===i?"#1a1a1a":"transparent", transition:"all 0.15s", cursor:"pointer", alignItems:"center", border:`1px solid ${hovAsset===i?"rgba(0,123,255,0.2)":"transparent"}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:2, display:"flex", alignItems:"center", gap:6 }}>
                    {a.name}
                    {hovAsset===i&&<span style={{ fontSize:9, color:C.blue, fontFamily:C.mono, opacity:.8 }}>Voir →</span>}
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, color:isLoue(a.statut||a.etatLocatif)?C.green:C.red, background:isLoue(a.statut||a.etatLocatif)?C.greenSub:C.redSub, padding:"2px 7px", borderRadius:4, fontFamily:C.mono }}>● {isLoue(a.statut||a.etatLocatif)?"Loué":(a.statut||a.etatLocatif||"Disponible")}</div>
                </div>
                <span style={{ fontSize:11, color:C.g2 }}>{a.type}</span>
                <span style={{ fontSize:12, fontFamily:C.mono, fontWeight:500 }}>{a.rent}</span>
                <span style={{ fontSize:12, fontFamily:C.mono, color:C.green, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><I.Trend/>{a.capital}</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ flex:1, height:3, background:"#1f1f1f", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${a.ltv}%`, background:C.blue, borderRadius:99 }}/>
                  </div>
                  <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{a.ltv}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{assets.length} actif{assets.length>1?"s":""} · Valeur estimée</span>
            <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.03em" }}>{fmtK(totalVL)}</span>
          </div>
        </div>
      </div>

      {modal&&<SmartIntakeModal onClose={()=>setModal(false)}/>}

      {/* ── LOCATAIRES STRIP ── */}
      <div style={{ marginTop:16, background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:4 }}>GESTION LOCATIVE</p>
            <h2 style={{ fontSize:14, fontWeight:700 }}>Locataires</h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onNewTenant}
              style={{ background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", borderRadius:7, padding:"5px 12px", color:C.blue, fontSize:10.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.blueSub.replace("0.08","0.14");}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.blueSub;}}>
              <I.Plus/> Nouveau
            </button>
            <button onClick={()=>onNav("locataires")}
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 12px", color:C.g2, fontSize:10.5, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.blue;e.target.style.color=C.blue;}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.g2;}}>
              Voir tout →
            </button>
          </div>
        </div>
        {/* Column headers */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1.4fr 2fr 1fr 1.2fr 0.9fr", padding:"0 10px 8px", borderBottom:`1px solid ${C.border}`, gap:10 }}>
          {["Nom","Prénom","Adresse du bien","Ville","Mail","État"].map(h=>(
            <span key={h} style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.08em" }}>{h}</span>
          ))}
        </div>
        {/* Tenant rows — show first 4 */}
        {tenants.length===0?<div style={{padding:"20px 0",textAlign:"center"}}><p style={{fontSize:12,color:C.g2}}>Aucun locataire</p><p style={{fontSize:10,color:C.g3}}>Ajoutez un locataire depuis la section Locataires.</p></div>:tenants.slice(0,4).map(t=>{
          const st = getStatut(t.daysLate);
          const isH = hovTenant===t.id;
          return (
            <div key={t.id}
              onMouseEnter={()=>setHovTenant(t.id)} onMouseLeave={()=>setHovTenant(null)}
              onClick={()=>onSelectTenant?onSelectTenant(t):onNav("locataires")}
              style={{ display:"grid", gridTemplateColumns:"1.4fr 1.4fr 2fr 1fr 1.2fr 0.9fr", padding:"11px 10px", borderRadius:8, gap:10, alignItems:"center", background:isH?"#1a1a1a":"transparent", transition:"all 0.15s", cursor:"pointer", border:`1px solid ${isH?"rgba(0,123,255,0.15)":"transparent"}`, marginTop:2 }}>
              {/* Nom */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:`linear-gradient(135deg,${st.color}28,${st.color}14)`, border:`1px solid ${st.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:st.color }}>
                  {t.prenom[0]}{t.nom[0]}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:C.w }}>{t.nom}</span>
              </div>
              <span style={{ fontSize:12, color:C.g1 }}>{t.prenom}</span>
              <span style={{ fontSize:11, color:C.g2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.adresse}</span>
              <span style={{ fontSize:11, color:C.g2 }}>{t.ville}</span>
              <span style={{ fontSize:11, color:C.g2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.mail}</span>
              {/* Statut */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:st.bg, border:`1px solid ${st.border}`, borderRadius:99, padding:"3px 8px", width:"fit-content" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, flexShrink:0, animation:st.pulse?"pulse 1.8s infinite":"none" }}/>
                <span style={{ fontSize:9, fontWeight:700, color:st.color, fontFamily:C.mono, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{st.label}</span>
              </div>
            </div>
          );
        })}
        <div style={{ marginTop:10, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{tenants.length} locataires · {tenants.filter(t=>t.daysLate>=10).length} impayé{tenants.filter(t=>t.daysLate>=10).length>1?"s":""}</span>
          <button onClick={()=>onNav("locataires")} style={{ background:"transparent", border:"none", color:C.blue, fontSize:11, cursor:"pointer", fontWeight:600 }}>Gérer tous les locataires →</button>
        </div>
      </div>
    </main>
  );
}

export { Dashboard };
