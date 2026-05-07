import { useState } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

export function AttachTenantPopup({ tenant, assets, onAttach, onSkip }) {
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
