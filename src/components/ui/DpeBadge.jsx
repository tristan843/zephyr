import { C } from "../../tokens/colors.js";

const DPE_MAP = {
  A:{ color:"#22c55e", score:{ A:"35", B:"70", C:"148", D:"210", E:"280" } },
  B:{ color:"#84cc16" },
  C:{ color:"#eab308" },
  D:{ color:"#f97316" },
  E:{ color:"#ef4444" },
};

export function DpeBadge({ letter, label, score }) {
  const cfg = DPE_MAP[letter] || DPE_MAP.C;
  const letters = ["A","B","C","D","E","F","G"];
  const widths  = { A:"100%",B:"84%",C:"68%",D:"54%",E:"40%",F:"28%",G:"16%" };
  return (
    <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
      <p style={{ fontSize:9, letterSpacing:"0.1em", color:C.g2, fontFamily:C.mono, marginBottom:10 }}>{label}</p>
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
        <div style={{ width:42, height:42, borderRadius:10, background:`${cfg.color}18`, border:`1.5px solid ${cfg.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:cfg.color, boxShadow:`0 0 16px ${cfg.color}30` }}>{letter}</div>
        <div><p style={{ fontSize:11, color:C.w, fontWeight:600 }}>{score}</p><p style={{ fontSize:10, color:C.g2 }}>kWh/m²/an</p></div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        {letters.map(l=>{
          const lc = DPE_MAP[l]||{color:C.g3};
          const active = l===letter;
          return (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:9, fontFamily:C.mono, color:active?cfg.color:C.g3, width:10, textAlign:"center", fontWeight:active?700:400 }}>{l}</span>
              <div style={{ flex:1, height:active?5:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:widths[l]||"10%", height:"100%", background:active?cfg.color:`${lc.color}44`, borderRadius:99, boxShadow:active?`0 0 8px ${cfg.color}`:"none" }}/>
              </div>
              {active&&<span style={{ fontSize:9, color:cfg.color, fontFamily:C.mono }}>◄</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
