export function Sparkline({ color="#10B981" }) {
  const pts="0,28 12,22 24,25 36,15 48,18 60,8 72,12 84,5 96,9";
  return (
    <svg width="96" height="32" viewBox="0 0 96 32" fill="none">
      <defs><linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points={`0,32 ${pts} 96,32`} fill={`url(#sg${color.replace('#','')})`}/>
    </svg>
  );
}
