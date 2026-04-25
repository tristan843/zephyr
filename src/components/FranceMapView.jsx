import { useState } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

/* ════════════════════════════════════════
   FRANCE MAP VIEW — Vue Investissement
════════════════════════════════════════ */
const CITY_COORDS = {
  "paris":{x:48.5,y:18.5},"marseille":{x:51.5,y:72},"lyon":{x:55,y:55},"toulouse":{x:32,y:70},"nice":{x:65,y:70},
  "nantes":{x:22,y:40},"strasbourg":{x:73,y:22},"montpellier":{x:44,y:72},"bordeaux":{x:23,y:62},"lille":{x:48,y:6},
  "rennes":{x:18,y:30},"reims":{x:55,y:16},"toulon":{x:56,y:74},"saint-étienne":{x:52,y:57},"le havre":{x:31,y:16},
  "grenoble":{x:58,y:58},"dijon":{x:58,y:38},"angers":{x:23,y:38},"nîmes":{x:49,y:70},"clermont-ferrand":{x:43,y:55},
  "le mans":{x:30,y:32},"aix-en-provence":{x:53,y:72},"brest":{x:6,y:24},"tours":{x:31,y:40},"amiens":{x:45,y:12},
  "limoges":{x:33,y:55},"metz":{x:67,y:18},"perpignan":{x:40,y:78},"besançon":{x:63,y:38},"orléans":{x:38,y:32},
  "rouen":{x:35,y:16},"caen":{x:25,y:16},"mulhouse":{x:72,y:30},"nancy":{x:66,y:22},"pau":{x:24,y:74},
  "bayonne":{x:18,y:74},"biarritz":{x:17,y:74},"la rochelle":{x:19,y:52},"poitiers":{x:30,y:48},"valence":{x:54,y:60},
  "avignon":{x:50,y:68},"cannes":{x:63,y:72},"antibes":{x:64,y:72},"ajaccio":{x:76,y:78},"bastia":{x:80,y:70},
  "colmar":{x:72,y:26},"troyes":{x:52,y:26},"bourges":{x:40,y:42},"chambéry":{x:60,y:55},"annecy":{x:62,y:52},
  "saint-nazaire":{x:17,y:42},"lorient":{x:11,y:32},"quimper":{x:7,y:30},"vannes":{x:13,y:34},
  "évreux":{x:35,y:20},"chartres":{x:36,y:26},"auxerre":{x:50,y:32},"mâcon":{x:56,y:46},"béziers":{x:42,y:74},
  "dunkerque":{x:45,y:3},"calais":{x:40,y:4},"saint-malo":{x:15,y:26},"arcachon":{x:20,y:64},
  "angoulême":{x:28,y:56},"agen":{x:28,y:66},"tarbes":{x:28,y:76},"rodez":{x:40,y:62},"cahors":{x:34,y:64},
  "périgueux":{x:28,y:60},"niort":{x:24,y:50},"rochefort":{x:20,y:54},"vichy":{x:44,y:50},
  "saint-denis":{x:49,y:18},"versailles":{x:47,y:19},"boulogne-billancourt":{x:48,y:19},
  "argenteuil":{x:48,y:17},"montreuil":{x:49.5,y:18.5},"créteil":{x:49.5,y:19.5},
  "eysines":{x:22,y:62},"mérignac":{x:22,y:63},"pessac":{x:22,y:64},"talence":{x:23,y:63},
};

