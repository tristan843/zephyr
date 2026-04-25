import { useState, useRef, useEffect } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

/* ── French cities database (top 250) for offline autocomplete ── */
const FR_CITIES = [
["Paris","75000","Île-de-France"],["Marseille","13000","Provence-Alpes-Côte d'Azur"],["Lyon","69000","Auvergne-Rhône-Alpes"],
["Toulouse","31000","Occitanie"],["Nice","06000","Provence-Alpes-Côte d'Azur"],["Nantes","44000","Pays de la Loire"],
["Montpellier","34000","Occitanie"],["Strasbourg","67000","Grand Est"],["Bordeaux","33000","Nouvelle-Aquitaine"],
["Lille","59000","Hauts-de-France"],["Rennes","35000","Bretagne"],["Reims","51100","Grand Est"],
["Saint-Étienne","42000","Auvergne-Rhône-Alpes"],["Toulon","83000","Provence-Alpes-Côte d'Azur"],
["Le Havre","76600","Normandie"],["Grenoble","38000","Auvergne-Rhône-Alpes"],["Dijon","21000","Bourgogne-Franche-Comté"],
["Angers","49000","Pays de la Loire"],["Nîmes","30000","Occitanie"],["Villeurbanne","69100","Auvergne-Rhône-Alpes"],
["Clermont-Ferrand","63000","Auvergne-Rhône-Alpes"],["Le Mans","72000","Pays de la Loire"],
["Aix-en-Provence","13100","Provence-Alpes-Côte d'Azur"],["Brest","29200","Bretagne"],
["Tours","37000","Centre-Val de Loire"],["Amiens","80000","Hauts-de-France"],["Limoges","87000","Nouvelle-Aquitaine"],
["Annecy","74000","Auvergne-Rhône-Alpes"],["Perpignan","66000","Occitanie"],["Boulogne-Billancourt","92100","Île-de-France"],
["Metz","57000","Grand Est"],["Besançon","25000","Bourgogne-Franche-Comté"],["Orléans","45000","Centre-Val de Loire"],
["Rouen","76000","Normandie"],["Mulhouse","68100","Grand Est"],["Caen","14000","Normandie"],
["Nancy","54000","Grand Est"],["Saint-Denis","93200","Île-de-France"],["Argenteuil","95100","Île-de-France"],
["Montreuil","93100","Île-de-France"],["Roubaix","59100","Hauts-de-France"],["Tourcoing","59200","Hauts-de-France"],
["Avignon","84000","Provence-Alpes-Côte d'Azur"],["Poitiers","86000","Nouvelle-Aquitaine"],
["Dunkerque","59140","Hauts-de-France"],["Pau","64000","Nouvelle-Aquitaine"],["La Rochelle","17000","Nouvelle-Aquitaine"],
["Mérignac","33700","Nouvelle-Aquitaine"],["Pessac","33600","Nouvelle-Aquitaine"],["Talence","33400","Nouvelle-Aquitaine"],
["Eysines","33320","Nouvelle-Aquitaine"],["Bègles","33130","Nouvelle-Aquitaine"],["Gradignan","33170","Nouvelle-Aquitaine"],
["Cenon","33150","Nouvelle-Aquitaine"],["Le Bouscat","33110","Nouvelle-Aquitaine"],["Floirac","33270","Nouvelle-Aquitaine"],
["Blanquefort","33290","Nouvelle-Aquitaine"],["Villenave-d'Ornon","33140","Nouvelle-Aquitaine"],
["Saint-Médard-en-Jalles","33160","Nouvelle-Aquitaine"],["Lormont","33310","Nouvelle-Aquitaine"],
["Bayonne","64100","Nouvelle-Aquitaine"],["Anglet","64600","Nouvelle-Aquitaine"],["Biarritz","64200","Nouvelle-Aquitaine"],
["Arcachon","33120","Nouvelle-Aquitaine"],["Libourne","33500","Nouvelle-Aquitaine"],
["Cannes","06400","Provence-Alpes-Côte d'Azur"],["Antibes","06600","Provence-Alpes-Côte d'Azur"],
["Saint-Nazaire","44600","Pays de la Loire"],["La Roche-sur-Yon","85000","Pays de la Loire"],
["Colmar","68000","Grand Est"],["Valence","26000","Auvergne-Rhône-Alpes"],["Chambéry","73000","Auvergne-Rhône-Alpes"],
["Ajaccio","20000","Corse"],["Bastia","20200","Corse"],["Cholet","49300","Pays de la Loire"],
["Chartres","28000","Centre-Val de Loire"],["Quimper","29000","Bretagne"],["Vannes","56000","Bretagne"],
["Lorient","56100","Bretagne"],["Troyes","10000","Grand Est"],["Laval","53000","Pays de la Loire"],
["Calais","62100","Hauts-de-France"],["Béziers","34500","Occitanie"],["Arles","13200","Provence-Alpes-Côte d'Azur"],
["Auxerre","89000","Bourgogne-Franche-Comté"],["Bourges","18000","Centre-Val de Loire"],
["Saint-Brieuc","22000","Bretagne"],["Carcassonne","11000","Occitanie"],["Châteauroux","36000","Centre-Val de Loire"],
["Albi","81000","Occitanie"],["Tarbes","65000","Occitanie"],["Niort","79000","Nouvelle-Aquitaine"],
["Agen","47000","Nouvelle-Aquitaine"],["Périgueux","24000","Nouvelle-Aquitaine"],["Bergerac","24100","Nouvelle-Aquitaine"],
["Dax","40100","Nouvelle-Aquitaine"],["Mont-de-Marsan","40000","Nouvelle-Aquitaine"],
["Villeneuve-sur-Lot","47300","Nouvelle-Aquitaine"],["Saintes","17100","Nouvelle-Aquitaine"],
["Rochefort","17300","Nouvelle-Aquitaine"],["Cognac","16100","Nouvelle-Aquitaine"],
["Angoulême","16000","Nouvelle-Aquitaine"],["Guéret","23000","Nouvelle-Aquitaine"],
["Tulle","19000","Nouvelle-Aquitaine"],["Brive-la-Gaillarde","19100","Nouvelle-Aquitaine"],
["Royan","17200","Nouvelle-Aquitaine"],["Sarlat-la-Canéda","24200","Nouvelle-Aquitaine"],
["Biscarrosse","40600","Nouvelle-Aquitaine"],["Langon","33210","Nouvelle-Aquitaine"],
["Le Haillan","33185","Nouvelle-Aquitaine"],["Bruges","33520","Nouvelle-Aquitaine"],
["Carbon-Blanc","33560","Nouvelle-Aquitaine"],["Artigues-près-Bordeaux","33370","Nouvelle-Aquitaine"],
["Ambès","33810","Nouvelle-Aquitaine"],["Parempuyre","33290","Nouvelle-Aquitaine"],
["Saint-Aubin-de-Médoc","33160","Nouvelle-Aquitaine"],["Le Taillan-Médoc","33320","Nouvelle-Aquitaine"],
["Coutras","33230","Nouvelle-Aquitaine"],["Saint-André-de-Cubzac","33240","Nouvelle-Aquitaine"],
["Cestas","33610","Nouvelle-Aquitaine"],["Léognan","33850","Nouvelle-Aquitaine"],
["Cadaujac","33140","Nouvelle-Aquitaine"],["Martignas-sur-Jalle","33127","Nouvelle-Aquitaine"],
["Le Teich","33470","Nouvelle-Aquitaine"],["Gujan-Mestras","33470","Nouvelle-Aquitaine"],
["La Teste-de-Buch","33260","Nouvelle-Aquitaine"],["Andernos-les-Bains","33510","Nouvelle-Aquitaine"],
["Lège-Cap-Ferret","33950","Nouvelle-Aquitaine"],["Le Porge","33680","Nouvelle-Aquitaine"],
["Lacanau","33680","Nouvelle-Aquitaine"],["Colomiers","31770","Occitanie"],["Tournefeuille","31170","Occitanie"],
["Blagnac","31700","Occitanie"],["Biarritz","64200","Nouvelle-Aquitaine"],
["Hendaye","64700","Nouvelle-Aquitaine"],["Saint-Jean-de-Luz","64500","Nouvelle-Aquitaine"],
["Oloron-Sainte-Marie","64400","Nouvelle-Aquitaine"],["Orthez","64300","Nouvelle-Aquitaine"],
["Maisons-Alfort","94700","Île-de-France"],["Créteil","94000","Île-de-France"],
["Vitry-sur-Seine","94400","Île-de-France"],["Ivry-sur-Seine","94200","Île-de-France"],
["Colombes","92700","Île-de-France"],["Courbevoie","92400","Île-de-France"],
["Asnières-sur-Seine","92600","Île-de-France"],["Nanterre","92000","Île-de-France"],
["Versailles","78000","Île-de-France"],["Saint-Germain-en-Laye","78100","Île-de-France"],
["Cergy","95000","Île-de-France"],["Évry-Courcouronnes","91000","Île-de-France"],
["Meaux","77100","Île-de-France"],["Melun","77000","Île-de-France"],
["Fontainebleau","77300","Île-de-France"],["Nemours","77140","Île-de-France"],
];

