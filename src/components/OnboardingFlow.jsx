import { useState } from "react";
import { C } from "../tokens/colors.js";

/* ════════════════════════════════════════
   ONBOARDING FLOW
════════════════════════════════════════ */
const ONBOARDING_STEPS = [
  {
    id: "bienvenue",
    emoji: "👋",
    title: "Bienvenue sur EQUITY",
    sub: "Votre espace de gestion patrimoniale intelligent. En 4 étapes, nous allons configurer votre compte.",
    cta: "C'est parti →",
    skip: false,
    fields: null,
  },
  {
    id: "profil",
    emoji: "👤",
    title: "Votre profil",
    sub: "Ces informations nous permettent de personnaliser votre expérience.",
    cta: "Continuer",
    skip: true,
    fields: [
      { key:"prenom",    label:"Prénom",              placeholder:"Thomas",            type:"text"   },
      { key:"nom",       label:"Nom",                 placeholder:"Dubois",            type:"text"   },
      { key:"email",     label:"Adresse e-mail",      placeholder:"thomas@exemple.fr", type:"email"  },
      { key:"telephone", label:"Téléphone",           placeholder:"06 12 34 56 78",    type:"tel"    },
    ],
  },
  {
    id: "situation",
    emoji: "🏠",
    title: "Votre situation",
    sub: "Dites-nous en plus sur votre patrimoine actuel.",
    cta: "Continuer",
    skip: true,
    choices: [
      {
        key:"nb_biens",
        label:"Combien de biens immobiliers possédez-vous ?",
        options:["Je débute (0 bien)","1 bien","2 à 5 biens","6 biens et plus"],
      },
      {
        key:"objectif",
        label:"Quel est votre objectif principal ?",
        options:["Cash-flow mensuel","Plus-value à la revente","Réduction fiscale","Constitution de patrimoine"],
      },
      {
        key:"regime",
        label:"Régime fiscal principal ?",
        options:["LMNP (meublé)","Location nue","SCI","Je ne sais pas encore"],
      },
    ],
  },
  {
    id: "premier_bien",
    emoji: "🏗️",
    title: "Ajoutez votre premier bien",
    sub: "Commencez à construire votre portefeuille. Vous pouvez le faire maintenant ou plus tard.",
    cta: "Ajouter mon premier bien",
    ctaSecondary: "Je le ferai plus tard",
    skip: true,
    isBienStep: true,
  },
  {
    id: "pret",
    emoji: "🚀",
    title: "Tout est prêt !",
    sub: "Votre espace est configuré. Voici ce que vous pouvez faire dès maintenant.",
    cta: "Accéder au tableau de bord",
    skip: false,
    isLast: true,
    features: [
      { icon:"📊", label:"Pilotage",    desc:"Suivez vos KPIs en temps réel" },
      { icon:"🏠", label:"Mes biens",   desc:"Gérez et valorisez chaque actif" },
      { icon:"👥", label:"Locataires",  desc:"Suivez loyers et dossiers" },
      { icon:"🤖", label:"IA intégrée", desc:"Scan docs, analyses, suggestions" },
    ],
  },
];