function cityToCoords(ville, cp) {
  if (!ville && !cp) return null;
  const v = (ville||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
  // Try exact match
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const cn = city.normalize("NFD").replace(/[̀-ͯ]/g,"");
    if (cn === v || v.includes(cn) || cn.includes(v)) return coords;
  }
  // Fallback by department (first 2 digits of CP)
  if (cp) {
    const dept = String(cp).slice(0,2);
    const deptCoords = {
      "01":{x:58,y:50},"02":{x:52,y:12},"03":{x:44,y:50},"04":{x:58,y:66},"05":{x:60,y:62},
      "06":{x:65,y:70},"07":{x:50,y:62},"08":{x:58,y:12},"09":{x:32,y:76},"10":{x:52,y:26},
      "11":{x:40,y:76},"12":{x:40,y:62},"13":{x:52,y:72},"14":{x:25,y:16},"15":{x:40,y:58},
      "16":{x:28,y:56},"17":{x:20,y:54},"18":{x:42,y:40},"19":{x:34,y:56},"20":{x:78,y:74},
      "21":{x:58,y:38},"22":{x:12,y:26},"23":{x:36,y:52},"24":{x:28,y:60},"25":{x:64,y:38},
      "26":{x:54,y:62},"27":{x:35,y:18},"28":{x:36,y:26},"29":{x:7,y:26},"30":{x:48,y:68},
      "31":{x:32,y:72},"32":{x:28,y:70},"33":{x:22,y:62},"34":{x:44,y:72},"35":{x:18,y:30},
      "36":{x:38,y:44},"37":{x:31,y:40},"38":{x:58,y:58},"39":{x:62,y:42},"40":{x:22,y:70},
      "41":{x:34,y:36},"42":{x:50,y:56},"43":{x:46,y:58},"44":{x:18,y:40},"45":{x:38,y:32},
      "46":{x:34,y:62},"47":{x:28,y:66},"48":{x:44,y:64},"49":{x:24,y:38},"50":{x:20,y:18},
      "51":{x:56,y:18},"52":{x:58,y:28},"53":{x:24,y:32},"54":{x:66,y:22},"55":{x:62,y:18},
      "56":{x:12,y:34},"57":{x:68,y:18},"58":{x:48,y:38},"59":{x:48,y:6},"60":{x:46,y:14},
      "61":{x:28,y:26},"62":{x:42,y:6},"63":{x:44,y:54},"64":{x:20,y:74},"65":{x:28,y:76},
      "66":{x:40,y:78},"67":{x:74,y:22},"68":{x:72,y:28},"69":{x:54,y:54},"70":{x:64,y:32},
      "71":{x:54,y:44},"72":{x:30,y:32},"73":{x:60,y:56},"74":{x:62,y:52},"75":{x:48.5,y:18.5},
      "76":{x:34,y:14},"77":{x:50,y:22},"78":{x:44,y:20},"79":{x:24,y:50},"80":{x:44,y:10},
      "81":{x:36,y:68},"82":{x:32,y:66},"83":{x:58,y:74},"84":{x:50,y:68},"85":{x:18,y:46},
      "86":{x:30,y:48},"87":{x:33,y:54},"88":{x:68,y:26},"89":{x:50,y:32},"90":{x:68,y:32},
      "91":{x:46,y:22},"92":{x:47,y:19},"93":{x:49,y:18},"94":{x:49,y:20},"95":{x:46,y:16},
      "2A":{x:76,y:78},"2B":{x:80,y:70},
    };
    if (deptCoords[dept]) return deptCoords[dept];
  }
  return null;
}

