import { useState, useRef, useEffect, useMemo, useCallback } from "react";

/* Font Loader */
const _fontLink = typeof document !== 'undefined' && !document.getElementById('eq-fonts') && (() => {
  const l = document.createElement('link');
  l.id = 'eq-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
  document.head.appendChild(l);
  return true;
})();

/* ════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════ */
const C = {
  bg:           "#09090B",
  card:         "#111113",
  card2:        "#0C0C0F",
  border:       "#1C1C22",
  border2:      "#27272E",
  blue:         "#3B82F6",
  blueGlow:     "rgba(59,130,246,0.28)",
  blueSub:      "rgba(59,130,246,0.08)",
  blueMid:      "rgba(59,130,246,0.15)",
  green:        "#10B981",
  greenSub:     "rgba(16,185,129,0.08)",
  greenBord:    "rgba(16,185,129,0.22)",
  red:          "#EF4444",
  redSub:       "rgba(239,68,68,0.08)",
  yellow:       "#F59E0B",
  yellowSub:    "rgba(245,158,11,0.08)",
  w:            "#FAFAFA",
  g1:           "#A1A1AA",
  g2:           "#71717A",
  g3:           "#3F3F46",
  g4:           "#27272A",
  font:         "'Outfit', system-ui, sans-serif",
  mono:         "'JetBrains Mono', 'SF Mono', monospace",
};

/* ════════════════════════════════════════
   INLINE ICONS
════════════════════════════════════════ */
const I = {
  Clock:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Home:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Users:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Dollar:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Immeuble: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 21V11h4a2 2 0 0 1 2 2v8"/><rect x="8" y="6" width="2" height="2"/><rect x="11" y="6" width="2" height="2"/><rect x="8" y="10" width="2" height="2"/><rect x="11" y="10" width="2" height="2"/><rect x="8" y="14" width="2" height="2"/><rect x="11" y="14" width="2" height="2"/><rect x="17" y="14" width="2" height="2"/></svg>,
  Safe:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9v-3M12 18v-3M9 12H6M18 12h-3"/></svg>,
  Plus:     ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Bell:     ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Search:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Upload:   ()=><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><polyline points="16,16 12,12 8,16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  X:        ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trend:    ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>,
  Sparkles: ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/><path d="M19 17v4"/><path d="M17 19h4"/></svg>,
  Check:    ()=><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  MapPin:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Edit:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Chevron:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Ruler:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/></svg>,
  Grid:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Calendar: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Euro:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 10h12"/><path d="M4 14h12"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 20.1 7.9 7.9 0 0 0 13.8 22c2 0 3.9-.8 5.2-2"/></svg>,
  Key:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="21" y2="21"/><line x1="17" y1="17" x2="19.5" y2="14.5"/></svg>,
  Lock:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Target:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  TrendUp:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Leaf:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  Eye:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Building: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  Tag:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Palette:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  Layers:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Globe:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  FileText: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Home2:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Zap:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Repeat:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  Save:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Camera:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Activity: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Trash:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  AlertTriangle: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  // NouveauLocataire icons
  ID:         ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10h.01M6 10h4"/><path d="M6 14h4M16 14h2"/></svg>,
  Receipt:    ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M4 2v20l3-2 2 2 3-2 2 2 3-2 3 2V2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>,
  HomeDoc:    ()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Upload2:    ()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  CheckCircle:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Shield:     ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Briefcase:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4"/></svg>,
  File:       ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Download:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Loader:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
  UserCheck:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
  Users2i:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Mail:       ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone:      ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18"/></svg>,
  User:       ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Simulator:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h2l2 4 2-6 2 4h2"/></svg>,
  Link:       ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Send: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Eye: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ChevronRight: ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

/* ════════════════════════════════════════
   DATA
════════════════════════════════════════ */
const NAV = [
  { id:"pilotage",     label:"Pilotage",     Icon:I.Home      },
  { id:"patrimoine",   label:"Mes biens",    Icon:I.Immeuble    },
  { id:"locataires",   label:"Locataires",   Icon:I.Users     },
  { id:"finances",     label:"Finances",     Icon:I.Dollar    },
  { id:"coffre",       label:"Coffre",       Icon:I.Safe      },
  { id:"simulateurs",  label:"Simulateurs",  Icon:I.Simulator },
];

const INITIAL_ASSETS = [];

const ALERTS_DEMO = [];

// daysLate: 0 = à jour, 1–9 = en retard (orange), 10+ = impayé (rouge)
const TENANTS_DEFAULT = [];

const DPE_MAP = {
  A:{ color:"#22c55e", score:{ A:"35", B:"70", C:"148", D:"210", E:"280" } },
  B:{ color:"#84cc16" },
  C:{ color:"#eab308" },
  D:{ color:"#f97316" },
  E:{ color:"#ef4444" },
};
const DPE_SCORES = { A:"12", B:"70", C:"148", D:"210", D2:"60", E:"280" };
const GES_SCORES = { A:"4", B:"12", C:"28", D:"44" };

/* ════════════════════════════════════════
   SHARED MICRO-COMPONENTS
════════════════════════════════════════ */
function Sparkline({ color="#10B981" }) {
  const pts="0,28 12,22 24,25 36,15 48,18 60,8 72,12 84,5 96,9";
  return (
    <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
      <defs><linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points={`0,32 ${pts} 96,32`} fill={`url(#sg${color.replace('#','')})`}/>
    </svg>
  );
}

function Gauge({ value, color }) {
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

/* ════════════════════════════════════════
   SMART INTAKE MODAL
════════════════════════════════════════ */
function SmartIntakeModal({ onClose }) {
  const [drag, setDrag]   = useState(false);
  const [file, setFile]   = useState(null);
  const ref = useRef();
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:18, width:"100%", maxWidth:520, padding:"32px 32px 28px", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.blue, boxShadow:`0 0 8px ${C.blue}` }}/>
              <span style={{ fontSize:10, fontFamily:C.mono, color:C.blue, letterSpacing:"0.12em" }}>SMART INTAKE</span>
            </div>
            <h2 style={{ fontSize:20, fontWeight:700, color:C.w, letterSpacing:"-0.02em" }}>Nouveau dossier</h2>
            <p style={{ fontSize:12, color:C.g2, marginTop:4 }}>Déposez vos documents — l'IA s'occupe du reste.</p>
          </div>
          <button onClick={onClose} style={{ background:"#1f1f1f", border:`1px solid ${C.border}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center" }}><I.X/></button>
        </div>
        <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);setFile(e.dataTransfer.files[0])}} onClick={()=>ref.current.click()}
          style={{ border:`1.5px dashed ${drag?C.blue:file?C.green:"#2a2a2a"}`, borderRadius:14, padding:"36px 24px", textAlign:"center", cursor:"pointer", background:drag?"rgba(0,123,255,0.05)":file?"rgba(16,185,129,0.05)":"#0a0a0a", transition:"all 0.2s", boxShadow:drag?`0 0 24px rgba(0,123,255,0.15)`:"none" }}>
          <input ref={ref} type="file" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])}/>
          <div style={{ color:file?C.green:drag?C.blue:C.g2, marginBottom:12, display:"flex", justifyContent:"center" }}><I.Upload/></div>
          {file ? <><p style={{ fontSize:13, color:C.green, fontWeight:600 }}>{file.name}</p><p style={{ fontSize:11, color:C.g2, marginTop:4 }}>Prêt pour analyse IA</p></>
                : <><p style={{ fontSize:13, color:C.w, fontWeight:600 }}>Glissez votre document ici</p><p style={{ fontSize:11, color:C.g2, marginTop:4 }}>PDF, Image, Contrat · Analyse IA automatique</p></>}
        </div>
        <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {["Bail","Quittance","Assurance","Diagnostic","Facture","Autre"].map(t=>(
            <button key={t} style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 4px", color:C.g2, fontSize:11, cursor:"pointer", fontFamily:C.mono, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.blue;e.target.style.color=C.blue}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.g2}}>{t}</button>
          ))}
        </div>
        <button style={{ marginTop:20, width:"100%", background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"13px 0", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:"0.04em", boxShadow:`0 4px 24px ${C.blueGlow}` }}
          onMouseEnter={e=>e.target.style.opacity="0.88"} onMouseLeave={e=>e.target.style.opacity="1"}>
          ⚡ ANALYSER AVEC L'IA
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DPE VISUAL COMPONENT
════════════════════════════════════════ */
function DpeBadge({ letter, label, score }) {
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

/* ════════════════════════════════════════
   DATA TILE WITH OCR TOOLTIP
════════════════════════════════════════ */
function DataTile({ icon:TIcon, label, value, accent, full }) {
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

/* ════════════════════════════════════════
   ACCESS TILE
════════════════════════════════════════ */
function AccessTile({ icon:TIcon, label, value, color }) {
  const [copied,setCopied] = useState(false);
  return (
    <div onClick={()=>{setCopied(true);setTimeout(()=>setCopied(false),1500)}}
      style={{ background:`${color}0d`, border:`1px solid ${color}28`, borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s" }}
      onMouseEnter={e=>{e.currentTarget.style.background=`${color}18`;e.currentTarget.style.borderColor=`${color}44`}}
      onMouseLeave={e=>{e.currentTarget.style.background=`${color}0d`;e.currentTarget.style.borderColor=`${color}28`}}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
        <span style={{ color }}><TIcon/></span>
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g2, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:20, fontWeight:800, color, letterSpacing:"0.08em", fontFamily:C.mono }}>{value}</span>
        <span style={{ fontSize:9, color:copied?"#22c55e":color, fontFamily:C.mono, opacity:.7 }}>{copied?"✓ Copié":"Tap pour copier"}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PROPERTY DETAIL SLIDE-OVER
════════════════════════════════════════ */
/* ════════════════════════════════════════
   FORM FIELD COMPONENTS (for Caract. complémentaires)
════════════════════════════════════════ */
const inputBase = {
  width:"100%", background:"#08080A",
  border:`1px solid #252525`, borderRadius:8,
  padding:"9px 12px", color:"#fff",
  fontSize:12, fontFamily:C.font,
  outline:"none", transition:"border-color 0.15s, box-shadow 0.15s",
  appearance:"none", WebkitAppearance:"none",
};

function FormField({ label, icon:FIcon, children, col2 }) {
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

function FInput({ value, onChange, placeholder, type="text" }) {
  const [focus, setFocus] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ ...inputBase, borderColor: focus ? "#007BFF" : "#252525", boxShadow: focus ? "0 0 0 2px rgba(0,123,255,0.12)" : "none" }}
      onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
  );
}

function FSelect({ value, onChange, options }) {
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

function FTextarea({ value, onChange, placeholder, rows=4 }) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{ ...inputBase, borderColor: focus ? "#007BFF" : "#252525", boxShadow: focus ? "0 0 0 2px rgba(0,123,255,0.12)" : "none", resize:"vertical", lineHeight:1.6 }}
      onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
  );
}

function DPESelector({ label, value, onChange }) {
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

function ColorDot({ color }) {
  return (
    <div style={{ width:20, height:20, borderRadius:"50%", background:color||"#007BFF", border:"2px solid #252525", flexShrink:0, boxShadow:`0 0 8px ${color||"#007BFF"}60` }}/>
  );
}

/* ── MAIN COMPLEMENTARY TAB ── */
const REFERENCE_COLORS = ["#007BFF","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#84CC16","#F97316","#6B7280"];

function CaractComplementaires({ asset }) {
  const [form, setForm] = useState({
    typeBien: asset.type==="Maison"?"Maison":asset.type==="Appartement"?"Appartement":asset.type==="Studio"?"Studio":"Autre",
    nomBien: asset.name,
    couleur: "#007BFF",
    dateConstruction: String(asset.year),
    adresse: asset.addr.split(",")[0]||"",
    complement: "",
    etage: "",
    ville: asset.addr.includes("Eysines")?"Eysines":asset.addr.includes("Bordeaux")?"Bordeaux":"Mérignac",
    codePostal: asset.addr.match(/\d{5}/)?.[0]||"",
    region: "Nouvelle-Aquitaine",
    pays: "France",
    superficie: asset.surface.replace(" m²",""),
    nbPieces: asset.rooms.split("P")[0]||"",
    nbChambres: asset.rooms.match(/(\d+)Ch/)?.[1]||"",
    nbSDB: asset.rooms.match(/(\d+)SDB/)?.[1]||"",
    description: "",
    etatLocatif: "Loué",
    typeLocation: asset.mode.includes("Meublée")||asset.mode.includes("meublée")?"Meublée":"Vide",
    loyerRef: String(asset.loyer||"").replace(" €","").replace(" / mois","").trim(),
    charges: "50",
    frequence: "Mensuel",
    classeEnergie: asset.dpe,
    indiceGES: asset.ges,
    depensesBasse: "1200",
    depensesHaute: "1500",
    anneeDPE: "2023",
  });
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm(f=>({...f, [k]: e.target ? e.target.value : e}));
  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const gridStyle = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };
  const sectionStyle = { display:"flex", flexDirection:"column", gap:14 };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* ── SECTION 1 : Identité ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="1 · INFORMATIONS GÉNÉRALES"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <FormField label="Type de bien" icon={I.Building}>
              <FSelect value={form.typeBien} onChange={set("typeBien")} options={[
                {v:"",l:"Choisir..."},{v:"Appartement",l:"Appartement"},{v:"Maison",l:"Maison"},
                {v:"Immeuble",l:"Immeuble"},{v:"Studio",l:"Studio"},{v:"Loft",l:"Loft"},
                {v:"Local commercial",l:"Local commercial / professionnel"},{v:"Terrain",l:"Terrain"},
                {v:"Garage",l:"Garage / Parking"},{v:"Cave",l:"Cave"},{v:"Autre",l:"Autre"},
              ]}/>
            </FormField>
            <FormField label="Identifiant / Nom du bien" icon={I.Tag}>
              <FInput value={form.nomBien} onChange={set("nomBien")} placeholder="ex: Villa Eysines, Lot n°4"/>
            </FormField>
          </div>

          <FormField label="Couleur de référence (calendrier & dashboard)" icon={I.Palette}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {REFERENCE_COLORS.map(col=>(
                  <button key={col} onClick={()=>setForm(f=>({...f, couleur:col}))}
                    style={{ width:24, height:24, borderRadius:"50%", background:col, border:`2px solid ${form.couleur===col?"#fff":"transparent"}`, cursor:"pointer", transition:"all 0.15s", boxShadow: form.couleur===col?`0 0 10px ${col}70`:"none" }}/>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:4 }}>
                <ColorDot color={form.couleur}/>
                <span style={{ fontSize:11, fontFamily:C.mono, color:C.g2 }}>{form.couleur}</span>
              </div>
            </div>
          </FormField>

          <div style={gridStyle}>
            <FormField label="Année de construction" icon={I.Calendar}>
              <FInput value={form.dateConstruction} onChange={set("dateConstruction")} placeholder="ex: 1985" type="number"/>
            </FormField>
          </div>
        </div>
      </div>

      {/* ── SECTION 2 : Localisation ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="2 · LOCALISATION PRÉCISE"/>
        <div style={sectionStyle}>
          <FormField label="Adresse complète (N°, Rue)" icon={I.MapPin} col2>
            <FInput value={form.adresse} onChange={set("adresse")} placeholder="ex: 12 Allée des Chênes"/>
          </FormField>
          <div style={gridStyle}>
            <FormField label="Complément d'adresse" icon={I.Layers}>
              <FInput value={form.complement} onChange={set("complement")} placeholder="Résidence, Bâtiment, Escalier"/>
            </FormField>
            <FormField label="Étage / N° de porte" icon={I.Home2}>
              <FInput value={form.etage} onChange={set("etage")} placeholder="ex: 3ème · Porte 12"/>
            </FormField>
            <FormField label="Ville" icon={I.Globe}>
              <FInput value={form.ville} onChange={set("ville")} placeholder="ex: Bordeaux"/>
            </FormField>
            <FormField label="Code Postal" icon={I.MapPin}>
              <FInput value={form.codePostal} onChange={set("codePostal")} placeholder="ex: 33000" type="text"/>
            </FormField>
            <FormField label="Région / État" icon={I.Globe}>
              <FInput value={form.region} onChange={set("region")} placeholder="ex: Nouvelle-Aquitaine"/>
            </FormField>
            <FormField label="Pays" icon={I.Globe}>
              <FSelect value={form.pays} onChange={set("pays")} options={["France","Belgique","Suisse","Luxembourg","Espagne","Autre"]}/>
            </FormField>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 : ADN Technique ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="3 · ADN TECHNIQUE"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <FormField label="Superficie totale (m²)" icon={I.Ruler}>
              <FInput value={form.superficie} onChange={set("superficie")} placeholder="ex: 210" type="number"/>
            </FormField>
            <FormField label="Nombre de pièces (total)" icon={I.Grid}>
              <FInput value={form.nbPieces} onChange={set("nbPieces")} placeholder="ex: 8" type="number"/>
            </FormField>
            <FormField label="Nombre de chambres" icon={I.Home2}>
              <FInput value={form.nbChambres} onChange={set("nbChambres")} placeholder="ex: 4" type="number"/>
            </FormField>
            <FormField label="Salles de bain / Salles d'eau" icon={I.Layers}>
              <FInput value={form.nbSDB} onChange={set("nbSDB")} placeholder="ex: 2" type="number"/>
            </FormField>
          </div>
          <FormField label="Description libre (annonce & contrat)" icon={I.FileText} col2>
            <FTextarea value={form.description} onChange={set("description")} rows={4}
              placeholder="Décrivez le bien : situation géographique, atouts, prestations, environnement..."/>
          </FormField>
        </div>
      </div>

      {/* ── SECTION 4 : État locatif ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="4 · ÉTAT & CONFIGURATION LOCATIVE"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <FormField label="État locatif actuel" icon={I.Target}>
              <FSelect value={form.etatLocatif} onChange={set("etatLocatif")} options={[
                "Automatique","Disponible","Loué","En préavis","En recherche","Indisponible","En travaux"
              ]}/>
            </FormField>
            <FormField label="Type de location proposé" icon={I.Home2}>
              <FSelect value={form.typeLocation} onChange={set("typeLocation")} options={["Meublée","Vide","Saisonnière"]}/>
            </FormField>
          </div>
          <div style={gridStyle}>
            <FormField label="Loyer de référence HC (€)" icon={I.Euro}>
              <FInput value={form.loyerRef} onChange={set("loyerRef")} placeholder="ex: 3200" type="number"/>
            </FormField>
            <FormField label="Provisions sur charges (€)" icon={I.Euro}>
              <FInput value={form.charges} onChange={set("charges")} placeholder="ex: 50" type="number"/>
            </FormField>
          </div>
          <FormField label="Fréquence de paiement" icon={I.Repeat}>
            <div style={{ display:"flex", gap:6 }}>
              {["Mensuel","Bimestriel","Trimestriel","Semestriel","Annuel"].map(f=>{
                const active = form.frequence===f;
                return (
                  <button key={f} onClick={()=>setForm(fr=>({...fr,frequence:f}))}
                    style={{ flex:1, padding:"7px 4px", borderRadius:7, fontSize:10, fontFamily:C.mono, cursor:"pointer", transition:"all 0.15s",
                      background: active ? C.blueSub : "#0a0a0a",
                      border: `1px solid ${active ? C.blue : "#252525"}`,
                      color: active ? C.blue : C.g2,
                      fontWeight: active ? 600 : 400 }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>
      </div>

      {/* ── SECTION 5 : DPE ── */}
      <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:14, padding:"18px 18px 20px" }}>
        <SectionTitle label="5 · PERFORMANCE ÉNERGÉTIQUE (DPE)"/>
        <div style={sectionStyle}>
          <div style={gridStyle}>
            <DPESelector label="Classe Énergie" value={form.classeEnergie} onChange={v=>setForm(f=>({...f,classeEnergie:v}))}/>
            <DPESelector label="Indice GES (Gaz à Effet de Serre)" value={form.indiceGES} onChange={v=>setForm(f=>({...f,indiceGES:v}))}/>
          </div>
          <div style={gridStyle}>
            <FormField label="Dépenses annuelles estimées — Basse (€)" icon={I.Zap}>
              <FInput value={form.depensesBasse} onChange={set("depensesBasse")} placeholder="ex: 1200" type="number"/>
            </FormField>
            <FormField label="Dépenses annuelles estimées — Haute (€)" icon={I.Zap}>
              <FInput value={form.depensesHaute} onChange={set("depensesHaute")} placeholder="ex: 1500" type="number"/>
            </FormField>
          </div>
          <FormField label="Année de référence du DPE" icon={I.Calendar}>
            <FSelect value={form.anneeDPE} onChange={set("anneeDPE")} options={
              ["2018","2019","2020","2021","2022","2023","2024","2025","2026"].map(y=>({v:y,l:y}))
            }/>
          </FormField>

          {/* Preview card */}
          <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              {[{k:"classeEnergie",label:"Énergie"},{k:"indiceGES",label:"GES"}].map(({k,label})=>{
                const col = {A:"#22c55e",B:"#84cc16",C:"#eab308",D:"#f97316",E:"#ef4444",F:"#dc2626",G:"#991b1b"}[form[k]]||"#6b7280";
                return (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:`${col}18`, border:`1.5px solid ${col}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:col, boxShadow:`0 0 10px ${col}30` }}>{form[k]||"?"}</div>
                    <div><p style={{ fontSize:9, color:C.g2, fontFamily:C.mono }}>{label}</p><p style={{ fontSize:11, fontWeight:600, color:C.w }}>{form.depensesBasse||"—"} — {form.depensesHaute||"—"} €/an</p></div>
                  </div>
                );
              })}
            </div>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>DPE {form.anneeDPE}</span>
          </div>
        </div>
      </div>

      {/* ── SAVE BUTTON ── */}
      <button onClick={handleSave} style={{
        width:"100%", background: saved ? "linear-gradient(135deg,#059669,#047857)" : `linear-gradient(135deg,${C.blue},#2563EB)`,
        border:"none", borderRadius:12, padding:"14px 24px", color:"#fff", fontSize:13, fontWeight:700,
        cursor:"pointer", letterSpacing:"0.04em", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        boxShadow: saved ? "0 4px 24px rgba(5,150,105,0.4)" : `0 4px 28px ${C.blueGlow}`,
        transition:"all 0.2s",
      }}
      onMouseEnter={e=>{ if(!saved){ e.currentTarget.style.boxShadow="0 6px 36px rgba(0,123,255,0.5)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow=saved?"0 4px 24px rgba(5,150,105,0.4)":`0 4px 28px ${C.blueGlow}`; e.currentTarget.style.transform="none"; }}>
        {saved ? <><span>✓</span> Modifications sauvegardées !</> : <><I.Save/> Enregistrer les modifications</>}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   FINANCES & FISCALITÉ TAB
════════════════════════════════════════ */

/* Reusable editable field row */
function FField({ label, value, unit, accent, icon:TIcon, mono, placeholder }) {
  const [val, setVal] = useState(value || "");
  const [focus, setFocus] = useState(false);
  return (
    <div style={{
      background: focus ? "rgba(0,123,255,0.04)" : "#0a0a0a",
      border: `1px solid ${focus ? "rgba(0,123,255,0.3)" : C.border}`,
      borderRadius: 10, padding: "11px 14px",
      transition: "all 0.15s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {TIcon && <span style={{ color: C.g3 }}><TIcon /></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <input
          value={val}
          onChange={e=>setVal(e.target.value)}
          onFocus={()=>setFocus(true)}
          onBlur={()=>setFocus(false)}
          placeholder={placeholder || "—"}
          style={{
            flex:1, background:"transparent", border:"none", outline:"none",
            fontSize:13, fontWeight:700,
            color: accent ? C.blue : C.w,
            fontFamily: mono ? "monospace" : "inherit",
            letterSpacing: accent ? "-0.02em" : "normal",
          }}
        />
        {unit && <span style={{ fontSize:11, color:C.g2, flexShrink:0 }}>{unit}</span>}
      </div>
    </div>
  );
}

/* Regime selector pill */
const REGIMES = [
  { id:"lmnp_reel",   label:"LMNP Réel",         sub:"BIC — Amortissement + charges" },
  { id:"lmnp_micro",  label:"LMNP Micro-BIC",     sub:"Abattement 50%" },
  { id:"rev_foncier", label:"Revenu Foncier Réel", sub:"Déficit foncier possible" },
  { id:"micro_fonc",  label:"Micro-Foncier",       sub:"Abattement 30%" },
  { id:"sci_is",      label:"SCI à l'IS",          sub:"Imposition société" },
  { id:"sci_ir",      label:"SCI à l'IR",          sub:"Transparence fiscale" },
  { id:"pinel",       label:"Pinel / Denormandie", sub:"Réduction d'impôt" },
  { id:"sarl",        label:"SARL de famille",     sub:"Statut libéral" },
  { id:"sas",         label:"SAS",                 sub:"Flexibilité statutaire" },
];

const TOP5 = ["lmnp_reel","lmnp_micro","rev_foncier","sci_is","pinel"];

/* ── Performance Simulator — Stable sub-components ── */
/* ── Custom DatePicker Calendar ── */
const JOURS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function DatePickerInput({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) { const d = new Date(value); return isNaN(d) ? new Date() : d; }
    return new Date();
  });
  const ref = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (popRef.current && !popRef.current.contains(e.target) && ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push({ day: prevDays - startDay + 1 + i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  const selectDay = (day) => {
    const d = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    onChange(d);
    setOpen(false);
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const prevYear = () => setViewDate(new Date(year - 1, month, 1));
  const nextYear = () => setViewDate(new Date(year + 1, month, 1));

  const formatDisplay = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d)) return v;
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const selectedStr = value || "";

  return (
    <div style={{ position:"relative", flex:1 }} ref={ref}>
      <div onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", minHeight:20 }}>
        <span style={{ flex:1, fontSize:13, fontWeight:700, color:value?C.w:C.g3 }}>{value ? formatDisplay(value) : (placeholder || "Sélectionner une date")}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      {open && (
        <div ref={popRef} style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:9999, background:"#141416", border:"1px solid "+C.border, borderRadius:12, boxShadow:"0 12px 40px rgba(0,0,0,0.7)", width:280, padding:"12px", animation:"fadeUp 0.15s ease" }}>
          {/* Navigation */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", gap:2 }}>
              <button onClick={prevYear} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:"2px 4px", fontSize:11 }}>{"<<"}</button>
              <button onClick={prevMonth} style={{ background:"none", border:"none", color:C.g2, cursor:"pointer", padding:"2px 6px", fontSize:13 }}>{"<"}</button>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:C.w }}>{MOIS_NOMS[month]} {year}</span>
            <div style={{ display:"flex", gap:2 }}>
              <button onClick={nextMonth} style={{ background:"none", border:"none", color:C.g2, cursor:"pointer", padding:"2px 6px", fontSize:13 }}>{">"}</button>
              <button onClick={nextYear} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:"2px 4px", fontSize:11 }}>{">>"}</button>
            </div>
          </div>
          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, marginBottom:4 }}>
            {JOURS.map(j => <div key={j} style={{ textAlign:"center", fontSize:9, fontWeight:700, color:C.g3, fontFamily:C.mono, padding:"2px 0" }}>{j}</div>)}
          </div>
          {/* Day cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1 }}>
            {cells.map((cell, i) => {
              const cellStr = cell.current ? `${year}-${String(month+1).padStart(2,"0")}-${String(cell.day).padStart(2,"0")}` : "";
              const isSelected = cell.current && cellStr === selectedStr;
              const isToday = cell.current && cellStr === todayStr;
              return (
                <button key={i} onClick={()=>cell.current && selectDay(cell.day)}
                  style={{ width:34, height:32, borderRadius:8, border:"none", fontSize:12, fontWeight:isSelected?800:isToday?700:500, cursor:cell.current?"pointer":"default",
                    background:isSelected?"linear-gradient(135deg,#3B82F6,#2563EB)":isToday?"rgba(59,130,246,0.12)":"transparent",
                    color:isSelected?"#fff":isToday?C.blue:cell.current?C.w:C.g3+"60",
                    transition:"all 0.1s" }}
                  onMouseEnter={e=>{if(cell.current&&!isSelected)e.currentTarget.style.background="rgba(59,130,246,0.08)";}}
                  onMouseLeave={e=>{if(cell.current&&!isSelected)e.currentTarget.style.background=isToday?"rgba(59,130,246,0.12)":"transparent";}}>
                  {cell.day}
                </button>
              );
            })}
          </div>
          {/* Today button */}
          <div style={{ marginTop:8, display:"flex", justifyContent:"center" }}>
            <button onClick={()=>{onChange(todayStr);setOpen(false);setViewDate(new Date());}}
              style={{ background:"none", border:"1px solid "+C.border, borderRadius:6, padding:"4px 12px", fontSize:10, color:C.blue, cursor:"pointer", fontFamily:C.mono }}>
              Aujourd'hui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PerfSH({label, icon}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0 8px" }}>
      <span style={{ fontSize:12 }}>{icon}</span>
      <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.12em", color:C.blue, fontFamily:C.mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(59,130,246,0.15)" }}/>
    </div>
  );
}
function PerfInpRow({label, value, onChange, unit, step, min, max}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 0" }}>
      <span style={{ flex:1, fontSize:11, color:C.g2 }}>{label}</span>
      <input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} step={step||1} min={min} max={max}
        style={{ width:80, background:"#111", border:"1px solid "+C.border, borderRadius:6, padding:"4px 8px", fontSize:12, fontWeight:700, color:C.blue, textAlign:"right", outline:"none" }}/>
      {unit && <span style={{ fontSize:10, color:C.g3, width:32, textAlign:"left" }}>{unit}</span>}
    </div>
  );
}
function PerfInfo({text}) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position:"relative", display:"inline-flex", marginLeft:4, cursor:"help" }}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <span style={{ width:14, height:14, borderRadius:"50%", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.25)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color:C.blue, fontFamily:C.mono, lineHeight:1 }}>i</span>
      {show && (
        <div style={{ position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", zIndex:100, width:260, background:"#1a1a2e", border:"1px solid rgba(59,130,246,0.25)", borderRadius:10, padding:"10px 12px", boxShadow:"0 8px 30px rgba(0,0,0,0.6)", pointerEvents:"none" }}>
          <p style={{ fontSize:10, color:"#d1d5db", lineHeight:1.6, fontFamily:C.mono, whiteSpace:"pre-wrap" }}>{text}</p>
          <div style={{ position:"absolute", bottom:-5, left:"50%", transform:"translateX(-50%) rotate(45deg)", width:8, height:8, background:"#1a1a2e", borderRight:"1px solid rgba(59,130,246,0.25)", borderBottom:"1px solid rgba(59,130,246,0.25)" }}/>
        </div>
      )}
    </span>
  );
}
function PerfMetric({label, value, color, sub, info}) {
  return (
    <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:9, padding:"10px 12px", textAlign:"center" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em", marginBottom:4 }}>{label}</p>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}>
        <p style={{ fontSize:16, fontWeight:800, color:color||C.w, fontFamily:C.mono }}>{value}</p>
        {info && <PerfInfo text={info}/>}
      </div>
      {sub && <p style={{ fontSize:9, color:C.g3, marginTop:2 }}>{sub}</p>}
    </div>
  );
}

/* ── Performance Simulator Tab ── */
function PerformanceTab({ asset, onUpdate, kycData }) {
  const p = (v) => parseInt(String(v||"0").replace(/[^\d]/g,""),10)||0;
  const pf = (v) => parseFloat(String(v||"0").replace(",","."))||0;

  // Parse TMI from KYC data ("0 % — Non imposable" → 0)
  const parseTMI = (s) => { const m = String(s||"").match(/^(\d+)/); return m ? parseInt(m[1]) : null; };
  const kycTMI = parseTMI(kycData?.tmi);

  // ── Inputs with pre-fill from asset.perfSim or asset ──
  const saved = asset.perfSim || {};
  const initPrix = saved.prixBien ?? p(asset.prixBien) || 200000;
  const [sim, setSim] = useState({
    prixBien: initPrix,
    fraisNotaire: saved.fraisNotaire ?? (p(asset.fraisNotaire) || Math.round(initPrix * 0.08)),
    travaux: saved.travaux ?? 0,
    mobilier: saved.mobilier ?? 0,
    apport: saved.apport ?? 40000,
    montantPret: saved.montantPret ?? 0,
    tauxInteret: saved.tauxInteret ?? 3.5,
    dureePret: saved.dureePret ?? 20,
    tauxAssurance: saved.tauxAssurance ?? 0.30,
    differe: saved.differe ?? 0,
    loyerMensuel: saved.loyerMensuel ?? (p(asset.loyer) || 800),
    vacance: saved.vacance ?? 5,
    tauxRevaloLoyer: saved.tauxRevaloLoyer ?? 1.5,
    taxeFonciere: saved.taxeFonciere ?? (p(asset.taxeFonciere) || 1200),
    chargesCopro: saved.chargesCopro ?? (p(asset.chargesCopro) || 1500),
    assurancePNO: saved.assurancePNO ?? 250,
    gestionLocative: saved.gestionLocative ?? 0,
    entretien: saved.entretien ?? 500,
    tmi: saved.tmi ?? kycTMI ?? 30,
    prelevementsSociaux: saved.prelevementsSociaux ?? 17.2,
    typeRegime: saved.typeRegime ?? "lmnp_reel",
    amortissement: saved.amortissement ?? 6800,
    tauxRevaloBien: saved.tauxRevaloBien ?? 2,
    dureeDetention: saved.dureeDetention ?? 15,
    tauxActualisation: saved.tauxActualisation ?? 3,
  });
  const u = (k,v) => setSim(s=>({...s,[k]:v}));
  const n = (k) => typeof sim[k]==="number" ? sim[k] : pf(sim[k]);

  // Auto-save sim data to asset.perfSim (debounced)
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!onUpdate) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // Compute VL inline for persistence
      const ct = (sim.prixBien||0)+(sim.fraisNotaire||0)+(sim.travaux||0)+(sim.mobilier||0);
      const mp = sim.montantPret || Math.max(0, ct - (sim.apport||0));
      const ae = asset.anneesDetention || 0;
      const va = (sim.prixBien||0) * Math.pow(1 + (sim.tauxRevaloBien||2)/100, ae);
      const tm = (sim.tauxInteret||0)/100/12;
      const nM = (sim.dureePret||0)*12;
      const dM = Math.min(sim.differe||0, nM);
      const nA = nM - dM;
      const me = Math.max(0, ae * 12 - dM);
      let crdCalc = 0;
      if (mp > 0 && tm > 0 && nA > 0 && me < nA) { const fN = Math.pow(1+tm,nA); const fn = Math.pow(1+tm,me); crdCalc = Math.round(mp*(fN-fn)/(fN-1)); }
      const fv = Math.round(va * 0.03);
      const vlCalc = Math.round(va - crdCalc - fv);
      onUpdate({
        ...asset,
        perfSim: { ...sim },
        vl: Math.round(va),
        vlLiquidative: vlCalc,
        // Sync main asset fields from perfSim
        loyer: String(sim.loyerMensuel || asset.loyer || ""),
        loyerAnnuel: (sim.loyerMensuel || 0) * 12,
        prixBien: sim.prixBien || asset.prixBien,
        fraisNotaire: sim.fraisNotaire || asset.fraisNotaire,
        taxeFonciere: sim.taxeFonciere || asset.taxeFonciere,
        chargesCopro: sim.chargesCopro || asset.chargesCopro,
      });
    }, 600);
    return () => { if(saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [sim]);

  // Auto-calc frais de notaire = 8% du prix du bien
  const prevPrixRef = useRef(sim.prixBien);
  useEffect(() => {
    if (sim.prixBien !== prevPrixRef.current) {
      prevPrixRef.current = sim.prixBien;
      setSim(s => ({...s, fraisNotaire: Math.round(sim.prixBien * 0.08)}));
    }
  }, [sim.prixBien]);

  // Auto-calc montant du prêt = coût total - apport
  const coutTotalCalc = n("prixBien") + n("fraisNotaire") + n("travaux") + n("mobilier");
  const prevCoutRef = useRef(null);
  useEffect(() => {
    const mp = Math.max(0, coutTotalCalc - n("apport"));
    if (prevCoutRef.current === null) { prevCoutRef.current = mp; setSim(s=>({...s, montantPret:mp})); return; }
    if (mp !== prevCoutRef.current) { prevCoutRef.current = mp; setSim(s=>({...s, montantPret:mp})); }
  }, [sim.prixBien, sim.fraisNotaire, sim.travaux, sim.mobilier, sim.apport]);

  // ═══ All calculations ═══
  const coutTotal = coutTotalCalc;
  const montantPret = n("montantPret");
  const tauxM = n("tauxInteret")/100/12;
  const nbMens = n("dureePret")*12;
  const differeMois = Math.min(n("differe"), nbMens);
  // Mensualité pendant différé (intérêts seuls)
  const mensualiteDiffere = montantPret > 0 && tauxM > 0 ? montantPret * tauxM : 0;
  // Mensualité après différé (amortissement sur durée restante)
  const nbMensAmorties = nbMens - differeMois;
  const mensualiteCredit = montantPret > 0 && tauxM > 0 && nbMensAmorties > 0 ? montantPret * tauxM / (1 - Math.pow(1+tauxM, -nbMensAmorties)) : 0;
  // Assurance sur montant du prêt
  const mensualiteAssurance = montantPret * (n("tauxAssurance")/100) / 12;
  // Totaux
  const mensualiteTotaleDiffere = mensualiteDiffere + mensualiteAssurance;
  const mensualiteTotale = mensualiteCredit + mensualiteAssurance;
  const creditAnnuelNormal = mensualiteTotale * 12;
  const creditAnnuelDiffere = mensualiteTotaleDiffere * 12;
  const creditAnnuel = creditAnnuelNormal;
  const interetsDiffere = mensualiteDiffere * differeMois;
  const interetsAmort = creditAnnuelNormal * (n("dureePret") - differeMois/12) - montantPret;
  const interetsTotaux = interetsDiffere + Math.max(0, interetsAmort);

  const loyerBrut = n("loyerMensuel") * 12;
  const loyerVacance = loyerBrut * (1 - n("vacance")/100);
  const chargesTotales = n("taxeFonciere") + n("chargesCopro") + n("assurancePNO") + n("gestionLocative") + n("entretien");
  const revenuNetCharges = loyerVacance - chargesTotales;

  const interetsAnnuelsMoy = n("dureePret") > 0 ? interetsTotaux / n("dureePret") : 0;
  const resultatFiscal = loyerVacance - chargesTotales - interetsAnnuelsMoy - n("amortissement");
  const resultatFiscalPos = Math.max(0, resultatFiscal);
  const impot = resultatFiscalPos * (n("tmi") + n("prelevementsSociaux")) / 100;

  // Cash-flow Year 1 (accounts for différé)
  const moisDiffAn1 = Math.min(differeMois, 12);
  const creditAnnuelAn1 = moisDiffAn1 * mensualiteTotaleDiffere + (12 - moisDiffAn1) * mensualiteTotale;
  const cashflowAnnuel = loyerVacance - chargesTotales - creditAnnuelAn1 - impot;
  const cashflowMensuel = cashflowAnnuel / 12;
  const effortEpargne = cashflowAnnuel < 0 ? Math.abs(cashflowMensuel) : 0;

  // ── Dual metrics: Pendant différé vs Après différé ──
  const cfMensuelAvant = differeMois > 0 ? loyerVacance/12 - chargesTotales/12 - mensualiteTotaleDiffere - impot/12 : cashflowMensuel;
  const cfAnnuelAvant = cfMensuelAvant * 12;
  const effortAvant = cfAnnuelAvant < 0 ? Math.abs(cfMensuelAvant) : 0;
  const dscrAvant = creditAnnuelDiffere > 0 ? loyerVacance / creditAnnuelDiffere : 99;

  const cfMensuelApres = loyerVacance/12 - chargesTotales/12 - mensualiteTotale - impot/12;
  const cfAnnuelApres = cfMensuelApres * 12;
  const effortApres = cfAnnuelApres < 0 ? Math.abs(cfMensuelApres) : 0;
  const dscrApres = creditAnnuelNormal > 0 ? loyerVacance / creditAnnuelNormal : 99;

  const [viewPeriod, setViewPeriod] = useState("apres");

  const rdtBrut = coutTotal > 0 ? loyerBrut / coutTotal : 0;
  const rdtNet = coutTotal > 0 ? revenuNetCharges / coutTotal : 0;
  const rdtNetNet = coutTotal > 0 ? (revenuNetCharges - impot) / coutTotal : 0;
  const roe = n("apport") > 0 ? cashflowAnnuel / n("apport") : 0;
  const dscr = creditAnnuelAn1 > 0 ? loyerVacance / creditAnnuelAn1 : 99;
  const ltv = n("prixBien") > 0 ? montantPret / n("prixBien") : 0;

  const prixRevente = n("prixBien") * Math.pow(1 + n("tauxRevaloBien")/100, n("dureeDetention"));
  const pvBrute = prixRevente - n("prixBien");
  const fraisRevente = prixRevente * 0.03;
  const pvNette = pvBrute - fraisRevente;

  // ── Valeur Liquidative (instant T) ──
  // Capital Restant Dû (CRD) : simplifié — on calcule le CRD après X mois d'amortissement
  // Pour un prêt classique : CRD = Montant × [(1+tm)^N - (1+tm)^n] / [(1+tm)^N - 1]
  // où N = nb mensualités totales, n = nb mensualités déjà payées
  const anneesEcoulees = asset.anneesDetention || 0;
  const moisEcoules = Math.max(0, anneesEcoulees * 12 - differeMois); // mois d'amortissement réels
  const crd = (() => {
    if (montantPret <= 0 || tauxM <= 0 || nbMens <= 0) return 0;
    if (moisEcoules >= nbMens - differeMois) return 0; // prêt fini
    const nbAmort = nbMens - differeMois;
    if (nbAmort <= 0 || moisEcoules >= nbAmort) return 0;
    // CRD = P × [(1+r)^N - (1+r)^n] / [(1+r)^N - 1]
    const factN = Math.pow(1 + tauxM, nbAmort);
    const factn = Math.pow(1 + tauxM, moisEcoules);
    return Math.round(montantPret * (factN - factn) / (factN - 1));
  })();
  const valeurActuelle = n("prixBien") * Math.pow(1 + n("tauxRevaloBien")/100, anneesEcoulees);
  const fraisVenteVL = Math.round(valeurActuelle * 0.03);
  const valeurLiquidative = Math.round(valeurActuelle - crd - fraisVenteVL);
  const equityGain = valeurLiquidative - n("apport");

  // TRI / VAN / Multiple
  const flux = [-n("apport")];
  let sumCF = 0;
  for (let y = 1; y <= n("dureeDetention"); y++) {
    const loyAn = loyerVacance * Math.pow(1 + n("tauxRevaloLoyer")/100, y-1);
    // Différé: first N months = interest only, then normal
    const moisDebut = (y-1)*12;
    const moisFin = y*12;
    const moisDiffRestant = Math.max(0, differeMois - moisDebut);
    const moisDiffDansAnnee = Math.min(moisDiffRestant, 12);
    const moisNormDansAnnee = 12 - moisDiffDansAnnee;
    const credAn = y <= n("dureePret") ? (moisDiffDansAnnee * mensualiteTotaleDiffere + moisNormDansAnnee * mensualiteTotale) : 0;
    const impAn = Math.max(0, loyAn - chargesTotales - interetsAnnuelsMoy - n("amortissement")) * (n("tmi")+n("prelevementsSociaux"))/100;
    let cf = loyAn - chargesTotales - credAn - impAn;
    if (y === n("dureeDetention")) cf += prixRevente * 0.97;
    flux.push(cf);
    sumCF += (y < n("dureeDetention") ? cf : cf - prixRevente*0.97);
  }
  // IRR Newton
  const calcIRR = (f) => {
    let r = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0, dnpv = 0;
      for (let t = 0; t < f.length; t++) { npv += f[t]/Math.pow(1+r,t); dnpv -= t*f[t]/Math.pow(1+r,t+1); }
      if (Math.abs(dnpv) < 1e-10) break;
      const nr = r - npv/dnpv;
      if (Math.abs(nr-r) < 1e-8) { r = nr; break; }
      r = nr;
    }
    return isFinite(r) && r > -1 ? r : null;
  };
  const tri = calcIRR(flux);
  const van = flux.reduce((s, f, t) => s + f / Math.pow(1 + n("tauxActualisation")/100, t), 0);
  const multiple = n("apport") > 0 ? (sumCF + prixRevente*0.97) / n("apport") : 0;

  // ── Scenarios ──
  const runScenario = (loyerAdj, vacAdj, revalAdj) => {
    const lm = n("loyerMensuel") * (1 + loyerAdj/100);
    const lb = lm * 12; const lv = lb * (1 - vacAdj/100);
    const rn = lv - chargesTotales;
    const imp = Math.max(0, lv - chargesTotales - interetsAnnuelsMoy - n("amortissement")) * (n("tmi")+n("prelevementsSociaux"))/100;
    const cf = lv - chargesTotales - creditAnnuelAn1 - imp;
    const rb = coutTotal > 0 ? lb / coutTotal : 0;
    const rnn = coutTotal > 0 ? (rn - imp) / coutTotal : 0;
    return { loyerM: Math.round(lm), cf: Math.round(cf), rb, rnn };
  };
  const scePess = runScenario(-10, 10, 0);
  const sceReal = runScenario(0, n("vacance"), n("tauxRevaloBien"));
  const sceOpti = runScenario(5, 2, 3);

  // ── Format helpers ──
  const fmt = (v) => new Intl.NumberFormat("fr-FR", {style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v);
  const fmtD = (v) => new Intl.NumberFormat("fr-FR", {style:"currency",currency:"EUR",maximumFractionDigits:2}).format(v);
  const fmtP = (v) => (v*100).toFixed(2) + " %";

  // ── UI Helpers ──
  // ── UI Helpers (stable refs — no re-creation) ──
  const colorCF = (v) => v >= 0 ? C.green : v > -200*12 ? C.yellow : C.red;
  const colorDSCR = (v) => v >= 1.2 ? C.green : v >= 1 ? C.yellow : C.red;
  const colorRdt = (v) => v >= 0.07 ? C.green : v >= 0.04 ? C.yellow : C.red;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── INPUTS ── */}
      <PerfSH icon="📥" label="PARAMÈTRES DE L'INVESTISSEMENT"/>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>🏠 LE BIEN</p>
        <PerfInpRow label="Prix du bien" value={sim.prixBien} onChange={v=>u("prixBien",v)} unit="€"/>
        <PerfInpRow label="Frais de notaire" value={sim.fraisNotaire} onChange={v=>u("fraisNotaire",v)} unit="€"/>
        <PerfInpRow label="Travaux" value={sim.travaux} onChange={v=>u("travaux",v)} unit="€"/>
        <PerfInpRow label="Mobilier" value={sim.mobilier} onChange={v=>u("mobilier",v)} unit="€"/>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>🏦 FINANCEMENT</p>
        <PerfInpRow label="Apport personnel" value={sim.apport} onChange={v=>u("apport",v)} unit="€"/>
        <PerfInpRow label="Montant du prêt" value={sim.montantPret} onChange={v=>u("montantPret",v)} unit="€"/>
        <PerfInpRow label="Taux d'intérêt" value={sim.tauxInteret} onChange={v=>u("tauxInteret",v)} unit="%" step={0.1}/>
        <PerfInpRow label="Durée du prêt" value={sim.dureePret} onChange={v=>u("dureePret",v)} unit="ans"/>
        <PerfInpRow label="Taux assurance" value={sim.tauxAssurance} onChange={v=>u("tauxAssurance",v)} unit="%" step={0.01}/>
        <PerfInpRow label="Différé" value={sim.differe} onChange={v=>u("differe",v)} unit="mois" step={1} min={0} max={36}/>
        <div style={{ borderTop:"1px solid "+C.border, marginTop:6, paddingTop:6 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
            <span style={{ fontSize:10, color:C.g3 }}>Mensualité crédit</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{fmtD(mensualiteCredit)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
            <span style={{ fontSize:10, color:C.g3 }}>Assurance / mois</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{fmtD(mensualiteAssurance)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderTop:"1px dashed "+C.border, marginTop:2 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.w }}>Mensualité totale</span>
            <span style={{ fontSize:14, fontWeight:800, color:C.green, fontFamily:C.mono }}>{fmtD(mensualiteTotale)}</span>
          </div>
          {differeMois > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0" }}>
              <span style={{ fontSize:10, color:"#F59E0B" }}>Pendant différé ({differeMois} mois)</span>
              <span style={{ fontSize:12, fontWeight:700, color:"#F59E0B", fontFamily:C.mono }}>{fmtD(mensualiteTotaleDiffere)}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>💰 REVENUS LOCATIFS</p>
        <PerfInpRow label="Loyer mensuel HC" value={sim.loyerMensuel} onChange={v=>u("loyerMensuel",v)} unit="€"/>
        <PerfInpRow label="Vacance locative" value={sim.vacance} onChange={v=>u("vacance",v)} unit="%" step={1}/>
        <PerfInpRow label="Revalo loyer (IRL)" value={sim.tauxRevaloLoyer} onChange={v=>u("tauxRevaloLoyer",v)} unit="%" step={0.1}/>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>📋 CHARGES ANNUELLES</p>
        <PerfInpRow label="Taxe foncière" value={sim.taxeFonciere} onChange={v=>u("taxeFonciere",v)} unit="€"/>
        <PerfInpRow label="Charges copro" value={sim.chargesCopro} onChange={v=>u("chargesCopro",v)} unit="€"/>
        <PerfInpRow label="Assurance PNO" value={sim.assurancePNO} onChange={v=>u("assurancePNO",v)} unit="€"/>
        <PerfInpRow label="Gestion locative" value={sim.gestionLocative} onChange={v=>u("gestionLocative",v)} unit="€"/>
        <PerfInpRow label="Entretien / divers" value={sim.entretien} onChange={v=>u("entretien",v)} unit="€"/>
      </div>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>🧾 FISCALITÉ & PROJECTION</p>
        <PerfInpRow label="TMI" value={sim.tmi} onChange={v=>u("tmi",v)} unit="%" step={1}/>
        <PerfInpRow label="Amortissement annuel" value={sim.amortissement} onChange={v=>u("amortissement",v)} unit="€"/>
        <PerfInpRow label="Revalo bien / an" value={sim.tauxRevaloBien} onChange={v=>u("tauxRevaloBien",v)} unit="%" step={0.1}/>
        <PerfInpRow label="Durée détention" value={sim.dureeDetention} onChange={v=>u("dureeDetention",v)} unit="ans"/>
      </div>

      {/* ── RÉSULTATS ── */}
      <PerfSH icon="📊" label="RÉSULTATS CLÉS"/>

      {/* Toggle Avant / Après différé */}
      {differeMois > 0 && (
        <div style={{ display:"flex", gap:0, marginBottom:10, background:"#0a0a0a", borderRadius:10, border:"1px solid "+C.border, padding:3, overflow:"hidden" }}>
          {[["avant","Pendant différé ("+differeMois+" mois)"],["apres","Après différé"]].map(([k,l])=>{
            const active = viewPeriod===k;
            return (
              <button key={k} onClick={()=>setViewPeriod(k)}
                style={{ flex:1, padding:"9px 14px", borderRadius:8, border:"none", background:active?"linear-gradient(135deg,#3B82F6,#2563EB)":"transparent",
                  color:active?"#fff":C.g2, fontSize:11, fontWeight:active?700:500, cursor:"pointer", transition:"all 0.2s",
                  boxShadow:active?"0 2px 10px rgba(59,130,246,0.3)":"none" }}>
                {l}
              </button>
            );
          })}
        </div>
      )}

      {/* Cash-flow hero */}
      {(()=>{
        const cf = differeMois > 0 ? (viewPeriod==="avant" ? cfAnnuelAvant : cfAnnuelApres) : cashflowAnnuel;
        const cfM = cf / 12;
        const eff = cf < 0 ? Math.abs(cfM) : 0;
        const mens = viewPeriod==="avant" && differeMois>0 ? mensualiteTotaleDiffere : mensualiteTotale;
        const dsc = viewPeriod==="avant" && differeMois>0 ? dscrAvant : (differeMois>0 ? dscrApres : (creditAnnuelAn1>0?loyerVacance/creditAnnuelAn1:99));
        const roeV = n("apport") > 0 ? cf / n("apport") : 0;
        const periodLabel = differeMois > 0 ? (viewPeriod==="avant" ? "PENDANT DIFFÉRÉ" : "APRÈS DIFFÉRÉ") : "";
        return (<>
          <div style={{ background:cf>=0?"rgba(16,185,129,0.06)":"rgba(239,68,68,0.06)", border:"1.5px solid "+(cf>=0?C.greenBord:"rgba(239,68,68,0.2)"), borderRadius:12, padding:"16px", textAlign:"center", marginBottom:10, position:"relative" }}>
            {periodLabel && <span style={{ position:"absolute", top:8, right:12, fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:viewPeriod==="avant"?"#F59E0B":"#3B82F6", background:viewPeriod==="avant"?"rgba(245,158,11,0.1)":"rgba(59,130,246,0.1)", border:"1px solid "+(viewPeriod==="avant"?"rgba(245,158,11,0.2)":"rgba(59,130,246,0.2)"), padding:"2px 8px", borderRadius:4 }}>{periodLabel}</span>}
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:4 }}>CASH-FLOW MENSUEL</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <p style={{ fontSize:28, fontWeight:800, color:colorCF(cf), fontFamily:C.mono, letterSpacing:"-0.03em" }}>{fmtD(cfM)}</p>
              <PerfInfo text={"(Loyer - Charges - Crédit - Impôt) ÷ 12\n\n("+fmt(Math.round(loyerVacance))+" - "+fmt(chargesTotales)+" - "+fmt(Math.round(mens*12))+" - "+fmt(Math.round(impot))+") ÷ 12"}/>
            </div>
            <p style={{ fontSize:10, color:C.g2, marginTop:2 }}>Mensualité : {fmtD(mens)}</p>
            <p style={{ fontSize:11, color:C.g2, marginTop:4 }}>{cf>=0?"✅ Bien autofinancé":"⚠️ Effort d'épargne : "+fmtD(eff)+"/mois"}</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
            <PerfMetric label="RDT BRUT" value={fmtP(rdtBrut)} color={colorRdt(rdtBrut)} info={"Loyer annuel brut ÷ Coût total projet\n\n"+fmt(loyerBrut)+" ÷ "+fmt(coutTotal)}/>
            <PerfMetric label="RDT NET" value={fmtP(rdtNet)} color={colorRdt(rdtNet)} info={"(Loyer - Charges) ÷ Coût total\n\n("+fmt(Math.round(loyerVacance))+" - "+fmt(chargesTotales)+") ÷ "+fmt(coutTotal)}/>
            <PerfMetric label="RDT NET-NET" value={fmtP(rdtNetNet)} color={colorRdt(rdtNetNet)} info={"(Loyer - Charges - Impôt) ÷ Coût total\n\n("+fmt(Math.round(loyerVacance))+" - "+fmt(chargesTotales)+" - "+fmt(Math.round(impot))+") ÷ "+fmt(coutTotal)}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
            <PerfMetric label="ROE" value={fmtP(roeV)} color={roeV>0?C.green:C.red} sub="CF / Apport" info={"Cash-flow annuel ÷ Apport\n\n"+fmt(Math.round(cf))+" ÷ "+fmt(n("apport"))}/>
            <PerfMetric label="DSCR" value={dsc>10?"∞":dsc.toFixed(2)} color={colorDSCR(dsc)} sub={dsc>=1.2?"Solide":dsc>=1?"Limite":"Risqué"} info={"Loyer annuel ÷ Crédit annuel\n\n"+fmt(Math.round(loyerVacance))+" ÷ "+fmt(Math.round(creditAnnuelAn1))+"\n\n≥ 1.2 = solide\n< 1.0 = risqué"}/>
            <PerfMetric label="LTV" value={fmtP(ltv)} color={ltv>0.9?C.red:ltv>0.7?C.yellow:C.green} info={"Montant prêt ÷ Prix du bien\n\n"+fmt(montantPret)+" ÷ "+fmt(n("prixBien"))+"\n\n< 70% = sûr\n> 90% = risqué"}/>
          </div>

          {/* Comparaison rapide si différé actif */}
          {differeMois > 0 && (
            <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:10 }}>
              <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:8 }}>COMPARAISON AVANT / APRÈS DIFFÉRÉ</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:8, color:"#F59E0B", fontFamily:C.mono, marginBottom:4 }}>PENDANT ({differeMois} MOIS)</p>
                  <p style={{ fontSize:18, fontWeight:800, color:colorCF(cfAnnuelAvant), fontFamily:C.mono }}>{fmtD(cfMensuelAvant)}</p>
                  <p style={{ fontSize:9, color:C.g3 }}>CF/mois · Mens. {fmtD(mensualiteTotaleDiffere)}</p>
                </div>
                <div style={{ width:1, height:40, background:C.border }}/>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:8, color:"#3B82F6", fontFamily:C.mono, marginBottom:4 }}>APRÈS DIFFÉRÉ</p>
                  <p style={{ fontSize:18, fontWeight:800, color:colorCF(cfAnnuelApres), fontFamily:C.mono }}>{fmtD(cfMensuelApres)}</p>
                  <p style={{ fontSize:9, color:C.g3 }}>CF/mois · Mens. {fmtD(mensualiteTotale)}</p>
                </div>
              </div>
            </div>
          )}
        </>);
      })()}

      {/* ── VALEUR LIQUIDATIVE ── */}
      <PerfSH icon="💎" label="VALEUR LIQUIDATIVE (INSTANT T)"/>
      <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.06),rgba(59,130,246,0.03))", border:"1.5px solid rgba(99,102,241,0.2)", borderRadius:12, padding:"16px", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:4 }}>SI VOUS VENDIEZ AUJOURD'HUI</p>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:28, fontWeight:800, color:valeurLiquidative>=0?"#6366F1":C.red, fontFamily:C.mono, letterSpacing:"-0.03em" }}>{fmt(valeurLiquidative)}</span>
              <PerfInfo text={"Valeur actuelle - CRD - Frais vente (3%)\n\n"+fmt(Math.round(valeurActuelle))+" - "+fmt(crd)+" - "+fmt(fraisVenteVL)+"\n\nCe que vous récupéreriez net si vous vendiez le bien aujourd'hui, après remboursement du prêt restant."}/>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginBottom:4 }}>GAIN VS APPORT</p>
            <span style={{ fontSize:18, fontWeight:800, color:equityGain>=0?C.green:C.red, fontFamily:C.mono }}>
              {equityGain>=0?"+":""}{fmt(equityGain)}
            </span>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6 }}>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>VALEUR BIEN</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.w, fontFamily:C.mono }}>{fmt(Math.round(valeurActuelle))}</p>
            <p style={{ fontSize:8, color:C.g3 }}>{anneesEcoulees>0?"+"+n("tauxRevaloBien")+"% × "+anneesEcoulees+" ans":"Prix actuel"}</p>
          </div>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>CAPITAL RESTANT DÛ</p>
            <p style={{ fontSize:13, fontWeight:700, color:crd>0?C.red:"#6366F1", fontFamily:C.mono }}>{crd>0?"-":""}{fmt(crd)}</p>
            <p style={{ fontSize:8, color:C.g3 }}>{crd>0?Math.round(moisEcoules)+" mois payés":"Prêt soldé"}</p>
          </div>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>FRAIS VENTE</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.red, fontFamily:C.mono }}>-{fmt(fraisVenteVL)}</p>
            <p style={{ fontSize:8, color:C.g3 }}>3% du prix de vente</p>
          </div>
          <div style={{ background:"#0a0a0a", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <p style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>APPORT INITIAL</p>
            <p style={{ fontSize:13, fontWeight:700, color:C.w, fontFamily:C.mono }}>{fmt(n("apport"))}</p>
            <p style={{ fontSize:8, color:equityGain>=0?C.green:C.red }}>{n("apport")>0?(equityGain>=0?"+":"")+(equityGain/n("apport")*100).toFixed(0)+"% retour":"—"}</p>
          </div>
        </div>
        {/* Progress bar: CRD remboursé */}
        {montantPret > 0 && (
          <div style={{ marginTop:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>CAPITAL REMBOURSÉ</span>
              <span style={{ fontSize:9, fontWeight:700, color:"#6366F1", fontFamily:C.mono }}>{montantPret>0?Math.round((1-crd/montantPret)*100):100}%</span>
            </div>
            <div style={{ height:4, background:"#1e1e1e", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:99, background:"linear-gradient(90deg,#6366F1,#3B82F6)", width:`${montantPret>0?Math.round((1-crd/montantPret)*100):100}%`, transition:"width 0.4s" }}/>
            </div>
          </div>
        )}
      </div>

      {/* Détail */}
      <PerfSH icon="📋" label="DÉTAIL FINANCIER"/>
      <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
        {(()=>{
          const isAvant = differeMois > 0 && viewPeriod==="avant";
          const cfShow = isAvant ? cfAnnuelAvant : (differeMois > 0 ? cfAnnuelApres : cashflowAnnuel);
          const mensShow = isAvant ? mensualiteTotaleDiffere : mensualiteTotale;
          const credShow = isAvant ? creditAnnuelDiffere : creditAnnuelNormal;
          const rows = [
            ["Coût total projet", fmt(coutTotal), "Prix + Notaire + Travaux + Mobilier"],
            ["Montant du prêt", fmt(montantPret), "Coût total - Apport"],
            ["Mensualité (crédit+assur.)", fmtD(mensShow), "Prêt × [taux/12 ÷ (1-(1+taux/12)^-n)] + assurance"],
            ...(differeMois > 0 ? [["Mensualité " + (isAvant?"(intérêts seuls)":"(amortissement)"), fmtD(mensShow), isAvant?"Prêt × taux/12 (capital non remboursé)":"Prêt × [taux/12 ÷ (1-(1+taux/12)^-n)]"]] : []),
            ["Crédit annuel", fmt(Math.round(credShow)), "Mensualité totale × 12"],
            ["Loyer annuel brut", fmt(loyerBrut), "Loyer mensuel × 12"],
            ["Loyer corrigé vacance", fmt(Math.round(loyerVacance)), "Loyer brut × (1 - vacance%)"],
            ["Charges totales / an", fmt(chargesTotales), "TF + Copro + PNO + Gestion + Entretien"],
            ["Résultat fiscal", fmt(Math.round(resultatFiscal)), "Loyer - Charges - Intérêts - Amortissement"],
            ["Impôt estimé", fmt(Math.round(impot)), "MAX(0, Résultat fiscal) × (TMI + 17.2%)"],
            ["Cash-flow annuel", fmt(Math.round(cfShow)), "Loyer - Charges - Crédit - Impôt"],
          ];
          return rows.map(([l,v,info],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:i<rows.length-1?"1px solid "+C.border:"none" }}>
              <span style={{ fontSize:11, color:C.g2 }}>{l}</span>
              <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.w, fontFamily:C.mono }}>{v}</span>
                {info && <PerfInfo text={info}/>}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Revente */}
      <PerfSH icon="🔄" label={"MODULE REVENTE ("+n("dureeDetention")+" ANS)"}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:10 }}>
        <PerfMetric label="PRIX REVENTE" value={fmt(Math.round(prixRevente))} info={"Prix × (1 + taux revalo)^durée\n\n"+fmt(n("prixBien"))+" × (1 + "+n("tauxRevaloBien")+"%)^"+n("dureeDetention")+" ans"}/>
        <PerfMetric label="PLUS-VALUE NETTE" value={fmt(Math.round(pvNette))} color={pvNette>0?C.green:C.red} info={"(Prix revente - Prix achat) - Frais 3%\n\n("+fmt(Math.round(prixRevente))+" - "+fmt(n("prixBien"))+") - "+fmt(Math.round(fraisRevente))}/>
      </div>

      {/* TRI / VAN / Multiple */}
      <PerfSH icon="📐" label="TRI · VAN · MULTIPLE"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
        <PerfMetric label="TRI" value={tri!==null?fmtP(tri):"N/A"} color={tri&&tri>0.05?C.green:tri&&tri>0.02?C.yellow:C.red} sub="Taux rendement interne" info={"Taux qui annule la VAN des flux :\n\nAn 0 : -Apport ("+fmt(n("apport"))+")\nAn 1→N : Cash-flows annuels\nAn N : + Revente nette\n\nCalcul par méthode de Newton"}/>
        <PerfMetric label="VAN" value={fmt(Math.round(van))} color={van>0?C.green:C.red} sub={van>0?"Crée de la valeur":"Détruit de la valeur"} info={"Σ flux actualisés à "+n("tauxActualisation")+"%\n\nSi VAN > 0 → investissement\nrentable vs placement à "+n("tauxActualisation")+"%"}/>
        <PerfMetric label="MULTIPLE" value={multiple.toFixed(2)+"x"} color={multiple>2?C.green:multiple>1?C.yellow:C.red} sub="Capital × retour" info={"(Σ cash-flows + revente nette) ÷ Apport\n\n> 2x = très bon\n> 1x = positif\n< 1x = perte en capital"}/>
      </div>

      {/* Scénarios */}
      <PerfSH icon="🎯" label="SCÉNARIOS"/>
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
        {[
          { name:"😟 Pessimiste", data:scePess, desc:"Loyer -10%, vacance 10%", bg:"rgba(239,68,68,0.04)", border:"rgba(239,68,68,0.15)" },
          { name:"😐 Réaliste", data:sceReal, desc:"Paramètres actuels", bg:"rgba(245,158,11,0.04)", border:"rgba(245,158,11,0.15)" },
          { name:"😊 Optimiste", data:sceOpti, desc:"Loyer +5%, vacance 2%", bg:"rgba(16,185,129,0.04)", border:"rgba(16,185,129,0.15)" },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, border:"1px solid "+s.border, borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ minWidth:90 }}>
              <p style={{ fontSize:12, fontWeight:700, color:C.w }}>{s.name}</p>
              <p style={{ fontSize:9, color:C.g3 }}>{s.desc}</p>
            </div>
            <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, textAlign:"center" }}>
              <div><p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>CF/AN</p><p style={{ fontSize:13, fontWeight:800, color:colorCF(s.data.cf), fontFamily:C.mono }}>{fmt(s.data.cf)}</p></div>
              <div><p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>RDT BRUT</p><p style={{ fontSize:13, fontWeight:800, color:colorRdt(s.data.rb), fontFamily:C.mono }}>{fmtP(s.data.rb)}</p></div>
              <div><p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>NET-NET</p><p style={{ fontSize:13, fontWeight:800, color:colorRdt(s.data.rnn), fontFamily:C.mono }}>{fmtP(s.data.rnn)}</p></div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize:9, color:C.g3, fontStyle:"italic", textAlign:"center", marginTop:4 }}>Simulation indicative · Les résultats dépendent des hypothèses saisies</p>
    </div>
  );
}


function FinancesFiscaliteTab({ asset, kycData }) {
  const [regime,    setRegime]    = useState("lmnp_reel");
  const [showAll,   setShowAll]   = useState(false);
  const [focusCentre, setFocusCentre] = useState(false);

  // Parse TMI from KYC data
  const parseTMI = (s) => { const m = String(s||"").match(/^(\d+)/); return m ? parseInt(m[1]) : null; };
  const kycTMI = parseTMI(kycData?.tmi);

  const displayed = showAll ? REGIMES : REGIMES.filter(r=>TOP5.includes(r.id));
  const selected  = REGIMES.find(r=>r.id===regime);

  // Prefill from asset data
  const prixBien    = asset.prixBien?.toLocaleString("fr-FR") || "—";
  const fraisNot    = asset.fraisNotaire?.toLocaleString("fr-FR") || "—";
  const fraisAg     = asset.fraisAgence?.toLocaleString("fr-FR") || "—";
  const taxFonc     = asset.taxeFonciere?.toLocaleString("fr-FR") || "—";
  const vlVal       = asset.vl?.toLocaleString("fr-FR") || "—";

  const SecTitle = ({label, icon:TIcon}) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, marginTop:4 }}>
      {TIcon && <span style={{ color:C.blue }}><TIcon/></span>}
      <span style={{ fontSize:9, letterSpacing:"0.13em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:22 }}>

      {/* ── 1. VALORISATION ── */}
      <div>
        <SecTitle label="1 · Valorisation — Suivi de l'Equity" icon={I.TrendUp}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
              <span style={{ color:C.green }}><I.Sparkles/></span>
              <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.green, fontFamily:C.mono }}>VALEUR ACTUELLE ESTIMÉE (IA)</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontSize:20, fontWeight:800, color:C.w, letterSpacing:"-0.04em" }}>{vlVal}</span>
              <span style={{ fontSize:11, color:C.g2 }}>€</span>
              {asset.vlVar && <span style={{ fontSize:10, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"1px 7px", borderRadius:4 }}>▲ {asset.vlVar}/an</span>}
            </div>
            <p style={{ fontSize:9, color:C.g3, fontFamily:C.mono, marginTop:5 }}>DVF · Étalab · Notaires · Mise à jour mensuelle</p>
          </div>
          <FField icon={I.Target} label="Prix de vente cible" value="" unit="€" mono placeholder="Objectif de cession"/>
        </div>
        {/* Plus-value latente */}
        {asset.vl && asset.prixBien && (
          <div style={{ marginTop:8, background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>PLUS-VALUE LATENTE ESTIMÉE</span>
              <span style={{ fontSize:11, fontWeight:700, fontFamily:C.mono, color:C.green }}>
                +{(asset.vl - (asset.prixBien+asset.fraisNotaire+asset.fraisAgence+(asset.ameublement||0))).toLocaleString("fr-FR")} €
              </span>
            </div>
            <div style={{ height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${Math.min(((asset.prixBien)/(asset.vl))*100,100)}%`, height:"100%", background:`linear-gradient(90deg,${C.blue},#60a5fa)`, borderRadius:99 }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:8.5, color:C.g3, fontFamily:C.mono }}>Prix net vendeur</span>
              <span style={{ fontSize:8.5, color:C.g3, fontFamily:C.mono }}>Valeur liquidative</span>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. RÉGIME FISCAL ── */}
      <div>
        <SecTitle label="2 · Moteur fiscal — Régime & Structure" icon={I.Building}/>

        {/* Regime grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:12 }}>
          {displayed.map(r=>{
            const isTop = TOP5.includes(r.id);
            const active = regime===r.id;
            return (
              <button key={r.id} onClick={()=>setRegime(r.id)} style={{
                background: active ? "rgba(0,123,255,0.10)" : "#0a0a0a",
                border: `1.5px solid ${active ? C.blue : C.border}`,
                borderRadius: 10, padding:"11px 14px",
                cursor:"pointer", textAlign:"left",
                transition:"all 0.15s",
                boxShadow: active ? `0 0 14px rgba(0,123,255,0.15)` : "none",
              }}
              onMouseEnter={e=>{ if(!active){ e.currentTarget.style.borderColor="#2a2a2a"; e.currentTarget.style.background="#111"; } }}
              onMouseLeave={e=>{ if(!active){ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="#0a0a0a"; } }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color: active ? C.blue : C.w }}>{r.label}</span>
                  <div style={{ display:"flex", gap:4 }}>
                    {isTop && <span style={{ fontSize:8, fontFamily:C.mono, color:C.yellow, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", padding:"1px 5px", borderRadius:3 }}>TOP 5</span>}
                    {active && <span style={{ fontSize:8, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", padding:"1px 5px", borderRadius:3 }}>ACTIF</span>}
                  </div>
                </div>
                <span style={{ fontSize:10, color: active ? C.g1 : C.g3 }}>{r.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Show more toggle */}
        <button onClick={()=>setShowAll(s=>!s)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:10, cursor:"pointer", fontFamily:C.mono, letterSpacing:"0.08em", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g2;}}>
          {showAll ? "▲ Masquer les régimes avancés" : "▼ Voir tous les régimes (SAS, SARL…)"}
        </button>

        {/* Regime active banner */}
        <div style={{ marginTop:12, background:"linear-gradient(135deg,rgba(0,123,255,0.08),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.18)", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.w, marginBottom:2 }}>Régime sélectionné : <span style={{ color:C.blue }}>{selected?.label}</span></p>
            <p style={{ fontSize:11, color:C.g2 }}>{selected?.sub} · L'IA adaptera les calculs de rendement et déficit à ce régime.</p>
          </div>
        </div>

        {/* Identifiants fiscaux */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
          <FField icon={I.Building} label="SIRET / N° SIREN"             value=""       mono placeholder="XXX XXX XXX XXXXX"/>
          <FField icon={I.Tag}      label="Numéro fiscal du bien"         value=""       mono placeholder="Référence cadastrale"/>
          <FField icon={I.Calendar} label="Date de début d'activité"     value=""            placeholder="JJ/MM/AAAA"/>
          <FField icon={I.Lock}     label="Numéro de déclaration (CERFA)" value=""       mono placeholder="Formulaire 2031 / 2044"/>
        </div>
      </div>

      {/* ── 4. TAXES & ADMINISTRATION ── */}
      <div>
        <SecTitle label="4 · Taxes & Administration" icon={I.FileText}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
              <span style={{ color:C.g3 }}><I.Euro/></span>
              <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>TAXE FONCIÈRE</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
              <span style={{ fontSize:18, fontWeight:800, color:C.w, letterSpacing:"-0.03em" }}>{taxFonc}</span>
              <span style={{ fontSize:11, color:C.g2 }}>€ / an</span>
            </div>
            <p style={{ fontSize:9, color:C.g3, marginTop:4, fontFamily:C.mono }}>≈ {asset.taxeFonciere ? Math.round(asset.taxeFonciere/12) : "—"} € / mois · Source : avis de taxe</p>
          </div>
          <FField icon={I.Building} label="Taxe d'habitation" value="" unit="€/an" mono placeholder="Résidence secondaire / vacance"/>
        </div>

        {/* Centre des impôts */}
        <div style={{ marginTop:8, background:"#08080A", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
            <span style={{ color:C.blue }}><I.Building/></span>
            <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue }}>CENTRE DES IMPÔTS COMPÉTENT</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1.2fr 0.8fr", gap:8 }}>
            <FField icon={I.Building} label="Nom du centre" value="" placeholder="Ex : SIP Bordeaux Victoire"/>
            <FField icon={I.MapPin}   label="Ville"         value={asset.addr?.split(",")[1]?.trim()?.split(" ").slice(-1)[0] || ""} placeholder="Bordeaux"/>
            <FField icon={I.Globe}    label="Code Postal"   value={asset.addr?.match(/\d{5}/)?.[0] || ""} mono placeholder="33000"/>
          </div>
        </div>
      </div>

      {/* ── 3. ESTIMATION DE L'IMPACT FISCAL ── */}
      <div>
        <SecTitle label="3 · Estimation de l'impact fiscal" icon={I.Euro}/>

        {(()=>{
          const ps = asset.perfSim || {};
          const pf = v => parseFloat(String(v||"0").replace(",","."))||0;
          const pi = v => parseInt(String(v||"0").replace(/[^\d]/g,""),10)||0;

          // Pull real numbers from perfSim or asset
          const loyerMensuel = pf(ps.loyerMensuel) || pi(asset.loyer) || 0;
          const loyerBrut = loyerMensuel * 12;
          const vacance = pf(ps.vacance) || 5;
          const loyerNet = Math.round(loyerBrut * (1 - vacance/100));
          const taxFonciere = pf(ps.taxeFonciere) || pi(asset.taxeFonciere) || 0;
          const chargesCopro = pf(ps.chargesCopro) || pi(asset.chargesCopro) || 0;
          const assurancePNO = pf(ps.assurancePNO) || 250;
          const gestion = pf(ps.gestionLocative) || 0;
          const entretien = pf(ps.entretien) || 500;
          const chargesTotales = taxFonciere + chargesCopro + assurancePNO + gestion + entretien;
          const prixBienNum = pf(ps.prixBien) || pi(asset.prixBien) || 0;
          const fraisNotaireNum = pf(ps.fraisNotaire) || pi(asset.fraisNotaire) || 0;
          const montantPret = pf(ps.montantPret) || Math.max(0, prixBienNum + fraisNotaireNum - (pf(ps.apport)||40000));
          const tauxInteret = pf(ps.tauxInteret) || 3.5;
          const dureePret = pf(ps.dureePret) || 20;
          const amortissement = pf(ps.amortissement) || 0;
          const tmiPct = pf(ps.tmi) || kycTMI || 30;
          const psPct = 17.2;

          // Intérêts annuels moyens
          const tauxM = tauxInteret/100/12;
          const nbM = dureePret * 12;
          const mensualiteCredit = montantPret > 0 && tauxM > 0 && nbM > 0 ? montantPret * tauxM / (1 - Math.pow(1+tauxM, -nbM)) : 0;
          const interetsTotaux = mensualiteCredit * nbM - montantPret;
          const interetsAnnuelsMoy = dureePret > 0 ? Math.round(interetsTotaux / dureePret) : 0;
          const creditAnnuel = Math.round((mensualiteCredit + montantPret*(pf(ps.tauxAssurance)||0.3)/100/12) * 12);

          const fmtE = v => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(v);
          const fmtE2 = v => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(v);

          // ── Calculate per regime ──
          let steps = [];
          let resultatFiscal = 0;
          let impotIR = 0;
          let impotPS = 0;
          let impotTotal = 0;
          let cotSociales = 0;
          let cashflowNet = 0;
          let regimeLabel = "";
          let regimeColor = "#3B82F6";
          let warning = null;

          if (regime === "lmnp_micro") {
            regimeLabel = "LMNP Micro-BIC";
            regimeColor = "#F59E0B";
            const abattement = Math.round(loyerNet * 0.50);
            resultatFiscal = loyerNet - abattement;
            impotIR = Math.round(resultatFiscal * tmiPct / 100);
            impotPS = Math.round(resultatFiscal * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            if (loyerBrut > 77700) warning = "⚠️ Recettes > 77 700 € → micro-BIC impossible, passage au réel obligatoire";
            steps = [
              { label:"Revenus locatifs bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative ("+vacance+"%)", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus nets encaissés", value:fmtE(loyerNet), type:"subtotal" },
              { label:"Abattement forfaitaire 50%", value:"-"+fmtE(abattement), type:"deduction", info:"Micro-BIC : abattement automatique de 50% sur les recettes. Aucune charge réelle déductible." },
              { label:"= Résultat fiscal (BIC)", value:fmtE(resultatFiscal), type:"result" },
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "lmnp_reel") {
            regimeLabel = "LMNP Réel BIC";
            regimeColor = "#D97706";
            resultatFiscal = loyerNet - chargesTotales - interetsAnnuelsMoy - amortissement;
            const resultatPos = Math.max(0, resultatFiscal);
            const deficit = resultatFiscal < 0 ? Math.abs(resultatFiscal) : 0;
            impotIR = Math.round(resultatPos * tmiPct / 100);
            impotPS = Math.round(resultatPos * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative ("+vacance+"%)", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus nets encaissés", value:fmtE(loyerNet), type:"subtotal" },
              { divider:true, label:"CHARGES DÉDUCTIBLES" },
              { label:"Taxe foncière", value:"-"+fmtE(taxFonciere), type:"deduction" },
              { label:"Charges copropriété", value:"-"+fmtE(chargesCopro), type:"deduction" },
              { label:"Assurance PNO", value:"-"+fmtE(assurancePNO), type:"deduction" },
              { label:"Gestion locative", value:"-"+fmtE(gestion), type:"deduction" },
              { label:"Entretien / divers", value:"-"+fmtE(entretien), type:"deduction" },
              { label:"Intérêts d'emprunt (moy.)", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction", info:"Moyenne annuelle des intérêts sur la durée du prêt. Déductibles en BIC réel." },
              { label:"Amortissement (bien + mobilier)", value:"-"+fmtE(amortissement), type:"deduction", info:"Amortissement linéaire du bien (~25-30 ans) + mobilier (~5-7 ans). Ne génère pas de déficit imputable." },
              { label:"= Résultat fiscal (BIC)", value:fmtE(resultatPos), type:"result" },
              ...(deficit > 0 ? [{ label:"Déficit BIC reportable (10 ans)", value:fmtE(deficit), type:"info", info:"Reportable uniquement sur revenus BIC meublés des 10 années suivantes." }] : []),
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "rev_foncier") {
            regimeLabel = "Revenu Foncier Réel";
            regimeColor = "#2563EB";
            resultatFiscal = loyerNet - chargesTotales - interetsAnnuelsMoy;
            const deficit = resultatFiscal < 0 ? Math.min(Math.abs(resultatFiscal), 10700) : 0;
            const resultatPos = Math.max(0, resultatFiscal);
            impotIR = Math.round(resultatPos * tmiPct / 100);
            impotPS = Math.round(resultatPos * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative ("+vacance+"%)", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus fonciers nets", value:fmtE(loyerNet), type:"subtotal" },
              { divider:true, label:"CHARGES DÉDUCTIBLES (art. 31 CGI)" },
              { label:"Taxe foncière", value:"-"+fmtE(taxFonciere), type:"deduction" },
              { label:"Charges copropriété", value:"-"+fmtE(chargesCopro), type:"deduction" },
              { label:"Assurance PNO", value:"-"+fmtE(assurancePNO), type:"deduction" },
              { label:"Gestion + entretien", value:"-"+fmtE(gestion + entretien), type:"deduction" },
              { label:"Intérêts d'emprunt", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction" },
              { label:"= Résultat foncier", value:fmtE(resultatFiscal), type:"result" },
              ...(deficit > 0 ? [{ label:"Déficit foncier imputable sur revenu global", value:"-"+fmtE(deficit), type:"info", info:"Plafonné à 10 700 €/an. Excédent reportable 10 ans sur revenus fonciers." }] : []),
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "micro_fonc") {
            regimeLabel = "Micro-Foncier";
            regimeColor = "#6366F1";
            const abattement = Math.round(loyerNet * 0.30);
            resultatFiscal = loyerNet - abattement;
            impotIR = Math.round(resultatFiscal * tmiPct / 100);
            impotPS = Math.round(resultatFiscal * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            if (loyerBrut > 15000) warning = "⚠️ Revenus fonciers > 15 000 € → micro-foncier impossible";
            steps = [
              { label:"Revenus fonciers bruts", value:fmtE(loyerBrut), type:"neutral" },
              { label:"Vacance locative", value:"-"+fmtE(Math.round(loyerBrut*vacance/100)), type:"deduction" },
              { label:"= Revenus nets", value:fmtE(loyerNet), type:"subtotal" },
              { label:"Abattement forfaitaire 30%", value:"-"+fmtE(abattement), type:"deduction", info:"Micro-foncier : abattement automatique 30%. Aucune déduction de charges réelles." },
              { label:"= Résultat foncier imposable", value:fmtE(resultatFiscal), type:"result" },
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "sci_is") {
            regimeLabel = "SCI à l'IS";
            regimeColor = "#7C3AED";
            const amortIS = Math.round((prixBienNum * 0.85) / 30);
            const resultatIS = Math.max(0, loyerNet - chargesTotales - interetsAnnuelsMoy - amortIS - 2500);
            const isReduit = Math.min(resultatIS, 42500) * 0.15;
            const isNormal = Math.max(0, resultatIS - 42500) * 0.25;
            const totalIS = Math.round(isReduit + isNormal);
            const beneficeApresIS = resultatIS - totalIS;
            const flatTax = Math.round(beneficeApresIS * 0.30);
            impotTotal = totalIS + flatTax;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - totalIS;
            steps = [
              { label:"Revenus locatifs nets", value:fmtE(loyerNet), type:"neutral" },
              { divider:true, label:"CHARGES SOCIÉTÉ" },
              { label:"Charges d'exploitation", value:"-"+fmtE(chargesTotales), type:"deduction" },
              { label:"Intérêts d'emprunt", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction" },
              { label:"Amortissement immeuble (30 ans)", value:"-"+fmtE(amortIS), type:"deduction", info:"85% du prix (hors terrain) amorti sur 30 ans. Réduit le résultat imposable à l'IS." },
              { label:"Frais de structure (~2 500 €)", value:"-"+fmtE(2500), type:"deduction" },
              { label:"= Résultat imposable (IS)", value:fmtE(resultatIS), type:"result" },
              { divider:true, label:"IMPÔT SUR LES SOCIÉTÉS" },
              { label:"IS taux réduit 15% (≤ 42 500 €)", value:fmtE(Math.round(isReduit)), type:"tax" },
              ...(resultatIS > 42500 ? [{ label:"IS taux normal 25% (> 42 500 €)", value:fmtE(Math.round(isNormal)), type:"tax" }] : []),
              { label:"= Total IS", value:fmtE(totalIS), type:"total_tax" },
              { divider:true, label:"SI DISTRIBUTION (DIVIDENDES)" },
              { label:"Bénéfice après IS", value:fmtE(Math.round(beneficeApresIS)), type:"neutral" },
              { label:"Flat tax 30% (IR 12,8% + PS 17,2%)", value:fmtE(flatTax), type:"tax", info:"Précompte forfaitaire unique. S'applique si les bénéfices sont distribués aux associés." },
              { label:"= Net perçu par les associés", value:fmtE(Math.round(beneficeApresIS - flatTax)), type:"result" },
              { label:"= TOTAL FISCALITÉ (IS + flat tax)", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else if (regime === "sci_ir") {
            regimeLabel = "SCI à l'IR";
            regimeColor = "#059669";
            resultatFiscal = loyerNet - chargesTotales - interetsAnnuelsMoy;
            const resultatPos = Math.max(0, resultatFiscal);
            impotIR = Math.round(resultatPos * tmiPct / 100);
            impotPS = Math.round(resultatPos * psPct / 100);
            impotTotal = impotIR + impotPS;
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs nets", value:fmtE(loyerNet), type:"neutral" },
              { label:"Charges d'exploitation", value:"-"+fmtE(chargesTotales), type:"deduction" },
              { label:"Intérêts d'emprunt", value:"-"+fmtE(interetsAnnuelsMoy), type:"deduction" },
              { label:"Frais de structure (~1 500 €)", value:"-1 500 €", type:"deduction" },
              { label:"= Quote-part imposable (IR)", value:fmtE(Math.max(0,resultatFiscal)), type:"result", info:"Transparence fiscale : chaque associé déclare sa quote-part à l'IR. Pas d'amortissement possible." },
              { divider:true },
              { label:"Impôt sur le revenu (TMI "+tmiPct+"%)", value:fmtE(impotIR), type:"tax" },
              { label:"Prélèvements sociaux (17,2%)", value:fmtE(impotPS), type:"tax" },
              { label:"= TOTAL IMPÔTS (par associé)", value:fmtE(impotTotal), type:"total_tax" },
            ];
          } else {
            // Pinel, SARL, SAS — simplified
            regimeLabel = selected?.label || regime;
            regimeColor = "#3B82F6";
            resultatFiscal = loyerNet - chargesTotales;
            impotTotal = Math.round(Math.max(0,resultatFiscal) * (tmiPct+psPct)/100);
            cashflowNet = loyerNet - chargesTotales - creditAnnuel - impotTotal;
            steps = [
              { label:"Revenus locatifs nets", value:fmtE(loyerNet), type:"neutral" },
              { label:"Charges", value:"-"+fmtE(chargesTotales), type:"deduction" },
              { label:"= Résultat imposable", value:fmtE(Math.max(0,resultatFiscal)), type:"result" },
              { label:"Imposition estimée ("+tmiPct+"% + 17,2%)", value:fmtE(impotTotal), type:"total_tax" },
            ];
          }

          return (
            <div style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.04),rgba(99,102,241,0.02))", border:"1px solid rgba(59,130,246,0.15)", borderRadius:14, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(59,130,246,0.1)", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:regimeColor+"18", border:"1px solid "+regimeColor+"35", display:"flex", alignItems:"center", justifyContent:"center", color:regimeColor }}>
                  <I.Euro/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:C.w }}>{regimeLabel}</p>
                  <p style={{ fontSize:10, color:C.g2 }}>Simulation basée sur les données réelles du bien</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>TMI</p>
                  <p style={{ fontSize:16, fontWeight:800, color:regimeColor, fontFamily:C.mono }}>{tmiPct}%</p>
                </div>
              </div>

              {/* Warning */}
              {warning && (
                <div style={{ margin:"12px 18px 0", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"8px 12px" }}>
                  <p style={{ fontSize:10, color:C.red, fontWeight:600 }}>{warning}</p>
                </div>
              )}

              {/* Steps */}
              <div style={{ padding:"14px 18px" }}>
                {steps.map((s, i) => {
                  if (s.divider) return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8, margin:"10px 0 6px" }}>
                      <div style={{ flex:1, height:1, background:C.border }}/>
                      {s.label && <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>{s.label}</span>}
                      <div style={{ flex:1, height:1, background:C.border }}/>
                    </div>
                  );
                  const isResult = s.type === "result";
                  const isTotal = s.type === "total_tax";
                  const isTax = s.type === "tax";
                  const isDeduction = s.type === "deduction";
                  const isSubtotal = s.type === "subtotal";
                  const isInfo = s.type === "info";
                  return (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:6, padding:(isResult||isTotal)?"8px 10px":"5px 10px",
                      background:isTotal?"rgba(239,68,68,0.06)":isResult?"rgba(59,130,246,0.04)":isInfo?"rgba(245,158,11,0.04)":"transparent",
                      border:isTotal?"1px solid rgba(239,68,68,0.15)":isResult?"1px solid rgba(59,130,246,0.12)":"none",
                      borderRadius:(isResult||isTotal||isInfo)?8:0,
                      margin:(isResult||isTotal)?"4px 0":"0",
                    }}>
                      <span style={{ flex:1, fontSize:isTotal?12:11, fontWeight:(isResult||isTotal||isSubtotal)?700:400, color:isTotal?C.red:isResult?C.blue:isDeduction?C.g2:isInfo?"#F59E0B":C.g1 }}>{s.label}</span>
                      <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                        <span style={{ fontSize:isTotal?14:12, fontWeight:(isResult||isTotal)?800:600, color:isTotal?C.red:isResult?C.w:isTax?C.red:isDeduction?"#F59E0B":isInfo?"#F59E0B":C.w, fontFamily:C.mono }}>{s.value}</span>
                        {s.info && <PerfInfo text={s.info}/>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom summary */}
              <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(59,130,246,0.1)", background:"#0a0a0a" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>IMPÔT TOTAL / AN</p>
                    <p style={{ fontSize:18, fontWeight:800, color:C.red, fontFamily:C.mono }}>{fmtE(impotTotal)}</p>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>PRESSION FISCALE</p>
                    <p style={{ fontSize:18, fontWeight:800, color:loyerNet>0?(impotTotal/loyerNet>0.3?C.red:impotTotal/loyerNet>0.15?C.yellow:C.green):C.g2, fontFamily:C.mono }}>{loyerNet>0?Math.round(impotTotal/loyerNet*100):0}%</p>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:3 }}>CASH-FLOW NET / MOIS</p>
                    <p style={{ fontSize:18, fontWeight:800, color:cashflowNet>=0?C.green:C.red, fontFamily:C.mono }}>{fmtE2(cashflowNet/12)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Save CTA */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10, paddingTop:4 }}>
        <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
          onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
          Annuler
        </button>
        <button style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:9, padding:"9px 22px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:`0 4px 18px ${C.blueGlow}`, transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(0,123,255,0.5)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 18px ${C.blueGlow}`;}}>
          <I.Save/> Enregistrer les données fiscales
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   NOUVEAU BIEN — SMART INTAKE PANEL
════════════════════════════════════════ */

const BIEN_OCR_SYSTEM_PROMPT = `Toute information absente ou incertaine doit être strictement retournée comme null. Toute hallucination est considérée comme une erreur critique.
Tu es un moteur d'extraction documentaire strictement déterministe pour des documents immobiliers.
Tu reçois des images ou PDF de documents liés à un bien immobilier : acte de vente, appels de fonds, diagnostics techniques, photos.
Ta mission : Extraire uniquement les informations explicitement présentes. Ne jamais compléter, deviner, corriger ou reformater si incertain. Si doute → null.

SCHÉMA JSON CIBLE :
{
  "identification": { "nom_bien": null, "type_bien": null, "identifiant": null, "adresse": null, "adresse_complement": null, "batiment_escalier_etage": null, "porte_lot": null, "ville": null, "code_postal": null, "region": null, "pays": null, "surface_carrez": null, "configuration": null, "chambres": null, "salles_de_bain": null, "annee_construction": null, "description": null },
  "performance_energetique": { "classe_dpe": null, "classe_ges": null, "depenses_energie_annuelles": null, "annee_reference_prix": null },
  "locatif": { "etat_locatif": null, "type_location": null, "mode_locatif": null, "loyer_hc": null, "charges_locatives": null, "frequence_paiement": null },
  "parties": { "vendeur": null, "notaire": null },
  "acquisition": { "date_acquisition": null, "prix_net_vendeur": null, "frais_notaire": null, "frais_agence": null, "ameublement_travaux": null },
  "charges": { "taxe_fonciere": null, "charges_copro": null },
  "regime_fiscal": null
}

RÈGLES PAR DOCUMENT :
ACTE DE VENTE — Extraire : prix, vendeur, acheteur, adresse complète, date de vente, surface, notaire. Prix = montant explicitement "prix de vente" ou "prix net vendeur". Ne pas confondre prix avec frais.
APPELS DE FONDS — Extraire : charges copropriété, taxe foncière, frais notaire. Montants = lignes explicitement libellées. Ne pas additionner des lignes.
DIAGNOSTICS — Extraire : classe DPE (A-G), classe GES (A-G), surface habitable, année de construction. Ne pas déduire la classe si seule la consommation est donnée.
PHOTOS — Extraire : type de bien visible (appartement/maison), état général, nombre de pièces visibles. Si incertain → null.

INTERDICTIONS : Ne pas calculer de totaux. Ne pas déduire un régime fiscal. Ne pas estimer une surface. Ne pas inventer une adresse. Ne pas corriger les fautes OCR.

FORMAT : Retourne UNIQUEMENT du JSON valide, sans backticks, sans commentaire, sans phrase. Respecte exactement le schéma ci-dessus.`;

const NB_AI_STEPS = [
  "Lecture de l'acte de vente...",
  "Extraction du prix et des parties...",
  "Analyse des diagnostics (DPE, amiante, plomb)...",
  "Traitement des appels de fonds...",
  "Reconnaissance des photos du bien...",
  "Calcul de la valeur liquidative...",
  "Génération de la fiche bien complète...",
];

const NB_DOC_ZONES = [
  {
    key:"acte",
    type:"ACTE DE VENTE",
    label:"Acte de vente",
    subLabel:"Acte authentique · Compromis · Avant-contrat",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    aiFields:["prix d'achat","vendeur","acheteur","adresse","date","surface"],
    color:"#007BFF",
  },
  {
    key:"fonds",
    type:"APPELS DE FONDS",
    label:"Appels de fonds",
    subLabel:"Appels notaire · Relevés de charges · Syndic",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    aiFields:["charges copro","taxe foncière","frais notaire","appels trimestriels"],
    color:"#10B981",
  },
  {
    key:"diag",
    type:"DIAGNOSTICS",
    label:"Diagnostics",
    subLabel:"DPE · Amiante · Plomb · Électricité · Gaz",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    aiFields:["DPE","GES","surface habitable","année construction","diagnostics réglementaires"],
    color:"#F59E0B",
  },
  {
    key:"photos",
    type:"PHOTOS",
    label:"Photos du bien",
    subLabel:"Façade · Intérieur · Plans · État général",
    icon:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    aiFields:["état général","pièces détectées","luminosité","rénovation visible"],
    color:"#8B5CF6",
  },
];

function NbDropZone({ zone, files, onAddFile, analyzing, done, onRemoveFile }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const ZoneIcon = zone.icon;
  const fileList = files || [];
  const hasFiles = fileList.length > 0;

  const handleDrop = e => { e.preventDefault(); setDrag(false); [...e.dataTransfer.files].forEach(f=>onAddFile(f)); };
  const handleInput = e => { [...e.target.files].forEach(f=>onAddFile(f)); e.target.value=""; };
  const ac = zone.color;

  return (
    <div style={{ position:"relative", flex:1, minWidth:0 }}>
      <input ref={ref} type="file" multiple style={{ display:"none" }} onChange={handleInput}/>
      <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={handleDrop}
        style={{ border:`1.5px dashed ${done?C.green:drag?ac:"#2a2a2a"}`, borderRadius:14, padding:"18px 14px 14px", textAlign:"center", cursor:"pointer", background:done?"rgba(16,185,129,0.05)":drag?`${ac}12`:"transparent", transition:"all 0.25s", boxShadow:drag?`0 0 22px ${ac}20`:done?`0 0 18px ${C.green}12`:"none", position:"relative", overflow:"hidden", height:"100%", boxSizing:"border-box" }}>
        <div style={{ position:"absolute", top:-14, left:-14, width:36, height:36, borderRadius:"50%", background:done?`${C.green}18`:`${ac}10`, pointerEvents:"none" }}/>
        <div style={{ width:40, height:40, borderRadius:11, margin:"0 auto 10px", background:done?"rgba(16,185,129,0.12)":drag?`${ac}22`:`${ac}10`, border:`1px solid ${done?C.greenBord:drag?`${ac}50`:`${ac}25`}`, display:"flex", alignItems:"center", justifyContent:"center", color:done?C.green:ac, transition:"all 0.2s" }}>
          {analyzing?<div style={{ animation:"spin 1s linear infinite" }}><I.Loader/></div>:done?<I.CheckCircle/>:<ZoneIcon/>}
        </div>
        <p style={{ fontSize:11, fontWeight:700, color:done?C.green:C.w, marginBottom:2 }}>{done?`${fileList.length} fichier${fileList.length>1?"s":""}`:zone.label}</p>
        {!hasFiles&&<p style={{ fontSize:9, color:C.g2, lineHeight:1.5, marginBottom:6 }}>{zone.subLabel}</p>}
        {hasFiles&&(
          <div style={{ marginTop:4, display:"flex", flexDirection:"column", gap:2, textAlign:"left" }}>
            {fileList.map((f,fi)=>(
              <div key={fi} style={{ display:"flex", alignItems:"center", gap:4, background:"#0d0d0f", borderRadius:5, padding:"3px 6px" }}>
                <I.File/>
                <span style={{ fontSize:7.5, color:C.g1, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:C.mono }}>{f.name}</span>
                <button onClick={e=>{e.stopPropagation();onRemoveFile(fi);}} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, display:"flex", padding:0, flexShrink:0, opacity:0.6 }}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}><I.X/></button>
              </div>
            ))}
          </div>
        )}
        {!hasFiles&&!analyzing&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:3, justifyContent:"center", marginBottom:6 }}>
            {zone.aiFields.slice(0,3).map(f=>(<span key={f} style={{ fontSize:7, fontFamily:C.mono, color:ac, background:`${ac}10`, border:`1px solid ${ac}20`, padding:"1px 4px", borderRadius:3 }}>{f}</span>))}
          </div>
        )}
        {analyzing&&<div style={{ height:2, background:"#1f1f1f", borderRadius:99, overflow:"hidden", marginTop:6 }}><div style={{ height:"100%", background:`linear-gradient(90deg,${ac},${ac}88)`, borderRadius:99, animation:"scanBar 1.4s ease-in-out infinite alternate", width:"60%" }}/></div>}
        {!analyzing&&<div style={{ marginTop:hasFiles?4:6, display:"flex", alignItems:"center", justifyContent:"center", gap:4, opacity:0.4 }}><I.Upload2/><span style={{ fontSize:8, color:C.g2 }}>{hasFiles?"+ Ajouter":"Glisser ou cliquer"}</span></div>}
      </div>
      <div style={{ position:"absolute", top:8, right:8, fontSize:7.5, fontFamily:C.mono, letterSpacing:"0.1em", color:done?C.green:ac, background:done?C.greenSub:`${ac}12`, border:`1px solid ${done?C.greenBord:`${ac}25`}`, padding:"2px 6px", borderRadius:4, lineHeight:1.5 }}>{zone.type}{hasFiles?` · ${fileList.length}`:""}</div>
    </div>
  );
}

/* ── Editable field for the new-asset form ── */
function NbField({ label, value, unit, icon:TIcon, mono, placeholder, accent, full, readOnly, onChange, ocrFilled, type }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ background: focus ? "rgba(0,123,255,0.04)" : "#0a0a0a", border:`1px solid ${focus?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", transition:"all 0.15s", gridColumn:full?"span 2":"span 1", position:"relative" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
        {ocrFilled && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {type==="date" ? (
          <DatePickerInput value={value||""} onChange={v=>!readOnly&&onChange&&onChange(v)} placeholder={placeholder}/>
        ) : (
          <input type={type||"text"}
            value={value||""} onChange={e=>!readOnly&&onChange&&onChange(e.target.value)}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            placeholder={placeholder||"—"} readOnly={readOnly}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:700, color:accent?C.blue:C.w, fontFamily:mono?"monospace":"inherit" }}
          />
        )}
        {unit&&<span style={{ fontSize:11, color:C.g2, flexShrink:0 }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ── Address field with autocomplete (api-adresse.data.gouv.fr) ── */
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
    const lower = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return FR_CITIES
      .filter(([city, cp]) => {
        const cn = city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

/* ── Select dropdown for the new-asset form ── */
function NbSelect({ label, value, options, icon:TIcon, full, onChange, ocrFilled, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(()=>{
    if(!open) return;
    const close = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return ()=>document.removeEventListener("mousedown", close);
  },[open]);
  return (
    <div ref={ref} style={{ position:"relative", gridColumn:full?"span 2":"span 1" }}>
      <div onClick={()=>setOpen(!open)} style={{ background:open?"rgba(0,123,255,0.04)":"#0a0a0a", border:`1px solid ${open?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", cursor:"pointer", transition:"all 0.15s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
          {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
          <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
          {ocrFilled && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ flex:1, fontSize:13, fontWeight:700, color:value?C.w:C.g3 }}>{value||placeholder||"Sélectionner…"}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2" strokeLinecap="round" style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:50, marginTop:4, background:"#111", border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 12px 40px rgba(0,0,0,0.6)", maxHeight:220, overflowY:"auto", animation:"fadeUp 0.15s ease" }}>
          {options.map(opt => {
            const isSelected = value === opt;
            return (
              <div key={opt} onClick={()=>{onChange(opt);setOpen(false);}}
                style={{ padding:"9px 14px", fontSize:12, fontWeight:isSelected?700:500, color:isSelected?C.blue:C.g1, background:isSelected?"rgba(0,123,255,0.06)":"transparent", cursor:"pointer", borderBottom:`1px solid ${C.border}`, transition:"background 0.1s" }}
                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background="#1a1a1a";}}
                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background="transparent";}}>
                {isSelected && <span style={{ marginRight:6, color:C.blue }}>✓</span>}{opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Textarea for the new-asset form ── */
function NbTextarea({ label, value, icon:TIcon, full, onChange, ocrFilled, placeholder, rows }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ background:focus?"rgba(0,123,255,0.04)":"#0a0a0a", border:`1px solid ${focus?"rgba(0,123,255,0.3)":C.border}`, borderRadius:10, padding:"10px 13px", transition:"all 0.15s", gridColumn:full?"span 2":"span 1" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
        {ocrFilled && <span style={{ marginLeft:"auto", fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
      </div>
      <textarea value={value||""} onChange={e=>onChange&&onChange(e.target.value)} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
        placeholder={placeholder||"—"} rows={rows||3}
        style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:600, color:C.w, resize:"vertical", lineHeight:1.6, fontFamily:"inherit" }}/>
    </div>
  );
}

/* ── Color picker for the new-asset form ── */
function NbColor({ label, value, onChange }) {
  const PRESET = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316","#84CC16","#6366F1"];
  return (
    <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 13px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
        <I.Palette/>
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
        {PRESET.map(col=>(
          <div key={col} onClick={()=>onChange(col)}
            style={{ width:22, height:22, borderRadius:6, background:col, cursor:"pointer", border:value===col?"2px solid #fff":`2px solid transparent`, boxShadow:value===col?`0 0 8px ${col}60`:"none", transition:"all 0.15s" }}/>
        ))}
        <input type="color" value={value||"#3B82F6"} onChange={e=>onChange(e.target.value)}
          style={{ width:22, height:22, borderRadius:6, border:`1px solid ${C.border}`, cursor:"pointer", background:"transparent", padding:0 }}/>
      </div>
    </div>
  );
}

/* ── Section Label ── */
const SecLabel = ({label})=>(
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, marginTop:2 }}>
    <span style={{ fontSize:9, letterSpacing:"0.12em", color:C.g3, fontFamily:C.mono }}>{label}</span>
    <div style={{ flex:1, height:1, background:C.border }}/>
  </div>
);

function NouveauBienPanel({ onClose, onCreateAsset }) {
  const [files,     setFiles]     = useState({ acte:[], fonds:[], diag:[], photos:[] });
  const [filesB64,  setFilesB64]  = useState({ acte:[], fonds:[], diag:[], photos:[] });
  const [analyzing, setAnalyzing] = useState({ acte:false, fonds:false, diag:false, photos:false });
  const [done,      setDone]      = useState({ acte:false, fonds:false, diag:false, photos:false });
  const [phase,     setPhase]     = useState("intake"); // intake | analyzing | done
  const [aiStep,    setAiStep]    = useState(0);
  const [aiLabel,   setAiLabel]   = useState(NB_AI_STEPS[0]);
  const [formTab,   setFormTab]   = useState("Caractéristiques");
  const [confirmed, setConfirmed] = useState(false);
  const [bienOcr,   setBienOcr]   = useState(null);
  const [bienErr,   setBienErr]   = useState(null);
  const [bienConf,  setBienConf]  = useState(0);

  // Read file as base64
  const readB64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });

  const handleFile = async (key, file) => {
    setFiles(f=>({...f,[key]:[...f[key],file]}));
    setAnalyzing(a=>({...a,[key]:true}));
    try {
      const b64 = await readB64(file);
      setFilesB64(f=>({...f,[key]:[...f[key],b64]}));
    } catch(e) { console.error("File read error:", e); }
    setTimeout(()=>{ setAnalyzing(a=>({...a,[key]:false})); setDone(d=>({...d,[key]:true})); }, 1800 + Math.random()*800);
  };

  const removeFile = (key, index) => {
    setFiles(f=>{
      const arr = f[key].filter((_,i)=>i!==index);
      if(arr.length===0) setDone(d=>({...d,[key]:false}));
      return {...f,[key]:arr};
    });
    setFilesB64(f=>({...f,[key]:f[key].filter((_,i)=>i!==index)}));
  };

  const allDone = Object.values(done).every(Boolean);
  const someFiles = Object.values(files).some(a=>a.length>0);

  // Editable form state — initialized empty, filled by OCR
  const EMPTY_FORM = { name:"",type:"",identifiant:"",couleur:"#3B82F6",addr:"",addr2:"",batiment:"",escalier:"",etage:"",porteLot:"",ville:"",codePostal:"",region:"",pays:"France",surface:"",rooms:"",chambres:"",sdb:"",year:"",description:"",dpe:"",ges:"",depensesEnergieMin:"",depensesEnergieMax:"",anneeRefPrix:"",etatLocatif:"",typeLocation:"",dureeMin:"",dureeMax:"",mode:"",loyer:"",chargesLocatives:"",depotGarantie:"",frequencePaiement:"",prixBien:"",fraisNotaire:"",fraisAgence:"",ameublement:"",dateAcq:"",vendeur:"",notaire:"",taxeFonciere:"",chargesCopro:"",regime:"" };
  const [formData, setFormData] = useState({...EMPTY_FORM});
  const [ocrFields, setOcrFields] = useState({}); // tracks which fields came from OCR
  const upd = (k,v) => setFormData(f=>({...f,[k]:v}));

  // Sync OCR results into formData when extraction finishes
  useEffect(()=>{
    if(!bienOcr) return;
    const d = bienOcr;
    const id = d.identification || {};
    const pe = d.performance_energetique || {};
    const lo = d.locatif || {};
    const pa = d.parties || {};
    const aq = d.acquisition || {};
    const ch = d.charges || {};
    const mapping = {
      name: id.nom_bien, type: id.type_bien, identifiant: id.identifiant,
      addr: id.adresse, addr2: id.adresse_complement, batiment: id.batiment_escalier_etage,
      porteLot: id.porte_lot, ville: id.ville, codePostal: id.code_postal, region: id.region, pays: id.pays,
      surface: id.surface_carrez, rooms: id.configuration, chambres: id.chambres, sdb: id.salles_de_bain,
      year: id.annee_construction, description: id.description,
      dpe: pe.classe_dpe, ges: pe.classe_ges, depensesEnergieMin: null, depensesEnergieMax: pe.depenses_energie_annuelles, anneeRefPrix: pe.annee_reference_prix,
      etatLocatif: lo.etat_locatif, typeLocation: lo.type_location, mode: lo.mode_locatif,
      loyer: lo.loyer_hc, chargesLocatives: lo.charges_locatives, depotGarantie: null, dureeMin: null, dureeMax: null, frequencePaiement: lo.frequence_paiement,
      prixBien: aq.prix_net_vendeur, fraisNotaire: aq.frais_notaire, fraisAgence: aq.frais_agence, ameublement: aq.ameublement_travaux,
      dateAcq: aq.date_acquisition, vendeur: pa.vendeur, notaire: pa.notaire,
      taxeFonciere: ch.taxe_fonciere, chargesCopro: ch.charges_copro, regime: d.regime_fiscal,
    };
    const filled = {};
    const ocrF = {};
    for (const [k,v] of Object.entries(mapping)) {
      filled[k] = (v !== null && v !== undefined && v !== "") ? String(v) : "";
      if (v !== null && v !== undefined && v !== "") ocrF[k] = true;
    }
    setFormData(prev => {
      const merged = {...prev};
      for (const [k,v] of Object.entries(filled)) { if(v) merged[k] = v; }
      return merged;
    });
    setOcrFields(ocrF);
  }, [bienOcr]);

  // OCR extraction
  const runBienOCR = useCallback(async () => {
    setPhase("analyzing");
    setAiStep(0); setAiLabel(NB_AI_STEPS[0]);
    let step = 0;
    const iv = setInterval(() => { step++; if(step<NB_AI_STEPS.length){setAiStep(step);setAiLabel(NB_AI_STEPS[step]);} }, 600);

    const addDoc = (arr, b64, name, mimeHint) => {
      if(!b64) return;
      const isPdf = name?.toLowerCase().endsWith(".pdf");
      const mime = isPdf ? "application/pdf" : (mimeHint || "image/jpeg");
      arr.push(isPdf ? {type:"document",source:{type:"base64",media_type:mime,data:b64}} : {type:"image",source:{type:"base64",media_type:mime,data:b64}});
    };

    try {
      const docs = [];
      ["acte","fonds","diag","photos"].forEach(k => {
        filesB64[k].forEach((b,i) => addDoc(docs, b, files[k][i]?.name, files[k][i]?.type));
      });
      docs.push({type:"text",text:"Extrais les données de ces documents immobiliers selon le schéma JSON défini. Retourne uniquement le JSON."});

      const resp = await fetch("/api/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-5-20250514", max_tokens:2048, system:BIEN_OCR_SYSTEM_PROMPT, messages:[{role:"user",content:docs}] })
      });
      const data = await resp.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setBienOcr(parsed);

      // Confidence
      const flatten = obj => { let vals=[]; for(const v of Object.values(obj||{})){if(v&&typeof v==="object"&&!Array.isArray(v)) vals.push(...flatten(v)); else vals.push(v);} return vals; };
      const all = flatten(parsed);
      const filled = all.filter(v=>v!==null&&v!=="").length;
      setBienConf(all.length>0?Math.round(filled/all.length*100):0);
    } catch(e) {
      console.error("Bien OCR error:", e);
      setBienErr(e.message);
      setBienOcr({});
      setBienConf(0);
    } finally {
      clearInterval(iv);
      setAiStep(NB_AI_STEPS.length-1);
      setAiLabel(NB_AI_STEPS[NB_AI_STEPS.length-1]);
      setTimeout(()=>setPhase("done"), 500);
    }
  }, [filesB64, files]);

  // Skip to empty form without docs
  const skipToEmpty = () => { setBienOcr({}); setBienConf(0); setPhase("done"); };

  useEffect(()=>{
    if (allDone && phase==="intake") {
      setTimeout(()=>runBienOCR(), 700);
    }
  },[done, allDone, runBienOCR]);

  const pct = Math.round((aiStep/NB_AI_STEPS.length)*100);
  const FORM_TABS = ["Caractéristiques","Finances & Fiscalité"];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)" }}/>

      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:201, width:"min(820px,92vw)", background:"#0d0d0d", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", animation:"slideIn 0.32s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"-24px 0 64px rgba(0,0,0,0.7)", overflowY:"auto" }}>

        {/* ── STICKY HEADER ── */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14, background:"#08080A", position:"sticky", top:0, zIndex:10, flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
            <I.X/>
          </button>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.14em", color:C.blue, marginBottom:2 }}>EQUITY · NOUVEAU BIEN</p>
            <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>
              {phase==="done" ? (formData.name || "Nouveau bien") : "Créer une fiche bien"}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            {[
              {n:1,l:"Documents",  done:phase!=="intake",          act:phase==="intake"},
              {n:2,l:"Analyse IA", done:phase==="done",            act:phase==="analyzing"},
              {n:3,l:"Fiche bien", done:false,                     act:phase==="done"},
            ].map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", background:s.done?C.green:s.act?C.blue:"#1a1a1a", border:`1.5px solid ${s.done?C.green:s.act?C.blue:"#2a2a2a"}`, color:s.done||s.act?"#fff":C.g3, boxShadow:s.act?`0 0 10px ${C.blueGlow}`:"none", transition:"all 0.4s" }}>
                  {s.done?"✓":s.n}
                </div>
                <span style={{ fontSize:10, color:s.done?C.green:s.act?C.w:C.g3, fontWeight:s.act?600:400, transition:"color 0.3s" }}>{s.l}</span>
                {i<2&&<div style={{ width:18, height:1, background:C.border }}/>}
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding:"22px 24px 32px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* ══ PHASE: INTAKE ══ */}
          {(phase==="intake"||phase==="analyzing") && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Smart intake zone */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:18, padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <span style={{ color:C.blue }}><I.Sparkles/></span>
                  <div>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue }}>SMART INTAKE · DÉPOSEZ VOS DOCUMENTS</p>
                    <p style={{ fontSize:11, color:C.g2, marginTop:2 }}>L'IA scannera vos documents et pré-remplira automatiquement la fiche du bien</p>
                  </div>
                </div>

                {/* 4 drop zones in a 2x2 grid */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {NB_DOC_ZONES.map(zone=>(
                    <NbDropZone key={zone.key} zone={zone} files={files[zone.key]} onAddFile={f=>handleFile(zone.key,f)} analyzing={analyzing[zone.key]} done={done[zone.key]} onRemoveFile={i=>removeFile(zone.key,i)}/>
                  ))}
                </div>

                {/* Progress dots */}
                <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:8 }}>
                  {NB_DOC_ZONES.map(z=>(
                    <div key={z.key} style={{ flex:1, height:3, borderRadius:99, background: done[z.key]?C.green:files[z.key].length>0?z.color:"#1e1e1e", transition:"background 0.4s" }}/>
                  ))}
                  <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>
                    {Object.values(done).filter(Boolean).length}/4
                  </span>
                </div>

                {!allDone && (
                  <div style={{ textAlign:"center", marginTop:10 }}>
                    <button onClick={skipToEmpty}
                      style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", color:C.g2, fontSize:10, cursor:"pointer", fontFamily:C.mono, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g2;}}>
                      Continuer sans documents → fiche vide
                    </button>
                  </div>
                )}
              </div>

              {/* Hint: what IA will extract */}
              {!allDone && (
                <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:10 }}>CE QUE L'IA VA EXTRAIRE AUTOMATIQUEMENT</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                    {NB_DOC_ZONES.map(z=>(
                      <div key={z.key}>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                          <div style={{ width:3, height:12, borderRadius:99, background:z.color }}/>
                          <span style={{ fontSize:9, fontWeight:700, color:C.g1, fontFamily:C.mono }}>{z.type}</span>
                        </div>
                        {z.aiFields.map(f=>(
                          <div key={f} style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
                            <span style={{ width:4, height:4, borderRadius:"50%", background:`${z.color}50`, flexShrink:0 }}/>
                            <span style={{ fontSize:9.5, color:C.g3 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IA global progress bar */}
              {phase==="analyzing" && (
                <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 20px", animation:"fadeUp 0.3s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, animation:"spin 1.2s linear infinite" }}><I.Loader/></div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:C.blue, marginBottom:2 }}>ANALYSE IA EN COURS</p>
                      <p style={{ fontSize:12, fontWeight:600, color:C.w }}>{aiLabel}</p>
                    </div>
                    <span style={{ fontSize:15, fontWeight:800, color:C.blue, fontFamily:C.mono }}>{pct}%</span>
                  </div>
                  <div style={{ height:4, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:10 }}>
                    <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.blue},#60a5fa,${C.blue})`, backgroundSize:"200% 100%", width:`${pct}%`, transition:"width 0.45s ease", animation:"shimmer 2s linear infinite" }}/>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {NB_AI_STEPS.map((s,i)=>(
                      <span key={i} style={{ fontSize:9, fontFamily:C.mono, color:i<aiStep?C.green:i===aiStep?C.blue:C.g3, transition:"color 0.3s" }}>
                        {i<aiStep?"✓ ":i===aiStep?"● ":"○ "}{i===aiStep?s.replace("...",""):""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skip CTA */}
              {phase==="intake" && (
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button onClick={()=>setPhase("done")} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"8px 18px", color:C.g2, fontSize:11, cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                    onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                    Passer → Fiche vide
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ PHASE: DONE — FICHE BIEN ══ */}
          {phase==="done" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.45s cubic-bezier(0.2,0.8,0.2,1)" }}>

              {/* Success banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:13, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:bienErr?C.yellow:C.green, marginBottom:2 }}>{bienErr?"Extraction partielle":"Scan terminé"} — {Object.values(files).reduce((s,a)=>s+a.length,0)} document{Object.values(files).reduce((s,a)=>s+a.length,0)>1?"s":""} traité{Object.values(files).reduce((s,a)=>s+a.length,0)>1?"s":""}</p>
                  <p style={{ fontSize:11, color:C.g2 }}>Vérifiez et complétez les champs vides avant de valider.</p>
                </div>
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <p style={{ fontSize:20, fontWeight:800, color:bienConf>=70?C.green:bienConf>=40?C.yellow:C.red }}>{bienConf}%</p>
                  <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>CONFIANCE</p>
                </div>
              </div>

              {/* Bien header */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background:C.blueSub, border:"1.5px solid rgba(0,123,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>
                    <I.Home/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <input value={formData.name} onChange={e=>upd("name",e.target.value)} placeholder="Nom du bien" style={{ background:"transparent", border:"none", outline:"none", fontSize:17, fontWeight:800, color:C.w, letterSpacing:"-0.02em", width:"100%" }}/>
                    </div>
                    <p style={{ fontSize:11, color:C.g2 }}>{[formData.addr, formData.ville, formData.surface?formData.surface+" m²":null, formData.year?"Construit en "+formData.year:null].filter(Boolean).join(" · ")||"Complétez les informations ci-dessous"}</p>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["Nouveau","Non loué"].map((b,i)=>(
                      <span key={i} style={{ fontSize:9, fontFamily:C.mono, color:i===0?C.blue:C.yellow, background:i===0?C.blueSub:"rgba(245,158,11,0.1)", border:`1px solid ${i===0?"rgba(0,123,255,0.25)":"rgba(245,158,11,0.25)"}`, padding:"3px 8px", borderRadius:4 }}>{b}</span>
                    ))}
                  </div>
                </div>

                {/* Form sub-tabs */}
                <div style={{ display:"flex", gap:2, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                  {FORM_TABS.map(t=>{
                    const active=formTab===t;
                    return(
                      <button key={t} onClick={()=>setFormTab(t)} style={{ background:active?C.blueSub:"transparent", border:active?"1px solid rgba(0,123,255,0.25)":"1px solid transparent", borderRadius:7, padding:"6px 14px", fontSize:11, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", transition:"all 0.15s" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TAB: CARACTÉRISTIQUES ── */}
              {formTab==="Caractéristiques" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                  {/* ═══ 1. IDENTITÉ & TYPE DE BIEN ═══ */}
                  <SecLabel label="1 · IDENTITÉ & TYPE DE BIEN"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Home} label="Nom / Identifiant" value={formData.name} full placeholder="Ex : Le Loft d'Eysines" onChange={v=>upd("name",v)} ocrFilled={ocrFields.name}/>
                    <NbSelect icon={I.Home2} label="Type de bien" value={formData.type} onChange={v=>upd("type",v)} ocrFilled={ocrFields.type}
                      options={["Appartement","Maison","Studio","Loft","Chambre","Château","Mobil-Home","Caravane","Atelier","Boutique","Box de stockage","Bureaux","Bureau partagé","Cave","Chalet","Commerce","Entrepôt","Garage","Grenier","Hôtel Particulier","Local professionnel","Local commercial","Parking","Terrain","Autre"]}/>
                    <NbField icon={I.Tag} label="Référence interne" value={formData.identifiant} placeholder="N° unique ou code" onChange={v=>upd("identifiant",v)} ocrFilled={ocrFields.identifiant}/>
                    <NbColor label="Couleur de référence" value={formData.couleur} onChange={v=>upd("couleur",v)}/>
                  </div>

                  {/* ═══ 2. LOCALISATION COMPLÈTE ═══ */}
                  <SecLabel label="2 · LOCALISATION"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbFieldAddress icon={I.MapPin} label="Adresse (n° et rue)" value={formData.addr} full placeholder="12 Rue de la République" onChange={v=>upd("addr",v)} ocrFilled={ocrFields.addr} onSelect={s=>{upd("addr",s.addr);upd("ville",s.ville);upd("codePostal",s.codePostal);if(s.region)upd("region",s.region);}}/>
                    <NbField icon={I.MapPin} label="Complément d'adresse" value={formData.addr2} full placeholder="Résidence, Adresse 2" onChange={v=>upd("addr2",v)} ocrFilled={ocrFields.addr2}/>
                    <NbField icon={I.Building} label="Bâtiment" value={formData.batiment} placeholder="Bât A" onChange={v=>upd("batiment",v)} ocrFilled={ocrFields.batiment}/>
                    <NbField icon={I.Building} label="Escalier" value={formData.escalier} placeholder="Esc 2" onChange={v=>upd("escalier",v)}/>
                    <NbField icon={I.Building} label="Étage" value={formData.etage} placeholder="3e étage" onChange={v=>upd("etage",v)}/>
                    <NbField icon={I.Grid} label="N° de porte / lot" value={formData.porteLot} placeholder="Porte 12 / Lot 45" onChange={v=>upd("porteLot",v)} ocrFilled={ocrFields.porteLot}/>
                    <NbField icon={I.MapPin} label="Ville" value={formData.ville} placeholder="Bordeaux" onChange={v=>upd("ville",v)} ocrFilled={ocrFields.ville}/>
                    <NbField icon={I.MapPin} label="Code postal" value={formData.codePostal} placeholder="33000" onChange={v=>upd("codePostal",v)} ocrFilled={ocrFields.codePostal}/>
                    <NbField icon={I.MapPin} label="Région" value={formData.region} placeholder="Nouvelle-Aquitaine" onChange={v=>upd("region",v)} ocrFilled={ocrFields.region}/>
                    <NbSelect icon={I.Globe} label="Pays" value={formData.pays} onChange={v=>upd("pays",v)} ocrFilled={ocrFields.pays}
                      options={["France","Belgique","Suisse","Luxembourg","Monaco","Canada","Maroc","Tunisie","Sénégal","Côte d'Ivoire","Autre"]}/>
                  </div>

                  {/* ═══ 3. DESCRIPTIF TECHNIQUE ═══ */}
                  <SecLabel label="3 · DESCRIPTIF TECHNIQUE"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Ruler} label="Superficie" value={formData.surface} unit="m²" placeholder="65" onChange={v=>upd("surface",v)} ocrFilled={ocrFields.surface}/>
                    <NbField icon={I.Grid} label="Nombre de pièces" value={formData.rooms} placeholder="T1, T2, T3…" onChange={v=>upd("rooms",v)} ocrFilled={ocrFields.rooms}/>
                    <NbField icon={I.Grid} label="Nombre de chambres" value={formData.chambres} placeholder="2" onChange={v=>upd("chambres",v)} ocrFilled={ocrFields.chambres}/>
                    <NbField icon={I.Grid} label="Salles de bain" value={formData.sdb} placeholder="1" onChange={v=>upd("sdb",v)} ocrFilled={ocrFields.sdb}/>
                    <NbField icon={I.Calendar} label="Année de construction" value={formData.year} placeholder="1975" onChange={v=>upd("year",v)} ocrFilled={ocrFields.year}/>
                  </div>
                  <NbTextarea icon={I.FileText} label="Description détaillée" value={formData.description} full placeholder="Texte descriptif pour les annonces ou le contrat de location : confort, particularités, équipements…" rows={4} onChange={v=>upd("description",v)} ocrFilled={ocrFields.description}/>

                  {/* ═══ 4. PARAMÈTRES DE LOCATION ═══ */}
                  <SecLabel label="4 · PARAMÈTRES DE LOCATION"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbSelect icon={I.Activity} label="État locatif" value={formData.etatLocatif} onChange={v=>upd("etatLocatif",v)} ocrFilled={ocrFields.etatLocatif}
                      options={["Automatique","Disponible","Loué","Préavis / Départ","En recherche de locataire","Indisponible","Travaux"]}/>
                    <NbSelect icon={I.Home2} label="Type de location" value={formData.typeLocation} onChange={v=>upd("typeLocation",v)} ocrFilled={ocrFields.typeLocation}
                      options={["Meublée","Vide","Saisonnière"]}/>
                  </div>
                  {/* Durées */}
                  <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                      <I.Calendar/>
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DURÉES PROPOSÉES</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <NbSelect label="Durée minimale" value={formData.dureeMin} onChange={v=>upd("dureeMin",v)}
                        options={["1 mois","2 mois","3 mois","6 mois","9 mois","12 mois","18 mois","24 mois","36 mois"]}/>
                      <NbSelect label="Durée maximale" value={formData.dureeMax} onChange={v=>upd("dureeMax",v)}
                        options={["1 an","2 ans","3 ans","4 ans","5 ans","6 ans","7 ans","8 ans","9 ans"]}/>
                    </div>
                  </div>
                  {/* Conditions financières cibles */}
                  <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                      <I.Euro/>
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>CONDITIONS FINANCIÈRES CIBLES</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      <NbField icon={I.Euro} label="Loyer hors charges" value={formData.loyer} unit="€" accent placeholder="850" onChange={v=>upd("loyer",v)} ocrFilled={ocrFields.loyer}/>
                      <NbField icon={I.Euro} label="Charges locatives" value={formData.chargesLocatives} unit="€" placeholder="80" onChange={v=>upd("chargesLocatives",v)} ocrFilled={ocrFields.chargesLocatives}/>
                      <NbField icon={I.Euro} label="Dépôt de garantie" value={formData.depotGarantie} unit="€" placeholder="850" onChange={v=>upd("depotGarantie",v)}/>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbSelect icon={I.Calendar} label="Fréquence de paiement" value={formData.frequencePaiement} onChange={v=>upd("frequencePaiement",v)} ocrFilled={ocrFields.frequencePaiement}
                      options={["Mensuel","Bimestriel","Trimestriel","Quadrimestriel","Semestriel","Annuel","Forfaitaire"]}/>
                    <NbSelect icon={I.Users} label="Mode locatif / fiscal" value={formData.mode} onChange={v=>upd("mode",v)} ocrFilled={ocrFields.mode}
                      options={["LMNP (meublé)","Location nue","SCI à l'IR","SCI à l'IS","Colocation","Sous-location","Autre"]}/>
                  </div>

                  {/* ═══ 5. PERFORMANCE ÉNERGÉTIQUE ═══ */}
                  <SecLabel label="5 · PERFORMANCE ÉNERGÉTIQUE (DPE)"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbSelect icon={I.Leaf} label="Classe énergie (DPE)" value={formData.dpe} onChange={v=>upd("dpe",v)} ocrFilled={ocrFields.dpe}
                      options={["A","B","C","D","E","F","G"]}/>
                    <NbSelect icon={I.Leaf} label="Gaz à effet de serre (GES)" value={formData.ges} onChange={v=>upd("ges",v)} ocrFilled={ocrFields.ges}
                      options={["A","B","C","D","E","F","G"]}/>
                  </div>
                  <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}>
                      <I.Euro/>
                      <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DÉPENSES ANNUELLES D'ÉNERGIE (FOURCHETTE)</span>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      <NbField icon={I.Euro} label="Estimation basse" value={formData.depensesEnergieMin} unit="€/an" mono placeholder="800" onChange={v=>upd("depensesEnergieMin",v)}/>
                      <NbField icon={I.Euro} label="Estimation haute" value={formData.depensesEnergieMax} unit="€/an" mono placeholder="1 400" onChange={v=>upd("depensesEnergieMax",v)} ocrFilled={ocrFields.depensesEnergieMax}/>
                      <NbSelect label="Année de référence" value={formData.anneeRefPrix} onChange={v=>upd("anneeRefPrix",v)} ocrFilled={ocrFields.anneeRefPrix}
                        options={["2021","2022","2023","2024","2025","2026"]}/>
                    </div>
                  </div>

                  {/* ═══ PARTIES ET INTERVENANTS ═══ */}
                  <SecLabel label="PARTIES ET INTERVENANTS"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.User}     label="Vendeur"          value={formData.vendeur}  placeholder="Nom ou société" onChange={v=>upd("vendeur",v)} ocrFilled={ocrFields.vendeur}/>
                    <NbField icon={I.Briefcase} label="Notaire en charge" value={formData.notaire} placeholder="Maître…" onChange={v=>upd("notaire",v)} ocrFilled={ocrFields.notaire}/>
                  </div>
                </div>
              )}

              {/* ── TAB: FINANCES & FISCALITÉ ── */}
              {formTab==="Finances & Fiscalité" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <SecLabel label="Coût d'acquisition"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Calendar} label="Date d'acquisition"      value={formData.dateAcq}      type="date" placeholder="" onChange={v=>upd("dateAcq",v)} ocrFilled={ocrFields.dateAcq}/>
                    <NbField icon={I.Euro}     label="Prix net vendeur"         value={formData.prixBien} unit="€" accent mono onChange={v=>upd("prixBien",v)} ocrFilled={ocrFields.prixBien}/>
                    <NbField icon={I.FileText} label="Frais de notaire"         value={formData.fraisNotaire} unit="€" mono onChange={v=>upd("fraisNotaire",v)} ocrFilled={ocrFields.fraisNotaire}/>
                    <NbField icon={I.Tag}      label="Frais d'agence"           value={formData.fraisAgence}  unit="€" mono onChange={v=>upd("fraisAgence",v)} ocrFilled={ocrFields.fraisAgence}/>
                    <NbField icon={I.Ruler}    label="Ameublement / travaux"    value={formData.ameublement}  unit="€" mono onChange={v=>upd("ameublement",v)} ocrFilled={ocrFields.ameublement}/>
                    {/* Total */}
                    <div style={{ gridColumn:"span 2", background:"rgba(0,123,255,0.05)", border:"1px solid rgba(0,123,255,0.18)", borderRadius:10, padding:"10px 13px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, letterSpacing:"0.1em" }}>COÛT TOTAL CALCULÉ</span>
                      <span style={{ fontSize:15, fontWeight:800, color:C.w, fontFamily:C.mono }}>
                        {(()=>{ const parse=s=>parseInt(String(s||"0").replace(/[^\d]/g,""),10)||0; return (parse(formData.prixBien)+parse(formData.fraisNotaire)+parse(formData.fraisAgence)+parse(formData.ameublement)).toLocaleString("fr-FR"); })()} €
                      </span>
                    </div>
                  </div>

                  <SecLabel label="Charges & Fiscalité"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <NbField icon={I.Euro}     label="Taxe foncière"         value={formData.taxeFonciere}  unit="€/an" mono onChange={v=>upd("taxeFonciere",v)} ocrFilled={ocrFields.taxeFonciere}/>
                    <NbField icon={I.Building} label="Charges de copropriété" value={formData.chargesCopro} unit="€/an" mono onChange={v=>upd("chargesCopro",v)} ocrFilled={ocrFields.chargesCopro}/>
                  </div>

                  <SecLabel label="Régime fiscal"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                    {REGIMES.filter(r=>TOP5.includes(r.id)).map(r=>{
                      const active = formData.regime && r.id===formData.regime; const isOcr = ocrFields.regime && active;
                      return(
                        <div key={r.id} onClick={()=>upd("regime",r.id)} style={{ background:active?"rgba(0,123,255,0.10)":"#0a0a0a", border:`1.5px solid ${active?C.blue:C.border}`, borderRadius:9, padding:"10px 12px", cursor:"pointer", transition:"all 0.15s" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:active?C.blue:C.w }}>{r.label}</span>
                            {isOcr&&<span style={{ fontSize:7.5, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", padding:"1px 5px", borderRadius:3 }}>IA</span>}
                          </div>
                          <span style={{ fontSize:9.5, color:active?C.g1:C.g3 }}>{r.sub}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validate CTA */}
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
                <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"10px 20px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                  Annuler
                </button>
                <button
                  disabled={confirmed}
                  onClick={()=>{
                    if(confirmed) return;
                    // Build structured asset from OCR data
                    const parse = s => parseInt(String(s||"0").replace(/[^\d]/g,""),10)||0;
                    const p = parse(formData.prixBien);
                    const fn= parse(formData.fraisNotaire);
                    const fa= parse(formData.fraisAgence);
                    const am= parse(formData.ameublement);
                    const tc= parse(formData.taxeFonciere);
                    const cc= parse(formData.chargesCopro);
                    const loyer= parse(formData.loyer);
                    const cl = parse(formData.chargesLocatives);
                    const newAsset = {
                      name:      formData.name,
                      type:      formData.type,
                      identifiant: formData.identifiant,
                      couleur:   formData.couleur,
                      addr:      formData.addr,
                      addr2:     formData.addr2,
                      batiment:  formData.batiment,
                      porteLot:  formData.porteLot,
                      ville:     formData.ville,
                      codePostal: formData.codePostal,
                      region:    formData.region,
                      pays:      formData.pays,
                      surface:   formData.surface,
                      escalier:  formData.escalier,
                      etage:     formData.etage,
                      rooms:     formData.rooms,
                      chambres:  formData.chambres,
                      sdb:       formData.sdb,
                      year:      parseInt(formData.year)||new Date().getFullYear(),
                      description: formData.description,
                      dpe:       formData.dpe,
                      ges:       formData.ges,
                      depensesEnergie: formData.depensesEnergie,
                      anneeRefPrix: formData.anneeRefPrix,
                      etatLocatif: formData.etatLocatif,
                      typeLocation: formData.typeLocation,
                      loyer:     formData.loyer,
                      chargesLocatives: cl,
                      depotGarantie: parse(formData.depotGarantie),
                      dureeMin:  formData.dureeMin,
                      dureeMax:  formData.dureeMax,
                      depensesEnergieMin: formData.depensesEnergieMin,
                      depensesEnergieMax: formData.depensesEnergieMax,
                      frequencePaiement: formData.frequencePaiement,
                      mode:      formData.mode,
                      rent:      formData.loyer,
                      capital:   "+0 €",
                      ltv:       0,
                      statut:    formData.etatLocatif||"Disponible",
                      prixBien:     p,
                      fraisAgence:  fa,
                      ameublement:  am,
                      fraisNotaire: fn,
                      vl:           Math.round((p+fn+fa+am)*1.05),
                      vlVar:        "+2.5%",
                      loyerAnnuel:  loyer*12,
                      chargesCopro: cc,
                      taxeFonciere: tc,
                    };
                    setConfirmed(true);
                    setTimeout(()=>{ onCreateAsset(newAsset); }, 900);
                  }}
                  style={{ background: confirmed ? "linear-gradient(135deg,#059669,#047857)" : `linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"10px 28px", color:"#fff", fontSize:12, fontWeight:700, cursor: confirmed?"default":"pointer", display:"flex", alignItems:"center", gap:8, boxShadow: confirmed?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`, transition:"all 0.35s", letterSpacing:"0.04em" }}
                  onMouseEnter={e=>{if(!confirmed){e.currentTarget.style.boxShadow="0 6px 32px rgba(0,123,255,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow=confirmed?"0 4px 20px rgba(5,150,105,0.4)":`0 4px 24px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
                  {confirmed
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Bien ajouté au patrimoine !</>
                    : <><I.Save/> Créer la fiche bien</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PropertyDetail({ asset, onClose, onDelete, onUpdate, kycData }) {
  const PROP_TABS = ["Caractéristiques","Caract. complémentaires","Finances & Performance","Fiscalité","Travaux"];
  const [tab,setTab]       = useState("Caractéristiques");
  const [aiLoad,setAiLoad] = useState(false);
  const [aiDone,setAiDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Editable Caractéristiques state ──
  const [editData, setEditData] = useState({
    name:asset.name||"",type:asset.type||"",identifiant:asset.identifiant||"",couleur:asset.couleur||"#3B82F6",
    addr:asset.addr||"",addr2:asset.addr2||"",batiment:asset.batiment||"",escalier:asset.escalier||"",etage:asset.etage||"",
    porteLot:asset.porteLot||"",ville:asset.ville||"",codePostal:asset.codePostal||"",region:asset.region||"",pays:asset.pays||"France",
    surface:asset.surface||"",rooms:asset.rooms||"",chambres:asset.chambres||"",sdb:asset.sdb||"",year:String(asset.year||""),description:asset.description||"",
    dpe:asset.dpe||"",ges:asset.ges||"",depensesEnergieMin:asset.depensesEnergieMin||"",depensesEnergieMax:asset.depensesEnergieMax||"",anneeRefPrix:asset.anneeRefPrix||"",
    etatLocatif:asset.etatLocatif||asset.statut||"",typeLocation:asset.typeLocation||"",dureeMin:asset.dureeMin||"",dureeMax:asset.dureeMax||"",
    mode:asset.mode||"",loyer:asset.perfSim?.loyerMensuel||asset.loyer||"",chargesLocatives:String(asset.perfSim?.chargesCopro||asset.chargesLocatives||""),depotGarantie:String(asset.depotGarantie||""),frequencePaiement:asset.frequencePaiement||"",
    vendeur:asset.vendeur||"",notaire:asset.notaire||"",taxeFonciere:String(asset.perfSim?.taxeFonciere||asset.taxeFonciere||""),
  });
  const upd = (k,v) => setEditData(f=>({...f,[k]:v}));
  const saveRef = useRef(null);
  useEffect(() => {
    if (!onUpdate) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      const p = s => parseInt(String(s||"0").replace(/[^\d]/g,""),10)||0;
      const loyer = editData.loyer || asset.loyer || "";
      const loyerNum = p(loyer);
      // Sync perfSim if it exists
      const syncPerf = asset.perfSim ? {
        ...asset.perfSim,
        prixBien: p(editData.prixBien || asset.prixBien) || asset.perfSim.prixBien,
        loyerMensuel: loyerNum || asset.perfSim.loyerMensuel,
        taxeFonciere: p(editData.taxeFonciere || asset.taxeFonciere) || asset.perfSim.taxeFonciere,
        chargesCopro: p(editData.chargesLocatives) || asset.perfSim.chargesCopro,
      } : undefined;
      onUpdate({
        ...asset, ...editData,
        year: parseInt(editData.year)||asset.year,
        chargesLocatives: p(editData.chargesLocatives),
        depotGarantie: p(editData.depotGarantie),
        statut: editData.etatLocatif || asset.statut,
        loyer: loyer,
        loyerAnnuel: loyerNum * 12 || asset.loyerAnnuel,
        taxeFonciere: p(editData.taxeFonciere || asset.taxeFonciere),
        ...(syncPerf ? { perfSim: syncPerf } : {}),
      });
    }, 800);
    return () => { if(saveRef.current) clearTimeout(saveRef.current); };
  }, [editData]);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      if (onDelete) onDelete(asset.id);
    }, 600);
  };
  const dpeScore = { A:"35",B:"70",C:"148",D:"210",E:"280" };
  const gesScore = { A:"4", B:"12",C:"28", D:"44"          };

  const handleAI = ()=>{
    if(aiDone||aiLoad) return;
    setAiLoad(true);
    setTimeout(()=>{setAiLoad(false);setAiDone(true)},2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}/>
      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:51, width:"100%", maxWidth:640, background:"#121212", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", boxShadow:"-32px 0 80px rgba(0,0,0,0.7)", animation:"slideIn 0.32s cubic-bezier(0.4,0,0.2,1)" }}>

        {/* TOP HEADER */}
        <div style={{ padding:"20px 24px 0", borderBottom:`1px solid #1a1a1a`, flexShrink:0 }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.g3, fontFamily:C.mono }}>
              <button onClick={onClose} style={{ background:"none", border:"none", color:C.g2, cursor:"pointer", fontSize:11, fontFamily:C.mono, padding:0 }}>Patrimoine</button>
              <I.Chevron/>
              <span style={{ color:C.g2 }}>{asset.name}</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", color:C.g1, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1}}>
                <I.Edit/> Éditer
              </button>
              <button onClick={()=>setShowDeleteConfirm(true)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";e.currentTarget.style.color=C.red;e.currentTarget.style.background="rgba(239,68,68,0.06)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g2;e.currentTarget.style.background="#1a1a1a";}}>
                <I.Trash/> Supprimer
              </button>
              <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44"}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2}}>
                <I.X/>
              </button>
            </div>
          </div>

          {/* Title + badge */}
          <div style={{ marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.04em", color:C.w }}>{asset.name}</h1>
              <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2 }}>{asset.surface}</span>
              <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:isLoue(asset.statut||asset.etatLocatif)?"#10b981":"#EF4444", background:isLoue(asset.statut||asset.etatLocatif)?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", border:"1px solid "+(isLoue(asset.statut||asset.etatLocatif)?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"), padding:"3px 9px", borderRadius:99, display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:isLoue(asset.statut||asset.etatLocatif)?"#10b981":"#EF4444", display:"inline-block", animation:"pulse 2s infinite" }}/>{isLoue(asset.statut||asset.etatLocatif)?"LOUÉ":(asset.statut||asset.etatLocatif||"DISPONIBLE").toUpperCase()}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:5, color:C.g2, fontSize:12 }}>
              <I.MapPin/><span>{asset.addr}</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex" }}>
            {PROP_TABS.map(t=>{
              const active = tab===t;
              return (
                <button key={t} onClick={()=>setTab(t)} style={{ background:"transparent", border:"none", padding:"10px 18px", fontSize:12, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent", transition:"all 0.15s" }}
                  onMouseEnter={e=>{if(!active)e.currentTarget.style.color=C.g1}}
                  onMouseLeave={e=>{if(!active)e.currentTarget.style.color=C.g2}}>{t}</button>
              );
            })}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 24px 16px" }}>
          {tab==="Caract. complémentaires" ? (
            <CaractComplementaires asset={asset}/>
          ) : tab==="Caractéristiques" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:"rgba(16,185,129,0.04)", border:`1px solid ${C.greenBord}`, borderRadius:10 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.green, animation:"pulse 2s infinite" }}/>
                <span style={{ fontSize:10, color:C.green, fontFamily:C.mono }}>ÉDITION EN DIRECT</span>
                <span style={{ fontSize:10, color:C.g3, marginLeft:"auto" }}>Sauvegarde automatique</span>
              </div>
              <SecLabel label="1 · IDENTITÉ & TYPE DE BIEN"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbField icon={I.Home} label="Nom / Identifiant" value={editData.name} full placeholder="Ex : Le Loft d'Eysines" onChange={v=>upd("name",v)}/>
                <NbSelect icon={I.Home2} label="Type de bien" value={editData.type} onChange={v=>upd("type",v)} options={["Appartement","Maison","Studio","Loft","Chambre","Château","Mobil-Home","Caravane","Atelier","Boutique","Box de stockage","Bureaux","Bureau partagé","Cave","Chalet","Commerce","Entrepôt","Garage","Grenier","Hôtel Particulier","Local professionnel","Local commercial","Parking","Terrain","Autre"]}/>
                <NbField icon={I.Tag} label="Référence interne" value={editData.identifiant} placeholder="N° unique" onChange={v=>upd("identifiant",v)}/>
                <NbColor label="Couleur de référence" value={editData.couleur} onChange={v=>upd("couleur",v)}/>
              </div>
              <SecLabel label="2 · LOCALISATION"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbFieldAddress icon={I.MapPin} label="Adresse (n° et rue)" value={editData.addr} full placeholder="12 Rue de la République" onChange={v=>upd("addr",v)} onSelect={s=>{upd("addr",s.addr);upd("ville",s.ville);upd("codePostal",s.codePostal);if(s.region)upd("region",s.region);}}/>
                <NbField icon={I.MapPin} label="Complément" value={editData.addr2} full placeholder="Résidence, Adresse 2" onChange={v=>upd("addr2",v)}/>
                <NbField icon={I.Building} label="Bâtiment" value={editData.batiment} placeholder="Bât A" onChange={v=>upd("batiment",v)}/>
                <NbField icon={I.Building} label="Escalier" value={editData.escalier} placeholder="Esc 2" onChange={v=>upd("escalier",v)}/>
                <NbField icon={I.Building} label="Étage" value={editData.etage} placeholder="3e" onChange={v=>upd("etage",v)}/>
                <NbField icon={I.Grid} label="N° porte / lot" value={editData.porteLot} placeholder="Lot 45" onChange={v=>upd("porteLot",v)}/>
                <NbField icon={I.MapPin} label="Ville" value={editData.ville} placeholder="Bordeaux" onChange={v=>upd("ville",v)}/>
                <NbField icon={I.MapPin} label="Code postal" value={editData.codePostal} placeholder="33000" onChange={v=>upd("codePostal",v)}/>
                <NbField icon={I.MapPin} label="Région" value={editData.region} placeholder="Nouvelle-Aquitaine" onChange={v=>upd("region",v)}/>
                <NbSelect icon={I.Globe} label="Pays" value={editData.pays} onChange={v=>upd("pays",v)} options={["France","Belgique","Suisse","Luxembourg","Monaco","Canada","Maroc","Tunisie","Sénégal","Côte d'Ivoire","Autre"]}/>
              </div>
              <SecLabel label="3 · DESCRIPTIF TECHNIQUE"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbField icon={I.Ruler} label="Superficie" value={editData.surface} unit="m²" placeholder="65" onChange={v=>upd("surface",v)}/>
                <NbField icon={I.Grid} label="Nombre de pièces" value={editData.rooms} placeholder="T3" onChange={v=>upd("rooms",v)}/>
                <NbField icon={I.Grid} label="Chambres" value={editData.chambres} placeholder="2" onChange={v=>upd("chambres",v)}/>
                <NbField icon={I.Grid} label="Salles de bain" value={editData.sdb} placeholder="1" onChange={v=>upd("sdb",v)}/>
                <NbField icon={I.Calendar} label="Construction" value={editData.year} placeholder="1975" onChange={v=>upd("year",v)}/>
              </div>
              <NbTextarea icon={I.FileText} label="Description détaillée" value={editData.description} full placeholder="Descriptif pour annonces ou contrat…" rows={4} onChange={v=>upd("description",v)}/>
              <SecLabel label="4 · PARAMÈTRES DE LOCATION"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbSelect icon={I.Activity} label="État locatif" value={editData.etatLocatif} onChange={v=>upd("etatLocatif",v)} options={["Automatique","Disponible","Loué","Préavis / Départ","En recherche","Indisponible","Travaux"]}/>
                <NbSelect icon={I.Home2} label="Type de location" value={editData.typeLocation} onChange={v=>upd("typeLocation",v)} options={["Meublée","Vide","Saisonnière"]}/>
              </div>
              <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><I.Calendar/><span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DURÉES PROPOSÉES</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <NbSelect label="Durée minimale" value={editData.dureeMin} onChange={v=>upd("dureeMin",v)} options={["1 mois","2 mois","3 mois","6 mois","9 mois","12 mois","18 mois","24 mois","36 mois"]}/>
                  <NbSelect label="Durée maximale" value={editData.dureeMax} onChange={v=>upd("dureeMax",v)} options={["1 an","2 ans","3 ans","4 ans","5 ans","6 ans","7 ans","8 ans","9 ans"]}/>
                </div>
              </div>
              <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><I.Euro/><span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>CONDITIONS FINANCIÈRES CIBLES</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  <NbField icon={I.Euro} label="Loyer HC" value={editData.loyer} unit="€" accent placeholder="850" onChange={v=>upd("loyer",v)}/>
                  <NbField icon={I.Euro} label="Charges" value={editData.chargesLocatives} unit="€" placeholder="80" onChange={v=>upd("chargesLocatives",v)}/>
                  <NbField icon={I.Euro} label="Dépôt garantie" value={editData.depotGarantie} unit="€" placeholder="850" onChange={v=>upd("depotGarantie",v)}/>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbSelect icon={I.Calendar} label="Fréquence paiement" value={editData.frequencePaiement} onChange={v=>upd("frequencePaiement",v)} options={["Mensuel","Bimestriel","Trimestriel","Quadrimestriel","Semestriel","Annuel","Forfaitaire"]}/>
                <NbSelect icon={I.Users} label="Mode locatif" value={editData.mode} onChange={v=>upd("mode",v)} options={["LMNP (meublé)","Location nue","SCI à l'IR","SCI à l'IS","Colocation","Sous-location","Autre"]}/>
              </div>
              <SecLabel label="5 · PERFORMANCE ÉNERGÉTIQUE (DPE)"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbSelect icon={I.Leaf} label="Classe DPE" value={editData.dpe} onChange={v=>upd("dpe",v)} options={["A","B","C","D","E","F","G"]}/>
                <NbSelect icon={I.Leaf} label="Classe GES" value={editData.ges} onChange={v=>upd("ges",v)} options={["A","B","C","D","E","F","G"]}/>
              </div>
              <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><I.Euro/><span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono }}>DÉPENSES ANNUELLES D'ÉNERGIE</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  <NbField icon={I.Euro} label="Min" value={editData.depensesEnergieMin} unit="€/an" mono placeholder="800" onChange={v=>upd("depensesEnergieMin",v)}/>
                  <NbField icon={I.Euro} label="Max" value={editData.depensesEnergieMax} unit="€/an" mono placeholder="1 400" onChange={v=>upd("depensesEnergieMax",v)}/>
                  <NbSelect label="Année réf." value={editData.anneeRefPrix} onChange={v=>upd("anneeRefPrix",v)} options={["2021","2022","2023","2024","2025","2026"]}/>
                </div>
              </div>
              <SecLabel label="PARTIES ET INTERVENANTS"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <NbField icon={I.User} label="Vendeur" value={editData.vendeur} placeholder="Nom ou société" onChange={v=>upd("vendeur",v)}/>
                <NbField icon={I.Briefcase} label="Notaire" value={editData.notaire} placeholder="Maître…" onChange={v=>upd("notaire",v)}/>
              </div>
            </div>
          ) : tab==="Finances & Performance" ? (
            <PerformanceTab asset={asset} onUpdate={onUpdate} kycData={kycData}/>
          ) : tab==="Fiscalité" ? (
            <FinancesFiscaliteTab asset={asset} kycData={kycData}/>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:280, gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:C.blueSub, border:"1px solid rgba(0,123,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.Sparkles/></div>
              <p style={{ fontSize:14, color:C.g2, textAlign:"center" }}>Onglet <strong style={{ color:C.g1 }}>{tab}</strong> — bientôt disponible</p>
              <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>EN COURS DE DÉVELOPPEMENT</span>
            </div>
          )}
        </div>

        {/* STICKY CTA */}
        <div style={{ padding:"16px 24px 24px", borderTop:`1px solid #1a1a1a`, background:"linear-gradient(to top,#121212 80%,transparent)", flexShrink:0 }}>
          <button onClick={handleAI} disabled={aiLoad}
            style={{ width:"100%", background:aiDone?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:12, padding:"15px 24px", color:"#fff", fontSize:13, fontWeight:700, cursor:aiLoad?"wait":"pointer", letterSpacing:"0.04em", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:aiDone?"0 4px 24px rgba(5,150,105,0.4)":`0 4px 28px ${C.blueGlow}`, transition:"all 0.2s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e=>{if(!aiLoad&&!aiDone){e.currentTarget.style.boxShadow="0 6px 36px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)"}}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=aiDone?"0 4px 24px rgba(5,150,105,0.4)":`0 4px 28px ${C.blueGlow}`;e.currentTarget.style.transform="none"}}>
            {aiLoad&&<div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)", backgroundSize:"200% 100%", animation:"shimmer 1.2s infinite" }}/>}
            {aiLoad?<><Spinner/>Génération en cours...</>:aiDone?<><span>✓</span>Annonce générée avec succès !</>:<><span>✨</span>Générer une annonce locative avec l'IA</>}
          </button>
          <p style={{ textAlign:"center", fontSize:10, color:C.g3, fontFamily:C.mono, marginTop:8 }}>Basé sur les données du bien · Prêt en ~10 secondes</p>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteConfirm && (
        <div onClick={()=>!deleting&&setShowDeleteConfirm(false)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"fadeUp 0.2s ease" }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"#111113", border:`1px solid ${C.border}`, borderRadius:18,
            width:"100%", maxWidth:420, padding:"28px 28px 24px",
            boxShadow:"0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03)",
            animation:"fadeUp 0.25s cubic-bezier(0.2,0.8,0.2,1)",
            opacity: deleting ? 0.6 : 1, transform: deleting ? "scale(0.97)" : "scale(1)",
            transition:"opacity 0.4s, transform 0.4s",
          }}>
            {/* Warning icon */}
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:C.redSub, border:"1.5px solid rgba(239,68,68,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red }}>
                <I.AlertTriangle/>
              </div>
            </div>

            {/* Title */}
            <h3 style={{ textAlign:"center", fontSize:17, fontWeight:800, letterSpacing:"-0.02em", color:C.w, marginBottom:8 }}>
              Supprimer ce bien ?
            </h3>
            <p style={{ textAlign:"center", fontSize:13, color:C.g2, lineHeight:1.65, marginBottom:6 }}>
              Vous allez supprimer <strong style={{ color:C.w }}>{asset.name}</strong> de votre patrimoine.
            </p>
            <p style={{ textAlign:"center", fontSize:11, color:C.g3, lineHeight:1.6, marginBottom:22 }}>
              Cette action supprimera toutes les données associées (caractéristiques, finances, fiscalité). Cette action est irréversible.
            </p>

            {/* Asset summary card */}
            <div style={{ background:C.card2, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:C.redSub, border:"1px solid rgba(239,68,68,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0 }}>
                <I.Home/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:2 }}>{asset.name}</p>
                <p style={{ fontSize:11, color:C.g2 }}>{asset.type} · {asset.surface} · {asset.addr}</p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowDeleteConfirm(false)} disabled={deleting}
                style={{ flex:1, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 0", color:C.g1, fontSize:12, fontWeight:600, cursor:deleting?"not-allowed":"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!deleting){e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1;}}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{
                  flex:1, background:deleting?"linear-gradient(135deg,#991B1B,#7F1D1D)":"linear-gradient(135deg,#EF4444,#DC2626)",
                  border:"none", borderRadius:10, padding:"11px 0",
                  color:"#fff", fontSize:12, fontWeight:700, cursor:deleting?"not-allowed":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 20px rgba(239,68,68,0.35)", transition:"all 0.2s",
                  letterSpacing:"0.02em",
                }}
                onMouseEnter={e=>{if(!deleting){e.currentTarget.style.boxShadow="0 6px 28px rgba(239,68,68,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(239,68,68,0.35)";e.currentTarget.style.transform="none";}}>
                {deleting
                  ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Suppression...</>
                  : <><I.Trash/> Confirmer la suppression</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectionTitle({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
      <span style={{ fontSize:9, letterSpacing:"0.14em", color:C.g3, fontFamily:C.mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function Spinner() {
  return <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>;
}

/* ════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════ */
function Dashboard({ onSelectAsset, onNav, onNewTenant, onSelectTenant, assets, tenants=[], user }) {
  const [hovAlert, setHovAlert]   = useState(null);
  const [hovAsset, setHovAsset]   = useState(null);
  const [hovTenant, setHovTenant] = useState(null);
  const [modal,    setModal]      = useState(false);

  // Computed KPIs from assets
  const totalVL = assets.reduce((s,a) => s + (a.vl || a.prixBien || 0), 0);
  const totalLoyerAn = assets.reduce((s,a) => s + (a.loyerAnnuel || 0), 0);
  const totalCharges = assets.reduce((s,a) => s + (a.chargesCopro||0) + (a.taxeFonciere||0), 0);
  const cashFlowNet = Math.round((totalLoyerAn - totalCharges) / 12);
  const avgLTV = assets.length ? Math.round(assets.reduce((s,a) => s + (a.ltv||0), 0) / assets.length) : 0;
  const fmtK = (n) => n >= 1000 ? new Intl.NumberFormat("fr-FR").format(n) + " €" : n + " €";
  const nbImpayes = tenants.filter(t=>t.daysLate>=10).length;

  return (
    <main style={{ flex:1, overflowY:"auto", padding:"28px 32px 40px" }}>

      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
        <div>
          <p style={{ fontSize:11, color:C.g2, fontFamily:C.mono, letterSpacing:"0.1em", marginBottom:6 }}>{new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()}</p>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>Bonjour{user?.prenom ? `, ${user.prenom}` : ""} 👋</h1>
          <p style={{ fontSize:13, color:C.g2, marginTop:4 }}>{assets.length>0?"Votre patrimoine en un coup d'œil.":"Ajoutez votre premier bien pour commencer."}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 14px", color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
            <I.Search/><span style={{ fontFamily:C.mono }}>Rechercher...</span>
          </button>
          <button style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <I.Bell/>
            <span style={{ position:"absolute", top:8, right:8, width:6, height:6, borderRadius:"50%", background:C.red, animation:"pulse 2s infinite" }}/>
          </button>
          <button onClick={()=>setModal(true)}
            style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, letterSpacing:"0.06em", boxShadow:`0 4px 20px ${C.blueGlow}`, transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${C.blueGlow}`;e.currentTarget.style.transform="none"}}>
            <I.Plus/> + NOUVEAU
          </button>
        </div>
      </div>

      {/* HERO METRICS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"PATRIMOINE ESTIMÉ", value:fmtK(totalVL), sub:assets.length+" bien(s) en portefeuille", subC:C.g2, badge:{ color:assets.length?C.green:C.g3, text:assets.length?"● Actif":"—" }, extra:assets.length?<Sparkline color={C.green}/>:null },
          { label:"CASH-FLOW NET / MOIS", value:cashFlowNet>0?"+\u00a0"+fmtK(cashFlowNet):cashFlowNet===0?"0 €":fmtK(cashFlowNet), sub:totalLoyerAn>0?"Loyers "+fmtK(totalLoyerAn)+"/an":"Aucun revenu locatif", subC:cashFlowNet>0?C.green:C.g2, badge:{ color:cashFlowNet>0?C.blue:C.g3, text:cashFlowNet>0?Math.round(cashFlowNet/500*100)+"% objectif":"—" }, extra:cashFlowNet>0?<Gauge value={Math.min(100,Math.round(cashFlowNet/500*100))} color={C.blue}/>:null },
          { label:"RATIO LTV MOYEN", value:avgLTV?avgLTV+" %":"— %", sub:avgLTV>0?(avgLTV<70?"Risque faible · seuil < 70%":"Risque élevé · seuil > 70%"):"Aucun bien", subC:C.g2, badge:{ color:avgLTV>0?(avgLTV<70?C.green:C.red):C.g3, text:avgLTV>0?(avgLTV<70?"✓ Sain":"⚠ Élevé"):"—" }, extra:avgLTV>0?<Gauge value={avgLTV} color={avgLTV<70?C.green:C.red}/>:null },
        ].map((card,i)=>(
          <div key={i}
            style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"22px 22px 18px", transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#3B3B44"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em" }}>{card.label}</span>
              <span style={{ fontSize:9, fontFamily:C.mono, color:card.badge.color, background:`${card.badge.color}18`, padding:"2px 7px", borderRadius:4 }}>{card.badge.text}</span>
            </div>
            <div style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.04em", marginBottom:4 }}>{card.value}</div>
            <div style={{ fontSize:11, color:card.subC, marginBottom:8 }}>{card.sub}</div>
            {card.extra}
          </div>
        ))}
      </div>

      {/* 2-COL */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16 }}>

        {/* ALERTS */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:4 }}>CENTRE D'INTELLIGENCE</p>
              <h2 style={{ fontSize:14, fontWeight:700 }}>Priorités du jour</h2>
            </div>
            <span style={{ fontSize:9, fontFamily:C.mono, background:nbImpayes?C.redSub:C.greenSub, color:nbImpayes?C.red:C.green, padding:"3px 8px", borderRadius:4 }}>{nbImpayes?nbImpayes+" IMPAYÉ"+(nbImpayes>1?"S":""):"✓ RAS"}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {ALERTS_DEMO.length===0?<div style={{padding:"20px 0",textAlign:"center"}}><p style={{fontSize:12,color:C.g2}}>Aucune alerte</p><p style={{fontSize:10,color:C.g3}}>Les alertes apparaîtront quand vous aurez des biens et locataires.</p></div>:ALERTS_DEMO.map((a,i)=>(
              <div key={i} onMouseEnter={()=>setHovAlert(i)} onMouseLeave={()=>setHovAlert(null)}
                style={{ background:hovAlert===i?`${a.color}08`:"transparent", border:`1px solid ${hovAlert===i?a.border:"transparent"}`, borderRadius:12, padding:"12px 14px", transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  {a.dot&&<span style={{ width:6, height:6, borderRadius:"50%", background:a.color, animation:"pulse 1.5s infinite" }}/>}
                  <span style={{ fontSize:8.5, fontFamily:C.mono, color:a.color, letterSpacing:"0.1em" }}>
                    {a.type}{a.aiTag&&<span style={{ fontSize:7.5, background:C.blueSub, padding:"1px 5px", borderRadius:3, marginLeft:4 }}>IA</span>}
                  </span>
                </div>
                <p style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{a.title}</p>
                <p style={{ fontSize:10.5, color:C.g2, marginBottom:10 }}>{a.sub}</p>
                <button style={{ background:`${a.color}18`, border:`1px solid ${a.color}44`, borderRadius:7, padding:"5px 12px", color:a.color, fontSize:10.5, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.target.style.background=`${a.color}30`;e.target.style.borderColor=a.color}}
                  onMouseLeave={e=>{e.target.style.background=`${a.color}18`;e.target.style.borderColor=`${a.color}44`}}>
                  {a.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ASSETS TABLE */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:4 }}>LISTE DES ACTIFS</p>
              <h2 style={{ fontSize:14, fontWeight:700 }}>Portefeuille immobilier</h2>
            </div>
            <button
              onClick={()=>onNav("patrimoine")}
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 12px", color:C.g2, fontSize:10.5, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.blue;e.target.style.color=C.blue}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.g2}}>
              Voir tout →
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", padding:"0 8px 10px", borderBottom:`1px solid ${C.border}`, gap:8 }}>
            {["Bien","Type","Loyer","Capital / mois","LTV"].map(h=>(
              <span key={h} style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.08em" }}>{h}</span>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:2, marginTop:4 }}>
            {assets.length===0?(
              <div style={{ padding:"32px 24px", textAlign:"center" }}>
                <div style={{ width:40, height:40, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.blue, marginBottom:12 }}><I.Building/></div>
                <p style={{ fontSize:13, color:C.g2 }}>Aucun bien immobilier</p>
                <p style={{ fontSize:11, color:C.g3, marginTop:4 }}>Cliquez sur « + NOUVEAU » pour ajouter votre premier bien.</p>
              </div>
            ):assets.map((a,i)=>(
              <div key={i} onMouseEnter={()=>setHovAsset(i)} onMouseLeave={()=>setHovAsset(null)}
                onClick={()=>onSelectAsset(a)}
                style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", padding:"13px 8px", borderRadius:10, gap:8, background:hovAsset===i?"#1a1a1a":"transparent", transition:"all 0.15s", cursor:"pointer", alignItems:"center", border:`1px solid ${hovAsset===i?"rgba(0,123,255,0.2)":"transparent"}` }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:2, display:"flex", alignItems:"center", gap:6 }}>
                    {a.name}
                    {hovAsset===i&&<span style={{ fontSize:9, color:C.blue, fontFamily:C.mono, opacity:.8 }}>Voir →</span>}
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, color:isLoue(a.statut||a.etatLocatif)?C.green:C.red, background:isLoue(a.statut||a.etatLocatif)?C.greenSub:C.redSub, padding:"2px 7px", borderRadius:4, fontFamily:C.mono }}>● {isLoue(a.statut||a.etatLocatif)?"Loué":(a.statut||a.etatLocatif||"Disponible")}</div>
                </div>
                <span style={{ fontSize:11, color:C.g2 }}>{a.type}</span>
                <span style={{ fontSize:12, fontFamily:C.mono, fontWeight:500 }}>{a.rent}</span>
                <span style={{ fontSize:12, fontFamily:C.mono, color:C.green, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><I.Trend/>{a.capital}</span>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ flex:1, height:3, background:"#1f1f1f", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${a.ltv}%`, background:C.blue, borderRadius:99 }}/>
                  </div>
                  <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{a.ltv}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{assets.length} actif{assets.length>1?"s":""} · Valeur estimée</span>
            <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.03em" }}>{fmtK(totalVL)}</span>
          </div>
        </div>
      </div>

      {modal&&<SmartIntakeModal onClose={()=>setModal(false)}/>}

      {/* ── LOCATAIRES STRIP ── */}
      <div style={{ marginTop:16, background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:4 }}>GESTION LOCATIVE</p>
            <h2 style={{ fontSize:14, fontWeight:700 }}>Locataires</h2>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onNewTenant}
              style={{ background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", borderRadius:7, padding:"5px 12px", color:C.blue, fontSize:10.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.blueSub.replace("0.08","0.14");}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.blueSub;}}>
              <I.Plus/> Nouveau
            </button>
            <button onClick={()=>onNav("locataires")}
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 12px", color:C.g2, fontSize:10.5, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.target.style.borderColor=C.blue;e.target.style.color=C.blue;}}
              onMouseLeave={e=>{e.target.style.borderColor=C.border;e.target.style.color=C.g2;}}>
              Voir tout →
            </button>
          </div>
        </div>
        {/* Column headers */}
        <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1.4fr 2fr 1fr 1.2fr 0.9fr", padding:"0 10px 8px", borderBottom:`1px solid ${C.border}`, gap:10 }}>
          {["Nom","Prénom","Adresse du bien","Ville","Mail","État"].map(h=>(
            <span key={h} style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.08em" }}>{h}</span>
          ))}
        </div>
        {/* Tenant rows — show first 4 */}
        {tenants.length===0?<div style={{padding:"20px 0",textAlign:"center"}}><p style={{fontSize:12,color:C.g2}}>Aucun locataire</p><p style={{fontSize:10,color:C.g3}}>Ajoutez un locataire depuis la section Locataires.</p></div>:tenants.slice(0,4).map(t=>{
          const st = getStatut(t.daysLate);
          const isH = hovTenant===t.id;
          return (
            <div key={t.id}
              onMouseEnter={()=>setHovTenant(t.id)} onMouseLeave={()=>setHovTenant(null)}
              onClick={()=>onSelectTenant?onSelectTenant(t):onNav("locataires")}
              style={{ display:"grid", gridTemplateColumns:"1.4fr 1.4fr 2fr 1fr 1.2fr 0.9fr", padding:"11px 10px", borderRadius:8, gap:10, alignItems:"center", background:isH?"#1a1a1a":"transparent", transition:"all 0.15s", cursor:"pointer", border:`1px solid ${isH?"rgba(0,123,255,0.15)":"transparent"}`, marginTop:2 }}>
              {/* Nom */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background:`linear-gradient(135deg,${st.color}28,${st.color}14)`, border:`1px solid ${st.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:st.color }}>
                  {t.prenom[0]}{t.nom[0]}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:C.w }}>{t.nom}</span>
              </div>
              <span style={{ fontSize:12, color:C.g1 }}>{t.prenom}</span>
              <span style={{ fontSize:11, color:C.g2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.adresse}</span>
              <span style={{ fontSize:11, color:C.g2 }}>{t.ville}</span>
              <span style={{ fontSize:11, color:C.g2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.mail}</span>
              {/* Statut */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:st.bg, border:`1px solid ${st.border}`, borderRadius:99, padding:"3px 8px", width:"fit-content" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, flexShrink:0, animation:st.pulse?"pulse 1.8s infinite":"none" }}/>
                <span style={{ fontSize:9, fontWeight:700, color:st.color, fontFamily:C.mono, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>{st.label}</span>
              </div>
            </div>
          );
        })}
        <div style={{ marginTop:10, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{tenants.length} locataires · {tenants.filter(t=>t.daysLate>=10).length} impayé{tenants.filter(t=>t.daysLate>=10).length>1?"s":""}</span>
          <button onClick={()=>onNav("locataires")} style={{ background:"transparent", border:"none", color:C.blue, fontSize:11, cursor:"pointer", fontWeight:600 }}>Gérer tous les locataires →</button>
        </div>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════
   PATRIMOINE PAGE — LIST VIEW
════════════════════════════════════════ */
function isLoue(statut) {
  if (!statut) return false;
  const s = statut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return s === "loue" || s === "loue" || s.includes("loue") || s.includes("lou");
}
function fmtEur(n) {
  return n.toLocaleString("fr-FR") + " €";
}

function AssetRow({ a, hov, setHov, onSelectAsset, isNew }) {
  const isH = hov === a.id;
  const cout        = a.prixBien + a.fraisAgence + a.ameublement + a.fraisNotaire;

  // ── Use perfSim data if available (from Performance tab) ──
  const ps = a.perfSim;
  let rendement, cashflow;
  if (ps && ps.prixBien > 0) {
    const pf = (v) => parseFloat(String(v||"0").replace(",","."))||0;
    const coutSim = pf(ps.prixBien) + pf(ps.fraisNotaire) + pf(ps.travaux) + pf(ps.mobilier);
    const loyerBrut = pf(ps.loyerMensuel) * 12;
    const loyerVac = loyerBrut * (1 - pf(ps.vacance)/100);
    const charges = pf(ps.taxeFonciere) + pf(ps.chargesCopro) + pf(ps.assurancePNO) + pf(ps.gestionLocative) + pf(ps.entretien);
    const rdtBrut = coutSim > 0 ? (loyerBrut / coutSim * 100).toFixed(2) : "0.00";
    // Mensualité
    const montant = pf(ps.montantPret);
    const tauxM = pf(ps.tauxInteret)/100/12;
    const nbM = pf(ps.dureePret)*12;
    const diffM = Math.min(pf(ps.differe), nbM);
    const nbAmort = nbM - diffM;
    const mensCred = montant > 0 && tauxM > 0 && nbAmort > 0 ? montant * tauxM / (1 - Math.pow(1+tauxM, -nbAmort)) : 0;
    const mensAss = montant * (pf(ps.tauxAssurance)/100) / 12;
    const mensTot = mensCred + mensAss;
    const creditAn = mensTot * 12;
    // Fiscal
    const interetsMoy = pf(ps.dureePret) > 0 ? (creditAn * pf(ps.dureePret) - montant) / pf(ps.dureePret) : 0;
    const resFiscal = Math.max(0, loyerVac - charges - interetsMoy - pf(ps.amortissement));
    const impot = resFiscal * (pf(ps.tmi) + pf(ps.prelevementsSociaux||17.2)) / 100;
    const cfAn = loyerVac - charges - creditAn - impot;
    rendement = rdtBrut;
    cashflow = Math.round(cfAn / 12);
  } else {
    const rnetAnnuel = a.loyerAnnuel - a.chargesCopro - a.taxeFonciere;
    rendement = a.prixBien > 0 ? ((a.loyerAnnuel / (a.prixBien + a.fraisNotaire)) * 100).toFixed(2) : "0.00";
    cashflow = Math.round(rnetAnnuel / 12);
  }

  const loue        = isLoue(a.statut || a.etatLocatif);
  const vlGain      = a.vl - cout;
  const vlGainPct   = cout > 0 ? ((vlGain / cout) * 100).toFixed(1) : "0.0";
  const cfPositif   = cashflow >= 0;

  return (
    <div
      onMouseEnter={()=>setHov(a.id)} onMouseLeave={()=>setHov(null)}
      onClick={()=>onSelectAsset(a)}
      style={{
        display:"grid",
        gridTemplateColumns:"2fr 1.2fr 1.5fr 0.9fr 1fr 0.9fr",
        alignItems:"center",
        borderBottom:`1px solid ${C.border}`,
        background: isNew ? "rgba(16,185,129,0.04)" : isH ? "#131313" : "transparent",
        cursor:"pointer",
        borderLeft:`2px solid ${isNew ? C.green : isH ? C.blue : "transparent"}`,
        transition:"all 0.15s",
        animation: isNew ? "fadeUp 0.5s cubic-bezier(0.2,0.8,0.2,1)" : "none",
      }}
    >
      {/* ── COL 1: Bien ── */}
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background: isH ? C.blueMid : C.blueSub,
          border:`1px solid ${isH ? "rgba(0,123,255,0.35)" : "rgba(0,123,255,0.18)"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:C.blue, transition:"all 0.15s",
        }}><I.Home/></div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</p>
          <p style={{ fontSize:10, color:C.g2, marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{a.addr}</p>
          <div style={{ display:"flex", gap:4 }}>
            <span style={{ fontSize:8, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.18)", padding:"1px 5px", borderRadius:3 }}>{a.type}</span>
            <span style={{ fontSize:8, fontFamily:C.mono, color:C.g2, background:"#111", border:`1px solid ${C.border}`, padding:"1px 5px", borderRadius:3 }}>{a.surface}</span>
            <span style={{ fontSize:8, fontFamily:C.mono, color:C.g2, background:"#111", border:`1px solid ${C.border}`, padding:"1px 5px", borderRadius:3 }}>DPE {a.dpe}</span>
          </div>
        </div>
      </div>

      {/* ── COL 2: Coût acquisition (total uniquement) ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", gap:3 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>COÛT</span>
        <span style={{ fontSize:15, fontWeight:800, color:C.w, letterSpacing:"-0.03em", fontFamily:C.mono }}>{fmtEur(cout)}</span>
      </div>

      {/* ── COL 3: VL estimée + Valeur Liquidative ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", gap:4 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>VL ESTIMÉE</span>
        <span style={{ fontSize:15, fontWeight:800, color:C.w, letterSpacing:"-0.03em", fontFamily:C.mono }}>{fmtEur(a.vl)}</span>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:10, fontFamily:C.mono, fontWeight:700, color: vlGain >= 0 ? C.green : C.red }}>
            {vlGain >= 0 ? "+" : ""}{fmtEur(vlGain)}
          </span>
          <span style={{
            fontSize:9, fontFamily:C.mono,
            color: vlGain >= 0 ? C.green : C.red,
            background: vlGain >= 0 ? C.greenSub : C.redSub,
            border:`1px solid ${vlGain >= 0 ? C.greenBord : "rgba(239,68,68,0.22)"}`,
            padding:"1px 6px", borderRadius:4,
          }}>
            {vlGain >= 0 ? "▲" : "▼"} {Math.abs(vlGainPct)}%
          </span>
        </div>
        {a.vlLiquidative != null && (
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
            <span style={{ fontSize:8, fontFamily:C.mono, color:"#6366F1", letterSpacing:"0.06em" }}>LIQUIDATIVE</span>
            <span style={{ fontSize:10, fontWeight:700, fontFamily:C.mono, color:"#6366F1" }}>{fmtEur(a.vlLiquidative)}</span>
          </div>
        )}
      </div>

      {/* ── COL 4: État ── */}
      <div style={{ padding:"14px 14px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:6 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:5,
          background: loue ? C.greenSub : C.redSub,
          border:`1px solid ${loue ? C.greenBord : "rgba(239,68,68,0.22)"}`,
          borderRadius:99, padding:"4px 10px",
        }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background: loue ? C.green : C.red, animation: loue ? "none" : "pulse 1.6s infinite" }}/>
          <span style={{ fontSize:9.5, fontWeight:700, fontFamily:C.mono, letterSpacing:"0.05em", color: loue ? C.green : C.red }}>
            {loue ? "LOUÉ" : (a.statut||a.etatLocatif||"DISPONIBLE").toUpperCase()}
          </span>
        </div>
        {loue && <p style={{ fontSize:9.5, color:C.g2, textAlign:"center", lineHeight:1.4 }}>{a.mode||a.typeLocation||""}</p>}
      </div>

      {/* ── COL 5: Rendement net (% uniquement) ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:2 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>RENDEMENT</span>
        <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
          <span style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.04em", color: parseFloat(rendement)>=5 ? C.green : parseFloat(rendement)>=3 ? C.yellow : C.red }}>
            {rendement}
          </span>
          <span style={{ fontSize:12, fontWeight:600, color:C.g2 }}>%</span>
        </div>
        <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>{ps ? "brut / an" : "net / an"}</span>
      </div>

      {/* ── COL 6: Cash-Flow mensuel ── */}
      <div style={{ padding:"14px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:2 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>CASH-FLOW</span>
        <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.03em", color: cfPositif ? C.green : C.red, fontFamily:C.mono }}>
          {cfPositif ? "+" : ""}{cashflow.toLocaleString("fr-FR")} €
        </span>
        <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>/mois</span>
      </div>
    </div>
  );
}

function PatrimoinePage({ onSelectAsset, onNewAsset, assets }) {
  const [hov,         setHov]         = useState(null);
  const [sort,        setSort]        = useState("rendement");
  const [sortDir,     setSortDir]     = useState("desc");
  const [lastAddedId, setLastAddedId] = useState(null);

  // Detect newly added asset (last in array) and highlight it briefly
  useEffect(()=>{
    if(assets.length > 0){
      const last = assets[assets.length-1];
      setLastAddedId(last.id);
      const t = setTimeout(()=>setLastAddedId(null), 4000);
      return ()=>clearTimeout(t);
    }
  },[assets.length]);

  const totalCout      = assets.reduce((s,a)=>s+a.prixBien+a.fraisAgence+a.ameublement+a.fraisNotaire, 0);
  const totalVL        = assets.reduce((s,a)=>s+a.vl, 0);
  const totalLoyerBrut = assets.reduce((s,a)=>{
    const ps = a.perfSim;
    if (ps && ps.loyerMensuel > 0) return s + ps.loyerMensuel * 12;
    return s + (a.loyerAnnuel||0);
  }, 0);
  const totalCoutSim   = assets.reduce((s,a)=>{
    const ps = a.perfSim;
    if (ps && ps.prixBien > 0) return s + (ps.prixBien||0)+(ps.fraisNotaire||0)+(ps.travaux||0)+(ps.mobilier||0);
    return s + a.prixBien + a.fraisNotaire;
  }, 0);
  const rnetMoyen      = totalCoutSim > 0 ? ((totalLoyerBrut / totalCoutSim)*100).toFixed(2) : "0.00";
  const plusValue      = totalVL - totalCout;

  const sorted = [...assets].sort((a,b)=>{
    const getV = x => {
      const ps = x.perfSim;
      if (sort==="rendement") {
        if (ps && ps.prixBien > 0) {
          const ct = (ps.prixBien||0)+(ps.fraisNotaire||0)+(ps.travaux||0)+(ps.mobilier||0);
          return ct > 0 ? ((ps.loyerMensuel||0)*12) / ct : 0;
        }
        return x.prixBien > 0 ? x.loyerAnnuel / (x.prixBien + x.fraisNotaire) : 0;
      }
      if (sort==="vl")       return x.vl;
      if (sort==="cout")     return x.prixBien+x.fraisAgence+x.ameublement+x.fraisNotaire;
      if (sort==="etat")     return isLoue(x.statut||x.etatLocatif)?1:0;
      if (sort==="cashflow") {
        if (ps && ps.prixBien > 0) {
          const pf = v => parseFloat(String(v||"0"))||0;
          const loyVac = pf(ps.loyerMensuel)*12*(1-pf(ps.vacance)/100);
          const ch = pf(ps.taxeFonciere)+pf(ps.chargesCopro)+pf(ps.assurancePNO)+pf(ps.gestionLocative)+pf(ps.entretien);
          const mt = pf(ps.montantPret), tm = pf(ps.tauxInteret)/100/12, nb = pf(ps.dureePret)*12;
          const mens = mt>0&&tm>0&&nb>0 ? mt*tm/(1-Math.pow(1+tm,-nb)) + mt*(pf(ps.tauxAssurance)/100)/12 : 0;
          return (loyVac - ch - mens*12) / 12;
        }
        return (x.loyerAnnuel-x.chargesCopro-x.taxeFonciere)/12;
      }
      return 0;
    };
    return sortDir==="desc" ? getV(b)-getV(a) : getV(a)-getV(b);
  });

  const handleSort = (col) => {
    if (sort===col) setSortDir(d=>d==="desc"?"asc":"desc");
    else { setSort(col); setSortDir("desc"); }
  };

  const SortBtn = ({col,label}) => {
    const active = sort===col;
    return (
      <button onClick={()=>handleSort(col)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:4, padding:0 }}>
        <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:active?C.blue:C.g3, textTransform:"uppercase", transition:"color 0.15s" }}>{label}</span>
        <span style={{ fontSize:9, color:active?C.blue:C.g3, opacity:active?1:0.4 }}>{active?(sortDir==="desc"?"↓":"↑"):"↕"}</span>
      </button>
    );
  };

  return (
    <main style={{ flex:1, overflowY:"auto", padding:"28px 32px 48px" }}>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
        <div>
          <p style={{ fontSize:10, color:C.g2, fontFamily:C.mono, letterSpacing:"0.12em", marginBottom:6 }}>PORTEFEUILLE IMMOBILIER</p>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.04em", marginBottom:4 }}>Mes biens</h1>
          <p style={{ fontSize:13, color:C.g2 }}>{assets.length} actifs · {assets.filter(a=>isLoue(a.statut||a.etatLocatif)).length} loués · {assets.filter(a=>!isLoue(a.statut||a.etatLocatif)).length} vide</p>
        </div>
        <button onClick={onNewAsset} style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, letterSpacing:"0.04em", boxShadow:`0 4px 20px ${C.blueGlow}`, transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,255,0.5)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 20px ${C.blueGlow}`;}}>
          <I.Plus/> + Ajouter un bien
        </button>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        {[
          { label:"COÛT TOTAL PORTEFEUILLE", value:fmtEur(totalCout),  sub:"Acquisitions + frais",       color:C.w   },
          { label:"VALEUR LIQUIDATIVE",       value:fmtEur(totalVL),   sub:"Estimation marché actuelle", color:C.w   },
          { label:"PLUS-VALUE LATENTE",       value:(plusValue>=0?"+":"")+fmtEur(plusValue), sub:`${((plusValue/totalCout)*100).toFixed(1)}% vs coût total`, color:plusValue>=0?C.green:C.red },
          { label:"RENDEMENT BRUT MOYEN",      value:`${rnetMoyen} %`,   sub:"Loyer brut / coût total",  color:C.blue },
        ].map((m,i)=>(
          <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:13, padding:"16px 18px" }}>
            <p style={{ fontSize:9, fontFamily:C.mono, color:C.g2, letterSpacing:"0.1em", marginBottom:8 }}>{m.label}</p>
            <p style={{ fontSize:18, fontWeight:800, color:m.color, letterSpacing:"-0.03em", marginBottom:3 }}>{m.value}</p>
            <p style={{ fontSize:10, color:C.g3 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>

        {/* Column headers */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"2fr 1.2fr 1.5fr 0.9fr 1fr 0.9fr",
          background:"#08080A",
          borderBottom:`1px solid ${C.border}`,
        }}>
          {[
            { key:null,        label:"BIEN",        pad:"14px 18px" },
            { key:"cout",      label:"COÛT",        pad:"12px 16px" },
            { key:"vl",        label:"VL ESTIMÉE",  pad:"12px 16px" },
            { key:"etat",      label:"ÉTAT",        pad:"12px 14px" },
            { key:"rendement", label:"RENDEMENT",   pad:"12px 16px" },
            { key:"cashflow",  label:"CASH-FLOW",   pad:"12px 16px" },
          ].map((col,i)=>(
            <div key={i} style={{ padding:col.pad, borderLeft:i>0?`1px solid ${C.border}`:"none", display:"flex", alignItems:"center" }}>
              {col.key
                ? <SortBtn col={col.key} label={col.label}/>
                : <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3 }}>{col.label}</span>
              }
            </div>
          ))}
        </div>

        {/* New-asset toast */}
        {lastAddedId && assets.find(a=>a.id===lastAddedId) && (
          <div style={{ padding:"11px 18px", borderBottom:`1px solid ${C.greenBord}`, background:"linear-gradient(90deg,rgba(16,185,129,0.07),rgba(16,185,129,0.02))", display:"flex", alignItems:"center", gap:10, animation:"fadeUp 0.4s ease" }}>
            <div style={{ width:22, height:22, borderRadius:6, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p style={{ fontSize:11, color:C.green, fontWeight:600 }}>
              <strong>{assets.find(a=>a.id===lastAddedId)?.name}</strong> — ajouté à Mes biens
            </p>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, marginLeft:"auto" }}>à l'instant</span>
          </div>
        )}

        {/* Rows */}
        {sorted.length===0?(
          <div style={{ padding:"48px 24px", textAlign:"center", gridColumn:"1/-1" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.blue, marginBottom:14 }}><I.Building/></div>
            <p style={{ fontSize:14, fontWeight:600, color:C.g1, marginBottom:4 }}>Votre portefeuille est vide</p>
            <p style={{ fontSize:12, color:C.g2 }}>Ajoutez votre premier bien immobilier pour commencer à piloter votre patrimoine.</p>
          </div>
        ):sorted.map(a=>(
          <AssetRow key={a.id} a={a} hov={hov} setHov={setHov} onSelectAsset={onSelectAsset} isNew={a.id===lastAddedId}/>
        ))}

        {/* Footer totals */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"2fr 1.2fr 1.5fr 0.9fr 1fr 0.9fr",
          background:"#08080A", borderTop:`1px solid ${C.border}`,
        }}>
          <div style={{ padding:"11px 18px", display:"flex", alignItems:"center" }}>
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>TOTAUX · {assets.length} ACTIFS</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}` }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.w, fontFamily:C.mono }}>{fmtEur(totalCout)}</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.w, fontFamily:C.mono }}>{fmtEur(totalVL)}</span>
            <span style={{ fontSize:9.5, color:C.green, fontFamily:C.mono }}>+{((plusValue/totalCout)*100).toFixed(1)}%</span>
          </div>
          <div style={{ padding:"11px 14px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>{assets.filter(a=>isLoue(a.statut||a.etatLocatif)).length}/{assets.length}</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:800, color:C.blue, fontFamily:C.mono }}>{rnetMoyen}%</span>
          </div>
          <div style={{ padding:"11px 16px", borderLeft:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
            {(()=>{
              const totalCF = assets.reduce((s,a)=>s+Math.round((a.loyerAnnuel-a.chargesCopro-a.taxeFonciere)/12),0);
              return <span style={{ fontSize:12, fontWeight:800, fontFamily:C.mono, color: totalCF>=0?C.green:C.red }}>{totalCF>=0?"+":""}{totalCF.toLocaleString("fr-FR")} €</span>;
            })()}
          </div>
        </div>
      </div>

      {/* ── METHODOLOGY NOTE ── */}
      <div style={{ marginTop:14, padding:"12px 16px", background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:24, height:24, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
        <p style={{ fontSize:10, color:C.g2 }}>
          <strong style={{ color:C.g1 }}>Valeur Liquidative</strong> calculée par IA : croisement des données DVF/Étalab, ventes des notaires de la zone, état du bien et DPE · Mise à jour mensuelle ·
          <strong style={{ color:C.g1 }}> Rendement net</strong> = (Loyers annuels − Charges copro − Taxe foncière) ÷ Prix du bien
        </p>
      </div>
    </main>
  );
}

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

/* ════════════════════════════════════════
   TENANT DETAIL PANEL (slide-over fiche)
════════════════════════════════════════ */

/* ── Gestion Tab: 5-Step Onboarding Stepper ── */
const GESTION_STEPS = [
  {
    id: "accord",
    label: "Accord de principe",
    icon: "Handshake",
    color: "#3B82F6",
    desc: "Validation des conditions d'entrée : loyer, date, dossier.",
    customRender: true,
    actions: [
      { label:"Envoi d'accord de principe", primary:true, key:"sendAccord" },
    ],
  },
  {
    id: "bail",
    label: "Signature du Bail",
    icon: "FileSignature",
    color: "#8B5CF6",
    desc: "Génération, envoi et suivi de la signature du contrat de bail mobilité.",
    customRender: true,
    actions: [
      { label:"Envoyer le bail à la signature", primary:true, key:"sendBail" },
    ],
  },
  {
    id: "paiement",
    label: "Paiement Initial",
    icon: "CreditCard",
    color: "#10B981",
    desc: "Encaissement du dépôt de garantie et du premier loyer.",
    fields: [
      { key:"depotGarantie", label:"Dépôt de garantie", placeholder:"Ex : 850 €", type:"text" },
      { key:"premierLoyer", label:"1er loyer", placeholder:"Ex : 850 €", type:"text" },
      { key:"modeReglement", label:"Mode de règlement", placeholder:"Virement / Chèque / CB", type:"text" },
    ],
    actions: [
      { label:"Marquer le paiement reçu", primary:true, key:"confirmPayment" },
      { label:"Envoyer un rappel de paiement", secondary:true, key:"reminderPayment" },
    ],
  },
  {
    id: "conformite",
    label: "Conformité",
    icon: "ShieldCheck",
    color: "#F59E0B",
    desc: "Collecte de l'Assurance Habitation et du justificatif Énergie.",
    documents: [
      { key:"assurance", label:"Attestation d'assurance habitation", subLabel:"PDF ou scan de l'attestation" },
      { key:"energie", label:"Justificatif d'ouverture de compteur", subLabel:"EDF, Engie, Total Energies…" },
    ],
    actions: [
      { label:"Valider la conformité", primary:true, key:"validateConf" },
    ],
  },
  {
    id: "edl",
    label: "État des lieux",
    icon: "Key",
    color: "#EC4899",
    desc: "Constat d'état détaillé, inventaire mobilier, photos et signature.",
    customRender: true,
    actions: [
      { label:"Clore et signer l'état des lieux", primary:true, key:"confirmKeys" },
    ],
  },
];

const GESTION_ICONS = {
  Handshake: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m11 17 2 2a1 1 0 0 0 3-1l-2-3"/><path d="m14 14 2.5 2.5a1 1 0 0 0 3-1L15 11l-1-1"/><path d="M2 2h4l2.5 2.5L5 8h8l3 3M7 8v8"/><path d="m22 22-5-10 3-3L12 1"/></svg>,
  FileSignature: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18c-2.67 0-5.33-1.33-5.33-4s2.67-4 5.33-4 5.33 1.33 5.33 4"/></svg>,
  CreditCard: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  ShieldCheck: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  Key: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
};


/* ── Accord de Principe — Rich Section ── */
function AccordSection({ tenant, bien, user, stepData, setField }) {
  const ci = tenant.ocrData?.carte_identite || {};
  const fp = tenant.ocrData?.fiche_paie || {};
  const garants = tenant.garantsOcr || [];

  // Pre-fill computed values
  const loyerHC = bien?.loyer || tenant.loyerHC || tenant.loyer || "";
  const loyerNum = parseInt(String(loyerHC).replace(/[^\d]/g,""),10) || 0;
  const isVide = (bien?.typeLocation||tenant.bienTypeLocation||"").toLowerCase().includes("vide");
  const depotGarantie = tenant.depotGarantieCalc || (loyerNum > 0 ? (isVide ? loyerNum : loyerNum * 2) : "");
  const chargesLoc = bien?.chargesLocatives || tenant.chargesLoc || "";
  const dureeBail = tenant.dureeBail || (isVide ? "3 ans renouvelable" : "1 an renouvelable");
  const adresseBien = [bien?.addr||"", bien?.addr2||"", bien?.batiment||"", bien?.porteLot||"", bien?.ville||"", bien?.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || "";
  const descBien = [bien?.type||tenant.bienType, (bien?.surface||tenant.bienSurface) ? (bien?.surface||tenant.bienSurface)+" m²" : null, bien?.rooms||tenant.bienRooms].filter(Boolean).join(" · ");
  const annexes = [(bien?.porteLot) ? "Lot "+bien.porteLot : null].filter(Boolean).join(", ") || "—";
  const prenomNom = `${tenant.prenom||""} ${tenant.nom||""}`.trim();
  const bailleur = `${user?.prenom||""} ${user?.nom||""}`.trim() || "—";

  const today = new Date();
  const validite72h = new Date(today.getTime() + 72*60*60*1000).toLocaleDateString("fr-FR");

  const SL = ({label}) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 10px" }}>
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:"#3B82F6", fontFamily:C.mono, fontWeight:700 }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(59,130,246,0.15)" }}/>
    </div>
  );

  const RoField = ({label, value, full, accent, mono}) => (
    <div style={{ background:"#0d0d0f", border:`1px solid ${value&&value!=="—"?"rgba(59,130,246,0.15)":C.border}`, borderRadius:10, padding:"10px 12px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:4, textTransform:"uppercase" }}>{label}</p>
      <p style={{ fontSize:13, fontWeight:700, color:accent?"#3B82F6":value&&value!=="—"?C.w:C.g3, fontFamily:mono?C.mono:"inherit" }}>{value||"—"}</p>
    </div>
  );

  const EdField = ({label, k, placeholder, full, unit, type}) => (
    <div style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:4, textTransform:"uppercase" }}>{label}</p>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {type==="date" ? (
          <DatePickerInput value={stepData[k]||""} onChange={v=>setField(k,v)} placeholder={placeholder}/>
        ) : (
          <input type="text" value={stepData[k]||""} onChange={e=>setField(k,e.target.value)} placeholder={placeholder}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:600, color:C.w }}/>
        )}
        {unit&&<span style={{ fontSize:11, color:C.g2, flexShrink:0 }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:16 }}>

      {/* ═══ 1. IDENTIFICATION DES PARTIES ═══ */}
      <SL label="1 · IDENTIFICATION DES PARTIES"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <RoField label="Le Bailleur" value={bailleur} accent/>
        <RoField label="Adresse de gestion" value={user?.email||"—"}/>
        <RoField label="Le Preneur" value={prenomNom} accent/>
        <RoField label="Date de naissance" value={ci.date_naissance||tenant.dateNaissance||"—"}/>
        <RoField label="Nationalité" value={ci.nationalite||tenant.nationalite||"—"}/>
        <RoField label="Employeur" value={fp.employeur||tenant.employeur||"—"}/>
      </div>
      {garants.length > 0 && (
        <div style={{ marginTop:8 }}>
          <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:"#818cf8", marginBottom:6 }}>GARANT(S)</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {garants.map((g, i) => {
              const gci = g?.carte_identite || {};
              const gfp = g?.fiche_paie || {};
              return (
                <div key={i} style={{ background:"#0d0d0f", border:"1px solid rgba(99,102,241,0.15)", borderRadius:10, padding:"10px 12px" }}>
                  <p style={{ fontSize:8, fontFamily:C.mono, color:"#818cf8", marginBottom:3 }}>GARANT {i+1}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:C.w }}>{gci.prenom||"?"} {gci.nom||"?"}</p>
                  <p style={{ fontSize:10, color:C.g2, marginTop:2 }}>{[gfp.employeur, gfp.salaire_net].filter(Boolean).join(" · ")||"—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ 2. DÉSIGNATION DU BIEN ═══ */}
      <SL label="2 · DÉSIGNATION DU BIEN"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <RoField label="Adresse exacte" value={adresseBien} full/>
        <RoField label="Description" value={descBien}/>
        <RoField label="Bâtiment / Étage / Lot" value={[bien?.batiment, bien?.porteLot].filter(Boolean).join(" · ")||tenant.bienAddr||"—"}/>
        <RoField label="Année de construction" value={bien?.year||tenant.bienYear||"—"}/>
        <RoField label="DPE" value={bien?.dpe||tenant.bienDpe||"—"}/>
        <RoField label="Usage" value="Habitation exclusivement" full/>
      </div>

      {/* ═══ 3. CONDITIONS FINANCIÈRES ═══ */}
      <SL label="3 · CONDITIONS FINANCIÈRES"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", marginBottom:8 }}>
        {[
          { poste:"Loyer hors charges", detail:loyerHC ? loyerHC+" €/mois" : "—", accent:true },
          { poste:"Provisions sur charges", detail:chargesLoc ? chargesLoc+" €/mois" : "À définir" },
          { poste:"Dépôt de garantie", detail:depotGarantie ? depotGarantie+" €" : "—", sub:isVide?"(1 mois HC — location vide)":"(2 mois HC — location meublée)" },
          { poste:"Honoraires / Frais", detail:"—" },
        ].map((r, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"10px 14px", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
            <span style={{ flex:1, fontSize:12, fontWeight:600, color:C.g1 }}>{r.poste}</span>
            <div style={{ textAlign:"right" }}>
              <span style={{ fontSize:13, fontWeight:800, color:r.accent?"#3B82F6":C.w, fontFamily:C.mono }}>{r.detail}</span>
              {r.sub && <p style={{ fontSize:9, color:C.g3, marginTop:1 }}>{r.sub}</p>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <EdField label="Loyer convenu (ajuster)" k="loyerAccorde" placeholder={loyerHC||"Montant"} unit="€/mois"/>
        <EdField label="Honoraires locataire" k="honoraires" placeholder="0" unit="€"/>
      </div>

      {/* ═══ 4. CALENDRIER D'ENTRÉE ═══ */}
      <SL label="4 · CALENDRIER D'ENTRÉE"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <EdField label="Date de prise d'effet" k="datePriseEffet" type="date" placeholder="JJ/MM/AAAA"/>
        <RoField label="Durée du bail" value={dureeBail}/>
        <EdField label="Date de remise des clés" k="dateRemiseCles" type="date" placeholder="JJ/MM/AAAA"/>
        <EdField label="Date de signature prévue" k="dateSignature" type="date" placeholder="JJ/MM/AAAA"/>
      </div>

      {/* ═══ 5. CONDITIONS SUSPENSIVES ═══ */}
      <SL label="5 · CONDITIONS SUSPENSIVES"/>
      <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:12, padding:"14px 16px" }}>
        <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.yellow, marginBottom:10, fontWeight:700 }}>L'ACCORD EST CONDITIONNÉ À :</p>
        {[
          { label:"Attestation d'assurance habitation", sub:"Couvrant les risques locatifs, à fournir avant la remise des clés." },
          { label:"Paiement du premier virement", sub:`Dépôt de garantie (${depotGarantie||"—"} €) + 1er mois de loyer (${loyerHC||"—"} €).` },
          { label:"Validation définitive de la caution", sub:"Réception de l'acte de cautionnement signé" + (garants.length>0 ? ` (${garants.length} garant${garants.length>1?"s":""}).` : " (si applicable).") },
        ].map((cond, i) => (
          <div key={i} style={{ display:"flex", gap:10, marginBottom:i<2?10:0 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.yellow, fontSize:10, fontWeight:800, flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:C.w, marginBottom:2 }}>{cond.label}</p>
              <p style={{ fontSize:10, color:C.g2, lineHeight:1.5 }}>{cond.sub}</p>
            </div>
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:12 }}>
          <EdField label="Date limite de réalisation" k="dateLimiteConditions" type="date" placeholder="JJ/MM/AAAA"/>
        </div>
      </div>

      {/* ═══ 6. VALIDITÉ ET DÉSENGAGEMENT ═══ */}
      <SL label="6 · VALIDITÉ ET DÉSENGAGEMENT"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0 }}><I.AlertTriangle/></div>
          <div>
            <p style={{ fontSize:12, fontWeight:700, color:C.w }}>Durée de validité : 72 heures</p>
            <p style={{ fontSize:10, color:C.g2 }}>Cet accord est valable jusqu'au <strong style={{ color:C.w }}>{validite72h}</strong>. Passé ce délai, le bien est remis sur le marché.</p>
          </div>
        </div>
        <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.1)", borderRadius:8, padding:"10px 12px" }}>
          <p style={{ fontSize:10, color:C.g3, lineHeight:1.6, fontStyle:"italic" }}>
            Cet accord de principe ne vaut pas bail et ne constitue pas un engagement définitif.
            L'entrée dans les lieux est strictement conditionnée à la signature du contrat de location définitif
            et à la réalisation de l'ensemble des conditions suspensives mentionnées ci-dessus.
          </p>
        </div>
      </div>
    </div>
  );
}


/* ── Signature Pad Modal ── */
function SignaturePadModal({ tenant, onSign, onClose }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const confirm = () => {
    if (!hasDrawn) return;
    const data = canvasRef.current.toDataURL("image/png");
    onSign(data);
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}/>
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:401, width:"min(520px,92vw)", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" }}>
        {/* Header */}
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#3B82F6" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22c-4 0-8-2-8-6V8l8-4 8 4v8c0 4-4 6-8 6z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>Signature de l'accord</p>
              <p style={{ fontSize:11, color:C.g2 }}>Signez ci-dessous pour accepter les conditions de l'accord de principe.</p>
            </div>
          </div>
        </div>

        {/* Signer info */}
        <div style={{ padding:"12px 24px", background:"#0d0d0f", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(59,130,246,0.12)", border:"1px solid rgba(59,130,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#3B82F6" }}>
            {(tenant.prenom||"?")[0]}{(tenant.nom||"?")[0]}
          </div>
          <div>
            <p style={{ fontSize:12, fontWeight:700 }}>{tenant.prenom} {tenant.nom}</p>
            <p style={{ fontSize:10, color:C.g3 }}>Signataire · Preneur</p>
          </div>
          <span style={{ marginLeft:"auto", fontSize:9, fontFamily:C.mono, color:C.g3 }}>{new Date().toLocaleDateString("fr-FR")}</span>
        </div>

        {/* Canvas */}
        <div style={{ padding:"20px 24px" }}>
          <div style={{ background:"#fafafa", borderRadius:12, border:"2px dashed #d1d5db", position:"relative", overflow:"hidden" }}>
            <canvas ref={canvasRef} width={472} height={180}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
              style={{ display:"block", width:"100%", height:180, cursor:"crosshair", touchAction:"none" }}/>
            {!hasDrawn && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <p style={{ fontSize:13, color:"#9ca3af", fontStyle:"italic" }}>Dessinez votre signature ici</p>
              </div>
            )}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
            <button onClick={clearCanvas} style={{ background:"none", border:"none", color:C.g3, fontSize:11, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:4 }}
              onMouseEnter={e=>e.currentTarget.style.color=C.red} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
              <I.X/> Effacer
            </button>
            <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>Tracez à la souris ou au doigt</span>
          </div>
        </div>

        {/* Legal */}
        <div style={{ padding:"0 24px 16px" }}>
          <p style={{ fontSize:10, color:C.g3, lineHeight:1.6, fontStyle:"italic" }}>
            En signant, je confirme avoir pris connaissance de l'ensemble des conditions de l'accord de principe
            et j'accepte les termes énoncés. Cette signature électronique a valeur d'engagement.
          </p>
        </div>

        {/* Actions */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
          <button onClick={onClose}
            style={{ flex:1, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 0", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            Annuler
          </button>
          <button onClick={confirm} disabled={!hasDrawn}
            style={{ flex:1, background:hasDrawn?"linear-gradient(135deg,#3B82F6,#2563EB)":"#1a1a1a", border:"none", borderRadius:10, padding:"11px 0", color:hasDrawn?"#fff":C.g3, fontSize:12, fontWeight:700, cursor:hasDrawn?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:hasDrawn?"0 4px 18px rgba(59,130,246,0.35)":"none", transition:"all 0.2s" }}>
            <I.CheckCircle/> Valider ma signature
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Bail Mobilité Section (Step 2) ── */
function BailMobiliteSection({ tenant, bien, user, stepData, setField }) {
  const ci = tenant.ocrData?.carte_identite || {};
  const garants = tenant.garantsOcr || [];
  const bailleurName = `${user?.prenom||""} ${user?.nom||""}`.trim() || "—";
  const bailleurAddr = user?.email || "—";
  const prenomNom = `${tenant.prenom||""} ${tenant.nom||""}`.trim();
  const bienAddr = [bien?.addr||"", bien?.addr2||"", bien?.batiment||"", bien?.ville||"", bien?.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || "";
  const loyerVal = bien?.loyer || tenant.loyerHC || "";
  const chargesVal = String(bien?.chargesLocatives || tenant.chargesLoc || "");
  const surface = bien?.surface || tenant.bienSurface || "";
  const rooms = bien?.rooms || tenant.bienRooms || "";
  const bienType = bien?.type || tenant.bienType || "";
  const bienYear = bien?.year || tenant.bienYear || "";
  const dpe = bien?.dpe || tenant.bienDpe || "";
  const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10)||0;
  const chargesNum = parseInt(String(chargesVal).replace(/[^\d]/g,""),10)||0;
  const totalMensuel = loyerNum + chargesNum;

  const MOTIFS = ["Formation professionnelle","Études supérieures","Contrat d'apprentissage","Stage","Engagement volontaire (service civique)","Mutation professionnelle","Mission temporaire"];

  const SL = ({label}) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0 8px" }}>
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:"#8B5CF6", fontFamily:C.mono, fontWeight:700 }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(139,92,246,0.15)" }}/>
    </div>
  );

  const RoField = ({label, value, full, accent, mono}) => (
    <div style={{ background:"#0d0d0f", border:`1px solid ${value&&value!=="—"?"rgba(139,92,246,0.12)":C.border}`, borderRadius:9, padding:"8px 11px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, marginBottom:3 }}>{label}</p>
      <p style={{ fontSize:12, fontWeight:600, color:accent?"#8B5CF6":value&&value!=="—"?C.w:C.g3, fontFamily:mono?C.mono:"inherit" }}>{value||"—"}</p>
    </div>
  );

  const EdField = ({label, k, placeholder, full, unit, type}) => (
    <div style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 11px", gridColumn:full?"span 2":"span 1" }}>
      <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, marginBottom:3 }}>{label}</p>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        {type==="date" ? (
          <DatePickerInput value={stepData[k]||""} onChange={v=>setField(k,v)} placeholder={placeholder}/>
        ) : (
          <input type="text" value={stepData[k]||""} onChange={e=>setField(k,e.target.value)} placeholder={placeholder}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:600, color:C.w }}/>
        )}
        {unit&&<span style={{ fontSize:10, color:C.g2 }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:14 }}>
      {/* Bail type badge */}
      <div style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.15)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B5CF6" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:12, fontWeight:800, color:"#8B5CF6" }}>BAIL MOBILITÉ</p>
          <p style={{ fontSize:10, color:C.g2 }}>Conforme Loi ELAN & ALUR · Durée 1 à 10 mois · Non renouvelable · Sans dépôt de garantie</p>
        </div>
        <span style={{ fontSize:8, fontFamily:C.mono, color:"#8B5CF6", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", padding:"3px 8px", borderRadius:4 }}>LOI ELAN</span>
      </div>

      {/* I. Parties */}
      <SL label="I · DÉSIGNATION DES PARTIES"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <RoField label="Bailleur" value={bailleurName} accent/>
        <RoField label="Adresse / Siège" value={bailleurAddr}/>
        <RoField label="Locataire (Preneur)" value={prenomNom} accent/>
        <RoField label="E-mail locataire" value={tenant.mail||"—"}/>
        {garants.length>0 && <RoField label="Garant(s)" value={garants.map((g,i)=>`${g?.carte_identite?.prenom||"?"} ${g?.carte_identite?.nom||"?"}`).join(", ")} full/>}
      </div>

      {/* II. Objet — Motif */}
      <SL label="II · OBJET DU CONTRAT — MOTIF"/>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
        {MOTIFS.map(m=>{
          const sel = stepData.bailMotif===m;
          return <button key={m} onClick={()=>setField("bailMotif",m)} style={{ background:sel?"rgba(139,92,246,0.12)":"#0d0d0f", border:`1.5px solid ${sel?"#8B5CF6":C.border}`, borderRadius:8, padding:"6px 12px", fontSize:10, fontWeight:sel?700:500, color:sel?"#8B5CF6":C.g2, cursor:"pointer", transition:"all 0.15s" }}>{m}</button>;
        })}
      </div>

      {/* II-A. Consistance du logement */}
      <SL label="II-A · CONSISTANCE DU LOGEMENT"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <RoField label="Adresse du logement" value={bienAddr} full/>
        <RoField label="Type" value={bienType}/>
        <RoField label="Surface habitable" value={surface?surface+" m²":"—"}/>
        <RoField label="Pièces principales" value={rooms}/>
        <RoField label="Période de construction" value={bienYear}/>
        <RoField label="Classe DPE" value={dpe?`Classe ${dpe}`:"—"}/>
        <EdField label="Équipements du logement" k="bailEquipements" placeholder="Cuisine équipée, sanitaires…" full/>
        <EdField label="Chauffage" k="bailChauffage" placeholder="Individuel électrique"/>
        <EdField label="Eau chaude" k="bailEauChaude" placeholder="Individuel"/>
      </div>

      {/* III. Date et durée */}
      <SL label="III · DATE ET DURÉE DU CONTRAT"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <EdField label="Date de prise d'effet" k="bailDateEffet" type="date" placeholder="JJ/MM/AAAA"/>
        <EdField label="Durée du bail (1 à 10 mois)" k="bailDuree" placeholder="Ex : 6 mois"/>
      </div>
      <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.12)", borderRadius:8, padding:"8px 12px", marginTop:6 }}>
        <p style={{ fontSize:10, color:C.yellow, lineHeight:1.5 }}>⚠ Le bail mobilité est conclu pour 1 à 10 mois maximum, non renouvelable et non reconductible. La durée peut être modifiée une fois par avenant sans dépasser 10 mois.</p>
      </div>

      {/* IV. Conditions financières */}
      <SL label="IV · CONDITIONS FINANCIÈRES"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden", marginBottom:6 }}>
        {[
          { poste:"Loyer mensuel", detail:loyerVal?loyerVal+" €":"—", accent:true },
          { poste:"Forfait de charges", detail:chargesVal?chargesVal+" €/mois":"—" },
          { poste:"Total mensuel dû", detail:totalMensuel>0?totalMensuel+" €":"—", accent:true },
          { poste:"Dépôt de garantie", detail:"INTERDIT (bail mobilité)", warn:true },
        ].map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"8px 14px", borderBottom:i<3?`1px solid ${C.border}`:"none" }}>
            <span style={{ flex:1, fontSize:11, fontWeight:600, color:r.warn?C.red:C.g1 }}>{r.poste}</span>
            <span style={{ fontSize:12, fontWeight:700, color:r.warn?C.red:r.accent?"#8B5CF6":C.w, fontFamily:C.mono }}>{r.detail}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
        <EdField label="Périodicité de paiement" k="bailPeriodicite" placeholder="Mensuel"/>
        <EdField label="Date / jour de paiement" k="bailDatePaiement" placeholder="Le 1er de chaque mois"/>
      </div>

      {/* Résiliation */}
      <SL label="RÉSILIATION"/>
      <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px" }}>
        <p style={{ fontSize:10, color:C.g2, lineHeight:1.6 }}>Le locataire peut résilier à tout moment avec un préavis d'<strong style={{ color:C.w }}>1 mois</strong> par lettre recommandée avec accusé de réception. Le bailleur ne peut pas donner congé avant le terme du bail.</p>
      </div>

      {/* Conditions particulières */}
      <SL label="CONDITIONS PARTICULIÈRES"/>
      <EdField label="Conditions particulières (optionnel)" k="bailConditions" placeholder="Clauses spécifiques, inventaire mobilier…" full/>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   DIGITAL EDL — État des Lieux Numérique
═══════════════════════════════════════════════════════════════ */
const EDL_PIECES = [
  { id:"entree", label:"Entrée / Couloir", icon:"🚪" },
  { id:"sejour", label:"Séjour / Salon", icon:"🛋️" },
  { id:"cuisine", label:"Cuisine", icon:"🍳" },
  { id:"chambre1", label:"Chambre 1", icon:"🛏️" },
  { id:"chambre2", label:"Chambre 2", icon:"🛏️" },
  { id:"sdb", label:"Salle de bain", icon:"🚿" },
  { id:"wc", label:"WC", icon:"🚽" },
  { id:"balcon", label:"Balcon / Terrasse", icon:"🌿" },
  { id:"cave", label:"Cave / Parking", icon:"🅿️" },
];
const EDL_ELEMENTS = ["Sols","Murs","Plafonds","Fenêtres","Portes","Prises / Interrupteurs","Éclairage","Placards"];
const EDL_SCORES = [{id:"TB",label:"TB",color:"#10B981",bg:"rgba(16,185,129,0.12)"},{id:"B",label:"B",color:"#3B82F6",bg:"rgba(59,130,246,0.12)"},{id:"P",label:"P",color:"#F59E0B",bg:"rgba(245,158,11,0.12)"},{id:"M",label:"M",color:"#EF4444",bg:"rgba(239,68,68,0.12)"}];
const EDL_INVENTAIRE = [
  { cat:"Literie", items:["Lit (cadre)","Matelas","Couette","Oreillers","Draps / housse","Table de chevet"] },
  { cat:"Mobilier séjour", items:["Canapé","Table basse","Meuble TV","Table à manger","Chaises","Étagère / Bibliothèque","Bureau","Chaise bureau"] },
  { cat:"Électroménager", items:["Réfrigérateur","Four / Mini-four","Micro-ondes","Plaque de cuisson","Lave-linge","Aspirateur","Bouilloire","Grille-pain","Cafetière"] },
  { cat:"Vaisselle", items:["Assiettes plates","Assiettes creuses","Verres","Tasses / Mugs","Couverts (lot)","Casseroles","Poêle","Saladier","Planche à découper"] },
  { cat:"Équipements", items:["Rideaux / Voilages","Luminaires","Tapis","Miroir","Poubelle","Fer à repasser","Séchoir à linge","Balai / Serpillière"] },
];
const EDL_CLES_TYPES = ["Porte d'entrée immeuble","Porte appartement","Boîte aux lettres","Cave","Parking","Badge / Bip","Autre"];

function EdlSectionTitle({label, icon, color}) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 8px" }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:10, fontWeight:800, letterSpacing:"0.12em", color:color||"#EC4899", fontFamily:C.mono }}>{label}</span>
      <div style={{ flex:1, height:1, background:"rgba(236,72,153,0.15)" }}/>
    </div>
  );
}

function EdlScoreBtn({score, selected, onClick}) {
  const s = EDL_SCORES.find(x=>x.id===score);
  const active = selected === score;
  return (
    <button onClick={onClick} style={{ width:36, height:32, borderRadius:7, border:active?`2px solid ${s.color}`:`1px solid ${C.border}`, background:active?s.bg:"transparent", color:active?s.color:C.g3, fontSize:11, fontWeight:active?800:600, cursor:"pointer", transition:"all 0.12s", fontFamily:C.mono }}>
      {s.label}
    </button>
  );
}

function EdlPhotoZone({photos, onAdd, label}) {
  const ref = useRef(null);
  const handleFiles = (files) => {
    [...files].forEach(f => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => onAdd(e.target.result);
      reader.readAsDataURL(f);
    });
  };
  return (
    <div style={{ marginTop:8 }}>
      <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>{label||"PHOTOS"}</p>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
        {(photos||[]).map((p,i) => (
          <div key={i} style={{ width:56, height:56, borderRadius:8, overflow:"hidden", border:"1px solid "+C.border, transition:"border-color 0.15s", cursor:"pointer" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#EC4899"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <img src={p} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          </div>
        ))}
        <input ref={ref} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>handleFiles(e.target.files)}/>
        <button onClick={()=>ref.current.click()} style={{ width:56, height:56, borderRadius:8, border:"1.5px dashed rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.04)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, cursor:"pointer", color:"#EC4899", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#EC4899";e.currentTarget.style.background="rgba(236,72,153,0.08)";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(236,72,153,0.3)";e.currentTarget.style.background="rgba(236,72,153,0.04)";}}>
          <I.Camera/>
          <span style={{ fontSize:7, fontFamily:C.mono }}>Ajouter</span>
        </button>
      </div>
    </div>
  );
}

function DigitalEDL({ tenant, bien, user, stepData, setField, onSign }) {
  const [openPiece, setOpenPiece] = useState("entree");
  const [showInventaire, setShowInventaire] = useState(false);
  const [showEdlPreview, setShowEdlPreview] = useState(false);
  const [edlHtml, setEdlHtml] = useState("");
  const edlIframeRef = useRef(null);

  // Helpers to read/write nested EDL data in stepData
  const edl = stepData._edl || {};
  const setEdl = (path, val) => {
    const next = JSON.parse(JSON.stringify(edl));
    const keys = path.split(".");
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
    obj[keys[keys.length-1]] = val;
    setField("_edl", next);
  };
  const getEdl = (path, def) => {
    let obj = edl;
    for (const k of path.split(".")) { if (!obj || obj[k] === undefined) return def; obj = obj[k]; }
    return obj;
  };

  const bienAddr = bien?.addr || tenant?.bienAddr || "";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>

      {/* ── INFO BANNER ── */}
      <div style={{ background:"linear-gradient(135deg,rgba(236,72,153,0.06),rgba(236,72,153,0.02))", border:"1px solid rgba(236,72,153,0.18)", borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
        <div style={{ width:28, height:28, borderRadius:8, background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#EC4899" }}><I.Key/></div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:"#EC4899", marginBottom:1 }}>ÉTAT DES LIEUX D'ENTRÉE</p>
          <p style={{ fontSize:11, color:C.g2 }}>Constat contradictoire — {bienAddr}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ fontSize:8, color:C.g3, fontFamily:C.mono }}>ENTRÉE</p>
          <span style={{ fontSize:9, fontWeight:700, color:"#EC4899", fontFamily:C.mono, background:"rgba(236,72,153,0.1)", border:"1px solid rgba(236,72,153,0.2)", padding:"2px 8px", borderRadius:4 }}>En cours</span>
        </div>
      </div>

      {/* ── 1. DATE & LIEU ── */}
      <EdlSectionTitle icon="📅" label="DATE & LIEU"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:4 }}>
        <div style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"10px 12px" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em", marginBottom:4 }}>DATE</p>
          <DatePickerInput value={getEdl("date","")} onChange={v=>setEdl("date",v)}/>
        </div>
        <div style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"10px 12px" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em", marginBottom:4 }}>LIEU</p>
          <input value={getEdl("lieu",bienAddr)} onChange={e=>setEdl("lieu",e.target.value)} placeholder="Adresse du bien"
            style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:600, color:C.w }}/>
        </div>
      </div>

      {/* ── 2. COMPTEURS ── */}
      <EdlSectionTitle icon="⚡" label="RELEVÉS DES COMPTEURS"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:4 }}>
        {[
          {k:"elecHP",label:"Électricité HP",unit:"kWh",icon:"⚡"},
          {k:"elecHC",label:"Électricité HC",unit:"kWh",icon:"⚡"},
          {k:"gaz",label:"Gaz",unit:"m³",icon:"🔥"},
          {k:"eauFroide",label:"Eau froide",unit:"m³",icon:"💧"},
          {k:"eauChaude",label:"Eau chaude",unit:"m³",icon:"♨️"},
        ].map(c => (
          <div key={c.k} style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:9, padding:"8px 10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
              <span style={{ fontSize:10 }}>{c.icon}</span>
              <span style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, letterSpacing:"0.08em" }}>{c.label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <input value={getEdl("compteurs."+c.k,"")} onChange={e=>setEdl("compteurs."+c.k,e.target.value)} placeholder="—"
                style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:14, fontWeight:700, color:C.w, fontFamily:C.mono, width:"100%" }}/>
              <span style={{ fontSize:9, color:C.g3 }}>{c.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. CLÉS ── */}
      <EdlSectionTitle icon="🔑" label="CLÉS REMISES"/>
      <div style={{ background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"10px 12px", marginBottom:4 }}>
        {EDL_CLES_TYPES.map(type => {
          const val = getEdl("cles."+type.replace(/[^a-zA-Z]/g,""), 0);
          return (
            <div key={type} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid "+C.border }}>
              <span style={{ fontSize:11, color:C.g1 }}>{type}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button onClick={()=>setEdl("cles."+type.replace(/[^a-zA-Z]/g,""), Math.max(0, val-1))}
                  style={{ width:24, height:24, borderRadius:6, border:"1px solid "+C.border, background:"transparent", color:C.g2, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>-</button>
                <span style={{ fontSize:14, fontWeight:800, color:C.w, fontFamily:C.mono, width:20, textAlign:"center" }}>{val}</span>
                <button onClick={()=>setEdl("cles."+type.replace(/[^a-zA-Z]/g,""), val+1)}
                  style={{ width:24, height:24, borderRadius:6, border:"1px solid rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.06)", color:"#EC4899", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
              </div>
            </div>
          );
        })}
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#EC4899", fontFamily:C.mono }}>
            Total : {EDL_CLES_TYPES.reduce((s,t) => s + (getEdl("cles."+t.replace(/[^a-zA-Z]/g,""), 0)), 0)} clé(s)
          </span>
        </div>
      </div>

      {/* ── 4. ÉTAT DES PIÈCES ── */}
      <EdlSectionTitle icon="🏠" label="ÉTAT DES PIÈCES"/>

      {/* Piece tabs */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
        {EDL_PIECES.map(p => {
          const active = openPiece === p.id;
          const filled = EDL_ELEMENTS.filter(el => getEdl("pieces."+p.id+"."+el.replace(/[^a-zA-Z]/g,""),"")).length;
          return (
            <button key={p.id} onClick={()=>setOpenPiece(p.id)} style={{
              padding:"6px 12px", borderRadius:8, border:active?"1.5px solid #EC4899":"1px solid "+C.border,
              background:active?"rgba(236,72,153,0.08)":"transparent", color:active?"#EC4899":C.g2,
              fontSize:10, fontWeight:active?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:"all 0.12s" }}>
              <span style={{ fontSize:12 }}>{p.icon}</span> {p.label}
              {filled>0 && <span style={{ fontSize:7, fontFamily:C.mono, background:active?"rgba(236,72,153,0.15)":"#1a1a1a", padding:"1px 5px", borderRadius:3, color:active?"#EC4899":C.g3 }}>{filled}/{EDL_ELEMENTS.length}</span>}
            </button>
          );
        })}
      </div>

      {/* Active piece detail */}
      {EDL_PIECES.filter(p=>p.id===openPiece).map(piece => (
        <div key={piece.id} style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:12, padding:"14px 16px", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <span style={{ fontSize:18 }}>{piece.icon}</span>
            <span style={{ fontSize:13, fontWeight:800, color:C.w }}>{piece.label}</span>
            <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
              <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>ENTRÉE</span>
            </div>
          </div>

          {/* Elements grid */}
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {/* Header */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 36px 36px 36px 36px", gap:4, padding:"0 0 4px", borderBottom:"1px solid "+C.border }}>
              <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>ÉLÉMENT</span>
              {EDL_SCORES.map(s => <span key={s.id} style={{ fontSize:8, fontFamily:C.mono, color:s.color, textAlign:"center" }}>{s.label}</span>)}
            </div>
            {EDL_ELEMENTS.map(el => {
              const elKey = el.replace(/[^a-zA-Z]/g,"");
              const current = getEdl("pieces."+piece.id+"."+elKey, "");
              return (
                <div key={el} style={{ display:"grid", gridTemplateColumns:"1fr 36px 36px 36px 36px", gap:4, alignItems:"center", padding:"4px 0" }}>
                  <span style={{ fontSize:11, color:C.g1 }}>{el}</span>
                  {EDL_SCORES.map(s => <EdlScoreBtn key={s.id} score={s.id} selected={current} onClick={()=>setEdl("pieces."+piece.id+"."+elKey, current===s.id?"":s.id)}/>)}
                </div>
              );
            })}
          </div>

          {/* Observation per room */}
          <div style={{ marginTop:8 }}>
            <input value={getEdl("pieces."+piece.id+".obs","")} onChange={e=>setEdl("pieces."+piece.id+".obs",e.target.value)}
              placeholder="Observation pour cette pièce…"
              style={{ width:"100%", background:"#111", border:"1px solid "+C.border, borderRadius:8, padding:"7px 10px", fontSize:11, color:C.w, outline:"none" }}/>
          </div>

          {/* Photos per room */}
          <EdlPhotoZone
            photos={getEdl("photos."+piece.id, [])}
            onAdd={(base64) => {
              const arr = getEdl("photos."+piece.id, []);
              setEdl("photos."+piece.id, [...arr, base64]);
            }}
            label={"PHOTOS — "+piece.label}
          />
        </div>
      ))}

      {/* ── 5. INVENTAIRE MOBILIER ── */}
      <EdlSectionTitle icon="📦" label="INVENTAIRE MOBILIER (MEUBLÉ)"/>
      <button onClick={()=>setShowInventaire(!showInventaire)}
        style={{ width:"100%", padding:"10px", borderRadius:10, border:"1px solid "+C.border, background:showInventaire?"rgba(236,72,153,0.04)":"transparent", color:showInventaire?"#EC4899":C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.15s" }}>
        <I.FileText/> {showInventaire ? "▲ Masquer l'inventaire" : "▼ Afficher l'inventaire mobilier complet"}
      </button>

      {showInventaire && (
        <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:10 }}>
          {EDL_INVENTAIRE.map(cat => (
            <div key={cat.cat} style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"12px 14px" }}>
              <p style={{ fontSize:9, fontWeight:800, letterSpacing:"0.1em", color:"#EC4899", fontFamily:C.mono, marginBottom:8 }}>{cat.cat.toUpperCase()}</p>
              {/* Header */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 60px 80px", gap:6, padding:"0 0 4px", borderBottom:"1px solid "+C.border, marginBottom:4 }}>
                <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>ARTICLE</span>
                <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3, textAlign:"center" }}>QTÉ</span>
                <span style={{ fontSize:8, fontFamily:C.mono, color:C.g3, textAlign:"center" }}>ÉTAT</span>
              </div>
              {cat.items.map(item => {
                const ik = "inv."+cat.cat.replace(/[^a-zA-Z]/g,"")+"."+item.replace(/[^a-zA-Z]/g,"");
                return (
                  <div key={item} style={{ display:"grid", gridTemplateColumns:"1fr 60px 80px", gap:6, alignItems:"center", padding:"3px 0" }}>
                    <span style={{ fontSize:11, color:C.g1 }}>{item}</span>
                    <input value={getEdl(ik+".qty","")} onChange={e=>setEdl(ik+".qty",e.target.value)} placeholder="0"
                      style={{ width:"100%", background:"#111", border:"1px solid "+C.border, borderRadius:6, padding:"3px 6px", fontSize:11, fontWeight:700, color:C.w, textAlign:"center", outline:"none", fontFamily:C.mono }}/>
                    <div style={{ display:"flex", gap:2, justifyContent:"center" }}>
                      {EDL_SCORES.map(s => {
                        const cur = getEdl(ik+".etat","");
                        const active = cur === s.id;
                        return <button key={s.id} onClick={()=>setEdl(ik+".etat",active?"":s.id)}
                          style={{ width:18, height:18, borderRadius:4, border:active?"1.5px solid "+s.color:"1px solid "+C.border, background:active?s.bg:"transparent", color:active?s.color:C.g3, fontSize:8, fontWeight:700, cursor:"pointer", fontFamily:C.mono, padding:0 }}>{s.label}</button>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── 6. OBSERVATIONS GÉNÉRALES ── */}
      <EdlSectionTitle icon="📝" label="OBSERVATIONS & RÉSERVES"/>
      <textarea value={getEdl("observations","")} onChange={e=>setEdl("observations",e.target.value)}
        placeholder="Réserves générales, remarques, éléments non conformes…"
        rows={4}
        style={{ width:"100%", background:"#0f0f0f", border:"1px solid "+C.border, borderRadius:10, padding:"12px 14px", fontSize:12, color:C.w, outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }}/>

      {/* ── 7. SIGNATURES ── */}
      <EdlSectionTitle icon="✍️" label="SIGNATURES"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {/* Bailleur */}
        <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>BAILLEUR</p>
          <p style={{ fontSize:11, fontWeight:700, color:C.w, marginBottom:8 }}>{user?.prenom||""} {user?.nom||""}</p>
          {getEdl("signBailleur","") ? (
            <div>
              <img src={getEdl("signBailleur","")} style={{ height:50, border:"1px solid "+C.border, borderRadius:6, padding:3, background:"#fff" }}/>
              <p style={{ fontSize:9, color:C.green, fontFamily:C.mono, marginTop:4 }}>✓ Signé</p>
            </div>
          ) : (
            <button onClick={()=>onSign && onSign("bailleur", (sig)=>setEdl("signBailleur",sig))}
              style={{ padding:"8px 16px", borderRadius:8, border:"1.5px dashed rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.04)", color:"#EC4899", fontSize:10, fontWeight:700, cursor:"pointer" }}>
              Signer
            </button>
          )}
        </div>
        {/* Locataire */}
        <div style={{ background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:10, padding:"12px", textAlign:"center" }}>
          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:6 }}>LOCATAIRE</p>
          <p style={{ fontSize:11, fontWeight:700, color:C.w, marginBottom:8 }}>{tenant?.prenom||""} {tenant?.nom||""}</p>
          {getEdl("signLocataire","") ? (
            <div>
              <img src={getEdl("signLocataire","")} style={{ height:50, border:"1px solid "+C.border, borderRadius:6, padding:3, background:"#fff" }}/>
              <p style={{ fontSize:9, color:C.green, fontFamily:C.mono, marginTop:4 }}>✓ Signé</p>
            </div>
          ) : (
            <button onClick={()=>onSign && onSign("locataire", (sig)=>setEdl("signLocataire",sig))}
              style={{ padding:"8px 16px", borderRadius:8, border:"1.5px dashed rgba(236,72,153,0.3)", background:"rgba(236,72,153,0.04)", color:"#EC4899", fontSize:10, fontWeight:700, cursor:"pointer" }}>
              Signer
            </button>
          )}
        </div>
      </div>

            {/* ── 8. GÉNÉRER LE DOCUMENT ── */}
      <EdlSectionTitle icon="📄" label="GÉNÉRER LE DOCUMENT"/>
      <button onClick={()=>{
        const MR = '<span style="color:#999;font-style:italic">[information requise]</span>';
        const v = (val) => val || MR;
        const fmtDate = (d) => { if (!d) return MR; const dt = new Date(d); if (isNaN(dt)) return d; return dt.toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" }); };
        const scoreColor = (s) => s==="TB"?"#059669":s==="B"?"#2563EB":s==="P"?"#D97706":s==="M"?"#DC2626":"#999";
        const scoreLabel = (s) => s==="TB"?"Très bon":s==="B"?"Bon":s==="P"?"Passable":s==="M"?"Mauvais":MR;
        const bailleurNom = ((user?.prenom||"") + " " + (user?.nom||"")).trim() || MR;
        const locataireNom = ((tenant?.prenom||"") + " " + (tenant?.nom||"")).trim() || MR;
        const bienNom = bien?.name || tenant?.bienName || MR;
        const bienAddress = bien?.addr || tenant?.bienAddr || MR;
        const bienVille = bien?.ville || tenant?.bienVille || "";
        const cptRows = [["\u00c9lectricit\u00e9 HP",getEdl("compteurs.elecHP",""),"kWh"],["\u00c9lectricit\u00e9 HC",getEdl("compteurs.elecHC",""),"kWh"],["Gaz",getEdl("compteurs.gaz",""),"m\u00b3"],["Eau froide",getEdl("compteurs.eauFroide",""),"m\u00b3"],["Eau chaude",getEdl("compteurs.eauChaude",""),"m\u00b3"]].map(r=>"<tr><td style=\"padding:6px 10px;border:1px solid #e5e7eb\">"+r[0]+"</td><td style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center;font-weight:700\">"+(r[1]||MR)+"</td><td style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center;color:#666\">"+r[2]+"</td></tr>").join("");
        const cleRows = EDL_CLES_TYPES.map(t=>{const val=getEdl("cles."+t.replace(/[^a-zA-Z]/g,""),0);return "<tr><td style=\"padding:5px 10px;border:1px solid #e5e7eb\">"+t+"</td><td style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:center;font-weight:700\">"+val+"</td></tr>";}).join("");
        const cleTotal = EDL_CLES_TYPES.reduce((s,t)=>s+(getEdl("cles."+t.replace(/[^a-zA-Z]/g,""),0)),0);
        const piecesHtml = EDL_PIECES.map(piece=>{const rows=EDL_ELEMENTS.map(el=>{const elKey=el.replace(/[^a-zA-Z]/g,"");const score=getEdl("pieces."+piece.id+"."+elKey,"");return "<tr><td style=\"padding:4px 10px;border:1px solid #e5e7eb\">"+el+"</td><td style=\"padding:4px 10px;border:1px solid #e5e7eb;text-align:center;font-weight:700;color:"+scoreColor(score)+"\">"+scoreLabel(score)+"</td></tr>";}).join("");const obs=getEdl("pieces."+piece.id+".obs","");const photos=getEdl("photos."+piece.id,[]);return "<div style=\"margin-bottom:16px;page-break-inside:avoid\"><h3 style=\"font-size:14px;font-weight:700;color:#1a1a2e;margin:0 0 6px\">"+piece.icon+" "+piece.label+"</h3><table style=\"width:100%;border-collapse:collapse;font-size:12px;margin-bottom:6px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:left\">\u00c9l\u00e9ment</th><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:center;width:120px\">\u00c9tat (Entr\u00e9e)</th></tr></thead><tbody>"+rows+"</tbody></table>"+(obs?"<p style=\"font-size:11px;color:#374151;margin:4px 0\"><strong>Observations :</strong> "+obs+"</p>":"")+(photos.length>0?"<div style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:4px\">"+photos.map(p=>"<img src=\""+p+"\" style=\"width:80px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #e5e7eb\"/>").join("")+"</div>":"")+"</div>";}).join("");
        const invHtml = EDL_INVENTAIRE.map(cat=>{const rows=cat.items.map(item=>{const ik="inv."+cat.cat.replace(/[^a-zA-Z]/g,"")+"."+item.replace(/[^a-zA-Z]/g,"");const qty=getEdl(ik+".qty","");const etat=getEdl(ik+".etat","");if(!qty&&!etat)return "";return "<tr><td style=\"padding:3px 10px;border:1px solid #e5e7eb\">"+item+"</td><td style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center\">"+(qty||"\u2014")+"</td><td style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center;color:"+scoreColor(etat)+";font-weight:600\">"+scoreLabel(etat)+"</td></tr>";}).filter(Boolean).join("");if(!rows)return "";return "<div style=\"margin-bottom:12px\"><h4 style=\"font-size:12px;color:#4B5563;margin:0 0 4px\">"+cat.cat+"</h4><table style=\"width:100%;border-collapse:collapse;font-size:11px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:left\">Article</th><th style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center;width:50px\">Qt\u00e9</th><th style=\"padding:3px 10px;border:1px solid #e5e7eb;text-align:center;width:80px\">\u00c9tat</th></tr></thead><tbody>"+rows+"</tbody></table></div>";}).filter(Boolean).join("");
        const observations = getEdl("observations","");
        const signB = getEdl("signBailleur","");
        const signL = getEdl("signLocataire","");
        const h = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>EDL</title><style>@media print{body{margin:0;padding:15px 25px}.no-print,.print-btn{display:none!important}@page{margin:10mm 12mm;size:A4}img{max-width:100%!important}table{page-break-inside:avoid}}body{font-family:-apple-system,system-ui,sans-serif;color:#111;line-height:1.5;max-width:780px;margin:0 auto;padding:32px;font-size:12px;background:#fff}h1{font-size:20px;font-weight:800;margin:0 0 2px}h2{font-size:14px;font-weight:700;color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:3px;margin:20px 0 10px;page-break-after:avoid}h3{page-break-after:avoid}.header{text-align:center;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px}.badge{display:inline-block;background:#EFF6FF;color:#2563EB;font-size:10px;font-weight:700;padding:3px 10px;border-radius:4px}.sig-box{border:1px solid #e5e7eb;border-radius:8px;padding:12px;text-align:center;min-height:100px}table{width:100%}</style></head><body>"
          +"<div class=\"header\"><div style=\"display:inline-block;width:32px;height:32px;background:#2563EB;border-radius:7px;color:#fff;font-weight:800;font-size:14px;line-height:32px;text-align:center;margin-bottom:6px\">E</div><h1>\u00c9TAT DES LIEUX D\u2019ENTR\u00c9E</h1><p style=\"color:#6b7280;font-size:11px;margin:4px 0\">EQUITY \u2014 "+new Date().toLocaleDateString("fr-FR")+"</p><span class=\"badge\">CONSTAT CONTRADICTOIRE</span></div>"
          +"<div style=\"display:flex;gap:24px;margin-bottom:16px\"><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">BAILLEUR</p><p style=\"font-weight:700\">"+v(bailleurNom)+"</p></div><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">LOCATAIRE</p><p style=\"font-weight:700\">"+v(locataireNom)+"</p></div></div>"
          +"<div style=\"display:flex;gap:24px;margin-bottom:16px\"><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">BIEN</p><p style=\"font-weight:700\">"+v(bienNom)+"</p><p style=\"color:#374151\">"+v(bienAddress)+" "+bienVille+"</p></div><div style=\"flex:1\"><p style=\"font-size:10px;color:#6b7280\">DATE</p><p style=\"font-weight:700\">"+fmtDate(getEdl("date",""))+"</p></div></div>"
          +"<h2>\u26a1 Relev\u00e9s des compteurs</h2><table style=\"width:100%;border-collapse:collapse;font-size:12px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:left\">Compteur</th><th style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center\">Relev\u00e9</th><th style=\"padding:6px 10px;border:1px solid #e5e7eb;text-align:center\">Unit\u00e9</th></tr></thead><tbody>"+cptRows+"</tbody></table>"
          +"<h2>\U0001f511 Cl\u00e9s remises</h2><table style=\"width:100%;border-collapse:collapse;font-size:12px\"><thead><tr style=\"background:#f8f9fa\"><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:left\">Type</th><th style=\"padding:5px 10px;border:1px solid #e5e7eb;text-align:center;width:60px\">Nombre</th></tr></thead><tbody>"+cleRows+"</tbody></table><p style=\"text-align:right;font-weight:700;margin-top:4px\">Total : "+cleTotal+" cl\u00e9(s)</p>"
          +"<h2>\U0001f3e0 \u00c9tat des pi\u00e8ces</h2>"+piecesHtml
          +(invHtml?"<h2>\U0001f4e6 Inventaire mobilier</h2>"+invHtml:"")
          +(observations?"<h2>\U0001f4dd Observations</h2><div style=\"background:#FEF3C7;border:1px solid #FCD34D;border-radius:6px;padding:10px 14px;font-size:12px\">"+observations+"</div>":"")
          +"<h2>\u270d\ufe0f Signatures</h2><div style=\"display:flex;gap:20px\"><div style=\"flex:1\" class=\"sig-box\"><p style=\"font-size:10px;color:#6b7280\">LE BAILLEUR</p><p style=\"font-weight:700;margin-bottom:8px\">"+v(bailleurNom)+"</p>"+(signB?"<img src=\""+signB+"\" style=\"height:60px;border:1px solid #e5e7eb;border-radius:4px;padding:4px;background:#fff\"/><p style=\"font-size:10px;color:#059669;margin-top:4px\">\u2713 Sign\u00e9</p>":"<div style=\"height:60px;border:2px dashed #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:11px\">Signature du bailleur</div>")+"</div>"
          +"<div style=\"flex:1\" class=\"sig-box\"><p style=\"font-size:10px;color:#6b7280\">LE LOCATAIRE</p><p style=\"font-weight:700;margin-bottom:8px\">"+v(locataireNom)+"</p>"+(signL?"<img src=\""+signL+"\" style=\"height:60px;border:1px solid #e5e7eb;border-radius:4px;padding:4px;background:#fff\"/><p style=\"font-size:10px;color:#059669;margin-top:4px\">\u2713 Sign\u00e9</p>":"<div style=\"height:60px;border:2px dashed #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:11px\">Signature du locataire</div>")+"</div></div>"
          +"<div style=\"text-align:center;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px\"><button onclick=\"this.style.display='none';window.print();setTimeout(function(){document.querySelector('.print-btn').style.display='inline-flex'},1000)\" class=\"print-btn\" style=\"display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;border:none;background:#EC4899;color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:12px\">\ud83d\udda8\ufe0f Imprimer / Enregistrer en PDF</button><p style=\"color:#9ca3af;font-size:10px\">EQUITY \u2014 "+new Date().toLocaleString("fr-FR")+"<br/>Constat amiable de l\u2019\u00e9tat du logement.</p></div></body></html>";
        setEdlHtml(h);
        setShowEdlPreview(true);
      }}
        style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#EC4899,#BE185D)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:"0 4px 20px rgba(236,72,153,0.3)", transition:"all 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 28px rgba(236,72,153,0.5)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(236,72,153,0.3)";}}>
        <I.FileText/> G\u00e9n\u00e9rer l'\u00e9tat des lieux (PDF)
      </button>

      {/* EDL Preview Modal */}
      {showEdlPreview && (<>
        <div onClick={()=>setShowEdlPreview(false)} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)" }}/>
        <div style={{ position:"fixed", top:"3vh", left:"50%", transform:"translateX(-50%)", zIndex:401, width:"min(820px,94vw)", height:"94vh", background:"#111", border:"1px solid "+C.border, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.7)", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"14px 20px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"#0a0a0a" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#EC4899" }}><I.FileText/></div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:800, color:C.w }}>\u00c9tat des lieux d'entr\u00e9e</p>
              <p style={{ fontSize:10, color:C.g2 }}>Ctrl+P ou bouton Imprimer \u2192 Enregistrer en PDF</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>{try{edlIframeRef.current.contentWindow.print();}catch(e){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([edlHtml],{type:"text/html"}));a.download="EDL_"+new Date().toISOString().slice(0,10)+".html";a.click();}}}
                style={{ padding:"8px 18px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#EC4899,#BE185D)", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 12px rgba(236,72,153,0.3)" }}>
                <I.FileText/> Imprimer / PDF
              </button>
              <button onClick={()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([edlHtml],{type:"text/html"}));a.download="EDL_"+new Date().toISOString().slice(0,10)+".html";a.click();}}
                style={{ padding:"8px 14px", borderRadius:9, border:"1px solid "+C.border2, background:"#1a1a1a", color:C.g1, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                <I.Download/> HTML
              </button>
              <button onClick={()=>setShowEdlPreview(false)}
                style={{ width:32, height:32, borderRadius:8, border:"1px solid "+C.border2, background:"#1a1a1a", color:C.g2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <I.X/>
              </button>
            </div>
          </div>
          <iframe ref={edlIframeRef} srcDoc={edlHtml} style={{ flex:1, border:"none", width:"100%", background:"#fff", borderRadius:"0 0 18px 18px" }} title="EDL" sandbox="allow-same-origin allow-modals allow-scripts"/>
        </div>
      </>)}
    </div>
  );
}

function GestionTab({ tenant, assets, user, onUpdateTenant }) {
  const [activeStep, setActiveStep] = useState(0);
  const [stepData, setStepData] = useState({});
  const [stepStatus, setStepStatus] = useState({}); // step.id → "pending"|"inprogress"|"done"
  const [confFiles, setConfFiles] = useState({ assurance:[], energie:[] });
  const [confAnalyzing, setConfAnalyzing] = useState({ assurance:false, energie:false });
  const [confDone, setConfDone] = useState({ assurance:false, energie:false });
  const [showAttachPicker, setShowAttachPicker] = useState(false);
  const [attachSearch, setAttachSearch] = useState("");
  const [showDetachConfirm, setShowDetachConfirm] = useState(false);

  // ── Accord de principe flow ──
  const [accordEmail, setAccordEmail] = useState(tenant.mail || "");
  const [editingEmail, setEditingEmail] = useState(false);
  const [accordStatus, setAccordStatus] = useState(null); // null → "sending" → "sent" → "signed"
  const [accordSignature, setAccordSignature] = useState(null); // base64 signature
  const [accordSentDate, setAccordSentDate] = useState(null);
  const [accordSignedDate, setAccordSignedDate] = useState(null);
  const [showAccordPreview, setShowAccordPreview] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showBailPreview, setShowBailPreview] = useState(false);
  const [signatureCallback, setSignatureCallback] = useState(null);

  const saveEmail = (newEmail) => {
    setAccordEmail(newEmail);
    setEditingEmail(false);
    if (onUpdateTenant && newEmail !== tenant.mail) {
      onUpdateTenant({ ...tenant, mail: newEmail });
    }
  };

  const buildBailHtml = (mode) => {
    const preview = mode === "preview";
    const MISSING = '<span style="color:#888;font-style:italic;font-size:11px">[information requise]</span>';
    const M = (v, label) => {
      if (v && v !== "\u2014" && v !== "") return v;
      if (preview) return '<span style="color:#EF4444;font-weight:700;font-style:italic;font-size:11px">\u26a0 info manquante' + (label ? ' (' + label + ')' : '') + '</span>';
      return MISSING;
    };
    const bailleurName = (user?.prenom||"") + " " + (user?.nom||"");
    const bailleurNameD = bailleurName.trim() || MISSING;
    const prenomNom = (tenant.prenom||"") + " " + (tenant.nom||"");
    const prenomNomD = prenomNom.trim() || MISSING;
    const ci = tenant.ocrData?.carte_identite || {};
    const garants = tenant.garantsOcr || [];
    const bienAddr = [bien?.addr||"",bien?.addr2||""].filter(Boolean).join(", ") || tenant.bienAddr || "";
    const bienVille = bien?.ville || tenant.bienVille || "";
    const bienCP = bien?.codePostal || tenant.bienCodePostal || "";
    const loyerVal = bien?.loyer || tenant.loyerHC || "";
    const chargesVal = String(bien?.chargesLocatives || tenant.chargesLoc || "");
    const surface = bien?.surface || tenant.bienSurface || "";
    const rooms = bien?.rooms || tenant.bienRooms || "";
    const bienType = bien?.type || tenant.bienType || "";
    const etage = bien?.etage || "";
    const dpe = bien?.dpe || tenant.bienDpe || "";
    const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10) || 0;
    const chargesNum = parseInt(String(chargesVal).replace(/[^\d]/g,""),10) || 0;
    const totalMensuel = loyerNum + chargesNum;
    const today = new Date().toLocaleDateString("fr-FR");
    const motif = stepData.bailMotif || "";
    const duree = stepData.bailDuree || "";
    const dateEffet = stepData.bailDateEffet || "";
    const equipements = stepData.bailEquipements || "";
    const conditions = stepData.bailConditions || "";
    const periodicite = stepData.bailPeriodicite || "Mensuel";
    const datePaiement = stepData.bailDatePaiement || "le 1er de chaque mois";
    const garantsStr = garants.length > 0 ? garants.map(function(g){ return (g?.carte_identite?.prenom||"?") + " " + (g?.carte_identite?.nom||"?"); }).join(", ") : "";

    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bail Mobilit\u00e9 \u2014 EQUITY</title>' +
'<style>' +
'@media print{body{margin:0;padding:20px 35px}.no-print{display:none!important}@page{margin:14mm 18mm;size:A4}}' +
'body{font-family:Georgia,"Times New Roman",serif;color:#1a1a2e;line-height:1.65;max-width:700px;margin:0 auto;padding:40px;font-size:12.5px;background:#fff}' +
'h1{font-family:-apple-system,system-ui,sans-serif;font-size:22px;font-weight:800;text-align:center;letter-spacing:0.18em;margin:0 0 2px;text-transform:uppercase;color:#1a1a2e}' +
'.header-sub{font-family:-apple-system,system-ui,sans-serif;text-align:center;font-size:10px;color:#6b7280;letter-spacing:0.04em;margin-bottom:4px}' +
'.header-ref{font-family:-apple-system,system-ui,sans-serif;text-align:center;font-size:10px;color:#1a1a2e;font-weight:600;margin-bottom:4px}' +
'.header-line{width:100%;height:2px;background:linear-gradient(90deg,transparent,#1a1a2e,transparent);margin:10px 0 20px}' +
'.section-title{font-family:-apple-system,system-ui,sans-serif;font-size:9px;font-weight:800;letter-spacing:0.14em;color:#6b7280;text-transform:uppercase;margin:24px 0 8px;padding:6px 0;border-bottom:1px solid #e5e7eb}' +
'h2{font-family:-apple-system,system-ui,sans-serif;font-size:13px;font-weight:700;color:#1a1a2e;margin:20px 0 8px;text-transform:uppercase;letter-spacing:0.02em}' +
'.party-block{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:14px 18px;margin:8px 0}' +
'.party-block .role{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.12em;color:#2563EB;text-transform:uppercase;margin-bottom:8px}' +
'.field-row{display:flex;margin-bottom:3px;font-size:12px}.field-row .lbl{color:#6b7280;min-width:160px;flex-shrink:0}.field-row .val{font-weight:600;color:#111}' +
'.article{margin:16px 0}.article p{margin:4px 0;text-align:justify}' +
'.article ul{margin:4px 0 4px 20px}.article li{margin-bottom:3px}' +
'.warn-box{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;font-size:11px;color:#92400e;margin:8px 0}' +
'.red-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:10px 14px;font-size:11px;color:#991b1b;margin:8px 0}' +
'.fin-table{width:100%;border-collapse:collapse;margin:8px 0;font-size:12px}' +
'.fin-table td{padding:7px 12px;border-bottom:1px solid #f3f4f6}.fin-table td:last-child{font-weight:700;text-align:right;font-family:monospace;color:#1a1a2e}' +
'.fin-table tr.total td{border-top:2px solid #1a1a2e;font-weight:800;font-size:13px}' +
'.sig-block{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:36px;padding-top:20px;border-top:2px solid #1a1a2e}' +
'.sig-col{text-align:center}.sig-col .role{font-family:-apple-system,system-ui,sans-serif;font-size:10px;font-weight:800;letter-spacing:0.1em;color:#1a1a2e;text-transform:uppercase;margin-bottom:6px}' +
'.sig-col .name{font-size:13px;font-weight:700;margin-bottom:4px}' +
'.sig-col .mention{font-size:10px;color:#6b7280;font-style:italic;margin-bottom:10px}' +
'.sig-box{width:100%;height:80px;border:1.5px dashed #d1d5db;border-radius:6px}' +
'.footer{text-align:center;font-family:-apple-system,system-ui,sans-serif;color:#9ca3af;font-size:8.5px;margin-top:28px;padding-top:10px;border-top:1px solid #e5e7eb;letter-spacing:0.02em}' +
'.footer strong{color:#6b7280}' +
'.print-btn{position:fixed;top:16px;right:16px;background:#1a1a2e;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:100;font-family:-apple-system,system-ui,sans-serif}' +
'</style></head><body>' +
(preview ? "" : '<button class="no-print print-btn" onclick="window.print()">Imprimer / PDF</button>') +

'<h1>BAIL MOBILIT\u00c9</h1>' +
'<div class="header-ref">Loi n\u00b089-462 du 6 juillet 1989 \u2014 Articles 25-3 \u00e0 25-11</div>' +
'<div class="header-sub">Modifi\u00e9e par la loi ELAN n\u00b02018-1021 du 23 novembre 2018</div>' +
'<div class="header-sub">Logement meubl\u00e9 \u00e0 usage de r\u00e9sidence temporaire</div>' +
'<div class="header-line"></div>' +

'<div class="section-title">ENTRE LES SOUSSIGN\u00c9S</div>' +

'<div class="party-block"><div class="role">LE BAILLEUR</div>' +
'<div class="field-row"><div class="lbl">Nom / Raison sociale :</div><div class="val">' + M(bailleurNameD,"nom bailleur") + '</div></div>' +
'<div class="field-row"><div class="lbl">Adresse :</div><div class="val">' + M(user?.email,"adresse bailleur") + '</div></div>' +
'<div class="field-row"><div class="lbl">T\u00e9l\u00e9phone :</div><div class="val">' + M(user?.telephone,"t\u00e9l\u00e9phone bailleur") + '</div></div>' +
'<div class="field-row"><div class="lbl">Email :</div><div class="val">' + M(user?.email,"email bailleur") + '</div></div>' +
'</div>' +

'<div class="party-block"><div class="role">LE LOCATAIRE</div>' +
'<div class="field-row"><div class="lbl">Nom & Pr\u00e9nom :</div><div class="val">' + M(prenomNomD,"nom locataire") + '</div></div>' +
'<div class="field-row"><div class="lbl">Date de naissance :</div><div class="val">' + M(ci.date_naissance || tenant.dateNaissance,"date de naissance") + '</div></div>' +
'<div class="field-row"><div class="lbl">Lieu de naissance :</div><div class="val">' + M(ci.lieu_naissance || tenant.lieuNaissance,"lieu de naissance") + '</div></div>' +
'<div class="field-row"><div class="lbl">Nationalit\u00e9 :</div><div class="val">' + M(ci.nationalite || tenant.nationalite,"nationalit\u00e9") + '</div></div>' +
'<div class="field-row"><div class="lbl">Adresse actuelle :</div><div class="val">' + M(tenant.adresse,"adresse locataire") + '</div></div>' +
'<div class="field-row"><div class="lbl">Code postal / Ville :</div><div class="val">' + M(tenant.ville,"ville locataire") + '</div></div>' +
'</div>' +

(garantsStr ? '<div class="party-block"><div class="role">GARANT(S)</div><div class="field-row"><div class="lbl">Nom(s) :</div><div class="val">' + garantsStr + '</div></div></div>' : "") +

'<p style="text-align:center;font-weight:600;margin:16px 0">Il a \u00e9t\u00e9 convenu et arr\u00eat\u00e9 ce qui suit :</p>' +

'<h2>ARTICLE 1 \u2013 OBJET DU CONTRAT</h2>' +
'<div class="article"><p>Le bailleur loue au locataire le logement meubl\u00e9 d\u00e9sign\u00e9 ci-apr\u00e8s, \u00e0 titre de r\u00e9sidence temporaire, conform\u00e9ment aux articles 25-3 \u00e0 25-11 de la loi n\u00b089-462 du 6 juillet 1989 modifi\u00e9e par la loi ELAN n\u00b02018-1021 du 23 novembre 2018. Le pr\u00e9sent contrat est conclu en consid\u00e9ration de la situation de mobilit\u00e9 du locataire, laquelle constitue une condition essentielle et d\u00e9terminante dudit bail.</p></div>' +

'<h2>ARTICLE 2 \u2013 D\u00c9SIGNATION DU LOGEMENT</h2>' +
'<div class="article">' +
'<div class="field-row"><div class="lbl">Adresse :</div><div class="val">' + M(bienAddr,"adresse logement") + '</div></div>' +
'<div class="field-row"><div class="lbl">Code postal / Ville :</div><div class="val">' + M(bienCP,"code postal") + ' ' + M(bienVille,"ville") + '</div></div>' +
'<div class="field-row"><div class="lbl">Nature du bien :</div><div class="val">' + M(bienType,"type de bien") + '</div></div>' +
'<div class="field-row"><div class="lbl">Surface habitable :</div><div class="val">' + M(surface ? surface + " m\u00b2" : "","surface") + '</div></div>' +
'<div class="field-row"><div class="lbl">Nombre de pi\u00e8ces :</div><div class="val">' + M(rooms,"nb pi\u00e8ces") + '</div></div>' +
'<div class="field-row"><div class="lbl">\u00c9tage :</div><div class="val">' + M(etage,"\u00e9tage") + '</div></div>' +
'<div class="field-row"><div class="lbl">DPE :</div><div class="val">' + M(dpe ? "Classe " + dpe : "","DPE") + '</div></div>' +
'<div class="field-row"><div class="lbl">\u00c9quipements :</div><div class="val">' + M(equipements,"\u00e9quipements") + '</div></div>' +
'</div>' +

'<h2>ARTICLE 3 \u2013 DESTINATION DES LIEUX</h2>' +
'<div class="article"><p>Le logement est lou\u00e9 \u00e0 usage exclusif d\u2019habitation meubl\u00e9e, \u00e0 titre de r\u00e9sidence temporaire. Il ne pourra \u00eatre utilis\u00e9 \u00e0 des fins commerciales, artisanales ou professionnelles. Toute sous-location totale ou partielle ainsi que toute cession du bail sont interdites sans l\u2019accord expr\u00e8s et \u00e9crit pr\u00e9alable du bailleur.</p></div>' +

'<h2>ARTICLE 4 \u2013 DUR\u00c9E DU BAIL</h2>' +
'<div class="article"><p>Le pr\u00e9sent bail est consenti pour une dur\u00e9e de <strong>' + M(duree,"dur\u00e9e") + '</strong>, prenant effet le <strong>' + M(dateEffet,"date d\u2019effet") + '</strong>.</p>' +
'<p>Conform\u00e9ment \u00e0 l\u2019article 25-7 de la loi du 6 juillet 1989, le pr\u00e9sent bail ne peut \u00eatre ni renouvel\u00e9, ni reconduit. \u00c0 son terme, si le locataire maintient l\u2019occupation des lieux, le bailleur peut saisir la juridiction comp\u00e9tente afin d\u2019obtenir la lib\u00e9ration des lieux sans qu\u2019il soit n\u00e9cessaire de d\u00e9livrer un cong\u00e9 pr\u00e9alable.</p></div>' +

'<h2>ARTICLE 5 \u2013 LOYER ET CHARGES</h2>' +
'<div class="article">' +
'<table class="fin-table">' +
'<tr><td>Loyer mensuel hors charges</td><td>' + M(loyerVal ? loyerVal + " \u20ac" : "","loyer") + '</td></tr>' +
'<tr><td>Forfait de charges locatives</td><td>' + M(chargesVal ? chargesVal + " \u20ac/mois" : "","charges") + '</td></tr>' +
'<tr class="total"><td>Montant mensuel total (loyer + charges)</td><td>' + (totalMensuel > 0 ? totalMensuel + " \u20ac" : M("","montant total")) + '</td></tr>' +
'</table>' +
'<p>Le loyer est payable ' + periodicite.toLowerCase() + ', ' + datePaiement + ', d\u2019avance et sans escompte.</p>' +
'</div>' +

'<h2>ARTICLE 6 \u2013 D\u00c9P\u00d4T DE GARANTIE</h2>' +
'<div class="red-box"><strong>Conform\u00e9ment \u00e0 l\u2019article 25-7 de la loi n\u00b089-462 du 6 juillet 1989, aucun d\u00e9p\u00f4t de garantie ne peut \u00eatre exig\u00e9 du locataire dans le cadre du pr\u00e9sent bail mobilit\u00e9.</strong> Le bailleur peut recourir au dispositif Visale propos\u00e9 par Action Logement (visale.fr).</div>' +

'<h2>ARTICLE 7 \u2013 MOTIF DE MOBILIT\u00c9</h2>' +
'<div class="article"><p>Le locataire justifie sa situation de mobilit\u00e9 professionnelle ou de formation au titre de : <strong>' + M(motif,"motif de mobilit\u00e9") + '</strong>.</p>' +
'<p>Le locataire s\u2019engage \u00e0 produire au bailleur, dans les quinze (15) jours suivant la signature des pr\u00e9sentes, tout justificatif attestant de ladite situation de mobilit\u00e9.</p></div>' +

'<h2>ARTICLE 8 \u2013 OBLIGATIONS DU BAILLEUR</h2>' +
'<div class="article"><p>Le bailleur s\u2019engage \u00e0 :</p><ul>' +
'<li>D\u00e9livrer un logement d\u00e9cent (d\u00e9cret n\u00b02002-120 du 30 janvier 2002) en bon \u00e9tat d\u2019usage et de r\u00e9paration ;</li>' +
'<li>Assurer au locataire la jouissance paisible du logement et le garantir des vices ou d\u00e9fauts ;</li>' +
'<li>Entretenir les locaux en \u00e9tat de servir \u00e0 l\u2019usage pr\u00e9vu ;</li>' +
'<li>Remettre gratuitement un exemplaire original du pr\u00e9sent contrat.</li>' +
'</ul></div>' +

'<h2>ARTICLE 9 \u2013 OBLIGATIONS DU LOCATAIRE</h2>' +
'<div class="article"><p>Le locataire s\u2019engage \u00e0 :</p><ul>' +
'<li>Payer le loyer et les charges aux termes convenus ;</li>' +
'<li>User paisiblement des locaux lou\u00e9s suivant la destination pr\u00e9vue ;</li>' +
'<li>R\u00e9pondre des d\u00e9gradations et pertes survenues pendant la dur\u00e9e du contrat ;</li>' +
'<li>Souscrire une assurance contre les risques locatifs et en justifier \u00e0 la remise des cl\u00e9s ;</li>' +
'<li>Ne pas transformer les lieux lou\u00e9s sans l\u2019accord \u00e9crit pr\u00e9alable du bailleur ;</li>' +
'<li>Laisser ex\u00e9cuter les travaux d\u2019am\u00e9lioration ou de mise en conformit\u00e9.</li>' +
'</ul></div>' +

(conditions ? '<h2>ARTICLE 10 \u2013 CLAUSES PARTICULI\u00c8RES</h2><div class="article"><p>' + conditions + '</p></div>' : '') +

'<h2>ARTICLE ' + (conditions ? "11" : "10") + ' \u2013 DISPOSITIONS G\u00c9N\u00c9RALES</h2>' +
'<div class="article"><p>Le pr\u00e9sent bail est soumis aux dispositions d\u2019ordre public de la loi n\u00b089-462 du 6 juillet 1989, notamment ses articles 25-3 \u00e0 25-11 relatifs au bail mobilit\u00e9 tels qu\u2019issus de la loi ELAN n\u00b02018-1021 du 23 novembre 2018.</p>' +
'<p>Pour tout litige relatif \u00e0 l\u2019ex\u00e9cution ou \u00e0 l\u2019interpr\u00e9tation du pr\u00e9sent contrat, les parties s\u2019engagent \u00e0 rechercher une solution amiable pr\u00e9alablement \u00e0 tout recours judiciaire. Le locataire fait \u00e9lection de domicile dans le logement lou\u00e9 pour la dur\u00e9e du pr\u00e9sent bail.</p></div>' +

'<div class="section-title">FAIT ET SIGN\u00c9</div>' +
'<p style="text-align:center;margin-bottom:24px">Fait \u00e0 ' + M(bienVille,"ville") + ', le ' + today + ', en deux (2) exemplaires originaux, dont un remis \u00e0 chacune des parties.</p>' +

'<div class="sig-block">' +
'<div class="sig-col"><div class="role">LE BAILLEUR</div><div class="name">' + bailleurNameD + '</div><div class="mention">Pr\u00e9c\u00e9d\u00e9 de la mention \u00ab Lu et approuv\u00e9 \u00bb</div><div class="sig-box"></div></div>' +
'<div class="sig-col"><div class="role">LE LOCATAIRE</div><div class="name">' + prenomNomD + '</div><div class="mention">Pr\u00e9c\u00e9d\u00e9 de la mention \u00ab Lu et approuv\u00e9 \u00bb</div><div class="sig-box"></div></div>' +
'</div>' +

'<div class="footer">BAIL MOBILIT\u00c9 \u00b7 Loi n\u00b089-462 du 6 juillet 1989 modifi\u00e9e par loi ELAN n\u00b02018-1021 du 23 novembre 2018 \u00b7 <strong>G\u00e9n\u00e9r\u00e9 par EQUITY</strong> \u00b7 ' + today + '</div>' +
'</body></html>';
  };

  const downloadBailMobilite = () => {
    const html = buildBailHtml("download");
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const bienName = bien?.name||tenant.bienName||"bien";
    a.download = "Bail_Mobilite_" + (tenant.nom||"locataire").replace(/\s/g,"_") + "_" + bienName.replace(/\s/g,"_") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };


  const downloadAccordPDF = () => {
    const MR = '<span style="color:#888;font-style:italic">[information requise]</span>';
    const bailleurName = `${user?.prenom||""} ${user?.nom||""}`.trim() || MR;
    const bienName = bien?.name || tenant.bienName || MR;
    const bienAddress = [bien?.addr||"", bien?.addr2||"", bien?.batiment||"", bien?.ville||"", bien?.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || MR;
    const loyerVal = bien?.loyer || tenant.loyerHC || MR;
    const chargesVal = bien?.chargesLocatives || tenant.chargesLoc || MR;
    const depotVal = tenant.depotGarantieCalc || MR;
    const bailDuree = tenant.dureeBail || MR;
    const bienType = bien?.type || tenant.bienType || MR;
    const bienSurface = bien?.surface || tenant.bienSurface || MR;
    const bienDpe = bien?.dpe || tenant.bienDpe || MR;
    const prenomNom = `${tenant.prenom||""} ${tenant.nom||""}`.trim();
    const ci = tenant.ocrData?.carte_identite || {};
    const garants = tenant.garantsOcr || [];
    const today = new Date().toLocaleDateString("fr-FR");
    const expiry = new Date(Date.now() + 72*3600000).toLocaleDateString("fr-FR");
    const signatureHtml = accordSignature
      ? "<div style=\"margin-top:8px\"><img src=\""+accordSignature+"\" style=\"height:60px;border:1px solid #e5e7eb;border-radius:4px;padding:4px;background:#fff\"/></div><p style=\"font-size:11px;color:#10B981;margin-top:4px\">✓ Signé le "+(accordSignedDate||today)+"</p>"
      : `<div style="width:100%;height:80px;border:2px dashed #d1d5db;border-radius:8px;margin-top:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:13px">Signature du preneur</div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Accord de Principe — ${bienName}</title>
<style>
@media print { body{margin:0;padding:20px 40px} .no-print{display:none!important} @page{margin:15mm 20mm} }
body{font-family:-apple-system,system-ui,sans-serif;color:#111;line-height:1.6;max-width:720px;margin:0 auto;padding:40px;font-size:13px}
h1{font-size:22px;font-weight:800;letter-spacing:-0.03em;margin:0 0 4px}
h2{font-size:14px;font-weight:700;color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:4px;margin:24px 0 12px;letter-spacing:0.02em}
.header{text-align:center;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px}
.header .logo{display:inline-block;width:36px;height:36px;background:#2563EB;border-radius:8px;color:#fff;font-weight:800;font-size:16px;line-height:36px;text-align:center;margin-bottom:8px}
.header .sub{color:#6b7280;font-size:11px;letter-spacing:0.1em;text-transform:uppercase}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px}
.field{margin-bottom:4px}.field .lbl{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:1px}.field .val{font-size:13px;font-weight:600}
.table{width:100%;border-collapse:collapse;margin:8px 0}
.table th{text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;padding:6px 12px;border-bottom:1px solid #e5e7eb}
.table td{padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}
.table td:last-child{font-weight:700;text-align:right;font-family:monospace}
.conditions{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin:8px 0}
.conditions li{margin-bottom:6px}
.legal{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-size:11px;color:#6b7280;font-style:italic;margin-top:12px}
.sig-block{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb}
.sig-col{text-align:center}
.sig-col .role{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px}
.sig-col .name{font-size:13px;font-weight:700;margin-bottom:8px}
.print-btn{position:fixed;top:20px;right:20px;background:#2563EB;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,0.3)}
.print-btn:hover{background:#1d4ed8}
</style></head><body>
<button class="no-print print-btn" onclick="window.print()">Imprimer / Enregistrer PDF</button>
<div class="header">
<div class="logo">E</div>
<h1>Accord de Principe</h1>
<div class="sub">EQUITY · Gestion Patrimoniale · ${today}</div>
</div>

<h2>1 · Identification des Parties</h2>
<div class="grid">
<div class="field"><div class="lbl">Le Bailleur</div><div class="val">${bailleurName}</div></div>
<div class="field"><div class="lbl">Adresse de gestion</div><div class="val">${user?.email||"—"}</div></div>
<div class="field"><div class="lbl">Le Preneur</div><div class="val">${prenomNom}</div></div>
<div class="field"><div class="lbl">Date de naissance</div><div class="val">${ci.date_naissance||tenant.dateNaissance||"—"}</div></div>
<div class="field"><div class="lbl">Nationalité</div><div class="val">${ci.nationalite||tenant.nationalite||"—"}</div></div>
<div class="field"><div class="lbl">Employeur</div><div class="val">${ci.employeur||tenant.employeur||"—"}</div></div>
</div>
${garants.length>0?"<p style=\"font-size:11px;color:#6b7280;margin-top:8px\"><strong>Garant(s) :</strong> "+garants.map((g,i)=>(g?.carte_identite?.prenom||"?")+" "+(g?.carte_identite?.nom||"?")).join(", ")+"</p>":""}

<h2>2 · Désignation du Bien</h2>
<div class="grid">
<div class="field" style="grid-column:span 2"><div class="lbl">Adresse exacte</div><div class="val">${bienAddress}</div></div>
<div class="field"><div class="lbl">Type / Description</div><div class="val">${bienType} · ${bienSurface} m²</div></div>
<div class="field"><div class="lbl">DPE</div><div class="val">Classe ${bienDpe}</div></div>
<div class="field" style="grid-column:span 2"><div class="lbl">Usage</div><div class="val">Habitation exclusivement</div></div>
</div>

<h2>3 · Conditions Financières</h2>
<table class="table">
<thead><tr><th>Poste</th><th>Détail</th></tr></thead>
<tbody>
<tr><td>Loyer hors charges</td><td>${loyerVal} €/mois</td></tr>
<tr><td>Provisions sur charges</td><td>${chargesVal} €/mois</td></tr>
<tr><td>Dépôt de garantie</td><td>${depotVal} €</td></tr>
<tr><td>Honoraires / Frais</td><td>—</td></tr>
</tbody>
</table>

<h2>4 · Calendrier d'Entrée</h2>
<div class="grid">
<div class="field"><div class="lbl">Durée du bail</div><div class="val">${bailDuree}</div></div>
<div class="field"><div class="lbl">Date de prise d'effet</div><div class="val">${stepData.datePriseEffet||"À définir"}</div></div>
</div>

<h2>5 · Conditions Suspensives</h2>
<div class="conditions">
<p style="font-size:11px;font-weight:700;margin-bottom:8px">L'accord est conditionné à la réalisation des éléments suivants :</p>
<ol style="margin:0;padding-left:20px">
<li>Fourniture de l'<strong>attestation d'assurance habitation</strong> couvrant les risques locatifs.</li>
<li>Paiement du <strong>dépôt de garantie</strong> (${depotVal} €) et du <strong>1er loyer</strong> (${loyerVal} €).</li>
<li>Validation définitive de la <strong>caution</strong> (acte de cautionnement signé).</li>
</ol>
</div>

<h2>6 · Validité et Désengagement</h2>
<p>Cet accord est valable <strong>72 heures</strong>, soit jusqu'au <strong>${expiry}</strong>. Passé ce délai, le bien sera remis sur le marché.</p>
<div class="legal">
Cet accord de principe ne vaut pas bail et ne constitue pas un engagement définitif. L'entrée dans les lieux est strictement conditionnée à la signature du contrat de location définitif et à la réalisation de l'ensemble des conditions suspensives mentionnées ci-dessus.
</div>

<div class="sig-block">
<div class="sig-col">
<div class="role">Le Bailleur</div>
<div class="name">${bailleurName}</div>
<div style="width:100%;height:80px;border:2px dashed #d1d5db;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-style:italic;font-size:12px">Signature du bailleur</div>
<p style="font-size:11px;color:#9ca3af;margin-top:6px">Fait à ____________, le ${today}</p>
</div>
<div class="sig-col">
<div class="role">Le Preneur</div>
<div class="name">${prenomNom}</div>
${signatureHtml}
<p style="font-size:11px;color:#9ca3af;margin-top:6px">Fait à ____________, le ${today}</p>
</div>
</div>

<p style="text-align:center;color:#9ca3af;font-size:10px;margin-top:30px;border-top:1px solid #e5e7eb;padding-top:12px">
Document généré par EQUITY · Gestion Patrimoniale Intelligente · ${today}
</p>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Accord_Principe_${(tenant.nom||"locataire").replace(/\s/g,"_")}_${(bien?.name||tenant.bienName||"bien").replace(/\s/g,"_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const sendAccord = () => {
    if (!accordEmail) return;
    // Build email content
    const bailleurName = `${user?.prenom||""} ${user?.nom||""}`.trim() || "Le bailleur";
    const bienName = bien?.name || tenant.bienName || "le bien";
    const bienAddress = [bien?.addr||"", bien?.ville||tenant.bienVille||""].filter(Boolean).join(", ");
    const loyerVal = bien?.loyer || tenant.loyerHC || "—";
    const chargesVal = bien?.chargesLocatives || tenant.chargesLoc || "—";
    const depotVal = tenant.depotGarantieCalc || "—";
    const bailDuree = tenant.dureeBail || "—";
    const today = new Date().toLocaleDateString("fr-FR");
    const expiry = new Date(Date.now() + 72*3600000).toLocaleDateString("fr-FR");

    const subject = `Accord de Principe — ${bienName} — EQUITY`;
    const body = [
      `Bonjour ${tenant.prenom||""},`,
      ``,
      `Suite à notre échange, nous avons le plaisir de vous transmettre l'accord de principe pour votre future location.`,
      ``,
      `═══════════════════════════════`,
      `BIEN CONCERNÉ`,
      `═══════════════════════════════`,
      `Bien : ${bienName}`,
      `Adresse : ${bienAddress}`,
      `Type : ${bien?.type||tenant.bienType||"—"}`,
      `Surface : ${bien?.surface||tenant.bienSurface||"—"} m²`,
      ``,
      `═══════════════════════════════`,
      `CONDITIONS FINANCIÈRES`,
      `═══════════════════════════════`,
      `Loyer hors charges : ${loyerVal} €/mois`,
      `Charges locatives : ${chargesVal} €/mois`,
      `Dépôt de garantie : ${depotVal} €`,
      `Durée du bail : ${bailDuree}`,
      ``,
      `═══════════════════════════════`,
      `PARTIES`,
      `═══════════════════════════════`,
      `Bailleur : ${bailleurName}`,
      `Preneur : ${tenant.prenom||""} ${tenant.nom||""}`,
      tenant.garantsOcr?.length > 0 ? "Garant(s) : "+tenant.garantsOcr.map((g,i)=>(g?.carte_identite?.prenom||"?")+" "+(g?.carte_identite?.nom||"?")).join(", ") : "",
      ``,
      `═══════════════════════════════`,
      `CONDITIONS SUSPENSIVES`,
      `═══════════════════════════════`,
      `Cet accord est conditionné à :`,
      `1. Fourniture de l'attestation d'assurance habitation`,
      `2. Paiement du dépôt de garantie (${depotVal} €) + 1er loyer (${loyerVal} €)`,
      `3. Validation de la caution (acte de cautionnement signé)`,
      ``,
      `═══════════════════════════════`,
      `VALIDITÉ`,
      `═══════════════════════════════`,
      `Cet accord est valable 72 heures, soit jusqu'au ${expiry}.`,
      `Passé ce délai, le bien sera remis sur le marché.`,
      ``,
      `Cet accord de principe ne vaut pas bail et ne constitue pas un engagement définitif. L'entrée dans les lieux est strictement conditionnée à la signature du contrat de location définitif.`,
      ``,
      `Pour accepter cet accord, veuillez répondre à cet e-mail en confirmant votre accord et en joignant votre signature.`,
      ``,
      `Cordialement,`,
      `${bailleurName}`,
      `EQUITY — Gestion Patrimoniale`,
    ].filter(l => l !== undefined).join("\n");

    // Open mailto
    const mailto = `mailto:${encodeURIComponent(accordEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");

    // Update status
    setAccordStatus("sending");
    setTimeout(() => {
      setAccordStatus("sent");
      setAccordSentDate(new Date().toLocaleString("fr-FR"));
    }, 1500);
  };

  const simulateSignature = (signatureData) => {
    if (signatureCallback) {
      signatureCallback(signatureData);
      setSignatureCallback(null);
      setShowSignaturePad(false);
      return;
    }
    setAccordSignature(signatureData);
    setAccordStatus("signed");
    setAccordSignedDate(new Date().toLocaleString("fr-FR"));
    setShowSignaturePad(false);
    markDone("accord");
  };

  const readB64 = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=()=>rej(new Error("Read failed")); r.readAsDataURL(file); });

  const setField = (key, val) => setStepData(d=>({...d,[key]:val}));

  const bien = assets?.find(a=>a.id===tenant.bienId);

  // ── Pre-fill stepData from bien + tenant data on mount ──
  useEffect(() => {
    if (!bien && !tenant.bienId) return;
    const b = bien || {};
    const loyerVal = b.loyer || tenant.loyerHC || "";
    const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10) || 0;
    const isVide = (b.typeLocation||tenant.bienTypeLocation||"").toLowerCase().includes("vide");
    const depotCalc = tenant.depotGarantieCalc || (loyerNum > 0 ? String(isVide ? loyerNum : loyerNum * 2) : "");
    const chargesVal = String(b.chargesLocatives || tenant.chargesLoc || "");
    const adresseComplete = [b.addr||"", b.addr2||"", b.batiment||"", b.ville||"", b.codePostal||""].filter(Boolean).join(", ") || tenant.bienAddr || "";

    setStepData(prev => {
      const d = {...prev};
      // Accord
      if (!d.loyerAccorde && loyerVal) d.loyerAccorde = String(loyerVal);
      // Bail
      if (!d.bailType) d.bailType = isVide ? "Location vide — 3 ans renouvelable" : "Meublé — 1 an renouvelable";
      // Paiement
      if (!d.depotGarantie && depotCalc) d.depotGarantie = depotCalc + " €";
      if (!d.premierLoyer && loyerVal) d.premierLoyer = loyerVal + " €";
      // Bail mobilité
      if (!d.bailMotif) d.bailMotif = "";
      if (!d.bailDuree) d.bailDuree = "";
      if (!d.bailDateEffet) d.bailDateEffet = d.datePriseEffet || "";
      if (!d.bailChargesForfait && chargesVal) d.bailChargesForfait = chargesVal;
      if (!d.bailPeriodicite) d.bailPeriodicite = b.frequencePaiement || "Mensuel";
      if (!d.bailDatePaiement) d.bailDatePaiement = "Le 1er de chaque mois";
      // EDL
      if (!d.lieuRdv && adresseComplete) d.lieuRdv = adresseComplete;
      return d;
    });
  }, [bien, tenant.bienId]);

  const getStatus = (idx) => {
    const sid = GESTION_STEPS[idx].id;
    if (stepStatus[sid]==="done") return "done";
    if (stepStatus[sid]==="inprogress") return "inprogress";
    // Auto-detect: first non-done step is current
    for (let i=0; i<GESTION_STEPS.length; i++) {
      if (stepStatus[GESTION_STEPS[i].id]!=="done") return i===idx ? "current" : i<idx ? "done" : "future";
    }
    return "future";
  };

  const markDone = (stepId) => {
    setStepStatus(s=>({...s,[stepId]:"done"}));
    // Auto-advance to next step
    const idx = GESTION_STEPS.findIndex(s=>s.id===stepId);
    if (idx < GESTION_STEPS.length - 1) setTimeout(()=>setActiveStep(idx+1), 400);
  };

  const handleConfFile = async (zone, file) => {
    setConfFiles(f=>({...f,[zone]:[...f[zone],file]}));
    setConfAnalyzing(a=>({...a,[zone]:true}));
    setTimeout(()=>{ setConfAnalyzing(a=>({...a,[zone]:false})); setConfDone(d=>({...d,[zone]:true})); }, 2200);
  };

  const removeConfFile = (zone, index) => {
    setConfFiles(f=>{
      const arr = f[zone].filter((_,i)=>i!==index);
      if(arr.length===0) setConfDone(d=>({...d,[zone]:false}));
      return {...f,[zone]:arr};
    });
  };

  const step = GESTION_STEPS[activeStep];
  const StepIcon = GESTION_ICONS[step.icon];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp 0.25s ease" }}>

      {/* ── Bien rattaché banner ── */}
      {bien ? (
        <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><I.Home/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.green, marginBottom:1 }}>BIEN RATTACHÉ</p>
            <p style={{ fontSize:12, fontWeight:700 }}>{bien.name||tenant.bienName||"Bien"} <span style={{ fontWeight:400, color:C.g2 }}>— {bien.addr||bien.ville||tenant.bienAddr||""}</span></p>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {(bien.loyer||tenant.loyerHC) && <span style={{ fontSize:11, fontWeight:700, color:C.blue, fontFamily:C.mono }}>{bien.loyer||tenant.loyerHC} €/mois</span>}
            <span style={{ fontSize:9, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"3px 8px", borderRadius:5 }}>Actif</span>
            <button onClick={()=>setShowDetachConfirm(true)}
              style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:7, padding:"4px 10px", color:C.red, fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:C.mono, letterSpacing:"0.05em", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.12)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.06)";}}>
              Détacher
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background:"rgba(245,158,11,0.04)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:14, padding:"20px", textAlign:"center" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.yellow, margin:"0 auto 12px" }}><I.Home/></div>
          <p style={{ fontSize:14, fontWeight:700, color:C.w, marginBottom:4 }}>Aucun bien rattaché</p>
          <p style={{ fontSize:11, color:C.g2, marginBottom:14 }}>Sélectionnez un bien pour démarrer la gestion locative de ce dossier.</p>
          <button onClick={()=>setShowAttachPicker(true)}
            style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#F59E0B,#D97706)", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, boxShadow:"0 4px 16px rgba(245,158,11,0.3)" }}>
            <I.Home/> Sélectionner un bien
          </button>

          {/* Attach picker modal */}
          {showAttachPicker && (
            <div style={{ marginTop:16, textAlign:"left", background:"#0a0a0a", border:"1px solid "+C.border, borderRadius:12, padding:"14px", maxHeight:320, overflowY:"auto" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <input type="text" value={attachSearch} onChange={e=>setAttachSearch(e.target.value)} placeholder="Rechercher un bien…"
                  style={{ flex:1, background:"#111", border:"1px solid "+C.border, borderRadius:8, padding:"7px 12px", fontSize:12, color:C.w, outline:"none" }}/>
                <button onClick={()=>{setShowAttachPicker(false);setAttachSearch("");}}
                  style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:4 }}><I.X/></button>
              </div>
              {(assets||[]).filter(a => {
                if (!attachSearch) return true;
                const s = attachSearch.toLowerCase();
                return (a.name||"").toLowerCase().includes(s) || (a.addr||"").toLowerCase().includes(s) || (a.ville||"").toLowerCase().includes(s);
              }).length === 0 ? (
                <p style={{ fontSize:11, color:C.g3, textAlign:"center", padding:12 }}>Aucun bien trouvé. Créez d’abord un bien dans Patrimoine.</p>
              ) : (assets||[]).filter(a => {
                if (!attachSearch) return true;
                const s = attachSearch.toLowerCase();
                return (a.name||"").toLowerCase().includes(s) || (a.addr||"").toLowerCase().includes(s) || (a.ville||"").toLowerCase().includes(s);
              }).map(a => (
                <button key={a.id} onClick={()=>{
                  if (!onUpdateTenant) return;
                  onUpdateTenant({
                    ...tenant,
                    bienId:a.id, bienName:a.name, bienType:a.type, bienAddr:a.addr, bienVille:a.ville, bienCodePostal:a.codePostal,
                    bienSurface:a.surface, bienRooms:a.rooms, bienDpe:a.dpe, bienYear:a.year, bienTypeLocation:a.typeLocation, bienMode:a.mode,
                    loyerHC:a.loyer, chargesLoc:a.chargesLocatives, depotGarantieCalc:a.depotGarantie, frequencePaiement:a.frequencePaiement, dureeBail:a.dureeBail,
                    loyer: tenant.loyer === "\u2014 \u20ac" ? (a.loyer||tenant.loyer) : tenant.loyer,
                  });
                  setShowAttachPicker(false); setAttachSearch("");
                }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"transparent", border:"1px solid "+C.border, borderRadius:10, cursor:"pointer", marginBottom:6, textAlign:"left", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.border;}}>
                  <div style={{ width:32, height:32, borderRadius:8, background:C.blueSub, border:"1px solid rgba(59,130,246,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Home/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:C.w, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.name}</p>
                    <p style={{ fontSize:10, color:C.g2 }}>{a.addr} {a.ville} · {a.surface} · {a.type}</p>
                  </div>
                  {a.loyer && <span style={{ fontSize:11, fontWeight:700, color:C.blue, fontFamily:C.mono, flexShrink:0 }}>{a.loyer} €</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {bien && (<>

      {/* Detach confirmation */}
      {showDetachConfirm && (
        <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:12, padding:"16px", marginBottom:8 }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.w, marginBottom:4 }}>Détacher ce locataire ?</p>
          <p style={{ fontSize:11, color:C.g2, marginBottom:12 }}>{tenant.prenom} {tenant.nom} sera détaché(e) de {bien?.name||"ce bien"}. La gestion locative sera réinitialisée.</p>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <button onClick={()=>setShowDetachConfirm(false)}
              style={{ background:"#1a1a1a", border:"1px solid "+C.border2, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:11, cursor:"pointer" }}>Annuler</button>
            <button onClick={()=>{
              setShowDetachConfirm(false);
              if (onUpdateTenant) onUpdateTenant({ ...tenant, bienId:null, bienName:null, bienType:null, bienAddr:null, bienVille:null, bienCodePostal:null, bienSurface:null, bienRooms:null, bienDpe:null, bienYear:null, bienTypeLocation:null, bienMode:null, loyerHC:null, chargesLoc:null, depotGarantieCalc:null, frequencePaiement:null, dureeBail:null });
            }}
              style={{ background:"linear-gradient(135deg,#EF4444,#DC2626)", border:"none", borderRadius:8, padding:"6px 16px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Confirmer</button>
          </div>
        </div>
      )}

      {/* ── 5-STEP STEPPER ── */}
      <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:16, padding:"24px 28px 20px" }}>
        {/* Step nodes + connectors */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"relative", marginBottom:28 }}>
          {/* Background connector line */}
          <div style={{ position:"absolute", top:20, left:40, right:40, height:2, background:"#1e1e1e", zIndex:0 }}/>
          {/* Progress line */}
          <div style={{ position:"absolute", top:20, left:40, height:2, background:`linear-gradient(90deg,${C.green},${C.blue})`, zIndex:1, transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)", width:`${Math.max(0, (Object.values(stepStatus).filter(v=>v==="done").length / (GESTION_STEPS.length-1)) * (100 - 16))}%`, borderRadius:99 }}/>

          {GESTION_STEPS.map((s, i) => {
            const status = getStatus(i);
            const isActive = i === activeStep;
            const isDone = status === "done" || stepStatus[s.id]==="done";
            const SIcon = GESTION_ICONS[s.icon];
            const col = isDone ? C.green : isActive ? s.color : "#333";
            return (
              <div key={s.id} onClick={()=>setActiveStep(i)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, cursor:"pointer", zIndex:2, flex:1, minWidth:0 }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%",
                  background: isDone ? "rgba(16,185,129,0.15)" : isActive ? `${s.color}18` : "#141414",
                  border: `2px solid ${isDone ? C.green : isActive ? s.color : "#2a2a2a"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color: isDone ? C.green : isActive ? s.color : C.g3,
                  boxShadow: isActive ? `0 0 20px ${s.color}30` : isDone ? `0 0 12px ${C.green}25` : "none",
                  transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}>
                  {isDone
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <SIcon/>
                  }
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:9, fontWeight:isActive?800:600, color: isDone ? C.green : isActive ? s.color : C.g3, fontFamily:C.mono, letterSpacing:"0.04em", transition:"color 0.3s", lineHeight:1.3, maxWidth:90 }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Active Step Detail Card ── */}
        <div key={step.id} style={{ background:"#0a0a0a", border:`1px solid ${step.color}22`, borderRadius:14, padding:"22px 20px", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)" }}>
          {/* Step header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${step.color}14`, border:`1px solid ${step.color}30`, display:"flex", alignItems:"center", justifyContent:"center", color:step.color }}>
              <StepIcon/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                <span style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.01em" }}>{step.label}</span>
                <span style={{ fontSize:8, fontFamily:C.mono, color:step.color, background:`${step.color}12`, border:`1px solid ${step.color}25`, padding:"2px 7px", borderRadius:4 }}>ÉTAPE {activeStep+1}/{GESTION_STEPS.length}</span>
                {stepStatus[step.id]==="done"&&<span style={{ fontSize:8, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"2px 7px", borderRadius:4 }}>COMPLÉTÉ</span>}
              </div>
              <p style={{ fontSize:11, color:C.g2, lineHeight:1.5 }}>{step.desc}</p>
            </div>
          </div>

          {/* ── Custom Accord Section ── */}
          {step.customRender && step.id==="accord" && (
            <AccordSection tenant={tenant} bien={bien} user={user} stepData={stepData} setField={setField}/>
          )}

          {/* ── Custom Bail Mobilité Section ── */}
          {step.customRender && step.id==="bail" && (
            <BailMobiliteSection tenant={tenant} bien={bien} user={user} stepData={stepData} setField={setField}/>
          )}

          {/* ── Custom EDL Section ── */}
          {step.customRender && step.id==="edl" && (
            <DigitalEDL tenant={tenant} bien={bien} user={user} stepData={stepData} setField={setField}
              onSign={(role, cb) => {
                setShowSignaturePad(true);
                setSignatureCallback(() => cb);
              }}/>
          )}

          {/* ── Fields ── */}
          {step.fields && !step.customRender && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
              {step.fields.map(f => (
                <div key={f.key} style={{ background:"#0f0f0f", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g3, marginBottom:5, textTransform:"uppercase" }}>{f.label}</p>
                  {f.type==="date" ? (
                    <DatePickerInput value={stepData[f.key]||""} onChange={v=>!f.readOnly&&setField(f.key,v)} placeholder={f.placeholder}/>
                  ) : (
                    <input type="text"
                      value={stepData[f.key]||""} onChange={e=>!f.readOnly&&setField(f.key,e.target.value)}
                      placeholder={f.placeholder} readOnly={f.readOnly}
                      style={{ background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:600, color:C.w, width:"100%" }}
                  />
                  )}
                </div>
              ))}
            </div>
          )}



          {/* ── Document upload (conformité step) ── */}
          {step.documents && (
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              {step.documents.map(doc => {
                const fileList = confFiles[doc.key]||[];
                const isAnalyzing = confAnalyzing[doc.key];
                const isDone = confDone[doc.key];
                const inputId = `conf-upload-${doc.key}`;
                return (
                  <div key={doc.key} style={{ background:"#0d0d0f", border:`1px dashed ${isDone?C.green:step.color+"40"}`, borderRadius:12, padding:"16px", transition:"all 0.2s" }}>
                    <input id={inputId} type="file" multiple style={{ display:"none" }} onChange={e=>{[...e.target.files].forEach(f=>handleConfFile(doc.key,f));e.target.value="";}}/>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:fileList.length>0?10:0 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:isDone?"rgba(16,185,129,0.12)":`${step.color}10`, border:`1px solid ${isDone?C.greenBord:step.color+"25"}`, display:"flex", alignItems:"center", justifyContent:"center", color:isDone?C.green:step.color }}>
                        {isDone ? <I.CheckCircle/> : isAnalyzing ? <div style={{ animation:"spin 1s linear infinite" }}><I.Loader/></div> : <I.Upload2/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:12, fontWeight:700, color:isDone?C.green:C.w, marginBottom:1 }}>{isDone?"Document vérifié ✓":doc.label}</p>
                        <p style={{ fontSize:10, color:C.g2 }}>{doc.subLabel}</p>
                      </div>
                      {isAnalyzing && <span style={{ fontSize:8, fontFamily:C.mono, color:step.color, background:`${step.color}12`, border:`1px solid ${step.color}25`, padding:"3px 8px", borderRadius:5, animation:"pulse 1.5s infinite" }}>Analyse IA en cours…</span>}
                      <button onClick={()=>document.getElementById(inputId).click()} style={{ background:`${step.color}10`, border:`1px solid ${step.color}25`, borderRadius:7, padding:"6px 12px", color:step.color, fontSize:10, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                        <I.Upload2/> {fileList.length>0?"+ Ajouter":"Déposer"}
                      </button>
                    </div>
                    {fileList.length>0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                        {fileList.map((f,fi)=>(
                          <div key={fi} style={{ display:"flex", alignItems:"center", gap:6, background:"#0a0a0a", borderRadius:6, padding:"5px 8px" }}>
                            <I.File/><span style={{ fontSize:9, color:C.g1, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:C.mono }}>{f.name}</span>
                            <button onClick={()=>removeConfFile(doc.key,fi)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, display:"flex", padding:0, opacity:0.6 }} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}><I.X/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Accord: Custom action flow ── */}
          {step.id==="accord" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Status tracker */}
              {accordStatus && (
                <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:12 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue }}>SUIVI DE L'ACCORD</span>
                  </div>
                  <div style={{ display:"flex", gap:0 }}>
                    {[
                      { id:"sent", label:"Envoyé", sub:accordSentDate||"—", icon:"mail" },
                      { id:"pending", label:"En attente", sub:"Signature locataire", icon:"clock" },
                      { id:"signed", label:"Signé", sub:accordSignedDate||"—", icon:"check" },
                    ].map((s,i) => {
                      const isDone = s.id==="sent" ? !!accordSentDate : s.id==="signed" ? accordStatus==="signed" : accordStatus==="sent";
                      const isCurrent = s.id==="pending" && accordStatus==="sent";
                      const col = isDone ? C.green : isCurrent ? C.yellow : C.g3;
                      return (
                        <div key={s.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, position:"relative" }}>
                          {i>0 && <div style={{ position:"absolute", top:12, right:"50%", width:"100%", height:2, background:isDone?C.green:"#1e1e1e", zIndex:0 }}/>}
                          <div style={{ width:26, height:26, borderRadius:"50%", background:isDone?`${C.green}18`:isCurrent?`${C.yellow}18`:"#141414", border:`2px solid ${col}`, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, transition:"all 0.3s" }}>
                            {isDone ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                              : isCurrent ? <div style={{ width:8, height:8, borderRadius:"50%", background:C.yellow, animation:"pulse 1.5s infinite" }}/>
                              : <div style={{ width:6, height:6, borderRadius:"50%", background:C.g3 }}/>}
                          </div>
                          <p style={{ fontSize:10, fontWeight:700, color:col, textAlign:"center" }}>{s.label}</p>
                          <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, textAlign:"center" }}>{isDone?s.sub:isCurrent?"En cours…":"—"}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Signature display if signed */}
              {accordSignature && (
                <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:12, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <I.CheckCircle/>
                    <span style={{ fontSize:11, fontWeight:700, color:C.green }}>Accord signé par {tenant.prenom} {tenant.nom}</span>
                    <span style={{ marginLeft:"auto", fontSize:9, fontFamily:C.mono, color:C.g3 }}>{accordSignedDate}</span>
                  </div>
                  <div style={{ background:"#fff", borderRadius:8, padding:"8px", display:"inline-block" }}>
                    <img src={accordSignature} alt="Signature" style={{ height:60, display:"block" }}/>
                  </div>
                </div>
              )}

              {/* Destinataire email */}
              {!accordSignature && (
                <div style={{ background:"#0d0d0f", border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}>
                    <I.Mail/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:8, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:3 }}>DESTINATAIRE</p>
                    {editingEmail ? (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <input
                          autoFocus
                          value={accordEmail}
                          onChange={e=>setAccordEmail(e.target.value)}
                          onKeyDown={e=>{ if(e.key==="Enter") saveEmail(accordEmail); if(e.key==="Escape") { setAccordEmail(tenant.mail||""); setEditingEmail(false); }}}
                          onBlur={()=>saveEmail(accordEmail)}
                          placeholder="adresse@email.com"
                          style={{ flex:1, background:"#111", border:`1px solid ${C.blue}`, borderRadius:6, padding:"5px 10px", fontSize:13, fontWeight:600, color:C.w, outline:"none" }}
                        />
                        <button onClick={()=>saveEmail(accordEmail)} style={{ background:C.blueSub, border:`1px solid rgba(0,123,255,0.25)`, borderRadius:6, padding:"5px 10px", color:C.blue, fontSize:10, fontWeight:700, cursor:"pointer" }}>OK</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:accordEmail?C.w:C.red }}>{accordEmail || "Aucune adresse e-mail"}</span>
                        <button onClick={()=>setEditingEmail(true)} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:0, display:"flex", transition:"color 0.15s" }}
                          onMouseEnter={e=>e.currentTarget.style.color=C.blue} onMouseLeave={e=>e.currentTarget.style.color=C.g3}>
                          <I.Edit/>
                        </button>
                      </div>
                    )}
                  </div>
                  {accordSentDate && <span style={{ fontSize:9, fontFamily:C.mono, color:C.green, flexShrink:0 }}>Envoyé le {accordSentDate}</span>}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:"flex", gap:8 }}>
                {!accordStatus && (
                  <>
                    <button onClick={()=>setShowAccordPreview(true)}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Eye/> Aperçu
                    </button>
                    <button onClick={downloadAccordPDF}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Download/> Télécharger PDF
                    </button>
                    <button onClick={sendAccord} disabled={!accordEmail}
                      style={{ flex:1, background:accordEmail?"linear-gradient(135deg,#3B82F6,#2563EB)":"#1a1a1a", border:"none", borderRadius:10, padding:"11px 20px", color:accordEmail?"#fff":C.g3, fontSize:12, fontWeight:700, cursor:accordEmail?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:accordEmail?"0 4px 18px rgba(59,130,246,0.35)":"none", transition:"all 0.2s", letterSpacing:"0.02em" }}
                      onMouseEnter={e=>{if(accordEmail){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(59,130,246,0.5)";}}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=accordEmail?"0 4px 18px rgba(59,130,246,0.35)":"none";}}>
                      <I.Send/> Envoyer par e-mail
                    </button>
                  </>
                )}
                {accordStatus==="sending" && (
                  <div style={{ flex:1, background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <div style={{ width:16, height:16, border:"2px solid rgba(59,130,246,0.3)", borderTopColor:"#3B82F6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                    <span style={{ fontSize:12, fontWeight:600, color:C.blue }}>Envoi à <strong>{accordEmail}</strong> en cours…</span>
                  </div>
                )}
                {accordStatus==="sent" && !accordSignature && (
                  <>
                    <button onClick={downloadAccordPDF}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", flexShrink:0 }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Download/> PDF
                    </button>
                    <div style={{ flex:1, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:10, padding:"11px 18px", display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:C.yellow, animation:"pulse 1.5s infinite" }}/>
                      <span style={{ fontSize:11, color:C.yellow, fontWeight:600 }}>En attente de la signature du locataire</span>
                    </div>
                    <button onClick={()=>setShowSignaturePad(true)}
                      style={{ background:"linear-gradient(135deg,#F59E0B,#D97706)", border:"none", borderRadius:10, padding:"11px 18px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(245,158,11,0.3)", transition:"all 0.2s" }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
                      <I.Edit/> Signer maintenant
                    </button>
                  </>
                )}
                {accordStatus==="signed" && (
                  <>
                    <button onClick={downloadAccordPDF}
                      style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s", flexShrink:0 }}
                      onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                      onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                      <I.Download/> Télécharger PDF signé
                    </button>
                    <div style={{ flex:1, background:"rgba(16,185,129,0.06)", border:`1px solid ${C.greenBord}`, borderRadius:10, padding:"11px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <I.CheckCircle/>
                      <span style={{ fontSize:12, fontWeight:700, color:C.green }}>Accord signé — Étape complétée</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Bail Mobilité: Custom action flow ── */}
          {step.id==="bail" && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={()=>setShowBailPreview(true)}
                style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                <I.Eye/> Consulter
              </button>
              <button onClick={downloadBailMobilite}
                style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 14px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#8B5CF6";e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";}}
                onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                <I.Download/> Télécharger le bail
              </button>
              {stepStatus[step.id]!=="done" && (
                <button onClick={()=>markDone(step.id)}
                  style={{ flex:1, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", borderRadius:10, padding:"11px 20px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:"0 4px 18px rgba(139,92,246,0.35)", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(139,92,246,0.5)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 18px rgba(139,92,246,0.35)";}}>
                  <I.Send/> Envoyer le bail à la signature
                </button>
              )}
              {stepStatus[step.id]==="done" && (
                <div style={{ flex:1, background:"rgba(16,185,129,0.06)", border:`1px solid ${C.greenBord}`, borderRadius:10, padding:"11px 18px", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <I.CheckCircle/><span style={{ fontSize:12, fontWeight:700, color:C.green }}>Bail signé — Étape complétée</span>
                </div>
              )}
            </div>
          )}

                    {/* ── Generic action buttons (non-accord steps) ── */}
          {step.actions && step.id!=="accord" && step.id!=="bail" && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {step.actions.map(a => a.primary ? (
                <button key={a.key} onClick={()=>markDone(step.id)}
                  disabled={stepStatus[step.id]==="done"}
                  style={{
                    flex:1, background: stepStatus[step.id]==="done" ? "linear-gradient(135deg,#059669,#047857)" : `linear-gradient(135deg,${step.color},${step.color}CC)`,
                    border:"none", borderRadius:10, padding:"11px 20px", color:"#fff", fontSize:12, fontWeight:700,
                    cursor: stepStatus[step.id]==="done" ? "default" : "pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    boxShadow:`0 4px 18px ${step.color}35`, transition:"all 0.2s", letterSpacing:"0.02em",
                  }}
                  onMouseEnter={e=>{if(stepStatus[step.id]!=="done"){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 6px 26px ${step.color}50`;}}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 18px ${step.color}35`;}}>
                  {stepStatus[step.id]==="done" ? <><I.CheckCircle/> Complété</> : a.label}
                </button>
              ) : (
                <button key={a.key}
                  style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Overall progress summary ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:16 }}>
          <div style={{ flex:1, height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.green},${C.blue})`, width:`${(Object.values(stepStatus).filter(v=>v==="done").length/GESTION_STEPS.length)*100}%`, transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)" }}/>
          </div>
          <span style={{ fontSize:9, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{Object.values(stepStatus).filter(v=>v==="done").length}/{GESTION_STEPS.length} étapes</span>
        </div>
      </div>

      {/* ── Signature Pad Modal ── */}
      {showSignaturePad && <SignaturePadModal tenant={tenant} onSign={simulateSignature} onClose={()=>setShowSignaturePad(false)}/>}

      {/* ── Bail Mobilité Preview Modal ── */}
      {/* ── Bail Preview (iframe) ── */}
      {showBailPreview && (()=>{
        const html = buildBailHtml("preview");
        return (
          <>
            <div onClick={()=>setShowBailPreview(false)} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(10px)" }}/>
            <div style={{ position:"fixed", top:"3vh", left:"50%", transform:"translateX(-50%)", zIndex:401, width:"min(780px,94vw)", height:"94vh", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.7)", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10, flexShrink:0, background:"#0d0d0f" }}>
                <div style={{ width:32, height:32, borderRadius:9, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B5CF6" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:800, letterSpacing:"-0.02em" }}>Bail Mobilité — Aperçu du document</p>
                  <p style={{ fontSize:10, color:C.g2 }}>Les champs manquants sont affichés en <span style={{ color:C.red, fontWeight:700 }}>rouge</span></p>
                </div>
                <button onClick={()=>setShowBailPreview(false)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:30, height:30, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><I.X/></button>
              </div>
              <iframe srcDoc={html} style={{ flex:1, border:"none", width:"100%", background:"#fff", borderRadius:"0 0 18px 18px" }} title="Bail Mobilité" sandbox="allow-same-origin"/>
              <div style={{ padding:"12px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8, justifyContent:"flex-end", flexShrink:0, background:"#0d0d0f" }}>
                <button onClick={()=>setShowBailPreview(false)}
                  style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"8px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  Fermer
                </button>
                <button onClick={()=>{setShowBailPreview(false);downloadBailMobilite();}}
                  style={{ background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", borderRadius:9, padding:"8px 20px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(139,92,246,0.35)" }}>
                  <I.Download/> Télécharger
                </button>
              </div>
            </div>
          </>
        );
      })()}

            {/* ── Email Preview Modal ── */}
      {showAccordPreview && (
        <>
          <div onClick={()=>setShowAccordPreview(false)} style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:401, width:"min(560px,92vw)", maxHeight:"80vh", background:"#111", border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", animation:"fadeUp 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"0 32px 80px rgba(0,0,0,0.6)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:800 }}>Aperçu de l'e-mail</p>
                <p style={{ fontSize:10, color:C.g2 }}>Envoi à <strong style={{ color:C.w }}>{accordEmail}</strong> — {tenant.prenom} {tenant.nom}</p>
              </div>
              <button onClick={()=>setShowAccordPreview(false)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:28, height:28, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center" }}><I.X/></button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
              <div style={{ background:"#fafafa", borderRadius:12, padding:"28px 24px", color:"#111" }}>
                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:"#2563EB", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", marginBottom:10 }}>E</div>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:4 }}>Accord de Principe</h2>
                  <p style={{ fontSize:12, color:"#6b7280" }}>EQUITY · Gestion Patrimoniale</p>
                </div>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:16 }}>
                  Bonjour <strong>{tenant.prenom}</strong>,<br/><br/>
                  Suite à notre échange, nous avons le plaisir de vous transmettre l'accord de principe pour votre future location au <strong>{bien?.name||tenant.bienName||"bien"}</strong> situé au <strong>{bien?.addr||tenant.bienAddr||"—"}, {bien?.ville||tenant.bienVille||""}</strong>.
                </p>
                <div style={{ background:"#f3f4f6", borderRadius:8, padding:"14px 16px", marginBottom:16 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#111", marginBottom:8 }}>Conditions proposées :</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {[
                      ["Loyer HC", (bien?.loyer||tenant.loyerHC||"—") + " €/mois"],
                      ["Charges", (bien?.chargesLocatives||tenant.chargesLoc||"—") + " €/mois"],
                      ["Dépôt de garantie", (tenant.depotGarantieCalc||"—") + " €"],
                      ["Type de bail", tenant.dureeBail||"—"],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#374151" }}>
                        <span>{k}</span><strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:16 }}>
                  Pour accepter cet accord, veuillez cliquer sur le bouton ci-dessous et apposer votre signature électronique.
                </p>
                <div style={{ textAlign:"center" }}>
                  <div style={{ display:"inline-block", background:"#2563EB", color:"#fff", borderRadius:8, padding:"12px 32px", fontSize:13, fontWeight:700, cursor:"default" }}>
                    ✓ Accepter et signer l'accord
                  </div>
                </div>
                <p style={{ fontSize:10, color:"#9ca3af", textAlign:"center", marginTop:16, lineHeight:1.6 }}>
                  Cet accord est valable 72 heures. Passé ce délai, le bien sera remis sur le marché.<br/>
                  Cet accord ne vaut pas bail et ne constitue pas un engagement définitif.
                </p>
              </div>
            </div>
            <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={()=>setShowAccordPreview(false)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.g2, fontSize:11, fontWeight:600, cursor:"pointer" }}>Fermer</button>
              <button onClick={()=>{setShowAccordPreview(false);sendAccord();}}
                style={{ background:"linear-gradient(135deg,#3B82F6,#2563EB)", border:"none", borderRadius:9, padding:"9px 22px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 4px 14px rgba(59,130,246,0.35)" }}>
                <I.Send/> Envoyer maintenant
              </button>
            </div>
          </div>
        </>
      )}
      </>)}
    </div>
  );
}

const TD_SUBTABS = ["Gestion","Profil & Identité","Garants","Dossier Numérique","Coordonnées"];

function TenantDetailTile({ label, value, accent, icon:TIcon, full, onChange, placeholder, type }) {
  return (
    <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", gridColumn:full?"span 2":"span 1" }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        {TIcon&&<span style={{ color:C.g3 }}><TIcon/></span>}
        <span style={{ fontSize:9, letterSpacing:"0.1em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      </div>
      {onChange ? (
        type==="date" ? (
          <DatePickerInput value={value||""} onChange={onChange} placeholder={placeholder}/>
        ) : (
          <input type="text" value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"—"}
            style={{ width:"100%", background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:700, color:accent?C.blue:C.w, padding:0 }}/>
        )
      ) : (
        <span style={{ fontSize:13, fontWeight:700, color:accent?C.blue:C.w }}>{value||"—"}</span>
      )}
    </div>
  );
}

function TenantDetailSecTitle({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, marginTop:4 }}>
      <span style={{ fontSize:9, letterSpacing:"0.12em", color:C.g3, fontFamily:C.mono, textTransform:"uppercase" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function TenantDetailPanel({ tenant, onClose, onDelete, onUpdateTenant, initialTab, assets, user }) {
  const [subtab, setSubtab] = useState(initialTab || "Profil & Identité");
  const st = getStatut(tenant.daysLate);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Editable tenant data ──
  const [ed, setEd] = useState({
    prenom: tenant.prenom||"", nom: tenant.nom||"", civilite: tenant.civilite||"", dateNaissance: tenant.dateNaissance||"",
    lieuNaissance: tenant.lieuNaissance||"", nationalite: tenant.nationalite||"Française",
    employeur: tenant.employeur||"", contrat: tenant.contrat||"", revenus: tenant.revenus||tenant.loyer||"", anciennete: tenant.anciennete||"",
    mail: tenant.mail||"", tel: tenant.tel||"", tel2: tenant.tel2||"",
    adresse: tenant.adresse||"", ville: tenant.ville||"", codePostal: tenant.codePostal||"", region: tenant.region||"", pays: tenant.pays||"France",
    garantNom: tenant.garantNom||"", garantPrenom: tenant.garantPrenom||"", garantLien: tenant.garantLien||"", garantRevenus: tenant.garantRevenus||"", garantEmployeur: tenant.garantEmployeur||"",
  });
  const upd = (k,v) => setEd(s=>({...s,[k]:v}));

  // Auto-save debounced
  const saveRef = useRef(null);
  useEffect(() => {
    if (!onUpdateTenant) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      onUpdateTenant({ ...tenant, ...ed });
    }, 600);
    return () => { if(saveRef.current) clearTimeout(saveRef.current); };
  }, [ed]);

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      if (onDelete) onDelete(tenant.id);
      setShowDeleteConfirm(false);
    }, 600);
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.72)", backdropFilter:"blur(8px)" }}/>

      {/* Slide-over panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, zIndex:201, width:"min(700px,90vw)", background:"#0d0d0d", borderLeft:`1px solid ${C.border}`, display:"flex", flexDirection:"column", animation:"slideIn 0.3s cubic-bezier(0.2,0.8,0.2,1)", boxShadow:"-20px 0 60px rgba(0,0,0,0.6)" }}>

        {/* ── Sticky Header ── */}
        <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14, background:"#08080A", position:"sticky", top:0, zIndex:10, flexShrink:0 }}>
          {/* Back / close */}
          <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, width:32, height:32, cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
            <I.X/>
          </button>

          {/* Avatar + name */}
          <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, background:`linear-gradient(135deg,${st.color}28,${st.color}14)`, border:`1.5px solid ${st.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:st.color }}>
            {(ed.prenom||"?")[0]}{(ed.nom||"?")[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.02em" }}>{ed.prenom} {ed.nom}</span>
              {/* Statut pill */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:st.bg, border:`1px solid ${st.border}`, borderRadius:99, padding:"2px 9px", flexShrink:0 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:st.dot, animation:st.pulse?"pulse 1.8s infinite":"none" }}/>
                <span style={{ fontSize:9, fontWeight:700, color:st.color, fontFamily:C.mono, letterSpacing:"0.04em" }}>{st.label}{tenant.daysLate>0?` · J+${tenant.daysLate}`:""}</span>
              </div>
            </div>
            <p style={{ fontSize:11, color:C.g2 }}>{[tenant.bienName, tenant.bienAddr||tenant.adresse, tenant.bienVille||tenant.ville, (tenant.loyerHC||tenant.loyer)?(tenant.loyerHC||tenant.loyer)+" €/mois":null].filter(Boolean).join(" · ")}</p>
          </div>
          {/* Breadcrumb + delete */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <button onClick={()=>setShowDeleteConfirm(true)} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", color:C.g2, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.red;e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              <I.Trash/> Supprimer
            </button>
            <div style={{ width:1, height:20, background:C.border }}/>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={onClose} style={{ background:"none", border:"none", color:C.g2, fontSize:11, cursor:"pointer", padding:0, transition:"color 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.color=C.blue}
              onMouseLeave={e=>e.currentTarget.style.color=C.g2}>
              Locataires
            </button>
            <span style={{ color:C.g3, fontSize:11 }}>›</span>
            <span style={{ fontSize:11, color:C.w, fontWeight:600 }}>{ed.prenom} {ed.nom}</span>
            </div>
          </div>
        </div>

        {/* ── Sub-tabs ── */}
        <div style={{ display:"flex", gap:2, padding:"12px 24px 0", borderBottom:`1px solid ${C.border}`, background:"#0d0d0d", flexShrink:0 }}>
          {TD_SUBTABS.map(t=>{
            const active=subtab===t;
            return(
              <button key={t} onClick={()=>setSubtab(t)} style={{
                background:"transparent", border:"none",
                borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent",
                padding:"8px 14px 10px", fontSize:11.5, fontWeight:active?700:500,
                color:active?C.blue:C.g2, cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
              }}>
                {t}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px 40px" }}>

          {/* ─── PROFIL & IDENTITÉ ─── */}
          {subtab==="Gestion"&&<GestionTab tenant={tenant} assets={assets||[]} user={user||{}} onUpdateTenant={onUpdateTenant}/>}

          {subtab==="Profil & Identité"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:18, animation:"fadeUp 0.2s ease" }}>
              {/* AI banner */}
              <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.07),rgba(0,123,255,0.02))", border:"1px solid rgba(0,123,255,0.15)", borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:24, height:24, borderRadius:7, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.Sparkles/></div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.blue, marginBottom:1 }}>DOSSIER IA · CONFIANCE 97%</p>
                  <p style={{ fontSize:11, color:C.g1 }}>Données extraites et vérifiées automatiquement. Survolez les tuiles pour les détails.</p>
                </div>
                <button style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:7, padding:"4px 10px", color:C.g2, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                  <I.Edit/> Éditer
                </button>
              </div>

              <div>
                <TenantDetailSecTitle label="Identité civile"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <TenantDetailTile icon={I.User}     label="Civilité"          value={ed.civilite} onChange={v=>upd("civilite",v)} placeholder="Madame / Monsieur"/>
                  <TenantDetailTile icon={I.User}     label="Prénom"            value={ed.prenom} onChange={v=>upd("prenom",v)}/>
                  <TenantDetailTile icon={I.User}     label="Nom de famille"    value={ed.nom} onChange={v=>upd("nom",v)}/>
                  <TenantDetailTile icon={I.Calendar} label="Date de naissance" value={ed.dateNaissance} onChange={v=>upd("dateNaissance",v)} type="date"/>
                  <TenantDetailTile icon={I.MapPin}   label="Lieu de naissance" value={ed.lieuNaissance} onChange={v=>upd("lieuNaissance",v)} placeholder="Ville (département)"/>
                  <TenantDetailTile icon={I.Globe}    label="Nationalité"       value={ed.nationalite} onChange={v=>upd("nationalite",v)}/>
                </div>
              </div>

              <div>
                <TenantDetailSecTitle label="Situation professionnelle"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <TenantDetailTile icon={I.Briefcase} label="Employeur"            value={ed.employeur} onChange={v=>upd("employeur",v)} full/>
                  <TenantDetailTile icon={I.Briefcase} label="Type de contrat"      value={ed.contrat} onChange={v=>upd("contrat",v)} placeholder="CDI / CDD…"/>
                  <TenantDetailTile icon={I.Euro}      label="Revenus nets/mois"    value={ed.revenus} onChange={v=>upd("revenus",v)} accent placeholder="ex: 2 800 €"/>
                  <TenantDetailTile icon={I.Clock}     label="Ancienneté"           value={ed.anciennete} onChange={v=>upd("anciennete",v)} placeholder="ex: 4 ans 2 mois"/>
                </div>
              </div>

              {/* Solvabilité */}
              <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:11, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, marginBottom:3 }}>SCORE DE SOLVABILITÉ IA</p>
                    <p style={{ fontSize:13, fontWeight:700, color:C.w }}>Ratio loyer/revenus : <span style={{ color:C.green }}>24,7%</span> <span style={{ fontSize:11, color:C.g2, fontWeight:400 }}>(seuil max 33%)</span></p>
                  </div>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:800, color:C.green }}>A</span>
                  </div>
                </div>
                <div style={{ height:4, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ width:"75%", height:"100%", background:`linear-gradient(90deg,${C.green},#34d399)`, borderRadius:99, boxShadow:`0 0 8px ${C.green}50` }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>0%</span>
                  <span style={{ fontSize:9, color:C.yellow, fontFamily:C.mono }}>⚠ 33%</span>
                  <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>100%</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── GARANTS ─── */}
          {subtab==="Garants"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.2s ease" }}>
              {/* Garant card */}
              <div style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12, background:"rgba(99,102,241,0.04)" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(99,102,241,0.12)", border:"1.5px solid rgba(99,102,241,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#818cf8" }}>{(ed.garantPrenom||"P")[0]}{(ed.garantNom||"D")[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                      <span style={{ fontSize:14, fontWeight:800 }}>{ed.garantPrenom||"—"} {ed.garantNom||"—"}</span>
                      <span style={{ fontSize:8, fontFamily:C.mono, color:"#818cf8", background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", padding:"2px 7px", borderRadius:4 }}>GARANT 1 · {ed.garantLien||"PARENT"}</span>
                    </div>
                    <span style={{ fontSize:11, color:C.g2 }}>{ed.garantEmployeur||"—"} · {ed.garantRevenus||"—"}/mois</span>
                  </div>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:13, fontWeight:800, color:C.green }}>A+</span>
                  </div>
                </div>
                <div style={{ padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <TenantDetailSecTitle label="Identité civile"/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <TenantDetailTile icon={I.User}     label="Prénom"            value={ed.garantPrenom} onChange={v=>upd("garantPrenom",v)}/>
                      <TenantDetailTile icon={I.User}     label="Nom"               value={ed.garantNom} onChange={v=>upd("garantNom",v)}/>
                      <TenantDetailTile icon={I.Briefcase} label="Lien"             value={ed.garantLien} onChange={v=>upd("garantLien",v)} placeholder="Père / Mère…"/>
                      <TenantDetailTile icon={I.Globe}    label="Nationalité"       value="Française"/>
                    </div>
                  </div>
                  <div>
                    <TenantDetailSecTitle label="Situation professionnelle"/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      <TenantDetailTile icon={I.Briefcase} label="Employeur"         value={ed.garantEmployeur} onChange={v=>upd("garantEmployeur",v)} full/>
                      <TenantDetailTile icon={I.Briefcase} label="Type de contrat"   value={tenant.garantContrat||""} />
                      <TenantDetailTile icon={I.Euro}      label="Revenus nets/mois" value={ed.garantRevenus} onChange={v=>upd("garantRevenus",v)} accent placeholder="ex: 5 200 €"/>
                      <TenantDetailTile icon={I.Clock}     label="Ancienneté"        value={tenant.garantAnciennete||""}/>
                    </div>
                  </div>
                  {/* Ratio */}
                  <div style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div>
                        <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:2 }}>SCORE SOLVABILITÉ · GARANT</p>
                        <p style={{ fontSize:12, fontWeight:700, color:C.w }}>Ratio : <span style={{ color:C.green }}>18,1%</span> <span style={{ fontSize:10, color:C.g2, fontWeight:400 }}>(seuil max 33%)</span></p>
                      </div>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:12, fontWeight:800, color:C.green }}>A+</span>
                      </div>
                    </div>
                    <div style={{ height:3, background:"#1a1a1a", borderRadius:99, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ width:"18%", height:"100%", background:`linear-gradient(90deg,${C.green},#34d399)`, borderRadius:99, boxShadow:`0 0 8px ${C.green}50` }}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>0%</span>
                      <span style={{ fontSize:9, color:C.yellow, fontFamily:C.mono }}>⚠ 33%</span>
                      <span style={{ fontSize:9, color:C.g3, fontFamily:C.mono }}>100%</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Global summary */}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:11, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}><I.Shield/></div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:C.green, marginBottom:2 }}>Couverture de garantie solide</p>
                  <p style={{ fontSize:10, color:C.g2 }}>Revenus garant : <strong style={{ color:C.w }}>5 200 €/mois</strong> · Ratio global : <strong style={{ color:C.green }}> 18,1%</strong></p>
                </div>
                <div style={{ textAlign:"right" }}><p style={{ fontSize:18, fontWeight:800, color:C.green, letterSpacing:"-0.03em" }}>A+</p><p style={{ fontSize:9, fontFamily:C.mono, color:C.g2 }}>SCORE GLOBAL</p></div>
              </div>
            </div>
          )}

          {/* ─── DOSSIER NUMÉRIQUE ─── */}
          {subtab==="Dossier Numérique"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.2s ease" }}>
              <TenantDetailSecTitle label="Dossier numérique · 5 documents"/>
              {[
                { name:`CNI_${tenant.nom}_2024.pdf`,       type:"CNI",     expiry:"15/06/2029" },
                { name:`Bulletin_Salaire_Jan2025.pdf`,      type:"Revenus", expiry:"—" },
                { name:`Bulletin_Salaire_Fev2025.pdf`,      type:"Revenus", expiry:"—" },
                { name:`Bulletin_Salaire_Mar2025.pdf`,      type:"Revenus", expiry:"—" },
                { name:`Quittance_EDF_Mars2025.pdf`,        type:"Domicile",expiry:"Valide" },
              ].map((d,i)=>(
                <div key={i} style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:C.blueSub, border:"1px solid rgba(0,123,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><I.File/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12, fontWeight:600, color:C.w, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</p>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.18)", padding:"1px 6px", borderRadius:4 }}>{d.type}</span>
                      <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>Exp. : {d.expiry}</span>
                    </div>
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.greenSub, border:`1px solid ${C.greenBord}`, borderRadius:99, padding:"3px 9px", flexShrink:0 }}>
                    <I.Shield/><span style={{ fontSize:9, fontFamily:C.mono, color:C.green, fontWeight:700, letterSpacing:"0.06em" }}>AUTHENTIFIÉ</span>
                  </div>
                </div>
              ))}
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.06),rgba(16,185,129,0.02))", border:`1px solid ${C.greenBord}`, borderRadius:11, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green }}><I.Shield/></div>
                <div><p style={{ fontSize:11, fontWeight:700, color:C.green, marginBottom:1 }}>Dossier certifié · Authenticité 100%</p><p style={{ fontSize:10, color:C.g2 }}>Analyse IA du 01/03/2026 à 14h32.</p></div>
              </div>
            </div>
          )}

          {/* ─── COORDONNÉES ─── */}
          {subtab==="Coordonnées"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"fadeUp 0.2s ease" }}>
              <TenantDetailSecTitle label="Contact"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <TenantDetailTile icon={I.Mail}   label="Adresse e-mail"      value={ed.mail} onChange={v=>upd("mail",v)} full placeholder="email@exemple.fr"/>
                <TenantDetailTile icon={I.Phone}  label="Téléphone principal" value={ed.tel} onChange={v=>upd("tel",v)} placeholder="06 12 34 56 78"/>
                <TenantDetailTile icon={I.Phone}  label="Téléphone secondaire" value={ed.tel2} onChange={v=>upd("tel2",v)} placeholder="—"/>
              </div>
              <TenantDetailSecTitle label="Adresse actuelle"/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <TenantDetailTile icon={I.MapPin} label="Adresse"      value={ed.adresse} onChange={v=>upd("adresse",v)} full placeholder="Numéro, rue"/>
                <TenantDetailTile icon={I.Globe}  label="Ville"        value={ed.ville} onChange={v=>upd("ville",v)}/>
                <TenantDetailTile icon={I.Globe}  label="Code Postal"  value={ed.codePostal} onChange={v=>upd("codePostal",v)} placeholder="33000"/>
                <TenantDetailTile icon={I.Globe}  label="Région"       value={ed.region} onChange={v=>upd("region",v)} placeholder="Nouvelle-Aquitaine"/>
                <TenantDetailTile icon={I.Globe}  label="Pays"         value={ed.pays} onChange={v=>upd("pays",v)}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.border}`, background:"#08080A", display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }}>
          <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:9, padding:"9px 18px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
            Fermer
          </button>
          <button style={{ background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:9, padding:"9px 20px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:`0 4px 18px ${C.blueGlow}`, transition:"all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 26px rgba(0,123,255,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 18px ${C.blueGlow}`;e.currentTarget.style.transform="none";}}>
            <I.Edit/> Modifier le dossier
          </button>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div onClick={()=>!deleting&&setShowDeleteConfirm(false)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16, animation:"fadeUp 0.2s ease" }}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:"#111113", border:`1px solid ${C.border}`, borderRadius:18,
            width:"100%", maxWidth:420, padding:"28px 28px 24px",
            boxShadow:"0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.03)",
            animation:"fadeUp 0.25s cubic-bezier(0.2,0.8,0.2,1)",
            opacity: deleting ? 0.6 : 1, transform: deleting ? "scale(0.97)" : "scale(1)",
            transition:"opacity 0.4s, transform 0.4s",
          }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:C.redSub, border:"1.5px solid rgba(239,68,68,0.22)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red }}>
                <I.AlertTriangle/>
              </div>
            </div>
            <h3 style={{ textAlign:"center", fontSize:17, fontWeight:800, letterSpacing:"-0.02em", color:C.w, marginBottom:8 }}>
              Supprimer ce locataire ?
            </h3>
            <p style={{ textAlign:"center", fontSize:13, color:C.g2, lineHeight:1.65, marginBottom:6 }}>
              Vous allez supprimer <strong style={{ color:C.w }}>{tenant.prenom} {tenant.nom}</strong> de votre liste de locataires.
            </p>
            <p style={{ textAlign:"center", fontSize:11, color:C.g3, lineHeight:1.6, marginBottom:22 }}>
              Cette action supprimera toutes les données associées (identité, documents, garants). Cette action est irréversible.
            </p>
            <div style={{ background:"#0a0a0a", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:C.redSub, border:"1px solid rgba(239,68,68,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.red, flexShrink:0, fontSize:13, fontWeight:800 }}>
                {(tenant.prenom||"?")[0]}{(tenant.nom||"?")[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.w, marginBottom:2 }}>{tenant.prenom} {tenant.nom}</p>
                <p style={{ fontSize:11, color:C.g2 }}>{[tenant.adresse, tenant.ville, tenant.loyer?tenant.loyer+"/mois":null].filter(Boolean).join(" · ")||"Aucune info"}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowDeleteConfirm(false)} disabled={deleting}
                style={{ flex:1, background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px 0", color:C.g1, fontSize:12, fontWeight:600, cursor:deleting?"not-allowed":"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!deleting){e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1;}}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{
                  flex:1, background:deleting?"linear-gradient(135deg,#991B1B,#7F1D1D)":"linear-gradient(135deg,#EF4444,#DC2626)",
                  border:"none", borderRadius:10, padding:"11px 0",
                  color:"#fff", fontSize:12, fontWeight:700, cursor:deleting?"not-allowed":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow:"0 4px 20px rgba(239,68,68,0.35)", transition:"all 0.2s",
                  letterSpacing:"0.02em",
                }}
                onMouseEnter={e=>{if(!deleting){e.currentTarget.style.boxShadow="0 6px 28px rgba(239,68,68,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(239,68,68,0.35)";e.currentTarget.style.transform="none";}}>
                {deleting
                  ? <><div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/> Suppression...</>
                  : <><I.Trash/> Confirmer la suppression</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   LOCATAIRES PAGE
════════════════════════════════════════ */
function getStatut(daysLate) {
  if (daysLate === 0)  return { label:"À jour",  color:"#10B981", bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.22)", dot:"#10B981" };
  if (daysLate < 10)   return { label:"En retard", color:"#F59E0B", bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.22)",  dot:"#F59E0B", pulse:true };
  return               { label:"Impayé",  color:"#EF4444", bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.22)",  dot:"#EF4444", pulse:true };
}

function TenantRow({ t, hov, setHov, onSelectTenant }) {
  const st = getStatut(t.daysLate);
  const isHov = hov === t.id;
  return (
    <div
      onMouseEnter={()=>setHov(t.id)}
      onMouseLeave={()=>setHov(null)}
      onClick={()=>onSelectTenant&&onSelectTenant(t)}
      style={{
        display:"grid",
        gridTemplateColumns:"1.2fr 1fr 1.4fr 1.6fr 0.9fr 1.1fr 0.9fr",
        alignItems:"center",
        padding:"0 20px",
        height:56,
        gap:12,
        borderBottom:`1px solid ${C.border}`,
        background: isHov ? "#161616" : "transparent",
        transition:"background 0.15s",
        cursor: onSelectTenant ? "pointer" : "default",
        borderLeft: isHov && onSelectTenant ? `2px solid ${C.blue}` : "2px solid transparent",
      }}
    >
      {/* Nom */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg, ${st.color}30, ${st.color}18)`,
          border:`1px solid ${st.color}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:11, fontWeight:700, color:st.color,
        }}>
          {t.prenom[0]}{t.nom[0]}
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:C.w }}>{t.nom}</span>
      </div>

      {/* Prénom */}
      <span style={{ fontSize:13, color:C.g1 }}>{t.prenom}</span>

      {/* Bien rattaché */}
      <div style={{ display:"flex", alignItems:"center", gap:6, overflow:"hidden" }}>
        {t.bienName ? (
          <>
            <div style={{ width:22, height:22, borderRadius:6, background:C.greenSub, border:`1px solid ${C.greenBord}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.green, flexShrink:0 }}><I.Home/></div>
            <span style={{ fontSize:11, fontWeight:600, color:C.g1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.bienName}</span>
          </>
        ) : (
          <span style={{ fontSize:10, color:C.g3, fontStyle:"italic" }}>Non rattaché</span>
        )}
      </div>

      {/* Adresse */}
      <div style={{ display:"flex", alignItems:"center", gap:5, overflow:"hidden" }}>
        <span style={{ color:C.g3, flexShrink:0 }}><I.MapPin/></span>
        <span style={{ fontSize:12, color:C.g2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.adresse}</span>
      </div>

      {/* Ville */}
      <span style={{ fontSize:12, color:C.g2 }}>{t.ville}</span>

      {/* Téléphone */}
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <span style={{ color:C.g3, flexShrink:0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.5 2 2 0 0 1 3.6 2.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </span>
        <span style={{ fontSize:12, color:C.g2, fontFamily:C.mono }}>{t.tel}</span>
      </div>

      {/* Statut */}
      <div style={{
        display:"inline-flex", alignItems:"center", gap:6,
        background:st.bg, border:`1px solid ${st.border}`,
        borderRadius:99, padding:"4px 10px",
        width:"fit-content",
      }}>
        <span style={{
          width:6, height:6, borderRadius:"50%", background:st.dot, flexShrink:0,
          animation: st.pulse ? "pulse 1.8s infinite" : "none",
        }}/>
        <span style={{ fontSize:10, fontWeight:700, color:st.color, fontFamily:C.mono, letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
          {st.label}
        </span>
        {t.daysLate > 0 && (
          <span style={{ fontSize:9, color:st.color, opacity:.7, fontFamily:C.mono }}>
            J+{t.daysLate}
          </span>
        )}
      </div>
    </div>
  );
}

function LocatairesPage({ onNewTenant, onSelectTenant, tenants=[] }) {
  const [hov,    setHov]    = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("tous");
  const [searchFocus, setSearchFocus] = useState(false);

  const aJour   = tenants.filter(t=>t.daysLate===0).length;
  const retard  = tenants.filter(t=>t.daysLate>0 && t.daysLate<10).length;
  const impayes = tenants.filter(t=>t.daysLate>=10).length;

  const filtered = tenants.filter(t=>{
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.nom.toLowerCase().includes(q) ||
      t.prenom.toLowerCase().includes(q) ||
      t.adresse.toLowerCase().includes(q) ||
      t.ville.toLowerCase().includes(q) ||
      t.mail.toLowerCase().includes(q);
    const matchFilter =
      filter==="tous"    ? true :
      filter==="ajour"   ? t.daysLate===0 :
      filter==="retard"  ? (t.daysLate>0 && t.daysLate<10) :
      filter==="impayes" ? t.daysLate>=10 : true;
    return matchSearch && matchFilter;
  });

  const COLS = ["Nom","Prénom","Bien rattaché","Adresse","Ville","Téléphone","État"];

  return (
    <main style={{ flex:1, overflowY:"auto", padding:"28px 32px 40px", display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <p style={{ fontSize:11, color:C.g2, fontFamily:C.mono, letterSpacing:"0.1em", marginBottom:6 }}>GESTION LOCATIVE</p>
          <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.03em" }}>Locataires</h1>
          <p style={{ fontSize:13, color:C.g2, marginTop:4 }}>{tenants.length} locataires actifs · {impayes} impayé{impayes>1?"s":""}</p>
        </div>
        <button onClick={onNewTenant} style={{
          background:`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:10,
          padding:"9px 18px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer",
          display:"flex", alignItems:"center", gap:7, letterSpacing:"0.06em",
          boxShadow:`0 4px 20px ${C.blueGlow}`, transition:"all 0.15s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(0,123,255,0.55)";e.currentTarget.style.transform="translateY(-1px)"}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${C.blueGlow}`;e.currentTarget.style.transform="none"}}>
          <I.Plus/> + Nouveau locataire
        </button>
      </div>

      {/* ── KPI STRIP ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"À JOUR",    value:aJour,   color:C.green,  bg:C.greenSub,  sub:`sur ${tenants.length} locataires`,   filter:"ajour"   },
          { label:"EN RETARD", value:retard,  color:C.yellow, bg:C.yellowSub, sub:"entre 1 et 9 jours",                 filter:"retard"  },
          { label:"IMPAYÉS",   value:impayes, color:C.red,    bg:C.redSub,    sub:"10 jours et plus",                   filter:"impayes" },
        ].map(k=>(
          <button key={k.filter} onClick={()=>setFilter(filter===k.filter?"tous":k.filter)}
            style={{
              background: filter===k.filter ? k.bg : C.card,
              border:`1px solid ${filter===k.filter ? k.color+"44" : C.border}`,
              borderRadius:12, padding:"16px 18px", cursor:"pointer", textAlign:"left",
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>{if(filter!==k.filter){e.currentTarget.style.borderColor=k.color+"33";e.currentTarget.style.background="#161616"}}}
            onMouseLeave={e=>{if(filter!==k.filter){e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card}}}>
            <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:filter===k.filter?k.color:C.g2, marginBottom:8 }}>{k.label}</p>
            <p style={{ fontSize:28, fontWeight:800, color:filter===k.filter?k.color:C.w, letterSpacing:"-0.04em", lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:11, color:C.g2, marginTop:6 }}>{k.sub}</p>
          </button>
        ))}
      </div>

      {/* ── TABLE CARD ── */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", flex:1 }}>

        {/* Table toolbar */}
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, maxWidth:320 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.g3, pointerEvents:"none" }}>
              <I.Search/>
            </span>
            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un locataire..."
              onFocus={()=>setSearchFocus(true)}
              onBlur={()=>setSearchFocus(false)}
              style={{
                width:"100%", background:"#0f0f0f",
                border:`1px solid ${searchFocus?C.blue:"#252525"}`,
                borderRadius:9, padding:"8px 12px 8px 34px",
                color:C.w, fontSize:12, fontFamily:C.font, outline:"none",
                boxShadow: searchFocus?`0 0 0 2px rgba(0,123,255,0.12)`:"none",
                transition:"all 0.15s",
              }}
            />
            {search && (
              <button onClick={()=>setSearch("")}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.g2, cursor:"pointer", padding:0 }}>
                <I.X/>
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {[{v:"tous",l:"Tous"},{v:"ajour",l:"À jour"},{v:"retard",l:"En retard"},{v:"impayes",l:"Impayés"}].map(f=>{
              const active = filter===f.v;
              const fCol = f.v==="ajour"?C.green:f.v==="retard"?C.yellow:f.v==="impayes"?C.red:C.blue;
              return (
                <button key={f.v} onClick={()=>setFilter(filter===f.v?"tous":f.v)}
                  style={{
                    background:active?(f.v==="tous"?C.blueSub:`${fCol}15`):"transparent",
                    border:`1px solid ${active?(f.v==="tous"?C.blue:fCol+"44"):"#252525"}`,
                    borderRadius:7, padding:"5px 12px",
                    color:active?(f.v==="tous"?C.blue:fCol):C.g2,
                    fontSize:11, cursor:"pointer", fontWeight:active?600:400,
                    transition:"all 0.15s",
                  }}>
                  {f.l}
                </button>
              );
            })}
            <span style={{ fontSize:11, color:C.g3, fontFamily:C.mono, marginLeft:4 }}>{filtered.length} résultat{filtered.length>1?"s":""}</span>
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"1.2fr 1fr 1.4fr 1.6fr 0.9fr 1.1fr 0.9fr",
          padding:"0 20px", height:38, gap:12,
          borderBottom:`1px solid ${C.border}`,
          alignItems:"center",
          background:"#0f0f0f",
        }}>
          {COLS.map(col=>(
            <span key={col} style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.1em", color:C.g3, textTransform:"uppercase" }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding:"48px 24px", textAlign:"center" }}>
              <div style={{ width:40, height:40, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"inline-flex", alignItems:"center", justifyContent:"center", color:C.blue, marginBottom:12 }}><I.Users/></div>
              <p style={{ fontSize:14, color:C.g2 }}>{tenants.length===0?"Aucun locataire pour le moment.":"Aucun locataire ne correspond à votre recherche."}</p>
              {tenants.length===0&&<p style={{ fontSize:11, color:C.g3, marginTop:6 }}>Ajoutez votre premier locataire via le bouton ci-dessus.</p>}
            </div>
          ) : (
            filtered.map(t=><TenantRow key={t.id} t={t} hov={hov} setHov={setHov} onSelectTenant={onSelectTenant}/>)
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:"12px 20px", borderTop:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"#0f0f0f",
        }}>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>
            {filtered.length} locataire{filtered.length>1?"s":""} affichés · Loyers du 1er du mois
          </span>
          <div style={{ display:"flex", gap:16 }}>
            {[
              { color:C.green,  label:"À jour" },
              { color:C.yellow, label:"En retard (J+1 à J+9)" },
              { color:C.red,    label:"Impayé (J+10 et +)" },
            ].map(l=>(
              <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:l.color, display:"inline-block" }}/>
                <span style={{ fontSize:10, color:C.g2, fontFamily:C.mono }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

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

/* ════════════════════════════════════════
   AUTH — LOGIN SCREEN
════════════════════════════════════════ */
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
  const v = (ville||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  // Try exact match
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const cn = city.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
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

/* ════════════════════════════════════════
   MON COMPTE — PAGE COMPLÈTE
════════════════════════════════════════ */
/* ════════════════════════════════════════
   KYC — MES INFORMATIONS (fil d'Ariane)
════════════════════════════════════════ */
const KYC_PILLARS = [
  {
    id:"civil", emoji:"👤", label:"Profil Civil", short:"Civil",
    color:"#6366F1",
    questions:[
      { key:"etatCivil",    label:"État civil", type:"select",
        options:["Célibataire","Marié — Communauté","Marié — Séparation de biens","PACS","Concubinage"],
        info:"Détermine le régime matrimonial applicable et les règles de propriété du bien." },
      { key:"enfants",      label:"Avez-vous des enfants ?", type:"select",
        options:["Non","1 enfant","2 enfants","3 enfants","4 enfants et plus"],
        info:"Impact sur le quotient familial et les stratégies de transmission." },
      { key:"ageEnfants",   label:"Âge moyen des enfants", type:"number", unit:"ans", placeholder:"ex : 8", optional:true,
        info:"Permet de calibrer les abattements en cas de démembrement de propriété." },
      { key:"residenceFiscale", label:"Résidence fiscale", type:"select",
        options:["France (métropole)","France (DOM-TOM)","Suisse","Expatrié UE","Expatrié hors UE"],
        info:"Conditionne l'éligibilité au LMNP et les conventions fiscales applicables." },
      { key:"age",          label:"Votre âge", type:"number", unit:"ans", placeholder:"ex : 38",
        info:"Crucial pour le calcul des abattements en cas de donation ou démembrement de propriété (barème fiscal de l'usufruit)." },
      { key:"investisseurs", label:"Investissement", type:"select",
        options:["Seul","En couple (conjoint)","En famille","Entre amis (hors famille)","En association professionnelle"],
        info:"Détermine le véhicule optimal : détention en nom propre, SCI, SARL de famille..." },
    ],
  },
  {
    id:"financier", emoji:"💰", label:"Profil Financier", short:"Financier",
    color:"#10B981",
    questions:[
      { key:"tmi", label:"Tranche Marginale d'Imposition (TMI)", type:"select",
        options:["0 % — Non imposable","11 % — Tranche basse","30 % — Tranche médiane","41 % — Haute tranche","45 % — Tranche maximale"],
        info:"Plus votre TMI est élevé, plus le LMNP Réel est avantageux face à une location nue." },
      { key:"revenusAnnuels", label:"Revenus d'activité annuels (N-1)", type:"number", unit:"€", placeholder:"ex : 85000",
        info:"Indispensable pour le test de basculement LMNP → LMP (Loueur Meublé Professionnel) à 23 000 €/an de recettes." },
      { key:"revenusFonciers", label:"Revenus fonciers existants", type:"number", unit:"€/an", placeholder:"0 si aucun", optional:true,
        info:"Location nue en cours. Peut créer un déficit foncier reportable et influer sur la structure recommandée." },
      { key:"ifi", label:"Êtes-vous assujetti à l'IFI ?", type:"select",
        options:["Non — Patrimoine net < 1,3 M€","Oui — Patrimoine net entre 1,3 et 2 M€","Oui — Patrimoine net > 2 M€"],
        info:"L'IFI (>1,3 M€ de patrimoine immobilier net) peut orienter vers une SCI à l'IS pour sortir les actifs de l'assiette." },
      { key:"deficitFoncier", label:"Déficits fonciers reportables ?", type:"select",
        options:["Non","Oui — moins de 5 000 €","Oui — entre 5 000 et 20 000 €","Oui — plus de 20 000 €"],
        info:"Des déficits fonciers reportables peuvent rendre la location nue temporairement plus intéressante." },
    ],
  },
  {
    id:"projet", emoji:"🏘️", label:"Projet Immobilier", short:"Projet",
    color:"#F59E0B",
    questions:[
      { key:"typeBien", label:"Type de bien", type:"select",
        options:["Appartement","Maison","Immeuble de rapport","Local commercial converti","Résidence étudiante","Résidence senior"],
        info:"Le type de bien conditionne les règles d'amortissement et la gestion locative applicable." },
      { key:"modeExploitation", label:"Mode d'exploitation visé", type:"select",
        options:["LMNP — Meublé longue durée","Colocation meublée","Saisonnier / Airbnb","Location nue (revenus fonciers)","Mixte (longue durée + saisonnier)"],
        info:"La location meublée (LMNP) ouvre l'amortissement. La location nue relève des revenus fonciers — régime différent." },
      { key:"travauxType", label:"Nature des travaux prévus", type:"select", optional:true,
        options:["Aucuns travaux","Entretien / rafraîchissement","Amélioration (cuisine, salle de bain)","Rénovation lourde","Reconstruction / division"],
        info:"Les travaux d'entretien sont déductibles immédiatement. Les travaux d'amélioration sont amortis sur leur durée de vie." },
      { key:"partTerrain", label:"Part estimée du terrain", type:"select",
        options:["Standard — 15 %","Urbain dense — 20 %","Zone tendue — 25 %","Rural — 10 %","Je ne sais pas (15% appliqué)"],
        info:"Le terrain n'est pas amortissable. Plus sa quote-part est faible, plus la base amortissable est élevée." },
    ],
  },
  {
    id:"strategie", emoji:"🎯", label:"Stratégie", short:"Stratégie",
    color:"#007BFF",
    questions:[
      { key:"objectifPrioritaire", label:"Objectif prioritaire", type:"select",
        options:["Générer des revenus immédiats (cash-flow)","Préparer la retraite (patrimoine)","Réduire mes impôts actuels","Transmettre un capital à mes enfants","Équilibre revenus + patrimoine"],
        info:"L'objectif détermine le véhicule : LMNP pour la réduction fiscale, SCI IS pour la capitalisation, démembrement pour la transmission." },
      { key:"horizonDetention", label:"Durée de détention prévue", type:"select",
        options:["Court terme — moins de 5 ans","Moyen terme — 10 à 15 ans","Long terme — 20 ans et plus","Indéfini / À vie"],
        info:"Déterminant pour la SCI à l'IS : piège fiscal à la revente si détention courte (pas d'abattement sur plus-value)." },
      { key:"revente", label:"Intention de revente ?", type:"select",
        options:["Oui — revente probable à terme","Non — bien patrimonial à conserver","Transmission aux héritiers sans revente","Indécis"],
        info:"La SCI à l'IS est un piège si revente envisagée : la plus-value est taxée à l'IS puis à l'IR lors de la distribution." },
      { key:"liquidite", label:"Besoin de liquidité sur les loyers", type:"select",
        options:["Élevé — j'ai besoin des loyers pour vivre","Modéré — je veux un complément de revenu","Faible — je préfère capitaliser et réinvestir","Nul — optimisation fiscale pure"],
        info:"Un besoin de liquidité élevé exclut les structures opaques (SCI IS) où distribuer les bénéfices génère une double imposition." },
    ],
  },
  {
    id:"transmission", emoji:"👨‍👩‍👧‍👦", label:"Transmission", short:"Succession",
    color:"#8B5CF6",
    questions:[
      { key:"enfantsMontage", label:"Intégrer vos enfants dans le montage ?", type:"select",
        options:["Non","Oui — via une SCI","Oui — via une SARL de Famille","Oui — donation nue-propriété","À étudier"],
        info:"La SARL de Famille permet l'option IR + amortissements LMNP + transmission facilitée. Très puissant si enfants majeurs." },
      { key:"donationNue", label:"Donation de nue-propriété envisagée ?", type:"select",
        options:["Non — pas d'horizon","Oui — dans les 5 ans","Oui — dans les 10–15 ans","Déjà en cours"],
        info:"Donner la nue-propriété jeune réduit la valeur taxable (barème de l'usufruit). Stratégie de transmission à anticiper tôt." },
      { key:"protectionConjoint", label:"Protection du conjoint en cas de décès", type:"select",
        options:["Non nécessaire (célibataire)","Clause de réversibilité souhaitée","Quasi-usufruit","Testament déjà rédigé","À étudier avec un notaire"],
        info:"Le quasi-usufruit permet au conjoint survivant de percevoir les revenus sans être propriétaire. Crucial en SCI." },
    ],
  },
  {
    id:"gestion", emoji:"⚙️", label:"Gestion & Logistique", short:"Gestion",
    color:"#F97316",
    questions:[
      { key:"modeGestion", label:"Mode de gestion du bien", type:"select",
        options:["Autogestion complète","Agence locative (5–8 %)","Conciergerie (Airbnb, ~20 %)","Co-gestion (agence + supervision)"],
        info:"L'autogestion maximise le cash-flow mais nécessite du temps. L'agence est déductible fiscalement en LMNP." },
      { key:"comptabilite", label:"Prêt(e) à tenir une comptabilité commerciale ?", type:"select",
        options:["Oui — j'ai déjà un expert-comptable","Oui — je suis prêt(e) à en prendre un","Non — je préfère le micro-BIC ou le foncier","Indécis"],
        info:"La comptabilité commerciale (bilan/liasse) est obligatoire en LMNP Réel et en société. Coût ~600–1 500 €/an." },
      { key:"deductionFrais", label:"Déduire frais de déplacement & bureau ?", type:"select",
        options:["Oui — c'est important pour moi","Non — pas de frais significatifs","Je ne savais pas que c'était possible"],
        info:"En LMNP Réel ou en société, vos frais de déplacement, de repas liés à la gestion et même un bureau à domicile sont déductibles. Impossible en revenus fonciers." },
      { key:"objectifCF", label:"Cash-flow mensuel cible", type:"number", unit:"€/mois", placeholder:"ex : 300", optional:true,
        info:"Votre cible de cash-flow mensuel net après toutes charges et impôts. Aide à calibrer le levier bancaire optimal." },
    ],
  },
];

function KYCWizard({ kycData, onSave }) {
  const [step,    setStep]    = useState(0);
  const [data,    setData]    = useState(kycData || {});
  const [saved,   setSaved]   = useState(false);
  const [animate, setAnimate] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const pillar  = KYC_PILLARS[step];
  const total   = KYC_PILLARS.length;
  const progress = KYC_PILLARS.slice(0, step).reduce((acc,p)=>acc+p.questions.length, 0);
  const totalQ   = KYC_PILLARS.reduce((acc,p)=>acc+p.questions.length, 0);
  const filled   = Object.keys(data).length;
  const pct      = Math.round((filled / totalQ) * 100);

  const goTo = (idx) => {
    setAnimate(true);
    setTimeout(()=>{ setStep(idx); setAnimate(false); }, 160);
  };

  const handleSaveAll = () => {
    onSave(data);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const setField = (key, val) => setData(d=>({...d, [key]: val}));

  const pillarComplete = (p) => p.questions.filter(q=>!q.optional).every(q=>data[q.key]);
  const allDone = KYC_PILLARS.every(p=>pillarComplete(p));

  // ── Simulation from KYC data ──
  const runSimulation = () => {
    setSimLoading(true);
    setTimeout(() => {
      // Map KYC data → simulation params
      const tmiMap = {"0 % — Non imposable":0,"11 % — Tranche basse":11,"30 % — Tranche médiane":30,"41 % — Haute tranche":41,"45 % — Tranche maximale":45};
      const tmi = tmiMap[data.tmi] || 30;
      const revAn = parseInt(data.revenusAnnuels) || 50000;
      const isMeuble = (data.modeExploitation||"").toLowerCase().includes("meubl") || (data.modeExploitation||"").includes("LMNP") || (data.modeExploitation||"").includes("saisonnier") || (data.modeExploitation||"").includes("Airbnb");
      const isNue = (data.modeExploitation||"").toLowerCase().includes("nue") || (data.modeExploitation||"").toLowerCase().includes("foncier");
      const loyerEst = parseInt(data.revenusFonciers) || parseInt(data.objectifCF)*12 || 12000;
      const chargesEst = Math.round(loyerEst * 0.3);
      const prixEst = Math.round(loyerEst / 0.05); // estimation ~5% rendement
      const enfantsMap = {"Non":0,"1 enfant":1,"2 enfants":2,"3 enfants":3,"4 enfants et plus":4};
      const nEnfants = enfantsMap[data.enfants] || 0;
      const couple = (data.etatCivil||"").includes("Marié") || (data.etatCivil||"").includes("PACS");
      const horizonMap = {"< 5 ans":5,"5 à 10 ans":8,"10 à 20 ans":15,"> 20 ans":25,"Indéterminé":15};
      const duree = horizonMap[data.horizonDetention] || 15;

      const pr = {objectives:[{id:"revenus",weight:40},{id:"optimiser-locatif",weight:35},{id:"transmettre",weight:25}],
        age:parseInt(data.age)||45, couple, regimeMatrimonial:couple?"communaute-reduite":"separation",
        enfants:nEnfants, donationsAnterieures:0, tmi, revenuGlobal:revAn};
      const pp = {mode:"acquisition",type:"locatif",isRP:false,prixAcquisition:prixEst,valeurActuelle:prixEst,
        dateAcquisition:"2026-01-01",anneesDetention:0,travaux:0,dettes:Math.round(prixEst*0.75),
        regimeFiscal:isNue?"reel":"reel",loyerAnnuel:loyerEst,chargesLocatives:chargesEst,
        meuble:isMeuble,acqMeuble:isMeuble,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:prixEst,
        acqDureeDetention:duree,acqTauxRevalo:2,acqLoyer:loyerEst,acqCharges:chargesEst,acqTaxeFonciere:Math.round(prixEst*0.007)};

      const scenarios = simGenAcq(pr, pp);
      setSimResult({ scenarios: scenarios.slice(0, 3), params: {tmi, isMeuble, loyerEst, prixEst, duree, nEnfants, couple}, date: new Date().toLocaleDateString("fr-FR") });
      setSimLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%" }}>

      {/* Breadcrumb fil d'Ariane */}
      <div style={{ padding:"14px 0 0", marginBottom:16 }}>
        <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:10 }}>
          MES INFORMATIONS · PROFIL INVESTISSEUR
        </p>
        {/* Progress global */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ flex:1, height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.blue},#6366f1)`, borderRadius:99, transition:"width 0.4s ease" }}/>
          </div>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g2, flexShrink:0 }}>{filled}/{totalQ} renseignés</span>
        </div>
        {/* Steps */}
        <div style={{ display:"flex", alignItems:"center", gap:0 }}>
          {KYC_PILLARS.map((p, i) => {
            const isActive  = i === step;
            const isDone    = pillarComplete(p);
            const isPast    = i < step;
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
                <button
                  onClick={()=>goTo(i)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    background:"none", border:"none", cursor:"pointer", padding:"4px 2px",
                    flex:1, minWidth:0,
                  }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12,
                    background: isActive ? p.color : isDone ? `${p.color}22` : "rgba(255,255,255,0.05)",
                    border:`2px solid ${isActive ? p.color : isDone ? `${p.color}60` : "rgba(255,255,255,0.1)"}`,
                    boxShadow: isActive ? `0 0 12px ${p.color}50` : "none",
                    transition:"all 0.2s",
                  }}>
                    {isDone && !isActive
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : <span style={{ fontSize:10 }}>{p.emoji}</span>
                    }
                  </div>
                  <span style={{ fontSize:8, fontFamily:C.mono, color: isActive ? p.color : isDone ? C.g2 : C.g3, letterSpacing:"0.06em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%" }}>
                    {p.short}
                  </span>
                </button>
                {i < total-1 && (
                  <div style={{ width:1, height:2, flex:"0 0 auto", background: i<step ? `${KYC_PILLARS[i+1].color}50` : "rgba(255,255,255,0.08)", margin:"0 1px", marginBottom:14 }}/>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pilier actif */}
      <div style={{
        flex:1, overflowY:"auto",
        opacity: animate ? 0 : 1,
        transform: animate ? "translateY(6px)" : "translateY(0)",
        transition:"all 0.16s ease",
      }}>
        {/* En-tête pilier */}
        <div style={{ marginBottom:16, padding:"14px 16px", background:`${pillar.color}0e`, border:`1px solid ${pillar.color}25`, borderRadius:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>{pillar.emoji}</span>
            <div>
              <p style={{ fontSize:13, fontWeight:800, color:C.w, letterSpacing:"-0.01em" }}>Pilier {step+1} — {pillar.label}</p>
              <p style={{ fontSize:9.5, color:C.g3, marginTop:2 }}>
                {step+1}/{total} · {pillar.questions.filter(q=>!q.optional).length} questions essentielles
                {pillar.questions.some(q=>q.optional) ? ` + ${pillar.questions.filter(q=>q.optional).length} optionnelles` : ""}
              </p>
            </div>
            {pillarComplete(pillar) && (
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5, background:`${C.green}12`, border:`1px solid ${C.greenBord}`, borderRadius:18, padding:"3px 10px" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                <span style={{ fontSize:9, color:C.green, fontFamily:C.mono }}>COMPLÉTÉ</span>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {pillar.questions.map((q) => (
            <KYCField key={q.key} q={q} value={data[q.key]||""} onChange={v=>setField(q.key,v)} accentColor={pillar.color}/>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", gap:8, marginTop:18 }}>
          {step > 0 && (
            <button onClick={()=>goTo(step-1)}
              style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border2}`, borderRadius:10, padding:"11px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;}} onMouseLeave={e=>{e.currentTarget.style.color=C.g2;}}>
              ← Pilier précédent
            </button>
          )}
          {step < total-1 ? (
            <button onClick={()=>goTo(step+1)}
              style={{ flex:2, background:`linear-gradient(135deg,${pillar.color},${pillar.color}cc)`, border:"none", borderRadius:10, padding:"11px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${pillar.color}30`, transition:"all 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              Pilier suivant →
            </button>
          ) : (
            <button onClick={handleSaveAll}
              style={{ flex:2, background:saved?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${pillar.color},${pillar.color}cc)`, border:"none", borderRadius:10, padding:"11px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${pillar.color}30`, transition:"all 0.3s" }}>
              {saved ? "✓ Profil sauvegardé !" : allDone ? "💾 Enregistrer mon profil complet" : "💾 Enregistrer (partiel)"}
            </button>
          )}
        </div>

        {/* Score de complétude */}
        {step === total-1 && (
          <div style={{ marginTop:12, padding:"10px 14px", background: allDone ? `${C.green}0e` : "rgba(245,158,11,0.07)", border:`1px solid ${allDone ? C.greenBord : "rgba(245,158,11,0.25)"}`, borderRadius:10 }}>
            <p style={{ fontSize:10, color: allDone ? C.green : C.yellow, fontFamily:C.mono }}>
              {allDone
                ? "✅ Profil complet — EQUITY peut générer votre recommandation de structure juridique optimale."
                : `⚠️ ${totalQ - filled} champs manquants — Remplissez-les pour obtenir une analyse fiscale précise.`}
            </p>
          </div>
        )}

        {/* ── Simulation de statut ── */}
        {pct >= 40 && (
          <div style={{ marginTop:16 }}>
            {/* Button */}
            {!simResult && (
              <button onClick={runSimulation} disabled={simLoading}
                style={{ width:"100%", padding:"14px", borderRadius:12, border:"none",
                  background:simLoading?"#1a1a1a":"linear-gradient(135deg,#8B5CF6,#6D28D9)",
                  color:simLoading?C.g3:"#fff", fontSize:13, fontWeight:700, cursor:simLoading?"wait":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  boxShadow:simLoading?"none":"0 4px 20px rgba(139,92,246,0.3)", transition:"all 0.2s" }}>
                {simLoading ? (
                  <><div style={{ width:14, height:14, border:"2px solid rgba(139,92,246,0.3)", borderTopColor:"#8B5CF6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/> Analyse en cours…</>
                ) : (
                  <><I.Sparkles/> Simuler mon statut optimal</>
                )}
              </button>
            )}

            {/* Result card */}
            {simResult && (
              <div style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.03))", border:"1px solid rgba(139,92,246,0.2)", borderRadius:14, overflow:"hidden" }}>
                {/* Header */}
                <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(139,92,246,0.12)", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"#8B5CF6" }}>
                    <I.Sparkles/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:9, fontFamily:C.mono, letterSpacing:"0.12em", color:"#8B5CF6" }}>PROFIL CONSEILLÉ</p>
                    <p style={{ fontSize:10, color:C.g3 }}>Analyse du {simResult.date} · {simResult.params.isMeuble?"Meublé":"Location nue"} · TMI {simResult.params.tmi}%</p>
                  </div>
                  <button onClick={()=>setSimResult(null)} style={{ background:"none", border:"none", color:C.g3, cursor:"pointer", padding:0 }}><I.X/></button>
                </div>

                {/* Top 3 scenarios */}
                <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
                  {simResult.scenarios.map((s, i) => {
                    const medal = i===0?"🥇":i===1?"🥈":"🥉";
                    const isTop = i===0;
                    return (
                      <div key={s.id} style={{
                        background:isTop?"rgba(139,92,246,0.08)":"#0a0a0a",
                        border:`1.5px solid ${isTop?"rgba(139,92,246,0.3)":C.border}`,
                        borderRadius:11, padding:"12px 14px", transition:"all 0.15s",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:isTop?8:0 }}>
                          <span style={{ fontSize:16 }}>{medal}</span>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:isTop?14:12, fontWeight:isTop?800:600, color:isTop?"#8B5CF6":C.w, letterSpacing:isTop?"-0.02em":"0" }}>{s.nom}</p>
                            <p style={{ fontSize:10, color:C.g2, marginTop:1 }}>{s.description}</p>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <p style={{ fontSize:isTop?18:14, fontWeight:800, color:isTop?"#8B5CF6":C.g1, fontFamily:C.mono }}>{s.score}</p>
                            <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3 }}>SCORE</p>
                          </div>
                        </div>
                        {isTop && s.phases && (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginTop:6 }}>
                            {s.phases.detention?.fiscAnnuelle != null && (
                              <div style={{ background:"#0a0a0a", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                                <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:2 }}>FISCALITÉ /AN</p>
                                <p style={{ fontSize:13, fontWeight:800, color:C.w }}>{simFmt(s.phases.detention.fiscAnnuelle)}</p>
                              </div>
                            )}
                            {s.phases.detention?.rendement && (
                              <div style={{ background:"#0a0a0a", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                                <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:2 }}>RENDEMENT</p>
                                <p style={{ fontSize:13, fontWeight:800, color:C.green }}>{s.phases.detention.rendement}</p>
                              </div>
                            )}
                            {s.phases.detention?.cashflow != null && (
                              <div style={{ background:"#0a0a0a", borderRadius:7, padding:"8px 10px", textAlign:"center" }}>
                                <p style={{ fontSize:8, fontFamily:C.mono, color:C.g3, marginBottom:2 }}>CASHFLOW /AN</p>
                                <p style={{ fontSize:13, fontWeight:800, color:s.phases.detention.cashflow>=0?C.green:C.red }}>{simFmt(s.phases.detention.cashflow)}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {isTop && s.avantages && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:8 }}>
                            {s.avantages.slice(0,4).map((a,j) => (
                              <span key={j} style={{ fontSize:8.5, fontFamily:C.mono, color:"#8B5CF6", background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.18)", padding:"2px 7px", borderRadius:4 }}>{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ padding:"10px 18px", borderTop:"1px solid rgba(139,92,246,0.12)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:9, color:C.g3, fontStyle:"italic" }}>Simulation indicative · Consultez un expert-comptable</p>
                  <button onClick={runSimulation}
                    style={{ background:"none", border:`1px solid ${C.border2}`, borderRadius:7, padding:"4px 12px", color:C.g2, fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}
                    onMouseEnter={e=>e.currentTarget.style.color="#8B5CF6"} onMouseLeave={e=>e.currentTarget.style.color=C.g2}>
                    <I.Sparkles/> Relancer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KYCField({ q, value, onChange, accentColor }) {
  const [focus, setFocus] = useState(false);
  const baseInput = {
    background:"transparent", border:"none", outline:"none",
    fontSize:13, fontWeight:600, color:C.w,
    width:"100%", fontFamily:C.mono,
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <label style={{ fontSize:9.5, fontFamily:C.mono, letterSpacing:"0.08em", color:C.g2, textTransform:"uppercase", flex:1 }}>
          {q.label}
        </label>
        {q.optional && <span style={{ fontSize:7.5, fontFamily:C.mono, color:C.g3, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:3, padding:"1px 5px" }}>OPT.</span>}
        {q.info && (
          <div style={{ position:"relative", display:"inline-flex" }}>
            <KYCInfoTip text={q.info} color={accentColor}/>
          </div>
        )}
      </div>
      <div style={{
        display:"flex", alignItems:"center",
        background: focus ? `${accentColor}08` : "rgba(255,255,255,0.03)",
        border:`1px solid ${focus ? `${accentColor}50` : value ? `${accentColor}25` : C.border2}`,
        borderRadius:9, padding:"0 12px",
        transition:"all 0.15s",
        boxShadow: focus ? `0 0 0 2px ${accentColor}18` : "none",
      }}>
        {q.type === "select" ? (
          <select value={value} onChange={e=>onChange(e.target.value)}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            style={{ ...baseInput, padding:"10px 0", cursor:"pointer",
              MozAppearance:"none", WebkitAppearance:"none", appearance:"none",
              color: value ? C.w : C.g3,
            }}>
            <option value="" disabled style={{ background:"#1a1a1a", color:C.g3 }}>— Sélectionner</option>
            {q.options.map(o=>(
              <option key={o} value={o} style={{ background:"#1a1a1a", color:C.w }}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            type={q.type||"text"}
            value={value}
            placeholder={q.placeholder||""}
            onChange={e=>onChange(e.target.value)}
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            style={{ ...baseInput, padding:"10px 0" }}
          />
        )}
        {q.unit && <span style={{ fontSize:11, color:C.g3, fontFamily:C.mono, marginLeft:6, flexShrink:0 }}>{q.unit}</span>}
        {q.type==="select" && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.g3} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginLeft:6 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>
      {/* Valeur sélectionnée mise en avant */}
      {value && (
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:accentColor, flexShrink:0 }}/>
          <span style={{ fontSize:9.5, color:accentColor, fontFamily:C.mono }}>{value}</span>
        </div>
      )}
    </div>
  );
}

function KYCInfoTip({ text, color="#007BFF" }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
      <div
        onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}
        style={{ width:14, height:14, borderRadius:"50%", background:`${color}15`, border:`1px solid ${color}35`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"help", flexShrink:0 }}>
        <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5.5" stroke={color} strokeWidth="1.2"/>
          <text x="6" y="9" textAnchor="middle" fill={color} fontSize="7" fontFamily="monospace" fontWeight="700">i</text>
        </svg>
      </div>
      {show && (
        <div style={{ position:"absolute", bottom:"calc(100% + 7px)", right:0, background:"#1e1e1e", border:`1px solid ${color}35`, borderRadius:10, padding:"9px 13px", width:220, zIndex:9999, boxShadow:"0 8px 32px rgba(0,0,0,0.7)", pointerEvents:"none" }}>
          <p style={{ fontSize:10.5, color:C.g1, lineHeight:1.7, fontFamily:C.mono }}>{text}</p>
        </div>
      )}
    </div>
  );
}


function MonComptePanel({ user, onClose, onLogout, onSave, kycData, onSaveKyc }) {
  const [tab,      setTab]      = useState("profil");
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ ...user });
  const [saved,    setSaved]    = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(()=>{ setSaved(false); setEditing(false); }, 1400);
  };

  const initials = ((form.prenom?.[0]||"") + (form.nom?.[0]||"")).toUpperCase() || "?";

  const PLAN_FEATURES = [
    { label:"Biens suivis",       value:"Illimité", ok:true  },
    { label:"Locataires",         value:"Illimité", ok:true  },
    { label:"Analyses IA / mois", value:"100",      ok:true  },
    { label:"Scan de documents",  value:"Illimité", ok:true  },
    { label:"Export PDF/Excel",   value:"✓",        ok:true  },
    { label:"Support prioritaire",value:"✓",        ok:true  },
  ];

  const MField = ({label,k,type="text",placeholder,full}) => (
    <div style={{ background: editing?"rgba(0,123,255,0.03)":"#0a0a0a", border:`1px solid ${editing?"rgba(0,123,255,0.25)":C.border}`, borderRadius:10, padding:"10px 14px", gridColumn:full?"span 2":"auto", transition:"all 0.15s" }}>
      <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:5 }}>{label.toUpperCase()}</p>
      <input
        type={type} value={form[k]||""} readOnly={!editing}
        onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        placeholder={placeholder||"—"}
        style={{ background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:600, color:editing?C.w:C.g1, width:"100%", cursor:editing?"text":"default" }}
      />
    </div>
  );

  return (
    <main style={{ flex:1, overflowY:"auto", background:C.bg, display:"flex", flexDirection:"column", animation:"fadeUp 0.3s ease" }}>
      <div style={{ maxWidth:620, width:"100%", margin:"0 auto", display:"flex", flexDirection:"column", flex:1 }}>

        {/* ── HEADER ── */}
        <div style={{ padding:"28px 32px 0", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <p style={{ fontSize:10, fontFamily:C.mono, letterSpacing:"0.14em", color:C.blue }}>MON COMPTE</p>
            <button onClick={onClose} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:8, padding:"6px 14px", cursor:"pointer", color:C.g2, display:"flex", alignItems:"center", gap:6, fontSize:11, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=C.w;e.currentTarget.style.borderColor="#3B3B44";}}
              onMouseLeave={e=>{e.currentTarget.style.color=C.g2;e.currentTarget.style.borderColor=C.border2;}}>
              <I.X/> Fermer
            </button>
          </div>

          {/* Avatar + identity */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, flexShrink:0, boxShadow:"0 4px 16px rgba(99,102,241,0.35)" }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, letterSpacing:"-0.02em", marginBottom:2 }}>{form.prenom} {form.nom}</p>
              <p style={{ fontSize:11, color:C.g2, marginBottom:4 }}>{form.email}</p>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:9, fontFamily:C.mono, color:C.blue, background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", padding:"2px 8px", borderRadius:4 }}>PLAN {form.plan?.toUpperCase()}</span>
                <span style={{ fontSize:9, fontFamily:C.mono, color:C.green, background:C.greenSub, border:`1px solid ${C.greenBord}`, padding:"2px 8px", borderRadius:4 }}>● ACTIF</span>
              </div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display:"flex", gap:0 }}>
            {[["profil","Profil"],["kyc","Mes informations"],["securite","Sécurité"],["plan","Mon plan"]].map(([k,l])=>{
              const active = tab===k;
              return (
                <button key={k} onClick={()=>setTab(k)} style={{ background:"transparent", border:"none", padding:"8px 14px", fontSize:11, fontWeight:active?700:500, color:active?C.blue:C.g2, cursor:"pointer", borderBottom:active?`2px solid ${C.blue}`:"2px solid transparent", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex:1, padding:"24px 32px 32px" }}>

          {/* ── PROFIL TAB ── */}
          {tab==="profil" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em" }}>INFORMATIONS PERSONNELLES</p>
                {!editing
                  ? <button onClick={()=>setEditing(true)} style={{ background:C.blueSub, border:"1px solid rgba(0,123,255,0.25)", borderRadius:7, padding:"5px 12px", color:C.blue, fontSize:11, fontWeight:600, cursor:"pointer" }}>Modifier</button>
                  : <div style={{ display:"flex", gap:7 }}>
                      <button onClick={()=>{setEditing(false);setForm({...user});}} style={{ background:"#1a1a1a", border:`1px solid ${C.border2}`, borderRadius:7, padding:"5px 12px", color:C.g2, fontSize:11, cursor:"pointer" }}>Annuler</button>
                      <button onClick={handleSave} style={{ background:saved?"linear-gradient(135deg,#059669,#047857)":`linear-gradient(135deg,${C.blue},#2563EB)`, border:"none", borderRadius:7, padding:"5px 14px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.3s" }}>
                        {saved ? "✓ Sauvegardé" : "Enregistrer"}
                      </button>
                    </div>
                }
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                <MField label="Prénom"    k="prenom"    placeholder="Thomas"/>
                <MField label="Nom"       k="nom"       placeholder="Dubois"/>
                <MField label="E-mail"    k="email"     type="email" placeholder="thomas@exemple.fr" full/>
                <MField label="Téléphone" k="telephone" type="tel"   placeholder="06 12 34 56 78"/>
                <MField label="Régime fiscal principal" k="regime"   placeholder="LMNP Réel"/>
              </div>

              {/* Member since */}
              <div style={{ marginTop:4, background:"#08080A", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:C.g3 }}><I.Calendar/></span>
                  <span style={{ fontSize:11, color:C.g2 }}>Membre depuis</span>
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:C.g1, fontFamily:C.mono }}>{user.dateInscription}</span>
              </div>
            </div>
          )}

          {/* ── KYC — MES INFORMATIONS ── */}
          {tab==="kyc" && (
            <KYCWizard kycData={kycData} onSave={onSaveKyc}/>
          )}

          {/* ── SÉCURITÉ TAB ── */}
          {tab==="securite" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <p style={{ fontSize:9, fontFamily:C.mono, color:C.g3, letterSpacing:"0.1em", marginBottom:4 }}>SÉCURITÉ DU COMPTE</p>

              {[
                { label:"Mot de passe", sub:"Dernière modification : jamais", action:"Modifier", color:C.blue },
                { label:"Double authentification (2FA)", sub:"Non activée — recommandé", action:"Activer", color:C.green },
                { label:"Sessions actives", sub:"1 session ouverte (ce navigateur)", action:"Voir", color:C.blue },
              ].map((item,i)=>(
                <div key={i} style={{ background:"#08080A", border:`1px solid ${C.border}`, borderRadius:11, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:C.w, marginBottom:3 }}>{item.label}</p>
                    <p style={{ fontSize:11, color:C.g2 }}>{item.sub}</p>
                  </div>
                  <button style={{ background:`${item.color}15`, border:`1px solid ${item.color}30`, borderRadius:7, padding:"6px 14px", color:item.color, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${item.color}25`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${item.color}15`;}}>
                    {item.action}
                  </button>
                </div>
              ))}

              {/* Delete zone */}
              <div style={{ marginTop:8, background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:11, padding:"14px 16px" }}>
                <p style={{ fontSize:12, fontWeight:600, color:C.red, marginBottom:4 }}>Zone de danger</p>
                <p style={{ fontSize:11, color:C.g2, marginBottom:12 }}>La suppression du compte est irréversible. Toutes vos données seront effacées.</p>
                <button style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"7px 16px", color:C.red, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,0.18)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,0.1)"}>
                  Supprimer mon compte
                </button>
              </div>
            </div>
          )}

          {/* ── PLAN TAB ── */}
          {tab==="plan" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* Current plan card */}
              <div style={{ background:"linear-gradient(135deg,rgba(0,123,255,0.1),rgba(0,123,255,0.03))", border:"1px solid rgba(0,123,255,0.25)", borderRadius:14, padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:9, fontFamily:C.mono, color:C.blue, letterSpacing:"0.1em", marginBottom:4 }}>PLAN ACTUEL</p>
                    <p style={{ fontSize:22, fontWeight:800, color:C.w, letterSpacing:"-0.03em" }}>EQUITY Pro</p>
                  </div>
                  <span style={{ fontSize:18, fontWeight:800, color:C.blue }}>49 €<span style={{ fontSize:11, color:C.g2, fontWeight:400 }}>/mois</span></span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {PLAN_FEATURES.map((f,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      <span style={{ fontSize:11, color:C.g1 }}>{f.label}</span>
                      <span style={{ fontSize:10, color:C.blue, fontFamily:C.mono, marginLeft:"auto" }}>{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button style={{ background:"#111", border:`1px solid ${C.border}`, borderRadius:11, padding:"12px", color:C.g2, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#3B3B44";e.currentTarget.style.color=C.w;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g2;}}>
                Gérer l'abonnement →
              </button>
            </div>
          )}
        </div>

        {/* ── STICKY FOOTER — Déconnexion ── */}
        <div style={{ padding:"20px 32px 32px", marginTop:"auto" }}>
          <button
            onClick={onLogout}
            style={{ width:"100%", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:11, padding:"12px", color:C.red, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:9, letterSpacing:"0.04em", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.14)";e.currentTarget.style.borderColor="rgba(239,68,68,0.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.07)";e.currentTarget.style.borderColor="rgba(239,68,68,0.2)";}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </main>
  );
}

/* ════════════════════════════════════════
   ROOT APP
════════════════════════════════════════ */

const SIM_ABT_DON = { "parent-enfant":{montant:100000,rappel:15},"grand-parent-petit-enfant":{montant:31865,rappel:15},"epoux-pacs":{montant:80724,rappel:15},"handicap":{montant:159325,rappel:15} };
const SIM_BAR_USU = [{ageMin:0,ageMax:20,usufruit:90,nuePropriete:10},{ageMin:21,ageMax:30,usufruit:80,nuePropriete:20},{ageMin:31,ageMax:40,usufruit:70,nuePropriete:30},{ageMin:41,ageMax:50,usufruit:60,nuePropriete:40},{ageMin:51,ageMax:60,usufruit:50,nuePropriete:50},{ageMin:61,ageMax:70,usufruit:40,nuePropriete:60},{ageMin:71,ageMax:80,usufruit:30,nuePropriete:70},{ageMin:81,ageMax:90,usufruit:20,nuePropriete:80},{ageMin:91,ageMax:999,usufruit:10,nuePropriete:90}];
const SIM_BAR_DR = [{min:0,max:8072,taux:5},{min:8072,max:12109,taux:10},{min:12109,max:15932,taux:15},{min:15932,max:552324,taux:20},{min:552324,max:902838,taux:30},{min:902838,max:1805677,taux:40},{min:1805677,max:Infinity,taux:45}];
const SIM_ABT_IR = [0,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,4,100];
const SIM_ABT_PS = [0,0,0,0,0,0,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.65,1.60,9,9,9,9,9,9,9,9,100];
const SIM_IFI_B = [{min:0,max:800000,taux:0},{min:800000,max:1300000,taux:0.5},{min:1300000,max:2570000,taux:0.7},{min:2570000,max:5000000,taux:1},{min:5000000,max:10000000,taux:1.25},{min:10000000,max:Infinity,taux:1.5}];

const SIM_OBJ = [
  { id:"vendre", label:"Vendre un bien", Ic:()=><I.Tag/>, short:"Vente" },
  { id:"transmettre", label:"Transmettre (donation)", Ic:()=><I.Sparkles/>, short:"Transmission" },
  { id:"succession", label:"Préparer la succession", Ic:()=><I.FileText/>, short:"Succession" },
  { id:"revenus", label:"Générer des revenus", Ic:()=><I.TrendUp/>, short:"Revenus" },
  { id:"optimiser-locatif", label:"Optimiser fiscalité locative", Ic:()=><I.Trend/>, short:"Optim. fiscale" },
  { id:"reduire-ifi", label:"Réduire l'IFI", Ic:()=><I.Dollar/>, short:"IFI" },
  { id:"gouvernance", label:"Gouvernance familiale", Ic:()=><I.Users/>, short:"Gouvernance" },
  { id:"indivision", label:"Sortir d'indivision", Ic:()=><I.Lock/>, short:"Indivision" },
  { id:"restructurer", label:"Restructurer la détention", Ic:()=><I.Building/>, short:"Restructuration" },
];

// Relevance matrix: scenario → objective relevance (0-100)
const SIM_REL = {
  "vente-directe":{vendre:95,transmettre:20,succession:15,revenus:5,"optimiser-locatif":10,"reduire-ifi":40,gouvernance:5,indivision:30,restructurer:20},
  "attente":{vendre:70,transmettre:15,succession:10,revenus:30,"optimiser-locatif":15,"reduire-ifi":10,gouvernance:5,indivision:10,restructurer:15},
  "donation-pp":{vendre:10,transmettre:95,succession:85,revenus:5,"optimiser-locatif":5,"reduire-ifi":50,gouvernance:60,indivision:15,restructurer:20},
  "donation-np":{vendre:5,transmettre:95,succession:90,revenus:40,"optimiser-locatif":10,"reduire-ifi":80,gouvernance:70,indivision:10,restructurer:25},
  "sci-ir":{vendre:15,transmettre:70,succession:65,revenus:35,"optimiser-locatif":40,"reduire-ifi":30,gouvernance:90,indivision:20,restructurer:85},
  "sci-is":{vendre:10,transmettre:40,succession:35,revenus:50,"optimiser-locatif":70,"reduire-ifi":20,gouvernance:75,indivision:10,restructurer:80},
  "loc-comp":{vendre:5,transmettre:5,succession:5,revenus:80,"optimiser-locatif":95,"reduire-ifi":10,gouvernance:5,indivision:5,restructurer:30},
  "sortie-indiv":{vendre:40,transmettre:10,succession:20,revenus:5,"optimiser-locatif":5,"reduire-ifi":15,gouvernance:15,indivision:95,restructurer:30},
  "ifi":{vendre:20,transmettre:30,succession:25,revenus:5,"optimiser-locatif":10,"reduire-ifi":95,gouvernance:15,indivision:5,restructurer:20},
  "pp-nu":{vendre:30,transmettre:30,succession:30,revenus:70,"optimiser-locatif":60,"reduire-ifi":20,gouvernance:15,indivision:10,restructurer:20},
  "pp-lmnp":{vendre:25,transmettre:25,succession:25,revenus:85,"optimiser-locatif":80,"reduire-ifi":15,gouvernance:10,indivision:5,restructurer:25},
  "sci-ir-acq":{vendre:15,transmettre:75,succession:70,revenus:45,"optimiser-locatif":45,"reduire-ifi":35,gouvernance:90,indivision:10,restructurer:85},
  "sci-is-acq":{vendre:10,transmettre:45,succession:40,revenus:60,"optimiser-locatif":75,"reduire-ifi":25,gouvernance:70,indivision:5,restructurer:80},
  "sarl-famille":{vendre:15,transmettre:70,succession:65,revenus:80,"optimiser-locatif":85,"reduire-ifi":25,gouvernance:85,indivision:5,restructurer:80},
};

function simWS(sid, base, objs) {
  const r = SIM_REL[sid]; if(!r||!objs?.length) return base;
  const tw = objs.reduce((s,o) => s+o.weight, 0); if(!tw) return base;
  let wr = 0; for(const o of objs) wr += (r[o.id]||30)/100 * (o.weight/tw);
  return Math.round(base * 0.35 + wr * 100 * 0.65);
}

// ═══════════════════════════════════════════════════════════════════════
// EXAMPLES
// ═══════════════════════════════════════════════════════════════════════
const SIM_EX = [
  { id:"couple-retraite",couleur:"#3B82F6",titre:"Couple retraité — Vente + succession",
    description:"Jean et Marie, 68 ans, mariés, 2 enfants. Locatif 380 000 €. Vendre (70%) + succession (30%).",
    tags:["Multi-objectif","Plus-value"],
    profile:{objectives:[{id:"vendre",weight:70},{id:"succession",weight:30}],age:68,couple:true,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:0,tmi:30,divorce:false},
    property:{mode:"existant",type:"locatif",isRP:false,prixAcquisition:180000,valeurActuelle:380000,dateAcquisition:"2007-03-15",anneesDetention:19,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:10800,chargesLocatives:3200,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:850000}
  },
  { id:"donation-revenu",couleur:"#10B981",titre:"Transmettre + garder des revenus",
    description:"Françoise, 62 ans, veuve, 3 enfants. Maison 520 000 €. Transmettre (80%) + revenus (20%).",
    tags:["Démembrement","Revenus"],
    profile:{objectives:[{id:"transmettre",weight:80},{id:"revenus",weight:20}],age:62,couple:false,regimeMatrimonial:"communaute-reduite",enfants:3,donationsAnterieures:0,tmi:30,divorce:false},
    property:{mode:"existant",type:"rs",isRP:false,prixAcquisition:150000,valeurActuelle:520000,dateAcquisition:"1998-06-01",anneesDetention:28,travaux:35000,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:0,chargesLocatives:0,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:520000}
  },
  { id:"triple-objectif",couleur:"#F59E0B",titre:"Acquisition — Triple objectif",
    description:"Marc, 50 ans, marié, 2 enfants. T3 à 280 000 €. Revenus (40%) + fiscal (35%) + transmission (25%).",
    tags:["Acquisition","Triple objectif"],
    profile:{objectives:[{id:"revenus",weight:40},{id:"optimiser-locatif",weight:35},{id:"transmettre",weight:25}],age:50,couple:true,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:0,tmi:41,divorce:false},
    property:{mode:"acquisition",type:"locatif",isRP:false,prixAcquisition:280000,valeurActuelle:280000,dateAcquisition:"2026-03-01",anneesDetention:0,travaux:0,dettes:210000,regimeFiscal:"reel",loyerAnnuel:14400,chargesLocatives:4800,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:280000,acqDureeDetention:15,acqTauxRevalo:2,acqLoyer:14400,acqCharges:4800,acqMeuble:false,acqTaxeFonciere:1800}
  },
  { id:"ifi-succession",couleur:"#EF4444",titre:"IFI + Succession",
    description:"Catherine, 72 ans, veuve, 2 enfants. Patrimoine 1 700 000 €. IFI (60%) + succession (40%).",
    tags:["IFI","Succession"],
    profile:{objectives:[{id:"reduire-ifi",weight:60},{id:"succession",weight:40}],age:72,couple:false,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:0,tmi:41,divorce:false},
    property:{mode:"existant",type:"locatif",isRP:false,prixAcquisition:420000,valeurActuelle:750000,dateAcquisition:"2005-07-01",anneesDetention:21,travaux:40000,dettes:180000,regimeFiscal:"reel",loyerAnnuel:36000,chargesLocatives:14000,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:1700000}
  },
  { id:"gouv-rev",icon:"👨‍👩‍👧‍👦",couleur:"#7c3aed",titre:"Gouvernance + Revenus + Fiscal",
    description:"Pierre, 58 ans, marié, 2 enfants. 3 biens (1 200 000 €). Gouvernance (50%) + revenus (30%) + fiscal (20%).",
    tags:["Gouvernance","SCI","Multi"],
    profile:{objectives:[{id:"gouvernance",weight:50},{id:"revenus",weight:30},{id:"optimiser-locatif",weight:20}],age:58,couple:true,regimeMatrimonial:"communaute-reduite",enfants:2,donationsAnterieures:50000,tmi:41,divorce:false},
    property:{mode:"existant",type:"locatif",isRP:false,prixAcquisition:680000,valeurActuelle:1200000,dateAcquisition:"2010-01-15",anneesDetention:16,travaux:85000,dettes:320000,regimeFiscal:"reel",loyerAnnuel:54000,chargesLocatives:22000,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:1900000}
  },
  { id:"indiv-vente",icon:"🔓",couleur:"#0891b2",titre:"Indivision + Vente",
    description:"Sophie et 2 frères. Appart 290 000 €. Indivision (75%) + vente (25%).",
    tags:["Indivision","Vente"],
    profile:{objectives:[{id:"indivision",weight:75},{id:"vendre",weight:25}],age:52,couple:false,regimeMatrimonial:"communaute-reduite",enfants:1,donationsAnterieures:0,tmi:30,divorce:false},
    property:{mode:"existant",type:"rs",isRP:false,prixAcquisition:45000,valeurActuelle:290000,dateAcquisition:"1985-04-10",anneesDetention:41,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:0,chargesLocatives:0,meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:290000}
  },
];

// ═══════════════════════════════════════════════════════════════════════
// CALC ENGINE
// ═══════════════════════════════════════════════════════════════════════
function simFmt(n){if(n==null||isNaN(n))return"—";return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);}
function simCAb(a,t){if(a>=t.length)return 100;let s=0;for(let i=0;i<=Math.min(a,t.length-1);i++)s+=t[i];return Math.min(s,100);}
function simPV(p,c,a,rp,tr=0,am=0){
  if(rp)return{ir:0,ps:0,total:0,exo:"RP",pvBrute:0,abattIR:100,abattPS:100};
  const f=p*0.075,ft=(a>=5&&tr===0)?p*0.15:tr;let pc=Math.max(0,p+f+ft-am);const pv=Math.max(0,c-pc);
  if(!pv)return{ir:0,ps:0,total:0,exo:"Pas de PV",pvBrute:0,abattIR:0,abattPS:0};
  const aI=simCAb(a,SIM_ABT_IR),aP=simCAb(a,SIM_ABT_PS),nI=pv*(1-aI/100),nP=pv*(1-aP/100);
  const ir=nI*0.19,ps=nP*0.172;let sur=0;
  if(nI>250000)sur=nI*0.06;else if(nI>200000)sur=nI*0.05;else if(nI>150000)sur=nI*0.04;else if(nI>100000)sur=nI*0.03;else if(nI>60000)sur=nI*0.02;else if(nI>50000)sur=nI*0.02-(60000-nI)/20;
  return{ir:Math.round(ir),ps:Math.round(ps),surtaxe:Math.max(0,Math.round(sur)),total:Math.round(ir+ps+Math.max(0,sur)),pvBrute:Math.round(pv),abattIR:Math.round(aI*10)/10,abattPS:Math.round(aP*10)/10,exo:null};
}
function simDon(val,ant=0){const ab=Math.max(0,100000-ant),ba=Math.max(0,val-ab);let d=0,r=ba;for(const t of SIM_BAR_DR){if(r<=0)break;d+=Math.min(r,t.max-t.min)*t.taux/100;r-=(t.max-t.min);}return{droits:Math.round(d),abattement:ab,base:Math.round(ba),taux:ba>0?Math.round(d/ba*1000)/10:0};}
function simUsuf(age){return SIM_BAR_USU.find(t=>age>=t.ageMin&&age<=t.ageMax)||{usufruit:10,nuePropriete:90};}
function simIFI(pat,det=0,rp=0){const nt=pat-rp+rp*0.7-det;if(nt<=1300000)return{montant:0,netTaxable:nt,seuil:false};let i=0;for(const t of SIM_IFI_B){if(nt>t.min)i+=Math.min(nt-t.min,t.max-t.min)*t.taux/100;}return{montant:Math.round(i),netTaxable:Math.round(nt),seuil:true};}
function simDP(v,div=false){return Math.round(v*(div?0.011:0.025));}
function simRF(l,ch=0,reg="micro"){
  // Revenus fonciers (location nue)
  if(reg==="micro"){
    if(l>15000) return{imposable:l,ps:Math.round(l*0.172),regime:"micro (forcé réel >15k)"};
    return{imposable:Math.round(l*0.7),ps:Math.round(l*0.7*0.172),regime:"Micro-foncier (30%)"};
  }
  const r=Math.max(0,l-ch);
  return{imposable:r,deficit:ch>l?Math.min(ch-l,10700):0,ps:Math.round(r*0.172),regime:"Réel foncier"};
}
function simBIC(l,ch=0,amort=0,reg="micro",tourisme=false){
  // BIC meublé (LMNP/LMP)
  const seuilMicro = tourisme ? 188700 : 77700;
  const abattement = tourisme ? 0.71 : 0.50;
  if(reg==="micro" && l <= seuilMicro){
    const imp = Math.round(l * (1 - abattement));
    return{imposable:imp, ps:Math.round(imp*0.172), regime:"Micro-BIC ("+ Math.round(abattement*100) +"%)", amort:0, deficit:0};
  }
  // Réel BIC
  const r = Math.max(0, l - ch - amort);
  const def = (ch + amort) > l ? Math.min((ch + amort) - l, l) : 0; // deficit BIC reportable 10 ans (sur BIC only en LMNP)
  return{imposable:r, ps:Math.round(r*0.172), regime:"Réel BIC", amort:amort, deficit:def};
}
function simIsLMP(loyer, revenuGlobal) {
  // Test bascule LMP: recettes > 23k ET > 50% revenus activité
  return loyer > 23000 && (revenuGlobal <= 0 || loyer > revenuGlobal * 0.5);
}
function simCotSocLMP(benefice) {
  // Cotisations sociales TNS sur bénéfice LMP (~40% effectif)
  if(benefice <= 0) return 0;
  return Math.round(benefice * 0.40);
}
function simHO(objs, ids){return objs.some(o=>o.weight>0&&ids.includes(o.id));}

// ═══════════════════════════════════════════════════════════════════════
// SCENARIO GENERATORS
// ═══════════════════════════════════════════════════════════════════════
function simGenEx(pr,pp){
  const sc=[],a=pp.anneesDetention||0,v=pp.valeurActuelle||0,p=pp.prixAcquisition||0,ob=pr.objectives||[];
  const nE=Math.max(pr.enfants||1,1),mul=pr.couple?2:1;
  const ant=pr.donationsAnterieures||0;
  // Compute annual fiscal burden on rental income
  const loyerAn=pp.loyerAnnuel||0,chAn=pp.chargesLocatives||0;
  let fiscAn=0;
  if(loyerAn>0){const rf=simRF(loyerAn,chAn,pp.regimeFiscal==="reel"?"reel":"micro");fiscAn=Math.round(rf.imposable*(pr.tmi||30)/100)+rf.ps;}

  // Helper: succession droits for a given value with optional décote and Dutreil
  function succFor(val, decote=0, dutreil=false) {
    const valNette = Math.round(val * (1 - decote));
    const assiette = dutreil ? Math.round(valNette * 0.25) : valNette;
    const parEnfantParParent = assiette / nE / mul;
    const d = simDon(parEnfantParParent, ant);
    return { totalDroits: Math.round(d.droits * nE * mul), droitsParEnfant: Math.round(d.droits * mul), abattement: d.abattement, valeur: valNette, assiette };
  }

  // Base succession: détention directe, valeur vénale pleine
  const succPP = succFor(v, 0, false);
  // SCI IR: décote parts 10%
  const succSCIir = succFor(v, 0.10, false);
  // SCI IS: actif net (simplifié: valeur + tréso estimée - IS latent) avec décote 15%
  const amIS = loyerAn>0 ? Math.round(((pp.valeurActuelle||0)*0.85)/30) : 0;
  const rIS = Math.max(0, loyerAn - chAn - amIS - 2500);
  const isAn = Math.round(Math.min(rIS,42500)*0.15 + Math.max(0,rIS-42500)*0.25);
  const tresoEst = Math.round((Math.max(0, loyerAn - chAn - 2500) - isAn) * 10);
  const isLatent = Math.round(Math.max(0, v - Math.max(0, v - amIS*10)) * 0.25);
  const actifNetIS = Math.max(v, v + tresoEst - isLatent);
  const succSCIis = succFor(actifNetIS, 0.15, false);

  if(simHO(ob,["vendre","transmettre","succession","restructurer","reduire-ifi","revenus"])){
    const pv=simPV(p,v,a,pp.isRP,pp.travaux,pp.amortissementsLMNP);const b=pv.total===0?95:Math.max(20,80-Math.round(pv.total/v*100));
    sc.push({id:"vente-directe",nom:"Vente directe",categorie:"Cession",description:"Vente en l'état",
      _comp:{fiscDetention:0,coutVente:pv.total,coutSuccession:null,note:"Vente immédiate → plus de bien à transmettre"},
      kpis:{"PV brute":simFmt(pv.pvBrute),"IR 19%":simFmt(pv.ir),"PS 17,2%":simFmt(pv.ps),"Total":simFmt(pv.total),"Cash net":simFmt(v-pv.total),"Abatt. IR":pv.abattIR+"%","Abatt. PS":pv.abattPS+"%"},avantages:["Liquidité","Simplicité",pv.exo?`Exo: ${pv.exo}`:null].filter(Boolean),inconvenients:pv.total>0?["Imposition PV",a<22?"Abatt IR non max":null].filter(Boolean):[],alertes:pp.amortissementsLMNP>0?["⚠️ LF2025: amort LMNP minorent prix"]:[],sources:["CGI art. 150 U"],score:simWS("vente-directe",b,ob)});}
  if(a<30&&simHO(ob,["vendre","restructurer","revenus"])){
    const t=a<22?22:30,pvF=simPV(p,v,t,pp.isRP,pp.travaux,pp.amortissementsLMNP),pvN=simPV(p,v,a,pp.isRP,pp.travaux,pp.amortissementsLMNP);
    const attFisc=fiscAn*(t-a);
    sc.push({id:"attente",nom:`Attendre ${t-a} an(s)`,categorie:"Cession différée",description:`Détention ${t} ans`,
      _comp:{fiscDetention:attFisc,coutVente:pvF.total,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:`Détention directe. Succession sur valeur pleine.`},
      kpis:{"Total projeté":simFmt(pvF.total),"Économie":simFmt(pvN.total-pvF.total),"Abatt IR":pvF.abattIR+"%"},avantages:["Exo IR 22 ans","Exo PS 30 ans","Revenus maintenus"],inconvenients:["Immobilisation","Risque marché"],alertes:[],sources:["CGI art. 150 VC"],score:simWS("attente",Math.min(90,50+(t-a<=5?30:10)),ob)});}
  if(simHO(ob,["transmettre","succession","gouvernance","reduire-ifi"])&&pr.enfants>0){
    const n=pr.enfants,m=pr.couple?2:1,d=simDon(v/n/m,ant),tot=Math.round(d.droits*n*m);
    sc.push({id:"donation-pp",nom:"Donation pleine propriété",categorie:"Transmission",description:`Aux ${n} enfant(s)`,
      _comp:{fiscDetention:0,coutVente:null,coutSuccession:tot,succDetail:{valeur:v,assiette:v,decote:null,dutreil:false,abattement:d.abattement},note:"Droits de donation (transmission immédiate)"},
      kpis:{"Valeur":simFmt(v),"Abattements":simFmt(d.abattement*n*m),"Droits":simFmt(tot),"Taux":d.taux+"%"},avantages:["Transmission immédiate","Purge PV"],inconvenients:["Perte contrôle","Plus de revenus"],alertes:ant>0?["⚠️ Rappel < 15 ans"]:[],sources:["CGI art. 779 I"],score:simWS("donation-pp",tot===0?90:Math.max(30,75-Math.round(tot/v*100)),ob)});}
  if(simHO(ob,["transmettre","succession","reduire-ifi","gouvernance","revenus"])&&pr.enfants>0&&pr.age){
    const u=simUsuf(pr.age),vnp=v*u.nuePropriete/100,n=pr.enfants,m=pr.couple?2:1;
    const d=simDon(vnp/n/m,ant),tot=Math.round(d.droits*n*m);
    const dPP=simDon(v/n/m,ant),totPP=Math.round(dPP.droits*n*m);
    sc.push({id:"donation-np",nom:"Donation nue-propriété",categorie:"Transmission démembrée",description:`NP ${u.nuePropriete}% / Usufruit ${u.usufruit}%`,
      _comp:{fiscDetention:0,coutVente:null,coutSuccession:tot,succDetail:{valeur:vnp,assiette:vnp,decote:`NP ${u.nuePropriete}%`,dutreil:false,abattement:d.abattement},note:`Droits sur NP (${u.nuePropriete}%). Réunion au décès sans droits (art. 1133 CGI).`},
      kpis:{"PP":simFmt(v),"NP":simFmt(vnp),"Droits":simFmt(tot),"Éco. vs PP":simFmt(totPP-tot)},avantages:["Usage & revenus conservés",`Assiette -${u.usufruit}%`,"Réunion sans droits","Réduit IFI"],inconvenients:["Partage contrôle","Complexité"],alertes:["ℹ️ Art. 1133 CGI"],sources:["CGI art. 669"],score:simWS("donation-np",Math.min(95,70+Math.round(u.usufruit/5)),ob)});}
  if(simHO(ob,["restructurer","gouvernance","transmettre","revenus"])){
    sc.push({id:"sci-ir",nom:"SCI à l'IR",categorie:"Structuration",description:"Transparente",
      _comp:{fiscDetention:fiscAn>0?(fiscAn+1500)*15:null,coutVente:simPV(p,v,a+15,pp.isRP).total,coutSuccession:succSCIir.totalDroits,succDetail:{valeur:succSCIir.valeur,assiette:succSCIir.assiette,decote:"10%",dutreil:false,abattement:succSCIir.abattement},note:`Décote parts 10%. Succession: ${simFmt(succSCIir.totalDroits)} vs ${simFmt(succPP.totalDroits)} en direct.`},
      kpis:{"PV":"Particuliers","Coût":"1 500–3 000 €"},avantages:["Parts transmissibles","Clauses","Démembrement","Revenus","Décote 10% succession"],inconvenients:["Formalisme","Coût","Meublé interdit"],alertes:["⚠️ SCI+meublé=IS"],sources:["CGI art. 8"],score:simWS("sci-ir",65,ob)});}
  if(simHO(ob,["restructurer","optimiser-locatif","revenus"])){
    sc.push({id:"sci-is",nom:"SCI à l'IS",categorie:"Structuration",description:"Amortissement, IS",
      _comp:{fiscDetention:loyerAn>0?(isAn+2500)*15:null,coutVente:Math.round(Math.max(0,v-Math.max(0,v-amIS*15))*0.25),coutSuccession:succSCIis.totalDroits,succDetail:{valeur:succSCIis.valeur,assiette:succSCIis.assiette,decote:"15%",dutreil:false,abattement:succSCIis.abattement},note:`Actif net réévalué ${simFmt(actifNetIS)}. Décote 15%.`},
      kpis:{"IS":"15%/25%","Amort":"Oui","PV":"Pro"},avantages:["Amortissement","IS réduit","Décote 15% succession"],inconvenients:["Double imposition","PV pro","IS irrévocable","Actif net élevé"],alertes:["⚠️ IS irrévocable","⚠️ Tréso accumulée gonfle actif net"],sources:["CGI art. 206"],score:simWS("sci-is",50,ob)});}
  if(simHO(ob,["optimiser-locatif","restructurer","revenus"])&&pp.loyerAnnuel){
    const mi=simRF(pp.loyerAnnuel,0,"micro"),re=simRF(pp.loyerAnnuel,pp.chargesLocatives||pp.loyerAnnuel*0.35,"reel");
    const fiscMi=Math.round(mi.imposable*(pr.tmi||30)/100)+mi.ps, fiscRe=Math.round(re.imposable*(pr.tmi||30)/100)+re.ps;
    const best=Math.min(fiscMi,fiscRe);
    sc.push({id:"loc-comp",nom:"Micro vs Réel",categorie:"Exploitation locative",description:"Comparaison régimes",
      _comp:{fiscDetention:best*10,coutVente:simPV(p,v,a+10,pp.isRP).total,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:"Détention directe. Succession sur valeur pleine."},
      kpis:{"Micro":simFmt(mi.imposable),"Réel":simFmt(re.imposable),"Déficit":simFmt(re.deficit||0)},avantages:["Micro: simplicité","Réel: déductions"],inconvenients:["Micro: forfait","Réel: 3 ans"],alertes:pp.loyerAnnuel>15000?["⚠️ >15k"]:[],sources:["CGI art. 31-32"],score:simWS("loc-comp",re.imposable<mi.imposable?70:65,ob)});}
  if(simHO(ob,["indivision","vendre"])){
    const dp=simDP(v,pr.divorce),pv=simPV(p,v,a,pp.isRP);
    sc.push({id:"sortie-indiv",nom:"Sortie d'indivision",categorie:"Indivision",description:"Partage / licitation",
      _comp:{fiscDetention:dp,coutVente:pv.total+dp,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:"Succession sur valeur pleine après partage."},
      kpis:{"Valeur":simFmt(v),"Droit partage":simFmt(dp),"PV":simFmt(pv.total)},avantages:["Résolution","Rachat possible"],inconvenients:["Droit partage","Contentieux"],alertes:["⚠️ Art. 815-3"],sources:["CGI art. 746"],score:simWS("sortie-indiv",60,ob)});}
  if(simHO(ob,["reduire-ifi","succession","transmettre"])){
    const ifi=simIFI(pp.patrimoineImmoTotal||v,pp.dettes||0,pp.isRP?v:0);
    sc.push({id:"ifi",nom:"Estimation IFI",categorie:"IFI",description:"Leviers de réduction",
      _comp:{fiscDetention:ifi.montant*10,coutVente:null,coutSuccession:succPP.totalDroits,succDetail:{valeur:succPP.valeur,assiette:succPP.assiette,decote:null,dutreil:false,abattement:succPP.abattement},note:"Succession sur valeur pleine. IFI projeté sur 10 ans."},
      kpis:{"Net taxable":simFmt(ifi.netTaxable),"IFI":simFmt(ifi.montant)},avantages:["Donation NP","Dettes déductibles"],inconvenients:["Restructuration"],alertes:ifi.seuil?["⚠️ Seuil dépassé"]:[],sources:["CGI art. 964"],score:simWS("ifi",ifi.montant>0?55:80,ob)});}
  return sc.sort((a,b)=>b.score-a.score);
}

function simGenAcq(pr,pp){
  const px=pp.prixAcquisition||0, dur=pp.acqDureeDetention||15, txR=(pp.acqTauxRevalo||2)/100;
  const loy=pp.acqLoyer||pp.loyerAnnuel||0, ch=pp.acqCharges||pp.chargesLocatives||0, txF=pp.acqTaxeFonciere||0;
  const tmi=pr.tmi||30, nE=Math.max(pr.enfants||1,1), mul=pr.couple?2:1;
  const vR=Math.round(px*Math.pow(1+txR,dur)), fN=Math.round(px*0.08), ob=pr.objectives||[];
  const ant=pr.donationsAnterieures||0;
  const isLMP = simIsLMP(loy, pr.revenuGlobal||loy*3);
  const isMeuble = pp.acqMeuble || pp.meuble;
  const sc=[];

  function succForValue(val, decote=0, dutreil=false) {
    const valNette = Math.round(val * (1 - decote));
    const assiette = dutreil ? Math.round(valNette * 0.25) : valNette;
    const parEnfantParParent = assiette / nE / mul;
    const d = simDon(parEnfantParParent, ant);
    return { valeur:valNette, assiette, droitsParEnfant:Math.round(d.droits*mul), totalDroits:Math.round(d.droits*nE*mul), abattement:d.abattement, tauxMoyen:d.taux, decote:decote>0?Math.round(decote*100)+"%":null, dutreil };
  }
  function rendement(revNet){ return px>0 ? Math.round(revNet/px*10000)/100 : 0; }
  function cashflowAn(revNet, mensualite){ return Math.round(revNet - (mensualite||0)*12); }

  const dette = pp.dettes||0;
  const mensualiteEst = dette > 0 ? Math.round(dette * 0.005) : 0; // ~estimation mensualité

  // ═══════════════════════════════════════════════════════════
  // 1. PP — Location nue MICRO-FONCIER
  // ═══════════════════════════════════════════════════════════
  if(!isMeuble){
    const rf = simRF(loy, 0, "micro");
    const ir = Math.round(rf.imposable*tmi/100), fa = ir + rf.ps, ft = fa*dur;
    const revNet = loy - ch - txF - fa;
    const pv = simPV(px, vR, dur, false);
    const succ = succForValue(vR, 0, false);
    sc.push({id:"pp-nu-micro",nom:"Location nue — Micro-foncier",categorie:"Personne physique",icon:"📋",couleur:"#6366f1",
      description:"Abattement 30% · Seuil 15 000 €/an · Simplicité maximale",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:rf.regime,revenuImposable:rf.imposable,irAnnuel:ir,psAnnuel:rf.ps,cotSociales:0,fiscAnnuelle:fa,fiscTotale:ft,duree:dur,revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
        succession:{...succ,notes:"Valeur vénale pleine."}},
      totalCout:fN+ft+pv.total,totalCoutSucc:fN+ft+succ.totalDroits,
      avantages:["Ultra-simple","Pas de comptabilité","Abattement 30% auto","Pas de cotisations sociales"],
      inconvenients:["Plafond 15 000 €/an","Pas de déduction charges réelles","Pas de déficit foncier","Pas d'amortissement"],
      alertes:loy>15000?["⚠️ Revenus > 15 000 € → micro impossible, passage réel obligatoire"]:[],
      sources:["CGI art. 32"],score:simWS("pp-nu",loy<=15000?65:30,ob)});

  // ═══════════════════════════════════════════════════════════
  // 2. PP — Location nue RÉEL FONCIER
  // ═══════════════════════════════════════════════════════════
    const rfR = simRF(loy, ch+txF, "reel");
    const irR = Math.round(rfR.imposable*tmi/100), faR = irR + rfR.ps, ftR = faR*dur;
    const revNetR = loy - ch - txF - faR;
    sc.push({id:"pp-nu-reel",nom:"Location nue — Réel foncier",categorie:"Personne physique",icon:"📊",couleur:"#2563eb",
      description:"Charges réelles déductibles · Déficit foncier possible (10 700 €/an)",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:rfR.regime,revenuImposable:rfR.imposable,irAnnuel:irR,psAnnuel:rfR.ps,cotSociales:0,deficitFoncier:rfR.deficit||0,fiscAnnuelle:faR,fiscTotale:ftR,duree:dur,revenuNet:revNetR,cashflow:cashflowAn(revNetR,mensualiteEst),rendement:rendement(revNetR)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
        succession:{...succ,notes:"Valeur vénale pleine."}},
      totalCout:fN+ftR+pv.total,totalCoutSucc:fN+ftR+succ.totalDroits,
      avantages:["Déduction intérêts emprunt","Déduction travaux/taxes","Déficit foncier imputable (10 700 €/an sur revenu global)","Report déficit 10 ans"],
      inconvenients:["Comptabilité foncière (décl. 2044)","Engagement 3 ans min","Pas d'amortissement du bien"],
      alertes:rfR.deficit>0?["ℹ️ Déficit foncier de "+simFmt(rfR.deficit)+" imputable sur revenu global"]:[],
      sources:["CGI art. 28-31"],score:simWS("pp-nu",rfR.imposable<rf.imposable?72:55,ob)});
  }

  // ═══════════════════════════════════════════════════════════
  // 3. LMNP Micro-BIC (si meublé et recettes ≤ 77 700 €)
  // ═══════════════════════════════════════════════════════════
  if(isMeuble && loy <= 77700){
    const bic = simBIC(loy, 0, 0, "micro", false);
    const ir = Math.round(bic.imposable*tmi/100), fa = ir + bic.ps, ft = fa*dur;
    const revNet = loy - ch - txF - fa;
    const pv = simPV(px, vR, dur, false);
    const succ = succForValue(vR, 0, false);
    sc.push({id:"lmnp-micro",nom:"LMNP — Micro-BIC",categorie:"Personne physique",icon:"📋",couleur:"#f59e0b",
      description:"Abattement 50% · Seuil 77 700 € · Aucune comptabilité",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:bic.regime,revenuImposable:bic.imposable,irAnnuel:ir,psAnnuel:bic.ps,cotSociales:0,fiscAnnuelle:fa,fiscTotale:ft,duree:dur,revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
        succession:{...succ,notes:"Valeur vénale pleine."}},
      totalCout:fN+ft+pv.total,totalCoutSucc:fN+ft+succ.totalDroits,
      avantages:["Ultra-simple (décl. 2042-C PRO)","Abattement 50% automatique","Pas de comptabilité","Pas de cotisations sociales (si < 23k)"],
      inconvenients:["Pas d'amortissement","Pas de déduction charges réelles","Plafond 77 700 €"],
      alertes:isLMP?["⚠️ Recettes > 23k ET > 50% revenus → bascule LMP obligatoire"]:[],
      sources:["CGI art. 50-0"],score:simWS("pp-lmnp",loy<=30000?68:55,ob)});
  }

  // ═══════════════════════════════════════════════════════════
  // 4. LMNP Réel BIC (amortissements + charges)
  // ═══════════════════════════════════════════════════════════
  if(isMeuble){
    const amA = Math.round((px*0.85)/25); // amort bien 25 ans (hors terrain 15%)
    const chTot = ch + txF;
    const bic = simBIC(loy, chTot, amA, "reel");
    const ir = Math.round(bic.imposable*tmi/100), fa = ir + bic.ps, ft = fa*dur;
    const revNet = loy - chTot - fa;
    const pv = simPV(px, vR, dur, false, 0, amA*dur);
    const succ = succForValue(vR, 0, false);
    sc.push({id:"lmnp-reel",nom:isLMP?"LMP — Réel BIC":"LMNP — Réel BIC",categorie:"Personne physique",icon:"🛋️",couleur:"#d97706",
      description:"Amort. "+simFmt(amA)+"/an · Charges réelles · "+( isLMP?"Cotisations SSI":"Pas de cotisations"),
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:0,total:fN},
        detention:{regime:"BIC réel (amortissements)",revenuImposable:bic.imposable,irAnnuel:ir,psAnnuel:bic.ps,
          cotSociales:isLMP?simCotSocLMP(bic.imposable):0,
          fiscAnnuelle:fa + (isLMP?simCotSocLMP(bic.imposable):0),
          fiscTotale:(fa + (isLMP?simCotSocLMP(bic.imposable):0))*dur,
          duree:dur,amortAnnuel:amA,deficitBIC:bic.deficit,
          revenuNet:revNet-(isLMP?simCotSocLMP(bic.imposable):0),
          cashflow:cashflowAn(revNet-(isLMP?simCotSocLMP(bic.imposable):0),mensualiteEst),
          rendement:rendement(revNet-(isLMP?simCotSocLMP(bic.imposable):0))+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total,
          alerte:isLMP?"PV professionnelle (exo possible après 5 ans, art. 151 septies)":"⚠️ LF2025: amort minorent prix acq."},
        succession:{...succ,notes:"Valeur vénale pleine. Amortissements sans incidence sur succession."}},
      totalCout:fN+ft+pv.total,totalCoutSucc:fN+ft+succ.totalDroits,
      avantages:["Amortissement bien + mobilier","Déduction charges réelles","Déficit BIC reportable 10 ans",
        isLMP?"Déficit imputable sur revenu global":"Loyers quasi neutralisés",
        isLMP?"PV pro exo après 5 ans (art. 151 septies)":"PV particuliers avec abattements"],
      inconvenients:["Comptabilité commerciale (bilan, 2031)","Frais comptable ~800-1 500 €/an",
        isLMP?"Cotisations SSI ~40% du bénéfice":"",
        "PV majorée si amort (LF2025)"].filter(Boolean),
      alertes:isLMP?["⚠️ Statut LMP détecté (recettes > 23k + > 50% revenus)","ℹ️ Affiliation SSI obligatoire"]:
        bic.deficit>0?["ℹ️ Déficit BIC de "+simFmt(bic.deficit)+" reportable"]:[],
      sources:isLMP?["CGI art. 155 IV","CGI art. 151 septies"]:["CGI art. 35 bis","CGI art. 39 C"],
      score:simWS("pp-lmnp",bic.imposable===0?85:75,ob)});
  }

  // ═══════════════════════════════════════════════════════════
  // 5. SCI à l'IR (location nue, transparente)
  // ═══════════════════════════════════════════════════════════
  {const cC=2000,cA=1500;
  const bR = Math.min(Math.round(loy*0.7), Math.max(0, loy-ch-txF));
  const ir = Math.round(bR*tmi/100), fa = ir + Math.round(bR*0.172), ft = (fa+cA)*dur;
  const revNet = loy - ch - txF - fa - cA;
  const pv = simPV(px, vR, dur, false);
  const succ = succForValue(vR, 0.10, false);
  sc.push({id:"sci-ir-acq",nom:"SCI à l'IR",categorie:"Société civile",icon:"🏛️",couleur:"#059669",
    description:"Transparente · Parts transmissibles · Décote 10% succession",
    phases:{acquisition:{fraisNotaire:fN,fraisStructure:cC,total:fN+cC},
      detention:{regime:"Foncier (IR transparent)",revenuImposable:bR,irAnnuel:ir,psAnnuel:Math.round(bR*0.172),cotSociales:0,fiscAnnuelle:fa,fiscTotale:fa*dur,duree:dur,coutStructure:cA,revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
      vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total},
      succession:{...succ,notes:"Décote parts 10% (illiquidité). Démembrement de parts possible (art. 669 CGI)."}},
    totalCout:fN+cC+ft+pv.total,totalCoutSucc:fN+cC+ft+succ.totalDroits,
    avantages:["Parts transmissibles","Démembrement de parts","Clauses statutaires","PV particuliers","Décote 10% succession","Pas de cotisations sociales"],
    inconvenients:["Coût création 2 000 €","Frais annuels ~1 500 €","Location meublée interdite (→ IS)","Pas d'amortissement"],
    alertes:isMeuble?["⚠️ Meublé dans SCI IR = requalification IS automatique"]:[],
    sources:["CGI art. 8","CGI art. 239 bis AA"],score:simWS("sci-ir-acq",isMeuble?30:65,ob)});}

  // ═══════════════════════════════════════════════════════════
  // 6. SCI à l'IS (amortissements, capitalisation)
  // ═══════════════════════════════════════════════════════════
  {const cC=2000,cA=2500,amA=Math.round((px*0.85)/30);
  const rIS = Math.max(0, loy-ch-txF-amA-cA);
  const isA = Math.round(Math.min(rIS,42500)*0.15 + Math.max(0,rIS-42500)*0.25);
  const vnc = Math.max(0, px-amA*dur);
  const isPV = Math.round(Math.max(0, vR-vnc)*0.25);
  const tresoAn = Math.max(0, loy-ch-txF-cA) - isA;
  const tresoCum = Math.round(tresoAn*dur);
  const isLatent = isPV;
  const actifNet = Math.max(0, vR + tresoCum - isLatent);
  const revNetSociete = loy - ch - txF - cA - isA;
  // Si distribution: flat tax 30% sur dividendes
  const divBrut = Math.max(0, revNetSociete);
  const flatTax = Math.round(divBrut * 0.30);
  const revNetAssocies = divBrut - flatTax;
  const succ = succForValue(actifNet, 0.15, false);
  sc.push({id:"sci-is-acq",nom:"SCI à l'IS",categorie:"Société civile",icon:"🏢",couleur:"#7c3aed",
    description:"IS 15%/25% · Amort. "+simFmt(amA)+"/an · Double imposition si distribution",
    phases:{acquisition:{fraisNotaire:fN,fraisStructure:cC,total:fN+cC},
      detention:{regime:"IS (amortissements)",revenuImposable:rIS,isAnnuel:isA,fiscAnnuelle:isA,fiscTotale:isA*dur,duree:dur,coutStructure:cA,amortAnnuel:amA,
        revenuNetSociete:revNetSociete,flatTaxDividendes:flatTax,revenuNetAssocies:revNetAssocies,
        cashflow:cashflowAn(revNetAssocies,mensualiteEst),rendement:rendement(revNetAssocies)+"%",
        notes:"Double imposition: IS + flat tax 30% si distribution."},
      vente:{valeurRevente:vR,vnc,pvPro:Math.max(0,vR-vnc),isPV,pvTotal:isPV,alerte:"PV professionnelle (base amortie → PV élevée)"},
      succession:{...succ,notes:"Actif net réévalué: "+simFmt(actifNet)+". Décote 15%. Tréso accumulée gonfle valeur parts."}},
    totalCout:fN+cC+(isA+cA)*dur+isPV,totalCoutSucc:fN+cC+(isA+cA)*dur+succ.totalDroits,
    avantages:["Amortissement complet","IS réduit (15% < 42 500 €)","Capitalisation sans distribution","Meublé autorisé","Décote 15% succession"],
    inconvenients:["Double imposition (IS + flat tax 30%)","PV sur base amortie (très élevée)","IS irrévocable","Tréso gonfle actif net → succession lourde","Comptabilité complète"],
    alertes:["⚠️ IS irrévocable","⚠️ Tréso accumulée augmente valeur parts"],
    sources:["CGI art. 206","CGI art. 219"],score:simWS("sci-is-acq",55,ob)});}

  // ═══════════════════════════════════════════════════════════
  // 7. SARL de famille (IR) — meublé uniquement
  // ═══════════════════════════════════════════════════════════
  if(isMeuble && nE>0){
    const cC=2500,cA=2000,amA=Math.round((px*0.85)/25),chM=ch+txF;
    const rBIC = Math.max(0, loy-chM-amA);
    const ir = Math.round(rBIC*tmi/100), ps = Math.round(rBIC*0.172), fa = ir+ps;
    const revNet = loy - chM - cA - fa;
    const pv = simPV(px, vR, dur, false);
    const succ = succForValue(vR, 0.10, true); // Dutreil 75% exo + décote 10%
    sc.push({id:"sarl-famille",nom:"SARL de famille (IR)",categorie:"Société commerciale",icon:"👨‍👩‍👧",couleur:"#0891b2",
      description:"Amort. BIC + PV particuliers + Pacte Dutreil (-75% succession)",
      phases:{acquisition:{fraisNotaire:fN,fraisStructure:cC,total:fN+cC},
        detention:{regime:"BIC réel (IR transparent)",revenuImposable:rBIC,irAnnuel:ir,psAnnuel:ps,cotSociales:0,fiscAnnuelle:fa,fiscTotale:fa*dur,duree:dur,coutStructure:cA,amortAnnuel:amA,
          revenuNet,cashflow:cashflowAn(revNet,mensualiteEst),rendement:rendement(revNet)+"%"},
        vente:{valeurRevente:vR,pvTotal:pv.total,abattIR:pv.abattIR+"%",cashNet:vR-pv.total,
          alerte:"PV des particuliers (pas de réintégration des amortissements)"},
        succession:{...succ,notes:"Pacte Dutreil: 75% exo (art. 787 B CGI). Assiette: "+simFmt(succ.assiette)+". Décote 10%."}},
      totalCout:fN+cC+(fa+cA)*dur+pv.total,totalCoutSucc:fN+cC+(fa+cA)*dur+succ.totalDroits,
      avantages:["Amortissement LMNP + IR transparent","PV des particuliers (pas pro)","Pacte Dutreil (-75% succession)","Responsabilité limitée","Décote parts 10%"],
      inconvenients:["Associés famille uniquement (3e degré)","Formalisme société","Engagement Dutreil 6 ans min","Frais comptable + gestion ~2 000 €/an"],
      alertes:["ℹ️ Dutreil: engagement collectif 2 ans + individuel 4 ans","ℹ️ Option IR irrévocable"],
      sources:["CGI art. 239 bis AA","CGI art. 787 B"],score:simWS("sarl-famille",78,ob)});
  }

  return sc.sort((a,b)=>b.score-a.score);
}



/* ════════════════════════════════════════
   SIMULATEUR — DARK MODE UI
════════════════════════════════════════ */
function SimScoreBar({score}){
  const col=score>=70?C.green:score>=45?"#F59E0B":C.red;
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:6,background:C.g4,borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${Math.min(score,100)}%`,height:"100%",background:col,borderRadius:3,transition:"width 0.6s"}}/>
      </div>
      <span style={{fontSize:12,fontWeight:700,color:col,fontFamily:C.mono,minWidth:28}}>{score}</span>
    </div>
  );
}

function SimCard({children,style,onClick,hover}){
  const[h,setH]=useState(false);
  return(
    <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:C.card,borderRadius:14,padding:22,border:`1px solid ${C.border}`,transition:"all 0.2s",
        cursor:onClick?"pointer":"default",
        boxShadow:h&&hover?"0 8px 32px rgba(0,0,0,0.4)":"none",
        transform:h&&hover?"translateY(-2px)":"none",...style}}>
      {children}
    </div>
  );
}

function SimInp({label,value,onChange,type="text",suffix,placeholder,min,max}){
  return(
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.g2,marginBottom:6,fontFamily:C.mono,letterSpacing:"0.05em"}}>{label}</label>
      <div style={{position:"relative"}}>
        {type==="date" ? (
          <div style={{padding:"10px 14px",border:`1px solid ${C.border2}`,borderRadius:10,background:"rgba(255,255,255,0.03)"}}>
            <DatePickerInput value={value} onChange={onChange} placeholder={placeholder}/>
          </div>
        ) : (
        <input type={type} value={value} onChange={e=>onChange(type==="number"?(e.target.value===""?"":Number(e.target.value)):e.target.value)}
          placeholder={placeholder} min={min} max={max}
          style={{width:"100%",padding:"10px 14px",paddingRight:suffix?50:14,border:`1px solid ${C.border2}`,borderRadius:10,fontSize:14,
            fontFamily:C.font,outline:"none",boxSizing:"border-box",background:"rgba(255,255,255,0.03)",color:C.w,transition:"all 0.15s"}}
          onFocus={e=>{e.target.style.borderColor=C.blue;e.target.style.boxShadow=`0 0 0 2px ${C.blueGlow}`;}}
          onBlur={e=>{e.target.style.borderColor=C.border2;e.target.style.boxShadow="none";}}/>
        )}
        {suffix&&<span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:C.g2,fontSize:12,fontFamily:C.mono}}>{suffix}</span>}
      </div>
    </div>
  );
}

function SimSel({label,value,onChange,options}){
  return(
    <div style={{marginBottom:18}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.g2,marginBottom:6,fontFamily:C.mono,letterSpacing:"0.05em"}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"10px 14px",border:`1px solid ${C.border2}`,borderRadius:10,fontSize:14,
          fontFamily:C.font,outline:"none",background:C.card2,color:C.w,cursor:"pointer",boxSizing:"border-box",
          MozAppearance:"none",WebkitAppearance:"none"}}>
        {options.map(o=><option key={o.value} value={o.value} style={{background:C.card,color:C.w}}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SimChk({label,checked,onChange}){
  return(
    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:14,fontSize:13,color:C.g1}}>
      <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${checked?C.blue:C.border2}`,background:checked?C.blue:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
        {checked&&<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      {label}
    </label>
  );
}

function SimStepInd({c,onGo}){
  const STEPS=["Objectifs","Profil","Bien","Résultats"];
  return(
    <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:32}}>
      {STEPS.map((s,i)=>(
        <div key={s} style={{display:"flex",alignItems:"center",flex:i<3?1:"none"}}>
          <div onClick={()=>onGo&&i<c&&onGo(i)}
            style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              background:i<=c?C.blue:C.g4,color:i<=c?"#fff":C.g2,fontFamily:C.mono,fontSize:12,fontWeight:700,
              boxShadow:i===c?`0 0 0 3px ${C.blueGlow}`:"none",cursor:onGo&&i<c?"pointer":"default",transition:"all 0.2s"}}>
            {i<c?"✓":i+1}
          </div>
          <div style={{marginLeft:8,fontSize:12,fontWeight:i===c?700:500,color:i<=c?C.w:C.g2,whiteSpace:"nowrap",
            cursor:onGo&&i<c?"pointer":"default"}} onClick={()=>onGo&&i<c&&onGo(i)}>{s}</div>
          {i<3&&<div style={{flex:1,height:1,background:i<c?C.blue:C.g4,margin:"0 16px",transition:"background 0.3s"}}/>}
        </div>
      ))}
    </div>
  );
}

function SimObjSel({objectives:objs,onChange}){
  const total=objs.reduce((s,o)=>s+o.weight,0);
  const toggle=(id)=>{const e=objs.find(o=>o.id===id);if(e&&e.weight>0)onChange(objs.filter(o=>o.id!==id));else onChange([...objs,{id,weight:Math.max(5,100-total)}]);};
  const setW=(id,w)=>onChange(objs.map(o=>o.id===id?{...o,weight:Math.max(0,Math.min(100,w))}:o));
  const bal=()=>{const a=objs.filter(o=>o.weight>0);if(!a.length)return;const e=Math.floor(100/a.length),r=100-e*a.length;onChange(objs.map((o,i)=>({...o,weight:e+(i===0?r:0)})));};


  return(
    <div>
      <p style={{color:C.g2,fontSize:13,marginBottom:20}}>Sélectionnez et pondérez les priorités (total = 100)</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:24}}>
        {SIM_OBJ.map(obj=>{const on=objs.find(o=>o.id===obj.id&&o.weight>0);return(
          <div key={obj.id} onClick={()=>toggle(obj.id)}
            style={{padding:"14px 16px",borderRadius:12,cursor:"pointer",
              border:on?`1.5px solid ${C.blue}`:`1px solid ${C.border}`,
              background:on?C.blueSub:C.card,transition:"all 0.2s"}}>
            <div style={{color:on?C.blue:C.g2,marginBottom:6}}><obj.Ic/></div>
            <div style={{fontSize:13,fontWeight:600,color:on?C.blue:C.g1}}>{obj.short}</div>
          </div>
        );})}
      </div>
      {objs.filter(o=>o.weight>0).length>0&&<SimCard>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em"}}>PONDÉRATION</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={bal} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",fontSize:11,fontWeight:600,cursor:"pointer",color:C.g1}}>Répartir</button>
            <div style={{padding:"4px 10px",borderRadius:6,fontFamily:C.mono,fontSize:12,fontWeight:700,
              background:total===100?C.greenSub:total>100?C.redSub:C.yellowSub,
              color:total===100?C.green:total>100?C.red:C.yellow,
              border:`1px solid ${total===100?C.greenBord:total>100?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}`}}>{total}/100</div>
          </div>
        </div>
        {objs.filter(o=>o.weight>0).map(obj=>{const m=SIM_OBJ.find(x=>x.id===obj.id);return(
          <div key={obj.id} style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:C.blue}}>{m&&<m.Ic/>}</span><span style={{fontSize:13,fontWeight:600,color:C.w}}>{m?.label}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:700,color:C.blue,fontFamily:C.mono}}>{obj.weight}%</span>
                <div onClick={e=>{e.stopPropagation();onChange(objs.filter(o=>o.id!==obj.id));}}
                  style={{width:22,height:22,borderRadius:6,background:C.redSub,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.red,fontSize:12,fontWeight:700}}>×</div>
              </div>
            </div>
            <input type="range" min={5} max={100} step={5} value={obj.weight} onChange={e=>setW(obj.id,Number(e.target.value))}
              style={{width:"100%",height:6,borderRadius:3,outline:"none",cursor:"pointer",WebkitAppearance:"none",
                background:`linear-gradient(to right,${C.blue} 0%,${C.blue} ${obj.weight}%,${C.g4} ${obj.weight}%,${C.g4} 100%)`}}/>
          </div>
        );})}
        {total!==100&&<div style={{marginTop:10,padding:10,borderRadius:8,fontSize:12,
          background:total>100?C.redSub:C.yellowSub,color:total>100?C.red:C.yellow,
          border:`1px solid ${total>100?"rgba(239,68,68,0.2)":"rgba(245,158,11,0.2)"}`}}>
          {total>100?`Total ${total}% — réduisez.`:`Reste ${100-total}% à répartir.`}
        </div>}
      </SimCard>}
    </div>
  );
}

function SimModeToggle({mode,onChange}){
  return(
    <div style={{display:"flex",background:C.card2,borderRadius:10,padding:3,marginBottom:24,maxWidth:360,border:`1px solid ${C.border}`}}>
      {[{id:"existant",label:"Existant"},{id:"acquisition",label:"Acquisition"}].map(m=>(
        <div key={m.id} onClick={()=>onChange(m.id)}
          style={{flex:1,padding:"10px 16px",borderRadius:8,cursor:"pointer",textAlign:"center",
            background:mode===m.id?C.blue:"transparent",transition:"all 0.2s"}}>
          <div style={{fontSize:13,fontWeight:700,color:mode===m.id?"#fff":C.g2}}>{m.label}</div>
        </div>
      ))}
    </div>
  );
}

function SimExCard({s,expanded:ex,onToggle,objs,isAcq}){
  const col=s.couleur||C.blue;
  const ao=objs?.filter(o=>o.weight>0)||[];
  const KV=({k,v,b})=>(
    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:12,color:C.g2}}>{k}</span>
      <span style={{fontSize:12,fontWeight:b?700:500,color:b?C.w:C.g1,fontFamily:C.mono}}>{v}</span>
    </div>
  );
  const PB=({t,c,children})=>(
    <div style={{background:`${c}08`,border:`1px solid ${c}20`,borderRadius:10,padding:14,marginBottom:10}}>
      <h5 style={{margin:"0 0 8px",fontSize:10,fontWeight:700,color:c,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:C.mono}}>{t}</h5>
      {children}
    </div>
  );

  return(
    <SimCard style={{marginBottom:14,borderLeft:`3px solid ${col}`}}>
      <div onClick={onToggle} style={{cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:180}}>
            <span style={{background:`${col}18`,color:col,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,textTransform:"uppercase",fontFamily:C.mono}}>{s.categorie}</span>
            <h3 style={{margin:"6px 0 0",fontSize:15,fontWeight:700,color:C.w}}>{s.nom}</h3>
            <p style={{margin:"4px 0 0",fontSize:12,color:C.g2}}>{s.description}</p>
          </div>
          <div style={{textAlign:"right",minWidth:120}}>
            <div style={{fontSize:10,color:C.g3,marginBottom:4,fontFamily:C.mono}}>SCORE</div>
            <SimScoreBar score={s.score}/>
            {(s.totalCout!=null)&&<><div style={{fontSize:10,color:C.g3,marginTop:8,fontFamily:C.mono}}>COÛT TOTAL</div>
            <div style={{fontSize:14,fontWeight:700,fontFamily:C.mono,color:C.w}}>{simFmt(s.totalCout)}</div></>}
          </div>
        </div>
        {ao.length>1&&<div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>{ao.map(o=>{
          const r=SIM_REL[s.id]?.[o.id]||30;const m=SIM_OBJ.find(x=>x.id===o.id);
          return(<div key={o.id} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:6,
            background:r>=70?C.greenSub:r>=40?C.yellowSub:C.redSub,fontSize:10}}>
            <span style={{fontWeight:700,color:r>=70?C.green:r>=40?C.yellow:C.red}}>{m?.short} {r}%</span>
          </div>);
        })}</div>}
        <div style={{fontSize:12,color:col,fontWeight:600,marginTop:10}}>{ex?"▾ Masquer":"▸ Détails"}</div>
      </div>
      {ex&&<div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
        {/* KPI grid for existant scenarios */}
        {s.kpis&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8,marginBottom:14}}>
          {Object.entries(s.kpis).map(([k,v])=><div key={k} style={{background:C.card2,border:`1px solid ${C.border}`,padding:"8px 12px",borderRadius:8}}>
            <div style={{fontSize:10,color:C.g3,fontFamily:C.mono}}>{k}</div>
            <div style={{fontSize:13,fontWeight:700,fontFamily:C.mono,color:C.w}}>{v}</div>
          </div>)}
        </div>}
        {/* Phases for acquisition scenarios */}
        {s.phases&&<>
          <PB t={"① Acquisition"} c={C.blue}><KV k="Frais notaire" v={simFmt(s.phases.acquisition.fraisNotaire)}/>{s.phases.acquisition.fraisStructure>0&&<KV k="Constitution" v={simFmt(s.phases.acquisition.fraisStructure)}/>}<KV k="Total" v={simFmt(s.phases.acquisition.total)} b/></PB>
          <PB t={`② Détention (${s.phases.detention.duree} ans)`} c={C.green}><KV k="Régime" v={s.phases.detention.regime}/><KV k="Imposable/an" v={simFmt(s.phases.detention.revenuImposable)}/>{s.phases.detention.amortAnnuel&&<KV k="Amort./an" v={simFmt(s.phases.detention.amortAnnuel)}/>}<KV k="Fiscal/an" v={simFmt(s.phases.detention.fiscAnnuelle)} b/><KV k="Revenu net/an" v={simFmt(s.phases.detention.revenuNet)} b/></PB>
          <PB t="③ Vente" c={C.yellow}><KV k="Valeur" v={simFmt(s.phases.vente.valeurRevente)}/>{s.phases.vente.pvBrute!=null&&<KV k="PV brute" v={simFmt(s.phases.vente.pvBrute)}/>}<KV k="Total fiscal" v={simFmt(s.phases.vente.pvTotal)} b/>{s.phases.vente.cashNet!=null&&<KV k="Cash net" v={simFmt(s.phases.vente.cashNet)} b/>}</PB>
          <PB t="④ Succession" c="#8B5CF6"><KV k="Valeur transmise" v={simFmt(s.phases.succession.valeur)}/>{s.phases.succession.decote&&<KV k="Décote" v={s.phases.succession.decote}/>}{s.phases.succession.dutreil&&<KV k="Dutreil" v="−75%"/>}<KV k="Total droits" v={simFmt(s.phases.succession.totalDroits)} b/></PB>
          <div style={{background:C.card2,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}><KV k="Acq+Détention+Vente" v={simFmt(s.totalCout)} b/><KV k="Acq+Détention+Succession" v={simFmt(s.totalCoutSucc)} b/></div>
        </>}
        {/* Avantages / Inconvénients */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12,marginBottom:12}}>
          <div>{(s.avantages||[]).map((a,i)=><div key={i} style={{fontSize:11,padding:"4px 0",color:C.green,borderBottom:`1px solid ${C.border}`}}>✓ {a}</div>)}</div>
          <div>{(s.inconvenients||[]).map((a,i)=><div key={i} style={{fontSize:11,padding:"4px 0",color:C.red,borderBottom:`1px solid ${C.border}`}}>✗ {a}</div>)}</div>
        </div>
        {(s.alertes||[]).length>0&&<div style={{marginBottom:10}}>{s.alertes.map((a,i)=><div key={i} style={{background:C.yellowSub,border:"1px solid rgba(245,158,11,0.2)",borderRadius:6,padding:"6px 10px",marginBottom:4,fontSize:11,color:C.yellow}}>{a}</div>)}</div>}
        {(s.sources||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{s.sources.map((src,i)=><span key={i} style={{background:C.card2,border:`1px solid ${C.border}`,padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:C.mono,color:C.g2}}>{src}</span>)}</div>}
      </div>}
    </SimCard>
  );
}

function SimCompTable({scenarios:sc}){
  const rows=sc.map(s=>{
    let fiscDet=null,coutVente=null,coutSucc=null,succDetail=null;
    if(s.phases){fiscDet=(s.phases.detention?.fiscTotale||0)+(s.phases.detention?.coutStructureTotal||0);coutVente=(s.phases.vente?.pvTotal||0);coutSucc=(s.phases.succession?.totalDroits||0);succDetail=s.phases.succession||null;}
    else if(s._comp){fiscDet=s._comp.fiscDetention;coutVente=s._comp.coutVente;coutSucc=s._comp.coutSuccession;succDetail=s._comp.succDetail||null;}
    return{nom:s.nom,categorie:s.categorie,couleur:s.couleur||C.blue,score:s.score,fiscDet,coutVente,coutSucc,succDetail};
  });
  const vals=(key)=>rows.map(r=>r[key]).filter(v=>v!=null&&v>0);
  const minDet=vals("fiscDet").length?Math.min(...vals("fiscDet")):null;
  const minVente=vals("coutVente").length?Math.min(...vals("coutVente")):null;
  const minSucc=vals("coutSucc").length?Math.min(...vals("coutSucc")):null;
  const th={padding:"12px 16px",fontSize:10,fontWeight:700,color:C.g2,textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"center",borderBottom:`1px solid ${C.border}`,background:C.card2,fontFamily:C.mono};
  const td={padding:"12px 16px",borderBottom:`1px solid ${C.border}`,textAlign:"center"};
  return(
    <div style={{marginBottom:24}}>
      <p style={{fontSize:10,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:12}}>TABLEAU COMPARATIF</p>
      <div style={{overflowX:"auto",borderRadius:12,border:`1px solid ${C.border}`,background:C.card}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
          <thead><tr>
            <th style={{...th,textAlign:"left",minWidth:180}}>Véhicule</th>
            <th style={th}>Coût fiscal</th>
            <th style={th}>Coût cession</th>
            <th style={th}>Coût succession</th>
          </tr></thead>
          <tbody>{rows.map((r,i)=>{
            const best=(key,min)=>r[key]!=null&&r[key]>0&&r[key]===min;
            return(
              <tr key={i} style={{transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{...td,textAlign:"left"}}><div style={{fontSize:13,fontWeight:700,color:C.w}}>{r.nom}</div><div style={{display:"flex",gap:6,marginTop:4}}><span style={{fontSize:9,color:r.couleur,fontFamily:C.mono}}>{r.categorie}</span><span style={{fontSize:10,fontWeight:700,color:r.score>=70?C.green:r.score>=45?C.yellow:C.red,fontFamily:C.mono}}>{r.score}</span></div></td>
                <td style={{...td,background:best("fiscDet",minDet)?C.greenSub:"transparent"}}>{r.fiscDet!=null?<span style={{fontSize:13,fontWeight:700,color:best("fiscDet",minDet)?C.green:C.w,fontFamily:C.mono}}>{simFmt(r.fiscDet)}</span>:<span style={{color:C.g3}}>—</span>}</td>
                <td style={{...td,background:best("coutVente",minVente)?C.greenSub:"transparent"}}>{r.coutVente!=null?<span style={{fontSize:13,fontWeight:700,color:best("coutVente",minVente)?C.green:C.w,fontFamily:C.mono}}>{simFmt(r.coutVente)}</span>:<span style={{color:C.g3}}>—</span>}</td>
                <td style={{...td,background:best("coutSucc",minSucc)?"rgba(139,92,246,0.08)":"transparent"}}>{r.coutSucc!=null?<div><span style={{fontSize:13,fontWeight:700,color:best("coutSucc",minSucc)?"#8B5CF6":C.w,fontFamily:C.mono}}>{simFmt(r.coutSucc)}</span>{r.succDetail?.decote&&<div style={{fontSize:9,color:"#8B5CF6",marginTop:2}}>Décote {r.succDetail.decote}</div>}</div>:<span style={{color:C.g3}}>—</span>}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

function SimChatbot({profile:pr,property:pp,scenarios:sc,isAcq}){
  const[open,setOpen]=useState(false);const[msgs,setMsgs]=useState([]);const[inp,setInp]=useState("");const[ld,setLd]=useState(false);
  const eR=useRef(null),iR=useRef(null);
  const objStr=pr.objectives?.filter(o=>o.weight>0).map(o=>`${SIM_OBJ.find(x=>x.id===o.id)?.label} (${o.weight}%)`).join(", ")||"";
  const sys=useMemo(()=>`Tu es l'assistant IA Equity, expert patrimoine immobilier France. Pédagogique, cite CGI/BOFiP.\nOBJECTIFS: ${objStr}\nPROFIL: ${pr.age} ans, ${pr.couple?"couple":"seul"}, ${pr.enfants} enf., TMI ${pr.tmi}%\nBIEN: ${pp.mode}, ${simFmt(pp.prixAcquisition)}${isAcq?", loyer "+simFmt(pp.acqLoyer):", valeur "+simFmt(pp.valeurActuelle)}\nSCÉNARIOS:\n${sc.map((s,i)=>`#${i+1} ${s.nom} (${s.score})`).join("\n")}`,[pr,pp,sc,isAcq]);
  useEffect(()=>{eR.current?.scrollIntoView({behavior:"smooth"});},[msgs,ld]);
  useEffect(()=>{if(open&&iR.current)iR.current.focus();},[open]);
  useEffect(()=>{
    const os=pr.objectives?.filter(o=>o.weight>0).map(o=>`**${SIM_OBJ.find(x=>x.id===o.id)?.short}** ${o.weight}%`).join(" · ")||"";
    setMsgs([{role:"assistant",content:`**${sc.length} scénarios** classés selon vos priorités : ${os}.\n\nLe score combine pertinence technique (35%) et adéquation objectifs (65%). Posez votre question !`}]);
  },[]);
  const sugg=["Pourquoi ce classement ?","Détaille le meilleur","Compare les 2 premiers","Impact d'un changement ?"];
  const send=async(t)=>{if(!t.trim()||ld)return;const nm=[...msgs,{role:"user",content:t.trim()}];setMsgs(nm);setInp("");setLd(true);
    try{const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5-20250514",max_tokens:2048,system:sys,messages:nm.map(m=>({role:m.role,content:m.content}))})});const d=await r.json();setMsgs(p=>[...p,{role:"assistant",content:d.content?.map(c=>c.text||"").join("")||"Erreur."}]);}catch(e){setMsgs(p=>[...p,{role:"assistant",content:`Erreur: ${e.message}`}]);}finally{setLd(false);}};
  const md=(t)=>t.split(/(\*\*[^*]+\*\*)/g).map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i} style={{color:C.blue}}>{p.slice(2,-2)}</strong>:p.split("\n").map((l,j)=><span key={`${i}-${j}`}>{j>0&&<br/>}{l}</span>));

  if(!open)return(
    <div onClick={()=>setOpen(true)} style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.blue},#2563EB)`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 6px 24px ${C.blueGlow}`,zIndex:1000,transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </div>
  );

  return(
    <div style={{position:"fixed",bottom:24,right:24,width:400,height:560,maxHeight:"calc(100vh - 48px)",borderRadius:18,overflow:"hidden",zIndex:1000,background:C.card,border:`1px solid ${C.border}`,boxShadow:"0 12px 48px rgba(0,0,0,0.5)",display:"flex",flexDirection:"column",animation:"fadeUp 0.25s ease"}}>
      <div style={{background:`linear-gradient(135deg,${C.blue},#2563EB)`,padding:"14px 18px",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800}}>E</div>
          <div><div style={{fontSize:14,fontWeight:700}}>Equity IA</div><div style={{fontSize:10,opacity:0.7}}>Assistant patrimonial</div></div>
        </div>
        <div onClick={()=>setOpen(false)} style={{width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:"rgba(255,255,255,0.12)"}}><I.X/></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 8px"}}>
        {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
          <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
            background:m.role==="user"?C.blue:C.card2,border:m.role==="user"?"none":`1px solid ${C.border}`,
            color:"#fff",fontSize:12.5,lineHeight:1.6}}>{md(m.content)}</div>
        </div>))}
        {ld&&<div style={{display:"flex",gap:6,marginBottom:10}}><div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:"14px 14px 14px 4px",padding:"12px 18px",display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.g2,animation:`pulse 1.4s ${i*0.16}s infinite ease-in-out both`}}/>)}</div></div>}
        <div ref={eR}/>
      </div>
      {msgs.length<=2&&!ld&&<div style={{padding:"4px 14px 6px",display:"flex",flexWrap:"wrap",gap:5,flexShrink:0}}>{sugg.map((q,i)=><div key={i} onClick={()=>send(q)} style={{padding:"5px 11px",borderRadius:16,border:`1px solid ${C.border}`,background:C.card2,fontSize:11,color:C.g1,cursor:"pointer",fontWeight:500,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.g1;}}>{q}</div>)}</div>}
      <div style={{padding:"10px 14px 14px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",gap:8}}>
          <input ref={iR} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(inp);}}} placeholder="Posez votre question…"
            style={{flex:1,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.border2}`,fontSize:13,fontFamily:C.font,outline:"none",background:C.card2,color:C.w}}
            onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border2}/>
          <button onClick={()=>send(inp)} disabled={!inp.trim()||ld}
            style={{width:38,height:38,borderRadius:10,border:"none",background:inp.trim()&&!ld?C.blue:C.g4,color:"#fff",cursor:inp.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div style={{fontSize:9,color:C.g3,marginTop:5,textAlign:"center",fontFamily:C.mono}}>Alimenté par Claude · Pas un conseil juridique</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   SIMULATEUR PAGE
════════════════════════════════════════ */
function SimulateurPage(){
  const[step,setStep]=useState(-1);const[ex,setEx]=useState(null);const[selEx,setSelEx]=useState(null);const[ck,setCk]=useState(0);const[viewMode,setViewMode]=useState("both");const[hasRes,setHasRes]=useState(false);
  const[pr,setPr]=useState({objectives:[],age:"",couple:false,regimeMatrimonial:"communaute-reduite",enfants:0,donationsAnterieures:0,tmi:30,divorce:false});
  const[pp,setPp]=useState({mode:"existant",type:"locatif",isRP:false,prixAcquisition:"",valeurActuelle:"",dateAcquisition:"",anneesDetention:0,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:"",chargesLocatives:"",meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:"",acqDureeDetention:15,acqTauxRevalo:2,acqLoyer:"",acqCharges:"",acqMeuble:false,acqTaxeFonciere:""});
  const up=(k,v)=>setPr(p=>({...p,[k]:v}));const upr=(k,v)=>setPp(p=>({...p,[k]:v}));
  useEffect(()=>{if(pp.dateAcquisition){const y=parseInt(pp.dateAcquisition.split("-")[0]);if(y)upr("anneesDetention",new Date().getFullYear()-y);}},[pp.dateAcquisition]);
  const isA=pp.mode==="acquisition";
  const loadEx=(e)=>{setSelEx(e.id);setPr(e.profile);setPp(e.property);setCk(k=>k+1);setTimeout(()=>{setStep(3);setEx(null);},200);};
  const fresh=()=>{setPr({objectives:[],age:"",couple:false,regimeMatrimonial:"communaute-reduite",enfants:0,donationsAnterieures:0,tmi:30,divorce:false});setPp({mode:"existant",type:"locatif",isRP:false,prixAcquisition:"",valeurActuelle:"",dateAcquisition:"",anneesDetention:0,travaux:0,dettes:0,regimeFiscal:"micro-foncier",loyerAnnuel:"",chargesLocatives:"",meuble:false,amortissementsLMNP:0,dispositif:"aucun",patrimoineImmoTotal:"",acqDureeDetention:15,acqTauxRevalo:2,acqLoyer:"",acqCharges:"",acqMeuble:false,acqTaxeFonciere:""});setSelEx(null);setCk(k=>k+1);setHasRes(false);setStep(0);};
  const sc=useMemo(()=>{if(step<3||!pr.objectives?.length)return[];return isA?simGenAcq(pr,pp):simGenEx(pr,pp);},[step,pr,pp,isA]);
  useEffect(()=>{if(step===3&&sc.length>0)setHasRes(true);},[step,sc]);
  const tw=pr.objectives.reduce((s,o)=>s+o.weight,0);
  const canGo=()=>{if(step===0)return pr.objectives.filter(o=>o.weight>0).length>0&&tw===100;if(step===1)return!!pr.age;if(step===2)return isA?(pp.prixAcquisition&&pp.acqLoyer):(pp.prixAcquisition&&pp.valeurActuelle);return true;};

  const NavBtn=({onClick,children,primary,disabled,danger})=>(
    <button onClick={disabled?undefined:onClick} disabled={disabled}
      style={{padding:"10px 24px",borderRadius:10,border:primary?"none":`1px solid ${C.border2}`,
        background:disabled?C.g4:danger?C.redSub:primary?`linear-gradient(135deg,${C.blue},#2563EB)`:C.card,
        fontSize:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",color:disabled?C.g3:danger?C.red:"#fff",
        boxShadow:primary&&!disabled?`0 4px 16px ${C.blueGlow}`:"none",transition:"all 0.15s"}}>
      {children}
    </button>
  );

  return(
    <main style={{flex:1,overflowY:"auto",background:C.bg,padding:"28px 36px 80px",position:"relative"}}>
      <style>{`
        .sim-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#3B82F6;cursor:pointer;border:2px solid #09090B;box-shadow:0 0 0 2px #3B82F6}
        .sim-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#3B82F6;cursor:pointer;border:2px solid #09090B}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.5}
      `}</style>
      <div style={{maxWidth:920,margin:"0 auto"}}>

        {/* ── HOME SCREEN ── */}
        {step===-1&&(<div>
          <div style={{marginBottom:36}}>
            <p style={{fontSize:10,fontFamily:C.mono,color:C.blue,letterSpacing:"0.12em",marginBottom:8}}>SIMULATEURS</p>
            <h2 style={{fontSize:26,fontWeight:800,color:C.w,letterSpacing:"-0.03em",marginBottom:8}}>Arbitrage patrimonial</h2>
            <p style={{color:C.g2,fontSize:13}}>Objectifs pondérés, calculs déterministes, assistant IA intégré.</p>
          </div>
          <button onClick={fresh} style={{padding:"12px 28px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.blue},#2563EB)`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${C.blueGlow}`,marginBottom:32,display:"flex",alignItems:"center",gap:8}}>
            <I.Sparkles/> Nouvelle simulation
          </button>
          <p style={{fontSize:10,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:16}}>CAS PRATIQUES</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {SIM_EX.map(e=>(
              <SimCard key={e.id} hover onClick={()=>loadEx(e)} style={{borderTop:`3px solid ${e.couleur}`,padding:0,overflow:"hidden"}}>
                <div style={{padding:"18px 20px 14px"}}>
                  <h3 style={{margin:"0 0 6px",fontSize:14,fontWeight:700,color:C.w,lineHeight:1.3}}>{e.titre}</h3>
                  <p style={{margin:"0 0 10px",fontSize:11.5,color:C.g2,lineHeight:1.5}}>{e.description}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{e.tags.map(t=><span key={t} style={{background:`${e.couleur}15`,color:e.couleur,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:12,fontFamily:C.mono}}>{t}</span>)}</div>
                </div>
                <div style={{background:C.card2,padding:"8px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end"}}>
                  <span style={{fontSize:11,fontWeight:700,color:e.couleur}}>Simuler →</span>
                </div>
              </SimCard>
            ))}
          </div>
        </div>)}

        {/* ── WIZARD STEPS ── */}
        {step>=0&&step<=2&&<SimStepInd c={step}/>}

        {step===0&&<div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:4}}>Objectifs</h2>
          <SimObjSel objectives={pr.objectives} onChange={v=>up("objectives",v)}/>
        </div>}

        {step===1&&(<div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:20}}>Profil du client</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>PERSONNEL</p>
              <SimInp label="Âge" value={pr.age} onChange={v=>up("age",v)} type="number" suffix="ans" placeholder="55"/>
              <SimChk label="En couple" checked={pr.couple} onChange={()=>up("couple",!pr.couple)}/>
              {pr.couple&&<SimSel label="Régime" value={pr.regimeMatrimonial} onChange={v=>up("regimeMatrimonial",v)} options={[{value:"communaute-reduite",label:"Communauté réduite"},{value:"separation",label:"Séparation de biens"},{value:"pacs",label:"PACS"}]}/>}
              <SimChk label="Divorce / rupture" checked={pr.divorce} onChange={()=>up("divorce",!pr.divorce)}/>
              <SimInp label="Enfants" value={pr.enfants} onChange={v=>up("enfants",v)} type="number" min={0}/>
            </SimCard>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>FISCAL</p>
              <SimSel label="TMI" value={pr.tmi} onChange={v=>up("tmi",Number(v))} options={[{value:0,label:"0%"},{value:11,label:"11%"},{value:30,label:"30%"},{value:41,label:"41%"},{value:45,label:"45%"}]}/>
              <SimInp label="Donations ant. (<15 ans) / enf." value={pr.donationsAnterieures} onChange={v=>up("donationsAnterieures",v)} type="number" suffix="€" placeholder="0"/>
            </SimCard>
          </div>
        </div>)}

        {step===2&&(<div>
          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:14}}>Le bien immobilier</h2>
          <SimModeToggle mode={pp.mode} onChange={v=>upr("mode",v)}/>
          {!isA&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>IDENTIFICATION</p>
              <SimSel label="Type" value={pp.type} onChange={v=>{upr("type",v);upr("isRP",v==="rp");}} options={[{value:"rp",label:"Résidence principale"},{value:"rs",label:"Résidence secondaire"},{value:"locatif",label:"Locatif"}]}/>
              <SimChk label="Résidence principale" checked={pp.isRP} onChange={()=>upr("isRP",!pp.isRP)}/>
              <SimInp label="Prix acquisition" value={pp.prixAcquisition} onChange={v=>upr("prixAcquisition",v)} type="number" suffix="€"/>
              <SimInp label="Valeur actuelle" value={pp.valeurActuelle} onChange={v=>upr("valeurActuelle",v)} type="number" suffix="€"/>
              <SimInp label="Date acquisition" value={pp.dateAcquisition} onChange={v=>upr("dateAcquisition",v)} type="date"/>
              <div style={{background:C.card2,border:`1px solid ${C.border}`,padding:"10px 14px",borderRadius:8,fontSize:13,color:C.g1}}>Détention: <strong style={{color:C.w,fontFamily:C.mono}}>{pp.anneesDetention} an(s)</strong></div>
            </SimCard>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>FISCAL</p>
              <SimInp label="Travaux" value={pp.travaux} onChange={v=>upr("travaux",v)} type="number" suffix="€"/>
              <SimInp label="Dettes" value={pp.dettes} onChange={v=>upr("dettes",v)} type="number" suffix="€"/>
              <SimChk label="Loué meublé" checked={pp.meuble} onChange={()=>upr("meuble",!pp.meuble)}/>
              {pp.meuble&&<SimInp label="Amort. LMNP" value={pp.amortissementsLMNP} onChange={v=>upr("amortissementsLMNP",v)} type="number" suffix="€"/>}
              {!pp.meuble&&<>
                <SimSel label="Régime fiscal" value={pp.regimeFiscal} onChange={v=>upr("regimeFiscal",v)} options={[{value:"micro-foncier",label:"Micro-foncier (30%)"},{value:"reel",label:"Réel (déductions)"}]}/>
                <SimInp label="Loyer annuel" value={pp.loyerAnnuel} onChange={v=>upr("loyerAnnuel",v)} type="number" suffix="€"/>
                <SimInp label="Charges annuelles" value={pp.chargesLocatives} onChange={v=>upr("chargesLocatives",v)} type="number" suffix="€"/>
              </>}
              {simHO(pr.objectives,["reduire-ifi"])&&<SimInp label="Patrimoine immo total" value={pp.patrimoineImmoTotal} onChange={v=>upr("patrimoineImmoTotal",v)} type="number" suffix="€"/>}
            </SimCard>
          </div>}
          {isA&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>ACQUISITION</p>
              <SimInp label="Prix" value={pp.prixAcquisition} onChange={v=>{upr("prixAcquisition",v);upr("valeurActuelle",v);}} type="number" suffix="€" placeholder="280 000"/>
              <SimInp label="Emprunt" value={pp.dettes} onChange={v=>upr("dettes",v)} type="number" suffix="€"/>
              <SimChk label="Meublé envisagé" checked={pp.acqMeuble} onChange={()=>upr("acqMeuble",!pp.acqMeuble)}/>
            </SimCard>
            <SimCard>
              <p style={{fontSize:9,fontFamily:C.mono,color:C.g3,letterSpacing:"0.1em",marginBottom:14}}>PROJECTION</p>
              <SimInp label="Loyer annuel" value={pp.acqLoyer} onChange={v=>{upr("acqLoyer",v);upr("loyerAnnuel",v);}} type="number" suffix="€" placeholder="14 400"/>
              <SimInp label="Charges" value={pp.acqCharges} onChange={v=>{upr("acqCharges",v);upr("chargesLocatives",v);}} type="number" suffix="€"/>
              <SimInp label="Taxe foncière" value={pp.acqTaxeFonciere} onChange={v=>upr("acqTaxeFonciere",v)} type="number" suffix="€"/>
              <SimInp label="Durée" value={pp.acqDureeDetention} onChange={v=>upr("acqDureeDetention",v)} type="number" suffix="ans"/>
              <SimInp label="Revalo./an" value={pp.acqTauxRevalo} onChange={v=>upr("acqTauxRevalo",v)} type="number" suffix="%"/>
            </SimCard>
          </div>}
        </div>)}

        {/* ── RESULTS ── */}
        {step===3&&(<div>
          <SimStepInd c={3} onGo={(s)=>{setStep(s);setEx(null);setCk(k=>k+1);}}/>
          {/* Edit toolbar */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div style={{fontSize:13,fontWeight:600,color:C.w}}>{selEx?SIM_EX.find(e=>e.id===selEx)?.titre:"Simulation personnalisée"}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{s:0,label:"Objectifs"},{s:1,label:"Profil"},{s:2,label:"Bien"}].map(b=>(
                <button key={b.s} onClick={()=>{setStep(b.s);setEx(null);setCk(k=>k+1);}}
                  style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.g1,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g1;}}>{b.label}</button>
              ))}
              <button onClick={fresh} style={{padding:"5px 12px",borderRadius:7,border:`1px solid ${C.border2}`,background:"transparent",color:C.g2,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.color=C.g2;}}>Nouveau</button>
            </div>
          </div>

          <h2 style={{fontSize:20,fontWeight:800,color:C.w,marginBottom:6}}>{isA?"Comparatif structures":"Scénarios comparés"}</h2>
          {/* Objective pills */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>{pr.objectives?.filter(o=>o.weight>0).map(o=>{const m=SIM_OBJ.find(x=>x.id===o.id);return(
            <div key={o.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:16,background:C.blueSub,border:`1px solid ${C.blueMid}`}}>
              <span style={{color:C.blue,display:"flex"}}>{m&&<m.Ic/>}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.w}}>{m?.short}</span>
              <span style={{fontSize:11,fontWeight:700,color:C.blue,fontFamily:C.mono}}>{o.weight}%</span>
            </div>
          );})}</div>
          {/* Summary card */}
          <SimCard style={{marginBottom:20,background:`linear-gradient(135deg,rgba(59,130,246,0.06),rgba(59,130,246,0.02))`,border:`1px solid ${C.blueMid}`}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:14}}>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>CLIENT</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{pr.age} ans{pr.couple?" · Couple":""}</div></div>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>{isA?"PRIX":"BIEN"}</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{simFmt(pp.prixAcquisition)}</div></div>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>{isA?"LOYER":"DÉTENTION"}</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{isA?simFmt(pp.acqLoyer)+"/an":pp.anneesDetention+" ans"}</div></div>
              <div><div style={{fontSize:9,color:C.g3,fontFamily:C.mono,letterSpacing:"0.08em"}}>TMI</div><div style={{fontSize:14,fontWeight:700,color:C.w,marginTop:3}}>{pr.tmi}%</div></div>
            </div>
          </SimCard>
          {/* View mode toggle */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <p style={{color:C.g2,margin:0,fontSize:12}}>{sc.length} scénario(s) · Score = 35% technique + 65% objectifs</p>
            <div style={{display:"flex",background:C.card2,borderRadius:8,padding:2,border:`1px solid ${C.border}`}}>
              {[{id:"cards",label:"Fiches"},{id:"table",label:"Tableau"},{id:"both",label:"Les deux"}].map(m=>(
                <div key={m.id} onClick={()=>setViewMode(m.id)}
                  style={{padding:"5px 14px",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:viewMode===m.id?700:500,
                    background:viewMode===m.id?C.blue:"transparent",color:viewMode===m.id?"#fff":C.g2,transition:"all 0.2s"}}>
                  {m.label}
                </div>
              ))}
            </div>
          </div>
          {(viewMode==="table"||viewMode==="both")&&<SimCompTable scenarios={sc}/>}
          {(viewMode==="cards"||viewMode==="both")&&<>{sc.map(s=><SimExCard key={s.id} s={s} expanded={ex===s.id} onToggle={()=>setEx(ex===s.id?null:s.id)} objs={pr.objectives} isAcq={isA}/>)}</>}
          <div style={{marginTop:28,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,fontSize:11,color:C.g2,lineHeight:1.7}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{color:C.g3,flexShrink:0,marginTop:1}}><I.Shield/></span>
              <div>
                <strong style={{color:C.g1}}>Avertissement</strong> — Estimations basées sur CGI/BOFiP en vigueur (04/03/2026). Le score pondéré combine 35% de pertinence technique et 65% d'adéquation à vos objectifs. Ces résultats ne constituent pas un conseil juridique ou fiscal. Validation notariale recommandée.
              </div>
            </div>
          </div>
        </div>)}

        {/* ── NAV BUTTONS ── */}
        {step>=0&&step<=2&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:28,gap:12}}>
          {step>0?<NavBtn onClick={()=>setStep(s=>s-1)}>← Précédent</NavBtn>:<div/>}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {hasRes&&<NavBtn onClick={()=>{setCk(k=>k+1);setEx(null);setStep(3);}}>↻ Résultats</NavBtn>}
            <NavBtn primary onClick={()=>canGo()&&setStep(s=>s+1)} disabled={!canGo()}>{step===0&&tw!==100?`Total: ${tw}/100`:"Suivant →"}</NavBtn>
          </div>
        </div>}
      </div>
      {step===3&&sc.length>0&&<SimChatbot key={ck} profile={pr} property={pp} scenarios={sc} isAcq={isA}/>}
    </main>
  );
}



/* ════════════════════════════════════════
   PERSISTENT STORAGE HELPERS
════════════════════════════════════════ */
async function storageGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch(e) { return null; }
}
async function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch(e) { console.error("Storage set error:", e); return false; }
}
async function storageDel(key) {
  try { localStorage.removeItem(key); return true; }
  catch(e) { return false; }
}

/* ── Attach Tenant to Property Popup ── */
function AttachTenantPopup({ tenant, assets, onAttach, onSkip }) {
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

export default function EquityApp() {
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [user,           setUser]           = useState(null);
  const [showMonCompte,  setShowMonCompte]  = useState(false);
  const [nav,            setNav]            = useState("pilotage");
  const [viewMode,       setViewMode]       = useState("standard"); // "standard" | "map"
  const [assets,         setAssets]         = useState([]);
  const [tenants,        setTenants]        = useState([]);
  const [selectedAsset,  setSelectedAsset]  = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showNewTenant,  setShowNewTenant]  = useState(false);
  const [showNewAsset,   setShowNewAsset]   = useState(false);
  const [pendingTenant,  setPendingTenant]  = useState(null); // tenant awaiting property attachment
  const [tenantInitialTab, setTenantInitialTab] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [kycData,        setKycData]        = useState({});
  const [storageReady,   setStorageReady]   = useState(false);

  const handleLogin = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Load saved data from persistent storage
    try {
      const email = userData.email || "default";
      const saved = await storageGet(`equity-data:${email}`);
      if (saved) {
        if (saved.assets) setAssets(saved.assets);
        if (saved.tenants) setTenants(saved.tenants);
        if (saved.kycData) setKycData(saved.kycData);
        if (saved.onboardingDone) setOnboardingDone(true);
        if (!saved.onboardingDone) setShowOnboarding(true);
      } else {
        // First time: start empty, show onboarding
        setAssets([]);
        setTenants([]);
        setShowOnboarding(true);
      }
    } catch(e) {
      console.error("Load error:", e);
      setShowOnboarding(true);
    }
    setStorageReady(true);
  };

  const handleLogout = () => {
    setShowMonCompte(false);
    setIsLoggedIn(false);
    setUser(null);
    setNav("pilotage");
    setAssets([]);
    setTenants([]);
    setSelectedAsset(null);
    setSelectedTenant(null);
    setShowNewTenant(false);
    setShowNewAsset(false);
    setShowOnboarding(false);
    setStorageReady(false);
  };

  const handleOnboardingComplete = () => { setShowOnboarding(false); setOnboardingDone(true); };

  const handleSaveUser = (updated) => setUser(updated);

  // ── AUTO-SAVE to persistent storage ──
  useEffect(() => {
    if (!storageReady || !user) return;
    const email = user.email || "default";
    const data = { assets, tenants, kycData, onboardingDone, savedAt: Date.now() };
    storageSet(`equity-data:${email}`, data);
  }, [assets, tenants, kycData, onboardingDone, storageReady, user]);

  // Save user profile separately
  useEffect(() => {
    if (!storageReady || !user) return;
    const email = user.email || "default";
    storageSet(`equity-user:${email}`, user);
  }, [user, storageReady]);

  const handleAddAsset = (newAsset) => {
    const withId = { ...newAsset, id: Date.now() };
    setAssets(prev => [...prev, withId]);
    setShowNewAsset(false);
    setNav("patrimoine");   // navigate to patrimoine after creation
  };

  const handleSelectAsset  = (asset)  => { setSelectedAsset(asset); setShowNewAsset(false); };
  const handleNewAsset     = ()       => { setShowNewAsset(true); setSelectedAsset(null); };
  const handleCloseAsset   = ()       => { setShowNewAsset(false); setSelectedAsset(null); };
  const handleUpdateAsset = (updatedAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setSelectedAsset(updatedAsset);
  };
  const handleDeleteAsset  = (assetId) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setSelectedAsset(null);
    setShowNewAsset(false);
  };
  const handleAddTenant = (newTenant) => {
    const withId = { ...newTenant, id: Date.now(), daysLate: 0 };
    setTenants(prev => [...prev, withId]);
    setShowNewTenant(false);
    // Show attach-to-property popup if there are existing assets
    if (assets.length > 0) {
      setPendingTenant(withId);
    }
  };

  const handleAttachTenant = (assetId) => {
    if (!pendingTenant) return;
    const bien = assets.find(a=>a.id===assetId);
    if (!bien) return;
    const loyerVal = bien.loyer || "";
    const loyerNum = parseInt(String(loyerVal).replace(/[^\d]/g,""),10) || 0;
    const isVide = (bien.typeLocation||"").toLowerCase().includes("vide");
    const depotCalc = loyerNum > 0 ? (isVide ? loyerNum : loyerNum * 2) : "";
    const updatedTenant = {
      ...pendingTenant,
      bienId: assetId,
      bienName: bien.name || "",
      bienType: bien.type || "",
      bienAddr: [bien.addr, bien.addr2, bien.batiment, bien.porteLot].filter(Boolean).join(", "),
      bienVille: bien.ville || "",
      bienCodePostal: bien.codePostal || "",
      bienSurface: bien.surface || "",
      bienRooms: bien.rooms || "",
      bienDpe: bien.dpe || "",
      bienYear: bien.year || "",
      bienTypeLocation: bien.typeLocation || "",
      bienMode: bien.mode || "",
      loyerHC: loyerVal,
      chargesLoc: String(bien.chargesLocatives || ""),
      depotGarantieCalc: String(depotCalc),
      frequencePaiement: bien.frequencePaiement || "",
      dureeBail: isVide ? "3 ans renouvelable" : "1 an renouvelable",
      loyer: (pendingTenant.loyer && pendingTenant.loyer !== "\u2014 \u20ac") ? pendingTenant.loyer : (loyerVal ? loyerVal + " \u20ac" : pendingTenant.loyer),
    };
    setTenants(prev => prev.map(t => t.id === pendingTenant.id ? updatedTenant : t));
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, statut: "Loué", etatLocatif: "Loué", tenantId: pendingTenant.id, tenantName: `${pendingTenant.prenom||""} ${pendingTenant.nom||""}`.trim() } : a));
    setPendingTenant(null);
    setTenantInitialTab("Gestion");
    setSelectedTenant(updatedTenant);
    setNav("locataires");
  };

  const handleSkipAttach = () => { setPendingTenant(null); };
  const handleUpdateTenant = (updatedTenant) => {
    const prevTenant = tenants.find(t => t.id === updatedTenant.id);
    setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
    if (selectedTenant?.id === updatedTenant.id) setSelectedTenant(updatedTenant);
    // Sync asset on detach (bienId removed)
    if (prevTenant?.bienId && !updatedTenant.bienId) {
      setAssets(prev => prev.map(a => a.id === prevTenant.bienId ? { ...a, statut:"Disponible", etatLocatif:"Disponible", tenantId:null, tenantName:null } : a));
      if (selectedAsset?.id === prevTenant.bienId) setSelectedAsset(a => a ? { ...a, statut:"Disponible", etatLocatif:"Disponible", tenantId:null, tenantName:null } : a);
    }
    // Sync asset on attach (bienId added from tenant side)
    if (!prevTenant?.bienId && updatedTenant.bienId) {
      const tn = `${updatedTenant.prenom||""} ${updatedTenant.nom||""}`.trim();
      setAssets(prev => prev.map(a => a.id === updatedTenant.bienId ? { ...a, statut:"Loué", etatLocatif:"Loué", tenantId:updatedTenant.id, tenantName:tn } : a));
    }
  };
  const handleDeleteTenant = (tenantId) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    setSelectedTenant(null);
  };
  const handleSelectTenant = (tenant) => { setTenantInitialTab(null); setSelectedTenant(tenant); setShowNewTenant(false); };
  const handleNewTenant    = ()       => { setShowNewTenant(true); setSelectedTenant(null); };
  const handleCloseTenant  = ()       => { setTenantInitialTab(null); setSelectedTenant(null); setShowNewTenant(false); };

  const handleNav = (id) => {
    setNav(id);
    setSelectedAsset(null);
    setShowNewAsset(false);
    if (id !== "locataires") setSelectedTenant(null);
    setShowNewTenant(false);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg, fontFamily:C.font, color:C.w }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        *{font-family:'Outfit',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#27272A;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#3F3F46}
        ::selection{background:rgba(59,130,246,0.25);color:#fff}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes scanBar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.5;cursor:pointer}
        input[type=date]::-webkit-calendar-picker-indicator:hover{opacity:0.8}
        input[type=date]{cursor:pointer}
      `}</style>

      {/* ── LOGIN SCREEN ── */}
      {!isLoggedIn && <LoginScreen onLogin={handleLogin}/>}

      {/* ── ONBOARDING ── */}
      {isLoggedIn && showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onAddBien={()=>{ setShowOnboarding(false); setOnboardingDone(true); setNav("patrimoine"); setShowNewAsset(true); }}
        />
      )}

      {/* ── SIDEBAR ── */}
      {isLoggedIn && !showOnboarding && (<>
      <aside style={{ width:64, flexShrink:0, background:"#08080A", borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0", position:"sticky", top:0, height:"100vh" }}>
        {/* Logo — toggle map/standard */}
        <button onClick={()=>setViewMode(v=>v==="standard"?"map":"standard")} title={viewMode==="map"?"Retour gestion":"Vue investissement"}
          style={{ width:32, height:32, borderRadius:8, marginBottom:32, background:viewMode==="map"?"linear-gradient(135deg,#1D4ED8,#7C3AED)":`linear-gradient(135deg,${C.blue},#1D4ED8)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:viewMode==="map"?"0 0 20px rgba(124,58,237,0.5),0 0 40px rgba(59,130,246,0.2)":`0 4px 16px ${C.blueGlow}`, fontSize:13, fontWeight:800, border:viewMode==="map"?"2px solid rgba(124,58,237,0.6)":"2px solid transparent", cursor:"pointer", color:"#fff", transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)", animation:viewMode==="map"?"pulse 2s infinite":undefined }}>E</button>

        <nav style={{ display:"flex", flexDirection:"column", gap:4, width:"100%", alignItems:"center" }}>
          {NAV.map(({ id, label, Icon })=>{
            const active = nav===id;
            return (
              <button key={id} title={label} onClick={()=>handleNav(id)} style={{ background:active?C.blueSub:"transparent", border:"none", borderLeft:active?`2px solid ${C.blue}`:"2px solid transparent", width:"100%", padding:"12px 0", cursor:"pointer", color:active?C.blue:C.g2, display:"flex", justifyContent:"center", transition:"all 0.15s" }}
                onMouseEnter={e=>{if(!active)e.currentTarget.style.color=C.w}}
                onMouseLeave={e=>{if(!active)e.currentTarget.style.color=C.g2}}>
                <Icon/>
              </button>
            );
          })}
        </nav>

        {/* Avatar — Mon Compte */}
        <button
          title="Mon compte"
          onClick={()=>setShowMonCompte(true)}
          style={{ marginTop:"auto", width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, border:"2px solid transparent", cursor:"pointer", transition:"all 0.2s", color:"#fff", flexShrink:0 }}
          onMouseEnter={e=>{e.currentTarget.style.border="2px solid #8b5cf6";e.currentTarget.style.boxShadow="0 0 16px rgba(139,92,246,0.4)";e.currentTarget.style.transform="scale(1.08)";}}
          onMouseLeave={e=>{e.currentTarget.style.border="2px solid transparent";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
          {user ? ((user.prenom?.[0]||"")+(user.nom?.[0]||"")).toUpperCase() || "?" : "?"}
        </button>
      </aside>

      {/* ── MAP VIEW ── */}
      {viewMode==="map" && (
        <FranceMapView assets={assets} onSelectAsset={handleSelectAsset}/>
      )}

      {/* ── PAGE CONTENT ── */}
      {viewMode==="standard" && (showMonCompte && user
        ? <MonComptePanel user={user} onClose={()=>setShowMonCompte(false)} onLogout={handleLogout} onSave={handleSaveUser} kycData={kycData} onSaveKyc={setKycData}/>
        : <>
      {nav==="pilotage"    && <Dashboard onSelectAsset={handleSelectAsset} onNav={handleNav} onNewTenant={handleNewTenant} onSelectTenant={handleSelectTenant} assets={assets} tenants={tenants} user={user}/>}
      {nav==="patrimoine"  && <PatrimoinePage onSelectAsset={handleSelectAsset} onNewAsset={handleNewAsset} assets={assets}/>}
      {nav==="locataires"  && <LocatairesPage onNewTenant={handleNewTenant} onSelectTenant={handleSelectTenant} tenants={tenants}/>}
      {nav==="simulateurs" && <SimulateurPage/>}
      {!["pilotage","patrimoine","locataires","simulateurs"].includes(nav) && (
        <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:C.blueSub, border:`1px solid rgba(0,123,255,0.15)`, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><I.Sparkles/></div>
          <p style={{ fontSize:14, color:C.g2 }}>Section <strong style={{ color:C.g1 }}>{NAV.find(n=>n.id===nav)?.label}</strong> — bientôt disponible</p>
          <span style={{ fontSize:10, fontFamily:C.mono, color:C.g3 }}>EN COURS DE DÉVELOPPEMENT</span>
        </main>
      )}

      </>)}

      {/* ── SLIDE-OVERS ── */}
      {selectedAsset   && <PropertyDetail asset={selectedAsset} onClose={handleCloseAsset} onDelete={handleDeleteAsset} onUpdate={handleUpdateAsset} kycData={kycData}/>}
      {showNewAsset    && <NouveauBienPanel onClose={handleCloseAsset} onCreateAsset={handleAddAsset}/>}
      {selectedTenant  && <TenantDetailPanel tenant={selectedTenant} onClose={handleCloseTenant} onDelete={handleDeleteTenant} onUpdateTenant={handleUpdateTenant} initialTab={tenantInitialTab} assets={assets} user={user}/>}
      {showNewTenant   && <NouveauLocatairePanel onClose={handleCloseTenant} onSave={handleAddTenant}/>}
      {pendingTenant   && <AttachTenantPopup tenant={pendingTenant} assets={assets} onAttach={handleAttachTenant} onSkip={handleSkipAttach}/>}
      </>)}
    </div>
  );
}