function NbFieldAddress({ label, value, icon:TIcon, full, onChange, onSelect, ocrFilled, placeholder }) {
  const [focus, setFocus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropPos, setDropPos] = useState({ top:0, left:0, width:0 });
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const searchLocal = (q) => {
    const lower = q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return FR_CITIES
      .filter(([city, cp]) => {
        const cn = city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        return cn.includes(lower) || cp.startsWith(q);
      })
      .slice(0, 6)
      .map(([city, cp, region]) => ({ label: city + ", " + cp, name: city, city, postcode: cp, context: region }));
  };

  const searchAPI = (q) => {
    return fetch("https://api-adresse.data.gouv.fr/search/?q=" + encodeURIComponent(q) + "&limit=6")
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(data => (data.features || []).map(f => ({
        label: f.properties.label,
        name: f.properties.name || f.properties.label,
        city: f.properties.city,
        postcode: f.properties.postcode,
        context: f.properties.context,
      })));
  };

  const search = (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    // Try API first, fallback to local
    searchAPI(q)
      .then(results => {
        setSuggestions(results.length > 0 ? results : searchLocal(q));
      })
      .catch(() => {
        setSuggestions(searchLocal(q));
      })
      .finally(() => setLoading(false));
  };

  const updateDropPos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  const handleChange = (val) => {
    onChange && onChange(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { updateDropPos(); search(val); }, 250);
  };

  const handleSelect = (s) => {
    onChange && onChange(s.name);
    setSuggestions([]);
    const parts = (s.context || "").split(", ");
    onSelect && onSelect({
      addr: s.name,
      ville: s.city,
      codePostal: s.postcode,
      region: parts.length >= 1 ? parts[parts.length - 1] : s.context || "",
    });
  };

  const handleFocus = () => {
    setFocus(true);
    updateDropPos();
    if (value && value.length >= 2) search(value);
  };

  useEffect(() => {
    const close = (e) => { if (inputRef.current && !inputRef.current.contains(e.target)) setSuggestions([]); };
    const onScroll = () => { if(suggestions.length > 0) updateDropPos(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("scroll", onScroll, true); };
  }, [suggestions.length]);

  return (
    <div ref={inputRef} style={{ position:"relative", gridColumn:full?"span 2":"span 1" }}>
      <div style={{ background: focus ? "rgba(0,123,255,0.04)" : "#0a0a0a", border:`1px solid ${focus?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", transition:"all 0.15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
          {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
          <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
          {loading && <div style={{ marginLeft:"auto", width:10, height:10, border:"1.5px solid rgba(0,123,255,0.3)", borderTopColor:C.blue, borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>}
          {ocrFilled && !loading && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
        </div>
        <input
          value={value||""} onChange={e=>handleChange(e.target.value)}
          onFocus={handleFocus} onBlur={()=>setTimeout(()=>setFocus(false),200)}
          placeholder={placeholder||"Commencez à taper une adresse…"}
          style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:700, color:C.w }}
        />
      </div>
      {suggestions.length > 0 && (
        <div style={{ position:"fixed", top:dropPos.top, left:dropPos.left, width:dropPos.width||300, zIndex:9999, background:"#111", border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 12px 40px rgba(0,0,0,0.7)", maxHeight:240, overflowY:"auto" }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={(e)=>{e.preventDefault();handleSelect(s);}}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${C.border}`, transition:"background 0.1s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:C.blue, flexShrink:0 }}><I.MapPin/></span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:C.w, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.label}</p>
                  <p style={{ fontSize:10, color:C.g3 }}>{s.postcode} {s.city}{s.context ? " · " + s.context : ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { NbFieldAddress };
