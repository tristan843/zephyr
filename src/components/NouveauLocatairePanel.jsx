import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "../tokens/colors.js";
import { I } from "./Icons.jsx";

/* ════════════════════════════════════════
   NOUVEAU LOCATAIRE — SLIDE-OVER
════════════════════════════════════════ */


const OCR_SYSTEM_PROMPT = `Toute information absente ou incertaine doit être strictement retournée comme null. Toute hallucination est considérée comme une erreur critique.
Tu es un moteur d'extraction documentaire strictement déterministe.
Tu reçois du texte OCR brut ou des images de documents locataire : Carte d'identité, Fiche de paie, Justificatif de domicile.
Ta mission : Extraire uniquement les informations explicitement présentes. Ne jamais compléter, deviner, corriger ou reformater si incertain. Si doute → null. Si contradictoire → null. Si plusieurs valeurs possibles → null.

RÈGLES PAR TYPE DE DOCUMENT :
CARTE D'IDENTITÉ — Champs : nom, prenom, sexe, date_naissance, lieu_naissance, nationalite, numero_document, date_expiration. Nom = champ NOM uniquement. Prénom = champ PRÉNOM uniquement. Ne pas recalculer âge. Ne pas déduire sexe si non mentionné. Si MRZ illisible → ignorer.

FICHE DE PAIE — Champs : employeur, type_contrat, date_fiche_paie, salaire_brut, salaire_net, net_imposable, cumul_annuel_net, anciennete. Salaire brut = ligne explicitement "Brut". Salaire net = ligne explicitement "Net à payer". Ne pas calculer moyenne. Ne pas deviner CDI/CDD si absent.

JUSTIFICATIF DE DOMICILE — Champs : nom_titulaire, adresse_complete, date_document, organisme_emetteur. Adresse complète = bloc texte unique. Ne pas reconstituer code postal. Si plusieurs adresses → null.

INTERDICTIONS : Ne pas compléter un prénom abrégé. Ne pas deviner un sexe. Ne pas déduire un contrat. Ne pas calculer un revenu. Ne pas corriger une date mal lue.

FORMAT DE SORTIE : Retourne UNIQUEMENT du JSON valide, sans backticks, sans commentaire, sans phrase :
{"carte_identite":{"nom":null,"prenom":null,"sexe":null,"date_naissance":null,"lieu_naissance":null,"nationalite":null,"numero_document":null,"date_expiration":null},"fiche_paie":{"employeur":null,"type_contrat":null,"date_fiche_paie":null,"salaire_brut":null,"salaire_net":null,"net_imposable":null,"cumul_annuel_net":null,"anciennete":null},"justificatif_domicile":{"nom_titulaire":null,"adresse_complete":null,"date_document":null,"organisme_emetteur":null}}`;
const NL_AI_STEPS = [
  "Lecture des métadonnées du fichier...",
  "Extraction des données biométriques...",
  "Vérification de la cohérence des informations...",
  "Analyse de l'authenticité du document...",
  "Croisement avec les données de revenus...",
  "Calcul du score de solvabilité...",
  "Génération de la fiche locataire...",
];

