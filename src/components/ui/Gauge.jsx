import { C } from "../../tokens/colors.js";

export function Gauge({ value, color }) {
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{value}%</span>
        <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>100%</span>
      </div>
      <div style={{ height:3, background:"#1f1f1f", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${value}%`, borderRadius:99, background:`linear-gradient(90deg,${color},${color}aa)`, boxShadow:`0 0 8px ${color}88`, transition:"width 1s ease" }}/>
      </div>
    </div>
  );
}
