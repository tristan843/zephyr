import { useState, useEffect } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

function isLoue(statut) {
  if (!statut) return false;
  const s = statut.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return s === "loue" || s === "loue" || s.includes("loue") || s.includes("lou");
}
function fmtEur(n) {
  return n.toLocaleString("fr-FR") + " €";
}

function AssetRow({ a, hov, setHov, onSelectAsset, isNew }) {
  const isH = hov === a.id;
  const cout        = a.prixBien + a.fraisAgence + a.ameublement + a.fraisNotaire;

  // ── Use perfSim data if available (from Performance tab) ──
  const ps = a.perfSim;
  let rendement, cashflow;
  if (ps && ps.prixBien > 0) {
    const pf = (v) => parseFloat(String(v||"0").replace(",","."))||0;
    const coutSim = pf(ps.prixBien) + pf(ps.fraisNotaire) + pf(ps.travaux) + pf(ps.mobilier);
    const loyerBrut = pf(ps.loyerMensuel) * 12;
    const loyerVac = loyerBrut * (1 - pf(ps.vacance)/100);
    const charges = pf(ps.taxeFonciere) + pf(ps.chargesCopro) + pf(ps.assurancePNO) + pf(ps.gestionLocative) + pf(ps.entretien);
    const rdtBrut = coutSim > 0 ? (loyerBrut / coutSim * 100).toFixed(2) : "0.00";
    // Mensualité
    const montant = pf(ps.montantPret);
    const tauxM = pf(ps.tauxInteret)/100/12;
    const nbM = pf(ps.dureePret)*12;
    const diffM = Math.min(pf(ps.differe), nbM);
    const nbAmort = nbM - diffM;
    const mensCred = montant > 0 && tauxM > 0 && nbAmort > 0 ? montant * tauxM / (1 - Math.pow(1+tauxM, -nbAmort)) : 0;
    const mensAss = montant * (pf(ps.tauxAssurance)/100) / 12;
    const mensTot = mensCred + mensAss;
    const creditAn = mensTot * 12;
    // Fiscal
    const interetsMoy = pf(ps.dureePret) > 0 ? (creditAn * pf(ps.dureePret) - montant) / pf(ps.dureePret) : 0;
    const resFiscal = Math.max(0, loyerVac - charges - interetsMoy - pf(ps.amortissement));
    const impot = resFiscal * (pf(ps.tmi) + pf(ps.prelevementsSociaux||17.2)) / 100;
    const cfAn = loyerVac - charges - creditAn - impot;
    rendement = rdtBrut;
    cashflow = Math.round(cfAn / 12);
  } else {
    const rnetAnnuel = a.loyerAnnuel - a.chargesCopro - a.taxeFonciere;
    rendement = a.prixBien > 0 ? ((a.loyerAnnuel / (a.prixBien + a.fraisNotaire)) * 100).toFixed(2) : "0.00";
    cashflow = Math.round(rnetAnnuel / 12);
  }

  const loue        = isLoue(a.statut || a.etatLocatif);
  const vlGain      = a.vl - cout;
  const vlGainPct   = cout > 0 ? ((vlGain / cout) * 100).toFixed(1) : "0.0";
  const cfPositif   = cashflow >= 0;

  return (
    <div
      onMouseEnter={()=>setHov(a.id)} onMouseLeave={()=>setHov(null)}
      onClick={()=>onSelectAsset(a)}
      style={{
        display:"grid",
        gridTemplateColumns:"2fr 1.2fr 1.5fr 0.9fr 1fr 0.9fr",
        alignItems:"center",
        borderBottom:`1px solid ${C.border}`,
        background: isNew ? "rgba(16,185,129,0.04)" : isH ? "#131313" : "transparent",
        cursor:"pointer",
        borderLeft:`2px solid ${isNew ? C.green : isH ? C.blue : "transparent"}`,
        transition:"all 0.15s",
        animation: isNew ? "fadeUp 0.5s cubic-bezier(0.2,0.8,0.2,1)" : "none",
      }}
    >
      {/* ── COL 1: Bien ── */}
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background: isH ? C.blueMid : C.blueSub,
          border:`1px solid ${isH ? "rgba(0,123,255,0.35)" : "rgba(0,123,255,0.18)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:C.blue, transition:"all 0.15s",
        }}><I.Home/></div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</p>
          <p style={{ fontSize:10, color:C.g2, marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.addr}</p>
          <div style={{ display:"flex", gap:4 }}>
            <span style={{ fontSize:8, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.18)", padding:"1px 5px", borderRadius:3 }}>{a.type}</span>
            <span style={{ fontSize:8, fontFamily:C.mono, color:C.g2, background:"#111", border:`1px solid ${C.border}`, padding:"1px 5px", borderRadius:3 }}>{a.surface}</span>
            <span style={{ fontSize:8, fontFamily:C.mono, color:C.g2, background:"#111", border:`1px solid ${C.border}`, padding:"1px 5px", borderRadius:3 }}>DPE {a.dpe}</span>
          </div>
        </div>
      </div>

      {/* ── COL 2: Coût acquisition (total uniquement) ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", gap:3 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>COÛT</span>
        <span style={{ fontSize:15, fontWeight:800, color:C.w, letterSpacing:"-0.03em", fontFamily:C.mono }}>{fmtEur(cout)}</span>
      </div>

      {/* ── COL 3: VL estimée + Valeur Liquidative ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", gap:4 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>VL ESTIMÉE</span>
        <span style={{ fontSize:15, fontWeight:800, color:C.w, letterSpacing:"-0.03em", fontFamily:C.mono }}>{fmtEur(a.vl)}</span>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:10, fontFamily:C.mono, fontWeight:700, color: vlGain >= 0 ? C.green : C.red }}>
            {vlGain >= 0 ? "+" : ""}{fmtEur(vlGain)}
          </span>
          <span style={{
            fontSize:9, fontFamily:C.mono,
            color: vlGain >= 0 ? C.green : C.red,
            background: vlGain >= 0 ? C.greenSub : C.redSub,
            border:`1px solid ${vlGain >= 0 ? C.greenBord : "rgba(239,68,68,0.22)"}`,
            padding:"1px 6px", borderRadius:4,
          }}>
            {vlGain >= 0 ? "▲" : "▼"} {Math.abs(vlGainPct)}%
          </span>
        </div>
        {a.vlLiquidative != null && (
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
            <span style={{ fontSize:8, fontFamily:C.mono, color:"#6366F1", letterSpacing:"0.06em" }}>LIQUIDATIVE</span>
            <span style={{ fontSize:10, fontWeight:700, fontFamily:C.mono, color:"#6366F1" }}>{fmtEur(a.vlLiquidative)}</span>
          </div>
        )}
      </div>

      {/* ── COL 4: État ── */}
      <div style={{ padding:"14px 14px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:6 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background: loue ? C.greenSub : C.redSub,
          border:`1px solid ${loue ? C.greenBord : "rgba(239,68,68,0.22)"}`,
          borderRadius:99, padding:"4px 10px",
        }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background: loue ? C.green : C.red, animation: loue ? "none" : "pulse 1.6s infinite" }}/>
          <span style={{ fontSize:9.5, fontWeight:700, fontFamily:C.mono, letterSpacing:"0.05em", color: loue ? C.green : C.red }}>
            {loue ? "LOUÉ" : (a.statut||a.etatLocatif||"DISPONIBLE").toUpperCase()}
          </span>
        </div>
        {loue && <p style={{ fontSize:9.5, color:C.g2, textAlign:"center", lineHeight:1.4 }}>{a.mode||a.typeLocation||""}</p>}
      </div>

      {/* ── COL 5: Rendement net (% uniquement) ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:2 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>RENDEMENT</span>
        <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
          <span style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.04em", color: parseFloat(rendement)>=5 ? C.green : parseFloat(rendement)>=3 ? C.yellow : C.red }}>
            {rendement}
          </span>
          <span style={{ fontSize:12, fontWeight:600, color:C.g2 }}>%</span>
        </div>
        <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>{ps ? "brut / an" : "net / an"}</span>
      </div>

      {/* ── COL 6: Cash-Flow mensuel ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:2 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>CASH-FLOW</span>
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em", color: cfPositif ? C.green : C.red, fontFamily:C.mono }}>
          {cfPositif ? "+" : ""}{cashflow.toLocaleString("fr-FR")} €
        </span>
        <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>/mois</span>
      </div>
    </div>
  );
}

export function PatrimoinePage({ onSelectAsset, onNewAsset, assets }) {
  const [hov,         setHov]         = useState(null);
  const [sort,        setSort]        = useState("rendement");
  const [sortDir,     setSortDir]     = useState("desc");
  const [lastAddedId, setLastAddedId] = useState(null);

  // Detect newly added asset (last in array) and highlight it briefly
  useEffect(()=>{
    if(assets.length > 0){
      const last = assets[assets.length-1];
      setLastAddedId(last.id);
      const t = setTimeout(()=>setLastAddedId(null), 4000);
      return ()=>clearTimeout(t);
    }
  },[assets.length]);

  const totalCout      = assets.reduce((s,a)=>s+a.prixBien+a.fraisAgence+a.ameublement+a.fraisNotaire, 0);
  const totalVL        = assets.reduce((s,a)=>s+a.vl, 0);
  const totalLoyerBrut = assets.reduce((s,a)=>{
    const ps = a.perfSim;
    if (ps && ps.loyerMensuel > 0) return s + ps.loyerMensuel * 12;
    return s + (a.loyerAnnuel||0);
  }, 0);
  const totalCoutSim   = assets.reduce((s,a)=>{
    const ps = a.perfSim;
    if (ps && ps.prixBien > 0) return s + (ps.prixBien||0)+(ps.fraisNotaire||0)+(ps.travaux||0)+(ps.mobilier||0);
    return s + a.prixBien + a.fraisNotaire;
  }, 0);
  const rnetMoyen      = totalCoutSim > 0 ? ((totalLoyerBrut / totalCoutSim)*100).toFixed(2) : "0.00";
  const plusValue      = totalVL - totalCout;

  const sorted = [...assets].sort((a,b)=>{
    const getV = x => {
      const ps = x.perfSim;
      if (sort==="rendement") {
        if (ps && ps.prixBien > 0) {
          const ct = (ps.prixBien||0)+(ps.fraisNotaire||0)+(ps.travaux||0)+(ps.mobilier||0);
          return ct > 0 ? ((ps.loyerMensuel||0)*12) / ct : 0;
        }
        return x.prixBien > 0 ? x.loyerAnnuel / (x.prixBien + x.fraisNotaire) : 0;
      }
      if (sort==="vl")       return x.vl;
      if (sort==="cout")     return x.prixBien+x.fraisAgence+x.ameublement+x.fraisNotaire;
      if (sort==="etat")     return isLoue(x.statut||x.etatLocatif)?1:0;
      if (sort==="cashflow") {
        if (ps && ps.prixBien > 0) {
          const pf = v => parseFloat(String(v||"0"))||0;
          const loyVac = pf(ps.loyerMensuel)*12*(1-pf(ps.vacance)/100);
          const ch = pf(ps.taxeFonciere)+pf(ps.chargesCopro)+pf(ps.assurancePNO)+pf(ps.gestionLocative)+pf(ps.entretien);
          const mt = pf(ps.montantPret), tm = pf(ps.tauxInteret)/100/12, nb = pf(ps.dureePret)*12;
          const mens = mt>0&&tm>0&&nb>0 ? mt*tm/(1-Math.pow(1+tm,-nb)) + mt*(pf(ps.tauxAssurance)/100)/12 : 0;
          return (loyVac - ch - mens*12) / 12;
        }
        return (x.loyerAnnuel-x.chargesCopro-x.taxeFonciere)/12;
      }
      return 0;
    };
    return sortDir==="desc" ? getV(b)-getV(a) : getV(a)-getV(b);
  });

  const handleSort = (col) => {
    if (sort===col) setSortDir(d=>d==="desc"?"asc":"desc");
    else { setSort(col); setSortDir("desc"); }
  };

  const SortBtn = ({col,label}) => {
    const active = sort===col;
    return (
      <button onClick={()=>handleSort(col)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, padding:0 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:active?C.blue:C.g3, textTransform:"uppercase", transition:"color 0.15s" }}>{label}</span>
        <span style={{ fontSize:9, color:active?C.blue:C.g3, opacity:active?1:0.4 }}>{active?(sortDir==="desc"?"↓":"↑"):"↕"}</span>
      </button>
    );
  };

  return (
    <main style={{ flex:1, overflowY:"auto", padding:"28px 32px 48px" }}>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <p style={{ fontSize:10, color:C.g2, fontFamily:C.mono, letterSpacing:"0.12em", marginBottom:6 }}>PORTEFEUILLE IMMOBILIER</p>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.04em", marginBottom:4 }}>Mes biens</h1>
          <p style={{ fontSize:13, color:C.g2 }}>{assets.length} actifs · {assets.filter(a=>isLoue(a.statut||a.etatLocatif)).length} loués · {assets.filter(a=>!isLoue(a.statut||a.etatLocatif)).length} vide</p>
        </div>
        <button onClick={onNewAsset} style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, letterSpacing:"0.04em", boxShadow:`0 4px 20px ${C.blueGlow}`, transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,255,0.5)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 20px ${C.blueGlow}`;}}>
          <I.Plus/> + Ajouter un bien
        </button>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[
          { label:"COÛT TOTAL PORTEFEUILLE", value:fmtEur(totalCout),  sub:"Acquisitions + frais",       color:C.w   },
          { label:"VALEUR LIQUIDATIVE",       value:fmtEur(totalVL),   sub:"Estimation marché actuelle", color:C.w   },
          { label:"PLUS-VALUE LATENTE",       value:(plusValue>=0?"+":"")+fmtEur(plusValue), sub:`${((plusValue/totalCout)*100).toFixed(1)}% vs coût total`, color:plusValue>=0?C.green:C.red },
          { label:"RENDEMENT BRUT MOYEN",      value:`${rnetMoyen} %`,   sub:"Loyer brut / coût total",  color:C.blue },
        ].map((m,i)=>(
          <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:"16px 18px" }}>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:8 }}>{m.label}</p>
            <p style={{ fontSize:18, fontWeight:800, color:m.color, letterSpacing:"-0.03em", marginBottom:3 }}>{m.value}</p>
            <p style={{ fontSize:10, color:C.g3 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>

        {/* Column headers */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"2fr 1.2fr 1.5fr 0.9fr 1fr 0.9fr",
          background:"#08080A",
          borderBottom:`1px solid ${C.border}`,
        }}>
          {[
            { key:null,        label:"BIEN",        pad:"14px 18px" },
            { key:"cout",      label:"COÛT",        pad:"12px 16px" },
            { key:"vl",        label:"VL ESTIMÉE",  pad:"12px 16px" },
            { key:"etat",      label:"ÉTAT",        pad:"12px 14px" },
            { key:"rendement", label:"RENDEMENT",   pad:"12px 16px" },
            { key:"cashflow",  label:"CASH-FLOW",   pad:"12px 16px" },
          ].map((col,i)=>(
            <div key={i} style={{ padding:col.pad, borderLeft:i>0?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center" }}>
              {col.key
                ? <SortBtn col={col.key} label={col.label}/>
                : <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3 }}>{col.label}</span>
              }
            </div>
          ))}
        </div>

        {/* New-asset toast */}
        {lastAddedId && assets.find(a=>a.id===lastAddedId) && (
          <div style={{ padding:"11px 18px", borderBottom:`1px solid ${C.greenBord}`, background:"linear-gradient(90deg,rgba(16,185,129,0.07),rgba(16,185,129,0.02))", display:"flex", alignItems:"center", gap:10, animation:"fadeUp 0.4s ease" }}>
            <div style={{ width:22, height:22, borderRadius:6, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p style={{ fontSize:11, color:C.green, fontWeight:600 }}>
              <strong>{assets.find(a=>a.id===lastAddedId)?.name}</strong> — ajouté à Mes biens
            </p>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginLeft:"auto" }}>à l'instant</span>
          </div>
        )}

        {/* Rows */}
        {sorted.length===0?(
          <div style={{ padding:"48px 24px", textAlign:"center", gridColumn:"1/-1" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.blue, marginBottom:14 }}><I.Building/></div>
            <p style={{ fontSize:14, fontWeight:600, color:C.g1, marginBottom:4 }}>Votre portefeuille est vide</p>
            <p style={{ fontSize:12, color:C.g2 }}>Ajoutez votre premier bien immobilier pour commencer à piloter votre patrimoine.</p>
          </div>
        ):sorted.map(a=>(
          <AssetRow key={a.id} a={a} hov={hov} setHov={setHov} onSelectAsset={onSelectAsset} isNew={a.id===lastAddedId}/>
        ))}

        {/* Footer totals */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"2fr 1.2fr 1.5fr 0.9fr 1fr 0.9fr",
          background:"#08080A", borderTop:`1px solid ${C.border}`,
        }}>
          <div style={{ padding:"11px 18px", display:"flex", alignItems:"center" }}>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>TOTAUX · {assets.length} ACTIFS</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.w, fontFamily:C.mono }}>{fmtEur(totalCout)}</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.w, fontFamily:C.mono }}>{fmtEur(totalVL)}</span>
            <span style={{ fontSize:9.5, color:C.green, fontFamily:C.mono }}>+{((plusValue/totalCout)*100).toFixed(1)}%</span>
          </div>
          <div style={{ padding:"11px 14px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>{assets.filter(a=>isLoue(a.statut||a.etatLocatif)).length}/{assets.length}</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.blue, fontFamily:C.mono }}>{rnetMoyen}%</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
            {(()=>{
              const totalCF = assets.reduce((s,a)=>s+Math.round((a.loyerAnnuel-a.chargesCopro-a.taxeFonciere)/12),0);
              return <span style={{ fontSize:12, fontWeight:800, fontFamily:C.mono, color: totalCF>=0?C.green:C.red }}>{totalCF>=0?"+":""}{totalCF.toLocaleString("fr-FR")} €</span>;
            })()}
          </div>
        </div>
      </div>

      {/* ── METHODOLOGY NOTE ── */}
      <div style={{ marginTop:14, padding:"12px 16px", background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:24, height:24, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
        <p style={{ fontSize:10, color:C.g2 }}>
          <strong style={{ color:C.g1 }}>Valeur Liquidative</strong> calculée par IA : croisement des données DVF/Étalab, ventes des notaires de la zone, état du bien et DPE · Mise à jour mensuelle ·
          <strong style={{ color:C.g1 }}> Rendement net</strong> = (Loyers annuels − Charges copro − Taxe foncière) ÷ Prix du bien
        </p>
      </div>
    </main>
  );
}
