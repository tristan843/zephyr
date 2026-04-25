import { useState } from "react";
import { C } from "../../tokens/colors.js";
import { I } from "../Icons.jsx";

export function DataTile({ icon:TIcon, label, value, accent, full }) {
  const [tip,setTip] = useState(false);
  return (
    <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", gridColumn:full?"span 2":"span 1", transition:"border-color 0.15s" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#2a2a2a"}
      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:15, fontWeight:700, color:accent?C.blue:C.w, letterSpacing:"-0.02em" }}>{value}</span>
        <div style={{ position:"relative" }}>
          <button onMouseEnter={()=>setTip(true)} onMouseLeave={()=>setTip(false)}
            style={{ width:18, height:18, borderRadius:"50%", background:C.blueSub, border:`1px solid rgba(0,123,255,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"default", color:C.blue }}>
            <I.Check/>
          </button>
          {tip&&<div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"#1a1a1a", border:`1px solid #2a2a2a`, borderRadius:7, padding:"5px 10px", fontSize:10, color:C.g1, whiteSpace:"nowrap", zIndex:50, boxShadow:"0 8px 24px rgba(0,0,0,0.5)", pointerEvents:"none" }}>
            ✓ Vérifié par OCR
            <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", width:0, height:0, borderLeft:"4px solid transparent", borderRight:"4px solid transparent", borderTop:"4px solid #2a2a2a" }}/>
          </div>}
        </div>
      </div>
    </div>
  );
}
