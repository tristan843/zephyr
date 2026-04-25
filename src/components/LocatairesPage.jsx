import { useState } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

function getStatut(daysLate) {
  if (daysLate === 0)  return { label:"À jour",  color:"#10B981", bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.22)", dot:"#10B981" };
  if (daysLate < 10)   return { label:"En retard", color:"#F59E0B", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.22)",  dot:"#F59E0B", pulse:true };
  return               { label:"Impayé",  color:"#EF4444", bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.22)",  dot:"#EF4444", pulse:true };
}

function TenantRow({ t, hov, setHov, onSelectTenant }) {
  const st = getStatut(t.daysLate);
  const isHov = hov === t.id;
  return (
    <div
      onMouseEnter={()=>setHov(t.id)}
      onMouseLeave={()=>setHov(null)}
      onClick={()=>onSelectTenant&&onSelectTenant(t)}
      style={{
        display:"grid",
        gridTemplateColumns:"1.2fr 1fr 1.4fr 1.6fr 0.9fr 1.1fr 0.9fr",
        alignItems:"center",
        padding:"0 20px",
        height:56,
        gap:12,
        borderBottom:`1px solid ${C.border}`,
        background: isHov ? "#161616" : "transparent",
        transition:"background 0.15s",
        cursor: onSelectTenant ? "pointer" : "default",
        borderLeft: isHov && onSelectTenant ? `2px solid ${C.blue}` : "2px solid transparent",
      }}
    >
      {/* Nom */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg, ${st.color}30, ${st.color}18)`,
          border:`1px solid ${st.color}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, fontWeight:700, color:st.color,
        }}>
          {t.prenom[0]}{t.nom[0]}
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:C.w }}>{t.nom}</span>
      </div>

      {/* Prénom */}
      <span style={{ fontSize:13, color:C.g1 }}>{t.prenom}</span>

      {/* Bien rattaché */}
      <div style={{ display:"flex", alignItems:"center", gap:6, overflow:"hidden" }}>
        {t.bienName ? (
          <>
            <div style={{ width:22, height:22, borderRadius:6, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}><I.Home/></div>
            <span style={{ fontSize:11, fontWeight:600, color:C.g1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.bienName}</span>
          </>
        ) : (
          <span style={{ fontSize:10, color:C.g3, fontStyle:"italic" }}>Non rattaché</span>
        )}
      </div>

      {/* Adresse */}
      <div style={{ display:"flex", alignItems:"center", gap:5, overflow:"hidden" }}>
        <span style={{ color:C.g3, flexShrink:0 }}><I.MapPin/></span>
        <span style={{ fontSize:12, color:C.g2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.adresse}</span>
      </div>

      {/* Ville */}
      <span style={{ fontSize:12, color:C.g2 }}>{t.ville}</span>

      {/* Téléphone */}
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ color:C.g3, flexShrink:0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.5 2 2 0 0 1 3.6 2.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <span style={{ fontSize:12, color:C.g2, fontFamily:C.mono }}>{t.tel}</span>
      </div>

      {/* Statut */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:6,
        background:st.bg, border:`1px solid ${st.border}`,
        borderRadius:99, padding:"4px 10px",
        width:"fit-content",
      }}>
        <span style={{
          width:6, height:6, borderRadius:"50%", background:st.dot, flexShrink:0,
          animation: st.pulse ? "pulse 1.8s infinite" : "none",
        }}/>
        <span style={{ fontSize:10, fontWeight:700, color:st.color, fontFamily:C.mono, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
          {st.label}
        </span>
        {t.daysLate > 0 && (
          <span style={{ fontSize:9, color:st.color, opacity:.7, fontFamily:C.mono }}>
            J+{t.daysLate}
          </span>
        )}
      </div>
    </div>
  );
}

export function LocatairesPage({ onNewTenant, onSelectTenant, tenants=[] }) {
  const [hov,    setHov]    = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const [searchFocus, setSearchFocus] = useState(false);

  const aJour   = tenants.filter(t=>t.daysLate===0).length;
  const retard  = tenants.filter(t=>t.daysLate>0 && t.daysLate<10).length;
  const impayes = tenants.filter(t=>t.daysLate>=10).length;

  const filtered = tenants.filter(t=>{
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.nom.toLowerCase().includes(q) ||
      t.prenom.toLowerCase().includes(q) ||
      t.adresse.toLowerCase().includes(q) ||
      t.ville.toLowerCase().includes(q) ||
      t.mail.toLowerCase().includes(q);
    const matchFilter =
      filter==="tous"    ? true :
      filter==="ajour"   ? t.daysLate===0 :
      filter==="retard"  ? (t.daysLate>0 && t.daysLate<10) :
      filter==="impayes" ? t.daysLate>=10 : true;
    return matchSearch && matchFilter;
  });

  const COLS = ["Nom","Prénom","Bien rattaché","Adresse","Ville","Téléphone","État"];

  return (
    <main style={{ flex:1, overflowY:"auto", padding:"28px 32px 40px", display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <p style={{ fontSize:11, color:C.g2, fontFamily:C.mono, letterSpacing:"0.1em", marginBottom:6 }}>GESTION LOCATIVE</p>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>Locataires</h1>
          <p style={{ fontSize:13, color:C.g2, marginTop:4 }}>{tenants.length} locataires actifs · {impayes} impayé{impayes>1?"s":""}</p>
        </div>
        <button onClick={onNewTenant} style={{
          background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10,
          padding:"9px 18px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer",
          display:"flex", alignItems:"center", gap:7, letterSpacing:"0.06em",
          boxShadow:`0 4px 20px ${C.blueGlow}`, transition:"all 0.15s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)"}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${C.blueGlow}`;e.currentTarget.style.transform="none"}}>
          <I.Plus/> + Nouveau locataire
        </button>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"À JOUR",    value:aJour,   color:C.green,  bg:C.greenSub,  sub:`sur ${tenants.length} locataires`,   filter:"ajour"   },
          { label:"EN RETARD", value:retard,  color:C.yellow, bg:C.yellowSub, sub:"entre 1 et 9 jours",                 filter:"retard"  },
          { label:"IMPAYÉS",   value:impayes, color:C.red,    bg:C.redSub,    sub:"10 jours et plus",                   filter:"impayes" },
        ].map(k=>(
          <button key={k.filter} onClick={()=>setFilter(filter===k.filter?"tous":k.filter)}
            style={{
              background: filter===k.filter ? k.bg : C.card,
              border:`1px solid ${filter===k.filter ? k.color+"44" : C.border}`,
              borderRadius:12, padding:"16px 18px", cursor:"pointer", textAlign:"left",
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>{if(filter!==k.filter){e.currentTarget.style.borderColor=k.color+"33";e.currentTarget.style.background="#161616"}}}
            onMouseLeave={e=>{if(filter!==k.filter){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card}}}>
            <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:filter===k.filter?k.color:C.g2, marginBottom:8 }}>{k.label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:filter===k.filter?k.color:C.w, letterSpacing:"-0.04em", lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:11, color:C.g2, marginTop:6 }}>{k.sub}</p>
          </button>
        ))}
      </div>

      {/* ── TABLE CARD ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", flex:1 }}>

        {/* Table toolbar */}
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, maxWidth:320 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.g3, pointerEvents:"none" }}>
              <I.Search/>
            </span>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un locataire..."
              onFocus={()=>setSearchFocus(true)}
              onBlur={()=>setSearchFocus(false)}
              style={{
                width:"100%", background:"#0f0f0f",
                border:`1px solid ${searchFocus?C.blue:"#252525"}`,
                borderRadius:9, padding:"8px 12px 8px 34px",
                color:C.w, fontSize:12, fontFamily:C.font, outline:"none",
                boxShadow: searchFocus?`0 0 0 2px rgba(0,123,255,0.12)`:"none",
                transition:"all 0.15s",
              }}
            />
            {search && (
              <button onClick={()=>setSearch("")}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.g2, cursor:"pointer", padding:0 }}>
                <I.X/>
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {[{v:"tous",l:"Tous"},{v:"ajour",l:"À jour"},{v:"retard",l:"En retard"},{v:"impayes",l:"Impayés"}].map(f=>{
              const active = filter===f.v;
              const fCol = f.v==="ajour"?C.green:f.v==="retard"?C.yellow:f.v==="impayes"?C.red:C.blue;
              return (
                <button key={f.v} onClick={()=>setFilter(filter===f.v?"tous":f.v)}
                  style={{
                    background:active?(f.v==="tous"?C.blueSub:`${fCol}15`):"transparent",
                    border:`1px solid ${active?(f.v==="tous"?C.blue:fCol+"44"):"#252525"}`,
                    borderRadius:7, padding:"5px 12px",
                    color:active?(f.v==="tous"?C.blue:fCol):C.g2,
                    fontSize:11, cursor:"pointer", fontWeight:active?600:400,
                    transition:"all 0.15s",
                  }}>
                  {f.l}
                </button>
              );
            })}
            <span style={{ fontSize:11, color:C.g3, fontFamily:C.mono, marginLeft:4 }}>{filtered.length} résultat{filtered.length>1?"s":""}</span>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"1.2fr 1fr 1.4fr 1.6fr 0.9fr 1.1fr 0.9fr",
          padding:"0 20px", height:38, gap:12,
          borderBottom:`1px solid ${C.border}`,
          alignItems:"center",
          background:"#0f0f0f",
        }}>
          {COLS.map(col=>(
            <span key={col} style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, textTransform:"uppercase" }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.blue, marginBottom:12 }}><I.Users/></div>
              <p style={{ fontSize:14, color:C.g2 }}>{tenants.length===0?"Aucun locataire pour le moment.":"Aucun locataire ne correspond à votre recherche."}</p>
              {tenants.length===0&&<p style={{ fontSize:11, color:C.g3, marginTop:6 }}>Ajoutez votre premier locataire via le bouton ci-dessus.</p>}
            </div>
          ) : (
            filtered.map(t=><TenantRow key={t.id} t={t} hov={hov} setHov={setHov} onSelectTenant={onSelectTenant}/>)
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:"12px 20px", borderTop:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"#0f0f0f",
        }}>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>
            {filtered.length} locataire{filtered.length>1?"s":""} affichés · Loyers du 1er du mois
          </span>
          <div style={{ display:"flex", gap:16 }}>
            {[
              { color:C.green,  label:"À jour" },
              { color:C.yellow, label:"En retard (J+1 à J+9)" },
              { color:C.red,    label:"Impayé (J+10 et +)" },
            ].map(l=>(
              <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:l.color, display:"inline-block" }}/>
                <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