function FranceMapView({ assets, onSelectAsset }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x:0, y:0 });

  const markers = (assets||[]).map(a => {
    const coords = cityToCoords(a.ville, a.codePostal);
    if (!coords) return null;
    const ps = a.perfSim || {};
    const rdtBrut = ps.prixBien && ps.loyerMensuel ? ((ps.loyerMensuel*12)/(ps.prixBien)*100).toFixed(1) : null;
    return { ...a, cx: coords.x, cy: coords.y, rdtBrut };
  }).filter(Boolean);

  const totalAssets = assets?.length || 0;
  const totalValue = (assets||[]).reduce((s,a) => s + (a.perfSim?.prixBien || a.prixBien || 0), 0);
  const totalLoyer = (assets||[]).reduce((s,a) => s + (Number(a.perfSim?.loyerMensuel || a.loyer || 0)), 0);
  const mapped = markers.length;

  return (
    <main style={{ flex:1, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden", background:"radial-gradient(ellipse at 50% 30%, #0d1020 0%, #09090B 70%)" }}>

      {/* ── Top stats bar ── */}
      <div style={{ display:"flex", gap:12, padding:"16px 24px", flexShrink:0, borderBottom:"1px solid "+C.border }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.blue, boxShadow:"0 0 8px "+C.blueGlow }}/>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em" }}>VUE INVESTISSEMENT</span>
        </div>
        <div style={{ flex:1 }}/>
        {[
          { label:"Biens", value:totalAssets, color:C.blue },
          { label:"Cartographiés", value:mapped+"/"+totalAssets, color:C.green },
          { label:"Valeur totale", value:totalValue?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(totalValue):"—", color:C.blue },
          { label:"Loyers mensuels", value:totalLoyer?new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(totalLoyer):"—", color:C.green },
        ].map((s,i) => (
          <div key={i} style={{ background:"#0c0c0f", border:"1px solid "+C.border, borderRadius:8, padding:"6px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>{s.label}</span>
            <span style={{ fontSize:13, fontWeight:800, color:s.color, fontFamily:C.mono }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Map area ── */}
      <div style={{ flex:1, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
        onMouseMove={e=>setMousePos({x:e.clientX, y:e.clientY})}>

        <svg viewBox="0 0 100 85" style={{ maxWidth:700, maxHeight:"calc(100vh - 160px)", filter:"drop-shadow(0 0 40px rgba(59,130,246,0.06))" }}>
          {/* France outline */}
          <path d="M48,3 L53,4 56,3 58,5 62,5 65,8 68,8 72,11 75,14 76,18 74,22 76,26 74,30 72,32 70,34 68,34 66,36 64,38 64,42 62,46 64,48 62,50 62,54 60,56 62,58 64,62 66,66 68,68 66,70 62,72 58,74 56,74 54,76 50,74 48,72 46,74 42,76 40,78 38,76 36,74 32,76 28,76 24,74 22,72 20,70 18,68 18,64 20,62 22,60 20,56 18,52 16,48 18,44 18,42 16,38 14,36 16,34 18,30 16,26 14,24 10,24 8,26 6,26 8,22 10,20 14,18 18,16 22,16 26,14 30,14 32,12 34,14 36,12 38,10 40,8 44,6 46,4 48,3Z"
            fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.18)" strokeWidth="0.4" strokeLinejoin="round"/>

          {/* Corse */}
          <path d="M76,66 L78,65 80,66 82,68 82,72 80,76 78,78 76,78 74,76 74,72 76,68Z"
            fill="rgba(59,130,246,0.03)" stroke="rgba(59,130,246,0.18)" strokeWidth="0.4" strokeLinejoin="round"/>

          {/* Grid lines */}
          {[20,40,60,80].map(y => <line key={"h"+y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(59,130,246,0.04)" strokeWidth="0.15"/>)}
          {[20,40,60,80].map(x => <line key={"v"+x} x1={x} y1="0" x2={x} y2="85" stroke="rgba(59,130,246,0.04)" strokeWidth="0.15"/>)}

          {/* Asset markers */}
          {markers.map((m, i) => {
            const isHov = hovered === m.id;
            return (
              <g key={m.id} style={{ cursor:"pointer" }}
                onMouseEnter={()=>setHovered(m.id)} onMouseLeave={()=>setHovered(null)}
                onClick={()=>onSelectAsset && onSelectAsset(m)}>
                {/* Pulse ring */}
                <circle cx={m.cx} cy={m.cy} r={isHov?3.5:2.5} fill="none" stroke={C.blue} strokeWidth="0.3" opacity="0.4">
                  <animate attributeName="r" from={isHov?"3":"2"} to={isHov?"6":"4.5"} dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite"/>
                </circle>
                {/* Glow */}
                <circle cx={m.cx} cy={m.cy} r={isHov?2:1.2} fill={C.blueGlow} opacity="0.6"/>
                {/* Core dot */}
                <circle cx={m.cx} cy={m.cy} r={isHov?1.4:0.8} fill={C.blue} stroke="#fff" strokeWidth="0.25"/>
                {/* Label on hover */}
                {isHov && (
                  <text x={m.cx} y={m.cy - 3} textAnchor="middle" fill={C.w} fontSize="2.2" fontWeight="700" fontFamily="system-ui">{m.name||m.ville}</text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip (follows mouse) */}
        {hovered && (() => {
          const m = markers.find(x=>x.id===hovered);
          if (!m) return null;
          const isLoue = (m.statut||m.etatLocatif||"").toLowerCase().includes("lou");
          return (
            <div style={{ position:"fixed", left:mousePos.x+16, top:mousePos.y-10, zIndex:999, pointerEvents:"none", animation:"fadeUp 0.15s ease" }}>
              <div style={{ background:"#141418", border:"1px solid "+C.border2, borderRadius:12, padding:"12px 16px", boxShadow:"0 12px 40px rgba(0,0,0,0.7)", minWidth:200, maxWidth:280 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:C.blueSub, border:"1px solid rgba(59,130,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.Home/></div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:800, color:C.w }}>{m.name||"Bien"}</p>
                    <p style={{ fontSize:10, color:C.g2 }}>{m.ville||""} {m.codePostal||""}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {m.rdtBrut && (
                    <span style={{ fontSize:10, fontWeight:700, color:C.green, fontFamily:C.mono, background:C.greenSub, border:"1px solid "+C.greenBord, padding:"2px 8px", borderRadius:5 }}>{m.rdtBrut}% brut</span>
                  )}
                  <span style={{ fontSize:10, fontWeight:600, color:isLoue?C.green:C.yellow, fontFamily:C.mono, background:isLoue?C.greenSub:C.yellowSub, padding:"2px 8px", borderRadius:5, border:"1px solid "+(isLoue?C.greenBord:"rgba(245,158,11,0.2)") }}>{isLoue?"Loué":"Disponible"}</span>
                  {(m.loyer||m.perfSim?.loyerMensuel) && (
                    <span style={{ fontSize:10, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{m.perfSim?.loyerMensuel||m.loyer} €/mois</span>
                  )}
                </div>
                <p style={{ fontSize:8, color:C.g3, marginTop:6, fontFamily:C.mono }}>CLIQUER POUR OUVRIR LA FICHE</p>
              </div>
            </div>
          );
        })()}

        {/* Empty state */}
        {markers.length === 0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:C.blueSub, border:"1px solid rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.MapPin/></div>
            <p style={{ fontSize:15, fontWeight:700, color:C.g1 }}>Aucun bien géolocalisé</p>
            <p style={{ fontSize:12, color:C.g2, textAlign:"center", maxWidth:320, lineHeight:1.6 }}>Renseignez la ville ou le code postal de vos biens dans l'onglet Patrimoine pour les voir apparaître sur la carte.</p>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:20, padding:"10px 20px", borderTop:"1px solid "+C.border, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:C.blue, boxShadow:"0 0 6px "+C.blueGlow }}/>
          <span style={{ fontSize:9, color:C.g2, fontFamily:C.mono }}>Bien immobilier</span>
        </div>
        <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>Survolez pour détails · Cliquez pour ouvrir</span>
      </div>
    </main>
  );
}

export { FranceMapView };