function OnboardingFlow({ onComplete, onAddBien }) {
  const [stepIdx, setStepIdx]   = useState(0);
  const [formData, setFormData] = useState({});
  const [choices,  setChoices]  = useState({});
  const [exiting,  setExiting]  = useState(false);

  const step    = ONBOARDING_STEPS[stepIdx];
  const total   = ONBOARDING_STEPS.length;
  const isFirst = stepIdx === 0;
  const isLast  = step.isLast;

  const goNext = () => {
    if (isLast) { finish(); return; }
    setExiting(true);
    setTimeout(()=>{ setStepIdx(i=>i+1); setExiting(false); }, 220);
  };

  const goPrev = () => {
    if (isFirst) return;
    setExiting(true);
    setTimeout(()=>{ setStepIdx(i=>i-1); setExiting(false); }, 220);
  };

  const finish = () => { setExiting(true); setTimeout(()=>onComplete({ formData, choices }), 300); };

  const setChoice = (key, val) => setChoices(c=>({...c,[key]:val}));
  const setField  = (key, val) => setFormData(f=>({...f,[key]:val}));

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:999,
      background:"#080808",
      display:"flex", flexDirection:"column",
      fontFamily:C.font, color:C.w,
      opacity: exiting ? 0 : 1,
      transform: exiting ? "scale(0.98)" : "scale(1)",
      transition:"opacity 0.22s ease, transform 0.22s ease",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 32px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${C.blue},#1D4ED8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, boxShadow:`0 4px 12px ${C.blueGlow}` }}>E</div>
          <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>EQUITY</span>
        </div>

        {/* Breadcrumb / stepper */}
        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
          {ONBOARDING_STEPS.map((s,i)=>{
            const done    = i < stepIdx;
            const current = i === stepIdx;
            const future  = i > stepIdx;
            return (
              <div key={s.id} style={{ display:"flex", alignItems:"center" }}>
                {/* Connector */}
                {i > 0 && (
                  <div style={{ width:32, height:1.5, background: done ? C.green : current ? C.blue : "#2a2a2a", transition:"background 0.4s" }}/>
                )}
                {/* Node */}
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:10, fontWeight:800,
                  background: done ? C.green : current ? C.blue : "#1a1a1a",
                  border:`1.5px solid ${done ? C.green : current ? C.blue : "#2a2a2a"}`,
                  color: done||current ? "#fff" : C.g3,
                  boxShadow: current ? `0 0 14px ${C.blueGlow}` : done ? "0 0 10px rgba(16,185,129,0.3)" : "none",
                  transition:"all 0.35s",
                  cursor: done ? "pointer" : "default",
                  flexShrink:0,
                }}
                onClick={()=>{ if(done){ setExiting(true); setTimeout(()=>{ setStepIdx(i); setExiting(false); },200); } }}
                title={s.title}>
                  {done
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <span>{i+1}</span>
                  }
                </div>
                {/* Label under node — only current */}
                {current && (
                  <div style={{ position:"absolute", marginTop:42, fontSize:8.5, fontFamily:C.mono, color:C.blue, letterSpacing:"0.08em", whiteSpace:"nowrap", transform:"translateX(-50%)", pointerEvents:"none" }}>
                    {s.title.toUpperCase().slice(0,12)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step counter + Passer */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>
            {stepIdx+1} / {total}
          </span>
          <button onClick={finish}
            style={{ background:"none", border:"none", color:C.g3, fontSize:11, fontFamily:C.mono, cursor:"pointer", padding:"4px 0", letterSpacing:"0.06em", transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color=C.g1}
            onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
            Passer
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px", overflowY:"auto" }}>
        <div style={{
          width:"100%", maxWidth:560,
          display:"flex", flexDirection:"column", gap:28,
          animation:"fadeUp 0.35s cubic-bezier(0.2,0.8,0.2,1)",
        }}>
          {/* Emoji + heading */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16, lineHeight:1 }}>{step.emoji}</div>
            <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.04em", marginBottom:10 }}>{step.title}</h1>
            <p style={{ fontSize:14, color:C.g2, lineHeight:1.7, maxWidth:440, margin:"0 auto" }}>{step.sub}</p>
          </div>

          {/* ── STEP: PROFIL (fields) ── */}
          {step.fields && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {step.fields.map(f=>{
                const focused = false;
                return (
                  <div key={f.key} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", transition:"border-color 0.15s" }}>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:6 }}>{f.label.toUpperCase()}</p>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={formData[f.key]||""}
                      onChange={e=>setField(f.key,e.target.value)}
                      onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
                      onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
                      style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%", colorScheme:"dark" }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP: SITUATION (choices) ── */}
          {step.choices && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {step.choices.map(q=>(
                <div key={q.key}>
                  <p style={{ fontSize:11, color:C.g2, marginBottom:8, fontWeight:600 }}>{q.label}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {q.options.map(opt=>{
                      const sel = choices[q.key]===opt;
                      return (
                        <button key={opt} onClick={()=>setChoice(q.key,opt)} style={{
                          background: sel ? C.blueSub : "#111",
                          border:`1.5px solid ${sel ? C.blue : "#252525"}`,
                          borderRadius:10, padding:"8px 16px",
                          fontSize:12, fontWeight:sel?700:500,
                          color:sel?C.blue:C.g1,
                          cursor:"pointer", transition:"all 0.15s",
                          boxShadow: sel ? `0 0 12px ${C.blueGlow}` : "none",
                        }}
                        onMouseEnter={e=>{ if(!sel){ e.currentTarget.style.borderColor="#3B3B44"; e.currentTarget.style.color=C.w; }}}
                        onMouseLeave={e=>{ if(!sel){ e.currentTarget.style.borderColor="#252525"; e.currentTarget.style.color=C.g1; }}}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP: PREMIER BIEN ── */}
          {step.isBienStep && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.08),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.2)", borderRadius:14, padding:"22px 24px", display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ width:48, height:48, borderRadius:12, background:C.blueSub, border:"1px solid rgba(0,123,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0, fontSize:22 }}>🏠</div>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:4 }}>Import intelligent par IA</p>
                  <p style={{ fontSize:12, color:C.g2, lineHeight:1.6 }}>Déposez votre acte de vente et vos diagnostics — EQUITY remplit automatiquement votre fiche bien en quelques secondes.</p>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {["Acte de vente","Diagnostics","Photos"].map((d,i)=>(
                  <div key={d} style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px", textAlign:"center" }}>
                    <p style={{ fontSize:18, marginBottom:6 }}>{["📄","🔬","📷"][i]}</p>
                    <p style={{ fontSize:11, color:C.g2, fontWeight:500 }}>{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: PRÊT (features grid) ── */}
          {step.features && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {step.features.map((f,i)=>(
                <div key={i} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px", display:"flex", gap:12, alignItems:"flex-start", animation:`fadeUp ${0.3+i*0.07}s ease both` }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{f.icon}</span>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:C.w, marginBottom:3 }}>{f.label}</p>
                    <p style={{ fontSize:11, color:C.g2 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CTAs ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:4 }}>
            {/* Primary CTA */}
            <button
              onClick={step.isBienStep ? ()=>{ finish(); setTimeout(()=>onAddBien(),400); } : goNext}
              style={{
                background:`linear-gradient(135deg,${C.blue},#2563EB)`,
                border:"none", borderRadius:12, padding:"14px 0",
                color:"#fff", fontSize:14, fontWeight:700,
                cursor:"pointer", letterSpacing:"0.03em",
                boxShadow:`0 6px 28px ${C.blueGlow}`,
                transition:"all 0.2s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 36px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 6px 28px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
              {step.cta}
            </button>

            {/* Secondary CTA */}
            {step.ctaSecondary && (
              <button onClick={goNext} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 0", color:C.g2, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border;}}>
                {step.ctaSecondary}
              </button>
            )}

            {/* Back + Skip row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {!isFirst && !isLast
                ? <button onClick={goPrev} style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4, transition:"color 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=C.g1}
                    onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                    ← Retour
                  </button>
                : <span/>
              }
              {step.skip && !isLast && (
                <button onClick={goNext} style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, transition:"color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.g1}
                  onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                  Passer cette étape →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM PROGRESS BAR ── */}
      <div style={{ height:3, background:"#111", flexShrink:0 }}>
        <div style={{ height:"100%", width:`${((stepIdx)/(total-1))*100}%`, background:`linear-gradient(90deg,${C.blue},#60a5fa)`, borderRadius:99, transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)" }}/>
      </div>
    </div>
  );
}

export { OnboardingFlow };
