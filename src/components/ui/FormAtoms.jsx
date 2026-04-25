import { useState } from "react";
import { C } from "../../tokens/colors.js";

export const inputBase = {
  width:"100%", background:"#08080A",
  border:`1px solid #252525`, borderRadius:8,
  padding:"9px 12px", color:"#fff",
  fontSize:12, fontFamily:C.font,
  outline:"none", transition:"border-color 0.15s, box-shadow 0.15s",
  appearance:"none", WebkitAppearance:"none",
};

export function FormField({ label, icon:FIcon, children, col2 }) {
  return (
    <div style={{ gridColumn: col2 ? "span 2" : "span 1" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {FIcon && <span style={{ color:"#374151" }}><FIcon/></span>}
        <label style={{ fontSize:9, letterSpacing:"0.12em", color:"#4b5563", fontFamily:C.mono, textTransform:"uppercase" }}>{label}</label>
      </div>
      {children}
    </div>
  );
}

export function FInput({ value, onChange, placeholder, type="text" }) {
  const [focus, setFocus] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ ...inputBase, borderColor: focus ? "#007BFF" : "#252525", boxShadow: focus ? "0 0 0 2px rgba(0,123,255,0.12)" : "none" }}
      onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
  );
}

export function FSelect({ value, onChange, options }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <select value={value} onChange={onChange}
        style={{ ...inputBase, borderColor: focus ? "#007BFF" : "#252525", boxShadow: focus ? "0 0 0 2px rgba(0,123,255,0.12)" : "none", paddingRight:32, cursor:"pointer", color: value ? "#fff" : "#4b5563", backgroundColor:"#0a0a0a" }}
        onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}>
        {options.map(o=><option key={o.v||o} value={o.v||o} style={{ background:"#1a1a1a" }}>{o.l||o}</option>)}
      </select>
      <div style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#4b5563" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  );
}

export function FTextarea({ value, onChange, placeholder, rows=4 }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ ...inputBase, borderColor: focus ? "#007BFF" : "#252525", boxShadow: focus ? "0 0 0 2px rgba(0,123,255,0.12)" : "none", resize:"vertical", lineHeight:1.6 }}
      onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
  );
}

export function DPESelector({ label, value, onChange }) {
  const letters = ["A","B","C","D","E","F","G"];
  const colors  = { A:"#22c55e", B:"#84cc16", C:"#eab308", D:"#f97316", E:"#ef4444", F:"#dc2626", G:"#991b1b" };
  return (
    <div>
      <label style={{ fontSize:9, letterSpacing:"0.12em", color:"#4b5563", fontFamily:C.mono, textTransform:"uppercase", display:"block", marginBottom:8 }}>{label}</label>
      <div style={{ display:"flex", gap:5 }}>
        {letters.map(l=>{
          const active = value===l;
          const col = colors[l];
          return (
            <button key={l} onClick={()=>onChange(l)}
              style={{ flex:1, height:36, borderRadius:7, border:`1.5px solid ${active ? col : "#252525"}`, background: active ? `${col}20` : "#0a0a0a", color: active ? col : "#4b5563", fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.15s", boxShadow: active ? `0 0 10px ${col}40` : "none" }}>
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ColorDot({ color }) {
  return (
    <div style={{ width:20, height:20, borderRadius:"50%", background:color||"#007BFF", border:"2px solid #252525", flexShrink:0, boxShadow:`0 0 8px ${color||"#007BFF"}60` }}/>
  );
}
