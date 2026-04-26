import { useState } from "react";
import { C } from "../tokens/colors.js";

/* ════════════════════════════════════════
   AUTH — LOGIN SCREEN
════════════════════════════════════════ */

function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [prenom,   setPrenom]   = useState("");
  const [nom,      setNom]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mode,     setMode]     = useState("login"); // login | signup

  const handleSubmit = () => {
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    if (mode==="signup" && (!prenom || !nom)) { setError("Veuillez renseigner votre prénom et nom."); return; }
    setError(""); setLoading(true);
    setTimeout(()=>{
      setLoading(false);
      const p = mode==="signup" ? prenom : (email.split("@")[0].split(".")[0] || "Utilisateur");
      const n = mode==="signup" ? nom    : (email.split("@")[0].split(".")[1] || "");
      onLogin({
        prenom: p.charAt(0).toUpperCase()+p.slice(1),
        nom:    n.charAt(0).toUpperCase()+n.slice(1),
        email,
        plan:   "Pro",
        dateInscription: new Date().toLocaleDateString("fr-FR"),
        telephone: "",
        regime: "LMNP",
        avatar: (p[0]||"?").toUpperCase() + (n[0]||"").toUpperCase(),
      });
    }, 1100);
  };

  const EyeIcon = ()=>(
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {showPass
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:998, background:"#080808", display:"flex", fontFamily:C.font, color:C.w, animation:"fadeUp 0.4s ease" }}>

      {/* Left panel — branding */}
      <div style={{ flex:1, background:"linear-gradient(145deg,#0a0a0a 0%,#0d1117 100%)", borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"40px 48px", position:"relative", overflow:"hidden" }}>
        {/* Ambient glow */}
        <div style={{ position:"absolute", top:-80, left:-80, width:320, height:320, borderRadius:"50%", background:`radial-gradient(circle,${C.blueGlow} 0%,transparent 70%)`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents:"none" }}/>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative", zIndex:1 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${C.blue},#1D4ED8)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, boxShadow:`0 4px 20px ${C.blueGlow}` }}>E</div>
          <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em" }}>EQUITY</span>
        </div>

        {/* Headline */}
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ fontSize:10, fontFamily:C.mono, letterSpacing:"0.14em", color:C.blue, marginBottom:14 }}>GESTION PATRIMONIALE INTELLIGENTE</p>
          <h2 style={{ fontSize:34, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.2, marginBottom:16 }}>
            Votre patrimoine,<br/><span style={{ color:C.blue }}>piloté par l'IA</span>
          </h2>
          <p style={{ fontSize:14, color:C.g2, lineHeight:1.75, maxWidth:360 }}>
            Centralisez vos biens, suivez vos locataires, optimisez votre fiscalité — le tout automatisé par l'intelligence artificielle.
          </p>

          {/* Social proof */}
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:10 }}>
            {[
              "📊 Analyse IA de vos documents en quelques secondes",
              "🏠 Valorisation temps réel via DVF & Étalab",
              "💶 Optimisation fiscale LMNP / SCI / Pinel",
            ].map((item,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, animation:`fadeUp ${0.4+i*0.1}s ease both` }}>
                <span style={{ fontSize:14 }}>{item.split(" ")[0]}</span>
                <span style={{ fontSize:13, color:C.g1 }}>{item.slice(item.indexOf(" ")+1)}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:10, color:C.g3, fontFamily:C.mono, position:"relative", zIndex:1 }}>© 2026 EQUITY — Tous droits réservés</p>
      </div>

      {/* Right panel — form */}
      <div style={{ width:460, flexShrink:0, display:"flex", flexDirection:"column", padding:"48px 52px", background:"#08080A", overflowY:"auto" }}>
        <div style={{ margin:"auto 0" }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em", marginBottom:6 }}>
            {mode==="login" ? "Connexion" : "Créer un compte"}
          </h1>
          <p style={{ fontSize:13, color:C.g2 }}>
            {mode==="login"
              ? <>Pas encore de compte ? <button onClick={()=>{setMode("signup");setError("");}} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:13, fontWeight:600, padding:0 }}>S'inscrire</button></>
              : <>Déjà un compte ? <button onClick={()=>{setMode("login");setError("");}} style={{ background:"none", border:"none", color:C.blue, cursor:"pointer", fontSize:13, fontWeight:600, padding:0 }}>Se connecter</button></>
            }
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Signup extra fields */}
          {mode==="signup" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[{l:"Prénom",k:"prenom",ph:"Prénom",val:prenom,set:setPrenom},{l:"Nom",k:"nom",ph:"Nom",val:nom,set:setNom}].map(f=>(
                <div key={f.k} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px 16px" }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:5, letterSpacing:"0.1em" }}>{f.l.toUpperCase()}</p>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%" }}
                    onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
                    onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Email */}
          <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px 16px", transition:"border-color 0.15s" }}>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:5, letterSpacing:"0.1em" }}>ADRESSE E-MAIL</p>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="thomas.dubois@exemple.fr"
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
              onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
              style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%" }}
            />
          </div>

          {/* Password */}
          <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:8, transition:"border-color 0.15s" }}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:5, letterSpacing:"0.1em" }}>MOT DE PASSE</p>
              <input
                type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                onFocus={e=>e.currentTarget.closest("div").style.borderColor=C.blue}
                onBlur={e=>e.currentTarget.closest("div").style.borderColor=C.border}
                style={{ background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:600, color:C.w, width:"100%" }}
              />
            </div>
            <button onClick={()=>setShowPass(s=>!s)} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:0, display:"flex", transition:"color 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.g1} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
              <EyeIcon/>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:9, padding:"10px 14px" }}>
              <p style={{ fontSize:12, color:C.red }}>{error}</p>
            </div>
          )}

          {mode==="login" && (
            <div style={{ textAlign:"right" }}>
              <button style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, transition:"color 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:12, padding:"14px", color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"wait":"pointer", letterSpacing:"0.03em", boxShadow:`0 6px 28px ${C.blueGlow}`, transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:10, position:"relative", overflow:"hidden", marginTop:4 }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.boxShadow="0 8px 36px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)";}}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 6px 28px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
            {loading && <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)", backgroundSize:"200% 100%", animation:"shimmer 1.2s infinite" }}/>}
            {loading
              ? <><div style={{ width:15, height:15, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Connexion en cours…</>
              : mode==="login" ? "Se connecter →" : "Créer mon compte →"
            }
          </button>
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:C.border }}/>
          <span style={{ fontSize:10, color:C.g3, fontFamily:C.mono }}>OU</span>
          <div style={{ flex:1, height:1, background:C.border }}/>
        </div>

        {/* Demo access */}
        <button onClick={()=>onLogin({ prenom:"Thomas", nom:"Dubois", email:"thomas.dubois@equity.fr", plan:"Pro", dateInscription:"01/01/2026", telephone:"06 12 34 56 78", regime:"LMNP Réel", avatar:"TD" })}
          style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"13px", color:C.g1, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s", letterSpacing:"0.02em" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g1;}}>
          ⚡ Accès démo — Thomas Dubois
        </button>

        <p style={{ fontSize:10, color:C.g3, textAlign:"center", marginTop:20, lineHeight:1.6, fontFamily:C.mono }}>
          En vous connectant, vous acceptez les<br/>Conditions d'utilisation et la Politique de confidentialité.
        </p>
        </div>{/* end margin wrapper */}
      </div>
    </div>
  );
}

export { LoginScreen };