/* Drop Zone */
function NLDropZone({ type, label, subLabel, Icon, files, onAddFile, analyzing, done, onRemoveFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const fileList = files || [];
  const hasFiles = fileList.length > 0;
  const handleDrop = (e) => { e.preventDefault(); setDrag(false); const dropped=[...e.dataTransfer.files]; dropped.forEach(f=>onAddFile(f)); };
  const handleInput = (e) => { [...e.target.files].forEach(f=>onAddFile(f)); e.target.value=""; };
  const stateBg = done?"rgba(16,185,129,0.06)":drag?"rgba(0,123,255,0.08)":"transparent";
  return (
    <div style={{ flex:1, position:"relative" }}>
      <input ref={ref} type="file" multiple style={{ display:"none" }} onChange={handleInput}/>
      <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={handleDrop}
        style={{ border:`1.5px dashed ${done?C.green:drag?C.blue:"#2a2a2a"}`, borderRadius:14, padding:"18px 14px 14px", textAlign:"center", cursor:"pointer", background:stateBg, transition:"all 0.25s ease", boxShadow:drag?`0 0 24px rgba(0,123,255,0.12)`:done?`0 0 16px rgba(16,185,129,0.07)`:"none", position:"relative", overflow:"hidden" }}>
        <div style={{ width:38, height:38, borderRadius:10, margin:"0 auto 10px", background:done?"rgba(16,185,129,0.12)":drag?"rgba(0,123,255,0.15)":C.blueSub, border:`1px solid ${done?"rgba(16,185,129,0.25)":drag?"rgba(0,123,255,0.35)":"rgba(0,123,255,0.18)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:done?C.green:C.blue, transition:"all 0.25s" }}>
          {analyzing ? <div style={{ animation:"spin 1s linear infinite", color:C.blue }}><I.Loader/></div> : done ? <I.CheckCircle/> : <Icon/>}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:done?C.green:C.w, marginBottom:2 }}>{done?`${fileList.length} fichier${fileList.length>1?"s":""}`:label}</p>
        {!hasFiles&&<p style={{ fontSize:9, color:C.g2, lineHeight:1.5 }}>{subLabel}</p>}
        {hasFiles&&(
          <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3, textAlign:"left" }}>
            {fileList.map((f,fi)=>(
              <div key={fi} style={{ display:"flex", alignItems:"center", gap:5, background:"#0d0d0f", borderRadius:6, padding:"4px 6px" }}>
                <I.File/>
                <span style={{ fontSize:8, color:C.g1, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:C.mono }}>{f.name}</span>
                <button onClick={(e)=>{e.stopPropagation();onRemoveFile(fi);}}
                  style={{ background:"none", border:"none", cursor:"pointer", color:C.red, display:"flex", alignItems:"center", padding:0, flexShrink:0, opacity:0.6, transition:"opacity 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>
                  <I.X/>
                </button>
              </div>
            ))}
          </div>
        )}
        {analyzing&&<div style={{ marginTop:8 }}><div style={{ height:2, background:"#1f1f1f", borderRadius:99, overflow:"hidden" }}><div style={{ height:"100%", background:`linear-gradient(90deg,${C.blue},#60a5fa)`, borderRadius:99, animation:"scanBar 1.4s ease-in-out infinite alternate", width:"60%" }}/></div></div>}
        {!analyzing&&<div style={{ marginTop:hasFiles?6:10, display:"flex", alignItems:"center", justifyContent:"center", gap:4, opacity:.4 }}><I.Upload2/><span style={{ fontSize:8, color:C.g2 }}>{hasFiles?"+ Ajouter":"Glisser ou cliquer"}</span></div>}
      </div>
      <div style={{ position:"absolute", top:8, right:8, fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:done?C.green:C.blue, background:done?C.greenSub:C.blueSub, border:`1px solid ${done?"rgba(16,185,129,0.22)":"rgba(0,123,255,0.2)"}`, padding:"2px 6px", borderRadius:4 }}>{type}{hasFiles?` · ${fileList.length}`:""}</div>
    </div>
  );
}

/* AI Progress */
function NLAIProgress({ step, total, label }) {
  const pct = Math.round((step/total)*100);
  return (
    <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <div style={{ width:26, height:26, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, animation:"spin 1.2s linear infinite" }}><I.Loader/></div>
        <div><p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue, marginBottom:1 }}>ANALYSE IA EN COURS</p><p style={{ fontSize:12, color:C.w, fontWeight:600 }}>{label}</p></div>
        <span style={{ marginLeft:"auto", fontSize:13, fontWeight:800, color:C.blue, fontFamily:C.mono }}>{pct}%</span>
      </div>
      <div style={{ height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:8 }}>
        <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.blue},#60a5fa,${C.blue})`, backgroundSize:"200% 100%", width:`${pct}%`, transition:"width 0.4s ease", animation:"shimmer 2s linear infinite" }}/>
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {NL_AI_STEPS.map((s,i)=>(
          <span key={i} style={{ fontSize:9, fontFamily:C.mono, color:i<step?C.green:i===step?C.blue:C.g3, transition:"color 0.3s" }}>
            {i<step?"✓ ":i===step?"● ":"○ "}{i===step?s.split("...")[0]:""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* NL DataTile */
function NLDataTile({ icon:TIcon, label, value, accent, full, highlight }) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ background:highlight?"rgba(0,123,255,0.05)":"#0a0a0a", border:`1px solid ${highlight?"rgba(0,123,255,0.2)":C.border}`, borderRadius:10, padding:"12px 14px", gridColumn:full?"span 2":"span 1", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:13, fontWeight:700, color:accent?C.blue:C.w }}>{value}</span>
        <div style={{ position:"relative" }} onMouseEnter={()=>setTip(true)} onMouseLeave={()=>setTip(false)}>
          <div style={{ width:16, height:16, borderRadius:"50%", background:C.blueSub, border:"1px solid rgba(0,123,255,0.22)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"default", color:C.blue }}><I.Check/></div>
          {tip&&<div style={{ position:"absolute", bottom:"calc(100% + 6px)", right:0, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:6, padding:"4px 8px", fontSize:9, color:C.g1, whiteSpace:"nowrap", zIndex:100, boxShadow:"0 8px 24px rgba(0,0,0,0.5)", pointerEvents:"none" }}>✓ Extrait par IA · OCR vérifié</div>}
        </div>
      </div>
    </div>
  );
}

/* NL SectionTitle */
function NLSectionTitle({ label, icon:TIcon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
      {TIcon&&<span style={{ color:C.blue }}><TIcon/></span>}
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

/* Profile Tab */
function NLProfileTab({ data, confidence }) {
  const ci = data?.carte_identite || {};
  const fp = data?.fiche_paie || {};
  const v = (x) => x || "—";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.07),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.14)", borderRadius:11, padding:"13px 15px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:24, height:24, borderRadius:6, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
        <div style={{ flex:1 }}><p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue, marginBottom:1 }}>EXTRACTION IA · CONFIANCE {confidence||0}%</p><p style={{ fontSize:11, color:C.g1 }}>Données extraites par OCR déterministe. Les champs « — » n'ont pas été trouvés.</p></div>
        <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:7, padding:"4px 10px", color:C.g2, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}><I.Edit/> Éditer</button>
      </div>
      <div>
        <NLSectionTitle label="Identité civile" icon={I.Users}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          <NLDataTile icon={I.Users}    label="Sexe"              value={v(ci.sexe)}/>
          <NLDataTile icon={I.Users}    label="Prénom"            value={v(ci.prenom)} highlight={!!ci.prenom}/>
          <NLDataTile icon={I.Users}    label="Nom de famille"    value={v(ci.nom)} highlight={!!ci.nom}/>
          <NLDataTile icon={I.Calendar} label="Date de naissance" value={v(ci.date_naissance)}/>
          <NLDataTile icon={I.MapPin}   label="Lieu de naissance" value={v(ci.lieu_naissance)}/>
          <NLDataTile icon={I.Globe}    label="Nationalité"       value={v(ci.nationalite)}/>
          <NLDataTile icon={I.ID}       label="N° document"       value={v(ci.numero_document)}/>
          <NLDataTile icon={I.Calendar} label="Expiration"        value={v(ci.date_expiration)}/>
        </div>
      </div>
      <div>
        <NLSectionTitle label="Situation professionnelle" icon={I.Briefcase}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
          <NLDataTile icon={I.Briefcase} label="Employeur"         value={v(fp.employeur)} full/>
          <NLDataTile icon={I.Briefcase} label="Type de contrat"   value={v(fp.type_contrat)}/>
          <NLDataTile icon={I.Euro}      label="Salaire net"       value={v(fp.salaire_net)} accent/>
          <NLDataTile icon={I.Euro}      label="Salaire brut"      value={v(fp.salaire_brut)}/>
          <NLDataTile icon={I.Euro}      label="Net imposable"     value={v(fp.net_imposable)}/>
          <NLDataTile icon={I.Euro}      label="Ancienneté"        value={v(fp.anciennete)}/>
          <NLDataTile icon={I.Calendar}  label="Date fiche"        value={v(fp.date_fiche_paie)}/>
          <NLDataTile icon={I.Euro}      label="Cumul annuel net"  value={v(fp.cumul_annuel_net)}/>
        </div>
      </div>
    </div>
  );
}

/* Documents Tab */
function NLDocumentsTab({ files }) {
  const [hovD, setHovD] = useState(null);
  const fmtSize = (f) => { if(!f) return "—"; const kb = f.size/1024; return kb>1024? (kb/1024).toFixed(1)+" Mo" : Math.round(kb)+" Ko"; };
  const docList = [
    ...(files?.cni||[]).map((f,i)=>({ id:`cni-${i}`, file:f, type:"CNI", label:"Carte d'identité" })),
    ...(files?.revenus||[]).map((f,i)=>({ id:`rev-${i}`, file:f, type:"Revenus", label:"Fiche de paie" })),
    ...(files?.domicile||[]).map((f,i)=>({ id:`dom-${i}`, file:f, type:"Domicile", label:"Justificatif domicile" })),
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <NLSectionTitle label={`Dossier numérique · ${docList.length} document${docList.length>1?"s":""}`} icon={I.File}/>
      <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"28px 2fr 0.7fr 0.7fr 1fr", gap:10, padding:"9px 14px", background:"#080808", borderBottom:`1px solid ${C.border}` }}>
          {["","Fichier","Type","Taille","Statut"].map((h,i)=><span key={i} style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, textTransform:"uppercase" }}>{h}</span>)}
        </div>
        {docList.map(d=>(
          <div key={d.id} onMouseEnter={()=>setHovD(d.id)} onMouseLeave={()=>setHovD(null)}
            style={{ display:"grid", gridTemplateColumns:"28px 2fr 0.7fr 0.7fr 1fr", alignItems:"center", gap:10, padding:"11px 14px", borderBottom:`1px solid ${C.border}`, background:hovD===d.id?"#111":"transparent", transition:"background 0.15s" }}>
            <div style={{ width:28, height:28, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.File/></div>
            <div><p style={{ fontSize:11, fontWeight:600, color:C.w, marginBottom:1 }}>{d.file.name}</p><p style={{ fontSize:9, color:C.g2, fontFamily:C.mono }}>{d.label}</p></div>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.18)", padding:"2px 6px", borderRadius:4 }}>{d.type}</span>
            <span style={{ fontSize:10, color:C.g1, fontFamily:C.mono }}>{fmtSize(d.file)}</span>
            <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.greenSub, border:`1px solid ${C.greenBord}`, borderRadius:99, padding:"3px 8px" }}>
              <I.Shield/><span style={{ fontSize:8, fontFamily:C.mono, color:C.green, letterSpacing:"0.06em", fontWeight:700 }}>TRAITÉ</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Coordonnées Tab */
function NLCoordonneesTab({ data }) {
  const jd = data?.justificatif_domicile || {};
  const v = (x) => x || "—";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <NLSectionTitle label="Adresse actuelle (extraite du justificatif)" icon={I.MapPin}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <NLDataTile icon={I.Users}  label="Nom titulaire"    value={v(jd.nom_titulaire)} full/>
        <NLDataTile icon={I.MapPin} label="Adresse complète" value={v(jd.adresse_complete)} full/>
        <NLDataTile icon={I.Calendar} label="Date document"  value={v(jd.date_document)}/>
        <NLDataTile icon={I.Building} label="Émetteur"       value={v(jd.organisme_emetteur)}/>
      </div>
    </div>
  );
}

/* Garants Tab */
// NL_GARANT: now extracted dynamically via OCR

function NLGarantsTab({ garantsOcr, garants }) {
  if (!garantsOcr || garantsOcr.length === 0) {
    return (
      <div style={{ padding:"32px 0", textAlign:"center" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"#818cf8", marginBottom:12 }}><I.Users/></div>
        <p style={{ fontSize:13, color:C.g2 }}>Aucun garant ajouté</p>
        <p style={{ fontSize:11, color:C.g3, marginTop:4 }}>Les garants peuvent être ajoutés lors du dépôt des documents.</p>
      </div>
    );
  }
  const v = (x) => x || "—";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {garantsOcr.map((gd, gi) => {
        const ci = gd?.carte_identite || {};
        const fp = gd?.fiche_paie || {};
        const jd = gd?.justificatif_domicile || {};
        const initials = (ci.prenom||"?")[0].toUpperCase() + (ci.nom||"?")[0].toUpperCase();
        const allVals = [...Object.values(ci),...Object.values(fp),...Object.values(jd)];
        const conf = allVals.length>0 ? Math.round(allVals.filter(x=>x!==null&&x!=="").length/allVals.length*100) : 0;
        const score = conf>=70?"A+":conf>=50?"B+":conf>=30?"C":"—";
        const col = conf>=50?"#10B981":"#F59E0B";
        return (
          <div key={gi} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"16px 18px", background:"rgba(99,102,241,0.03)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#818cf8", flexShrink:0 }}>{initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>{v(ci.prenom)} {v(ci.nom)}</span>
                  <span style={{ fontSize:8, fontFamily:C.mono, color:"#818cf8", background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", padding:"2px 7px", borderRadius:4 }}>GARANT {gi+1}</span>
                </div>
                <span style={{ fontSize:11, color:C.g2 }}>{[fp.employeur, fp.salaire_net?fp.salaire_net+"/mois":null, fp.type_contrat].filter(Boolean).join(" · ")||"Données extraites par OCR"}</span>
              </div>
              <div style={{ width:38, height:38, borderRadius:"50%", background:`${col}18`, border:`1px solid ${col}40`, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:13, fontWeight:800, color:col }}>{score}</span></div>
            </div>
            <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
              <NLSectionTitle label="Identité civile" icon={I.Users}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <NLDataTile icon={I.Users}    label="Sexe"              value={v(ci.sexe)}/>
                <NLDataTile icon={I.Users}    label="Prénom"            value={v(ci.prenom)} highlight={!!ci.prenom}/>
                <NLDataTile icon={I.Users}    label="Nom de famille"    value={v(ci.nom)} highlight={!!ci.nom}/>
                <NLDataTile icon={I.Calendar} label="Date naissance"    value={v(ci.date_naissance)}/>
                <NLDataTile icon={I.MapPin}   label="Lieu naissance"    value={v(ci.lieu_naissance)}/>
                <NLDataTile icon={I.Globe}    label="Nationalité"       value={v(ci.nationalite)}/>
              </div>
              <NLSectionTitle label="Situation professionnelle" icon={I.Briefcase}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <NLDataTile icon={I.Briefcase} label="Employeur"         value={v(fp.employeur)} full/>
                <NLDataTile icon={I.Briefcase} label="Type de contrat"   value={v(fp.type_contrat)}/>
                <NLDataTile icon={I.Euro}      label="Salaire net"       value={v(fp.salaire_net)} accent/>
                <NLDataTile icon={I.Euro}      label="Ancienneté"        value={v(fp.anciennete)}/>
              </div>
              <NLSectionTitle label="Domicile" icon={I.MapPin}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                <NLDataTile icon={I.MapPin}    label="Adresse"           value={v(jd.adresse_complete)} full/>
                <NLDataTile icon={I.Building}  label="Émetteur"          value={v(jd.organisme_emetteur)}/>
                <NLDataTile icon={I.Calendar}  label="Date document"     value={v(jd.date_document)}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const NL_SUBTABS = ["Profil & Identité","Garants","Dossier Numérique","Coordonnées"];

/* ── NouveauLocataire Slide-Over ── */
function NouveauLocatairePanel({ onClose, onSave }) {
  const [files,     setFiles]     = useState({ cni:[], revenus:[], domicile:[] });
  const [filesB64,  setFilesB64]  = useState({ cni:[], revenus:[], domicile:[] });
  const [phase,     setPhase]     = useState("intake");
  const [aiStep,    setAiStep]    = useState(0);
  const [aiLabel,   setAiLabel]   = useState(NL_AI_STEPS[0]);
  const [subtab,    setSubtab]    = useState("Profil & Identité");
  const [validated, setValidated] = useState(false);
  const [analyzing, setAnalyzing] = useState({ cni:false, revenus:false, domicile:false });
  const [done,      setDone]      = useState({ cni:false, revenus:false, domicile:false });
  const [ocrData,   setOcrData]   = useState(null);
  const [ocrError,  setOcrError]  = useState(null);
  const [ocrConf,   setOcrConf]   = useState(0);

  // Read file as base64
  const readB64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const handleFile = async (zone, file) => {
    setFiles(f=>({...f,[zone]:[...f[zone], file]}));
    setAnalyzing(a=>({...a,[zone]:true}));
    try {
      const b64 = await readB64(file);
      setFilesB64(f=>({...f,[zone]:[...f[zone], b64]}));
    } catch(e) { console.error("File read error:", e); }
    setTimeout(()=>{ setAnalyzing(a=>({...a,[zone]:false})); setDone(d=>({...d,[zone]:true})); }, 1800);
  };

  const removeFile = (zone, index) => {
    setFiles(f=>{
      const arr = f[zone].filter((_,i)=>i!==index);
      if(arr.length===0) setDone(d=>({...d,[zone]:false}));
      return {...f,[zone]:arr};
    });
    setFilesB64(f=>({...f,[zone]:f[zone].filter((_,i)=>i!==index)}));
  };

  // ── GARANTS STATE ──
  const emptyG = () => ({ id:Date.now(), files:{cni:[],revenus:[],domicile:[]}, filesB64:{cni:[],revenus:[],domicile:[]}, analyzing:{cni:false,revenus:false,domicile:false}, done:{cni:false,revenus:false,domicile:false} });
  const [garants, setGarants] = useState([]);
  const [garantsOcr, setGarantsOcr] = useState([]);

  const addGarant = () => setGarants(g=>[...g, emptyG()]);

  const removeGarant = (gid) => setGarants(g=>g.filter(x=>x.id!==gid));

  const handleGarantFile = async (gid, zone, file) => {
    setGarants(g=>g.map(x=>x.id!==gid?x:{...x, files:{...x.files,[zone]:[...x.files[zone],file]}, analyzing:{...x.analyzing,[zone]:true}}));
    try {
      const b64 = await readB64(file);
      setGarants(g=>g.map(x=>x.id!==gid?x:{...x, filesB64:{...x.filesB64,[zone]:[...x.filesB64[zone],b64]}}));
    } catch(e) { console.error("Garant file read error:", e); }
    setTimeout(()=>{
      setGarants(g=>g.map(x=>x.id!==gid?x:{...x, analyzing:{...x.analyzing,[zone]:false}, done:{...x.done,[zone]:true}}));
    }, 1800);
  };

  const removeGarantFile = (gid, zone, index) => {
    setGarants(g=>g.map(x=>{
      if(x.id!==gid) return x;
      const arr = x.files[zone].filter((_,i)=>i!==index);
      const b64arr = x.filesB64[zone].filter((_,i)=>i!==index);
      return {...x, files:{...x.files,[zone]:arr}, filesB64:{...x.filesB64,[zone]:b64arr}, done:{...x.done,[zone]:arr.length>0}, analyzing:{...x.analyzing,[zone]:false}};
    }));
  };

  const isGarantReady = (g) => g.done.cni && g.done.revenus && g.done.domicile && g.filesB64.cni.length>0 && g.filesB64.revenus.length>0 && g.filesB64.domicile.length>0;
  const allGarantsReady = garants.length === 0 || garants.every(isGarantReady);
  const totalDocs = 3 + garants.length * 3;
  const doneDocs = [files.cni,files.revenus,files.domicile].filter(a=>a.length>0).length + garants.reduce((s,g)=>[g.files.cni,g.files.revenus,g.files.domicile].filter(a=>a.length>0).length+s,0);

  // Call Claude API for OCR extraction when all docs are ready
  const runOCR = useCallback(async () => {
    setPhase("analyzing");
    setAiStep(0); setAiLabel(NL_AI_STEPS[0]);

    // Progress animation
    let step = 0;
    const iv = setInterval(() => {
      step++;
      if (step < NL_AI_STEPS.length) { setAiStep(step); setAiLabel(NL_AI_STEPS[step]); }
    }, 600);

    // Helper for garant docs (must be outside try for finally access)
    const addDoc2 = (arr, b64, name, mimeHint) => {
      if (!b64) return;
      const isPdf = name?.toLowerCase().endsWith(".pdf");
      const mime = isPdf ? "application/pdf" : (mimeHint || "image/jpeg");
      arr.push(isPdf ? { type: "document", source: { type: "base64", media_type: mime, data: b64 } } : { type: "image", source: { type: "base64", media_type: mime, data: b64 } });
    };

    try {
      const docs = [];
      const addDoc = (b64, name, mimeHint) => {
        if (!b64) return;
        const isPdf = name?.toLowerCase().endsWith(".pdf");
        const mime = isPdf ? "application/pdf" : (mimeHint || "image/jpeg");
        if (isPdf) {
          docs.push({ type: "document", source: { type: "base64", media_type: mime, data: b64 } });
        } else {
          docs.push({ type: "image", source: { type: "base64", media_type: mime, data: b64 } });
        }
      };

      // Tenant documents (multiple per zone)
      filesB64.cni.forEach((b,i) => addDoc(b, files.cni[i]?.name, files.cni[i]?.type));
      filesB64.revenus.forEach((b,i) => addDoc(b, files.revenus[i]?.name, files.revenus[i]?.type));
      filesB64.domicile.forEach((b,i) => addDoc(b, files.domicile[i]?.name, files.domicile[i]?.type));

      docs.push({ type: "text", text: "Extrais les données de ces 3 documents (locataire principal) selon le schéma JSON défini. Retourne uniquement le JSON." });

      const resp = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250514",
          max_tokens: 2048,
          system: OCR_SYSTEM_PROMPT,
          messages: [{ role: "user", content: docs }]
        })
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setOcrData(parsed);

      // Compute confidence: count non-null fields
      const all = [
        ...Object.values(parsed.carte_identite || {}),
        ...Object.values(parsed.fiche_paie || {}),
        ...Object.values(parsed.justificatif_domicile || {}),
      ];
      const filled = all.filter(v => v !== null && v !== "").length;
      setOcrConf(all.length > 0 ? Math.round(filled / all.length * 100) : 0);

    } catch(e) {
      console.error("OCR extraction error:", e);
      setOcrError(e.message);
      // Fallback: empty extraction
      setOcrData({
        carte_identite: { nom:null,prenom:null,sexe:null,date_naissance:null,lieu_naissance:null,nationalite:null,numero_document:null,date_expiration:null },
        fiche_paie: { employeur:null,type_contrat:null,date_fiche_paie:null,salaire_brut:null,salaire_net:null,net_imposable:null,cumul_annuel_net:null,anciennete:null },
        justificatif_domicile: { nom_titulaire:null,adresse_complete:null,date_document:null,organisme_emetteur:null }
      });
      setOcrConf(0);
    } finally {
      // Run garant OCR calls sequentially
      const gResults = [];
      for (let gi = 0; gi < garants.length; gi++) {
        const g = garants[gi];
        try {
          const gDocs = [];
          g.filesB64.cni.forEach((b,i) => addDoc2(gDocs, b, g.files.cni[i]?.name, g.files.cni[i]?.type));
          g.filesB64.revenus.forEach((b,i) => addDoc2(gDocs, b, g.files.revenus[i]?.name, g.files.revenus[i]?.type));
          g.filesB64.domicile.forEach((b,i) => addDoc2(gDocs, b, g.files.domicile[i]?.name, g.files.domicile[i]?.type));
          gDocs.push({ type: "text", text: `Extrais les données de ces 3 documents (garant ${gi+1}) selon le schéma JSON défini. Retourne uniquement le JSON.` });
          const gResp = await fetch("/api/claude", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "claude-sonnet-4-5-20250514", max_tokens: 2048, system: OCR_SYSTEM_PROMPT, messages: [{ role: "user", content: gDocs }] })
          });
          const gData = await gResp.json();
          const gText = gData.content?.map(b => b.text || "").join("") || "";
          const gClean = gText.replace(/```json|```/g, "").trim();
          gResults.push(JSON.parse(gClean));
        } catch(ge) {
          console.error(`Garant ${gi+1} OCR error:`, ge);
          gResults.push({ carte_identite:{nom:null,prenom:null,sexe:null,date_naissance:null,lieu_naissance:null,nationalite:null,numero_document:null,date_expiration:null}, fiche_paie:{employeur:null,type_contrat:null,date_fiche_paie:null,salaire_brut:null,salaire_net:null,net_imposable:null,cumul_annuel_net:null,anciennete:null}, justificatif_domicile:{nom_titulaire:null,adresse_complete:null,date_document:null,organisme_emetteur:null} });
        }
      }
      setGarantsOcr(gResults);
      clearInterval(iv);
      setAiStep(NL_AI_STEPS.length - 1);
      setAiLabel(NL_AI_STEPS[NL_AI_STEPS.length - 1]);
      setTimeout(() => setPhase("done"), 500);
    }
  }, [filesB64, files, garants]);

  useEffect(()=>{
    const tenantReady = done.cni&&done.revenus&&done.domicile&&filesB64.cni.length>0&&filesB64.revenus.length>0&&filesB64.domicile.length>0;
    if(tenantReady && allGarantsReady && phase==="intake"){
      setTimeout(()=>runOCR(), 600);
    }
  },[done, filesB64, garants, allGarantsReady, runOCR]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)" }}/>

      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:201, width:"min(780px,90vw)", background:"#0d0d0d", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", animation:"slideIn 0.32s cubic-bezier(0.2,0.8,0.2,1)", overflowY:"auto", boxShadow:"-20px 0 60px rgba(0,0,0,0.6)" }}>

        {/* Panel header */}
        <div style={{ padding:"20px 24px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:"#08080A", position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              <I.X/>
            </button>
            <div>
              <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue, marginBottom:2 }}>EQUITY · NOUVEAU LOCATAIRE</p>
              <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>Créer un dossier locataire</p>
            </div>
          </div>
          {/* Step pills */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {[{n:1,l:"Dépôt",done:phase==="done"||phase==="analyzing",act:phase==="intake"||phase==="analyzing"},{n:2,l:"Analyse IA",done:phase==="done",act:phase==="analyzing"},{n:3,l:"Fiche",done:validated,act:phase==="done"}].map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", background:s.done?C.green:s.act?C.blue:"#1a1a1a", border:`1.5px solid ${s.done?C.green:s.act?C.blue:"#2a2a2a"}`, color:s.done||s.act?"#fff":C.g3, boxShadow:s.act?`0 0 10px ${C.blueGlow}`:"none", transition:"all 0.4s" }}>
                  {s.done?"✓":s.n}
                </div>
                <span style={{ fontSize:10, color:s.done?C.green:s.act?C.w:C.g3, fontWeight:s.act?600:400, transition:"color 0.3s" }}>{s.l}</span>
                {i<2&&<div style={{ width:20, height:1, background:C.border }}/>}
              </div>
            ))}
          </div>
        </div>

        {/* Panel body */}
        <div style={{ padding:"24px", flex:1 }}>

          {/* ── INTAKE PHASE ── */}
          {(phase==="intake"||phase==="analyzing")&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.3s ease" }}>
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                  <span style={{ color:C.blue }}><I.Sparkles/></span>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue }}>SMART INTAKE · DÉPOSEZ VOS 3 DOCUMENTS</p>
                </div>
                <div style={{ display:"flex", gap:12 }}>
                  <NLDropZone type="CNI"     label="Pièce d'identité"       subLabel="Recto · Verso · Passeport" Icon={I.ID}      files={files.cni}     onAddFile={f=>handleFile("cni",f)}     analyzing={analyzing.cni}     done={done.cni}     onRemoveFile={i=>removeFile("cni",i)}/>
                  <NLDropZone type="REVENUS" label="Justificatifs de revenus" subLabel="Bulletins de salaire · Avis d'imposition" Icon={I.Receipt} files={files.revenus} onAddFile={f=>handleFile("revenus",f)} analyzing={analyzing.revenus} done={done.revenus} onRemoveFile={i=>removeFile("revenus",i)}/>
                  <NLDropZone type="DOMICILE" label="Justificatif de domicile" subLabel="Facture énergie · Quittance · Avis taxe"       Icon={I.HomeDoc} files={files.domicile} onAddFile={f=>handleFile("domicile",f)} analyzing={analyzing.domicile} done={done.domicile} onRemoveFile={i=>removeFile("domicile",i)}/>
                </div>
                <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
                  {["cni","revenus","domicile"].map((k,i)=>(
                    <div key={i} style={{ flex:1, height:2, borderRadius:99, background:files[k].length>0?(done[k]?C.green:C.blue):"#1e1e1e", transition:"background 0.4s" }}/>
                  ))}
                  <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{doneDocs}/{totalDocs}</span>
                </div>
              </div>

              {/* ── GARANTS SECTIONS ── */}
              {garants.map((g, gi) => (
                <div key={g.id} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"20px", animation:"fadeUp 0.3s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#818cf8" }}>{gi+1}</div>
                      <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:"#818cf8" }}>GARANT {gi+1} · DÉPOSEZ 3 DOCUMENTS</p>
                    </div>
                    <button onClick={()=>removeGarant(g.id)}
                      style={{ width:26, height:26, borderRadius:7, background:C.redSub, border:`1px solid rgba(239,68,68,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.red, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.25)";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=C.redSub;}}>
                      <I.Trash/>
                    </button>
                  </div>
                  <div style={{ display:"flex", gap:12 }}>
                    <NLDropZone type="CNI"      label="Pièce d'identité"       subLabel="Recto · Verso · Passeport" Icon={I.ID}      files={g.files.cni}      onAddFile={f=>handleGarantFile(g.id,"cni",f)}      analyzing={g.analyzing.cni}      done={g.done.cni}      onRemoveFile={i=>removeGarantFile(g.id,"cni",i)}/>
                    <NLDropZone type="REVENUS"  label="Justificatifs de revenus" subLabel="Bulletins de salaire · Avis d'imposition" Icon={I.Receipt} files={g.files.revenus}  onAddFile={f=>handleGarantFile(g.id,"revenus",f)}  analyzing={g.analyzing.revenus}  done={g.done.revenus}  onRemoveFile={i=>removeGarantFile(g.id,"revenus",i)}/>
                    <NLDropZone type="DOMICILE" label="Justificatif de domicile" subLabel="Facture énergie · Quittance · Avis taxe"       Icon={I.HomeDoc} files={g.files.domicile} onAddFile={f=>handleGarantFile(g.id,"domicile",f)} analyzing={g.analyzing.domicile} done={g.done.domicile} onRemoveFile={i=>removeGarantFile(g.id,"domicile",i)}/>
                  </div>
                  <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
                    {["cni","revenus","domicile"].map((k,i)=>(
                      <div key={i} style={{ flex:1, height:2, borderRadius:99, background:g.files[k].length>0?(g.done[k]?C.green:C.blue):"#1e1e1e", transition:"background 0.4s" }}/>
                    ))}
                    <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{["cni","revenus","domicile"].filter(k=>g.files[k].length>0).length}/3</span>
                  </div>
                </div>
              ))}

              {/* ── ADD GARANT BUTTON ── */}
              {phase==="intake"&&(
                <button onClick={addGarant}
                  style={{ width:"100%", padding:"14px", borderRadius:12, border:`1.5px dashed rgba(99,102,241,0.3)`, background:"rgba(99,102,241,0.04)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.6)";e.currentTarget.style.background="rgba(99,102,241,0.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(99,102,241,0.3)";e.currentTarget.style.background="rgba(99,102,241,0.04)";}}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:"#818cf8", fontSize:14, fontWeight:700 }}>+</div>
                  <span style={{ fontSize:12, fontWeight:700, color:"#818cf8" }}>Ajouter un garant</span>
                  {garants.length>0&&<span style={{ fontSize:9, fontFamily:C.mono, color:"#818cf899" }}>({garants.length} ajouté{garants.length>1?"s":""})</span>}
                </button>
              )}

              {phase==="analyzing"&&<div style={{ animation:"fadeUp 0.3s ease" }}><NLAIProgress step={aiStep} total={NL_AI_STEPS.length} label={aiLabel}/></div>}
              {phase==="intake"&&doneDocs<totalDocs&&<p style={{ textAlign:"center", fontSize:10, color:C.g3, fontFamily:C.mono }}>{totalDocs===3?"Déposez les 3 documents pour lancer l'analyse automatique":`Déposez tous les documents (${doneDocs}/${totalDocs}) pour lancer l'analyse`}</p>}
            </div>
          )}

          {/* ── DONE PHASE ── */}
          {phase==="done"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.4s cubic-bezier(0.2,0.8,0.2,1)" }}>
              {/* Success banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><I.CheckCircle/></div>
                <div><p style={{ fontSize:11, fontWeight:700, color:ocrError?C.yellow:C.green, marginBottom:1 }}>{ocrError?"Extraction partielle — erreur API":`Analyse complète — ${totalDocs} document${totalDocs>1?"s":""} traité${totalDocs>1?"s":""}`}</p><p style={{ fontSize:10, color:C.g2 }}>{ocrError?"Certaines données n'ont pas pu être extraites.":"Données extraites par OCR. Valeurs null = non trouvées. Relisez et validez."}</p></div>
                <div style={{ marginLeft:"auto", textAlign:"center", flexShrink:0 }}><p style={{ fontSize:18, fontWeight:800, color:ocrConf>=70?C.green:ocrConf>=40?C.yellow:C.red }}>{ocrConf}%</p><p style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>CONFIANCE</p></div>
              </div>

              {/* Tenant card header */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:50, height:50, borderRadius:"50%", background:"rgba(0,123,255,0.12)", border:"1.5px solid rgba(0,123,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, color:C.blue, flexShrink:0 }}>{(ocrData?.carte_identite?.prenom||"?")[0]+(ocrData?.carte_identite?.nom||"?")[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <h2 style={{ fontSize:17, fontWeight:800, letterSpacing:"-0.03em" }}>{ocrData?.carte_identite?.prenom||"Prénom"} {ocrData?.carte_identite?.nom||"Nom"}</h2>
                      <span style={{ fontSize:8, fontFamily:C.mono, color:ocrConf>=50?C.green:C.yellow, background:ocrConf>=50?C.greenSub:C.yellowSub, border:`1px solid ${ocrConf>=50?C.greenBord:"rgba(245,158,11,0.25)"}`, padding:"2px 7px", borderRadius:4 }}>{ocrConf>=50?"DOSSIER COMPLET":"EXTRACTION PARTIELLE"}</span>
                    </div>
                    <p style={{ fontSize:11, color:C.g2 }}>{[ocrData?.carte_identite?.date_naissance, ocrData?.carte_identite?.lieu_naissance, ocrData?.fiche_paie?.type_contrat, ocrData?.fiche_paie?.employeur, ocrData?.fiche_paie?.salaire_net].filter(Boolean).join(" · ")||"Données en cours d'extraction..."}</p>
                  </div>
                </div>
                {/* Subtabs */}
                <div style={{ display:"flex", gap:4, borderTop:`1px solid ${C.border}`, paddingTop:12, flexWrap:"wrap" }}>
                  {NL_SUBTABS.map(t=>{
                    const active=subtab===t;
                    return(
                      <button key={t} onClick={()=>setSubtab(t)} style={{ background:active?C.blueSub:"transparent", border:active?"1px solid rgba(0,123,255,0.25)":"1px solid transparent", borderRadius:7, padding:"6px 13px", fontSize:11, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div style={{ animation:"fadeUp 0.2s ease" }}>
                {subtab==="Profil & Identité" &&<NLProfileTab data={ocrData} confidence={ocrConf}/>}
                {subtab==="Garants"           &&<NLGarantsTab garantsOcr={garantsOcr} garants={garants}/>}
                {subtab==="Dossier Numérique" &&<NLDocumentsTab files={files}/>}
                {subtab==="Coordonnées"       &&<NLCoordonneesTab data={ocrData}/>}
              </div>
            </div>
          )}
        </div>

        {/* Panel footer CTA */}
        {phase==="done"&&(
          <div style={{ padding:"16px 24px", borderTop:`1px solid ${C.border}`, background:"#08080A", display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0, position:"sticky", bottom:0 }}>
            <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"10px 20px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              Annuler
            </button>
            <button onClick={()=>{
              if(!validated){
                setValidated(true);
                const ci = ocrData?.carte_identite || {};
                const fp = ocrData?.fiche_paie || {};
                const jd = ocrData?.justificatif_domicile || {};
                if(onSave) onSave({
                  nom: ci.nom || "Inconnu",
                  prenom: ci.prenom || "Inconnu",
                  adresse: jd.adresse_complete || "",
                  ville: "",
                  tel: "",
                  mail: "",
                  loyer: "— €",
                  echeance: "1er du mois",
                  sexe: ci.sexe,
                  dateNaissance: ci.date_naissance,
                  lieuNaissance: ci.lieu_naissance,
                  nationalite: ci.nationalite,
                  employeur: fp.employeur,
                  typeContrat: fp.type_contrat,
                  salaireNet: fp.salaire_net,
                  salaireBrut: fp.salaire_brut,
                  ocrData: ocrData,
                  garantsOcr: garantsOcr,
                  nbGarants: garants.length,
                });
              }
            }}
              style={{ background:validated?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"10px 28px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, letterSpacing:"0.04em", boxShadow:validated?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`, transition:"all 0.2s" }}
              onMouseEnter={e=>{if(!validated){e.currentTarget.style.boxShadow="0 6px 30px rgba(0,123,255,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=validated?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
              {validated?<><I.CheckCircle/> Locataire validé !</>:<><I.Check/> Valider le locataire</>}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export { NouveauLocatairePanel };
