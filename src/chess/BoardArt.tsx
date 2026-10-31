import { useId } from 'react'

/** Schematic of the supplied 11 × 11 touch board. */
export default function CubeArt({ compact = false }: { compact?: boolean }) {
  const id = useId().replace(/:/g, '')
  const orange = [25, 36, 47, 58, 69]
  const white = [27, 38, 48, 59, 71]
  return <svg viewBox="0 0 600 480" fill="none" role="img" aria-label="AI智能棋盘示意图：11乘11触控棋盘、右侧数显屏与四个操作按键">
    <defs>
      <linearGradient id={`${id}-body`} x1="90" y1="60" x2="490" y2="420" gradientUnits="userSpaceOnUse"><stop stopColor="#f9f9f6"/><stop offset="1" stopColor="#c9c9c5"/></linearGradient>
      <linearGradient id={`${id}-key`} x2="0" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#d5d5d1"/></linearGradient>
      <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="24" stdDeviation="22" floodOpacity=".35"/></filter>
      <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <g transform="translate(56 32) rotate(-10 240 210)" filter={`url(#${id}-shadow)`}>
      <rect x="22" y="37" width="465" height="392" rx="33" fill="#8a8b86"/>
      <rect x="20" y="24" width="465" height="392" rx="33" fill={`url(#${id}-body)`} stroke="#fff" strokeWidth="1.5"/>
      <rect x="33" y="37" width="438" height="364" rx="24" stroke="#aaa" strokeOpacity=".3"/>
      {Array.from({ length: 121 }, (_, i) => {
        const x = 56 + (i % 11) * 30; const y = 66 + Math.floor(i / 11) * 30
        const lit = orange.includes(i); const other = white.includes(i)
        return <g key={i}>{lit && <circle cx={x} cy={y} r="14" fill="#ff6c24" filter={`url(#${id}-glow)`} opacity=".8"/>}<circle cx={x} cy={y} r="10.7" fill={lit ? '#fa702e' : other ? '#777b71' : `url(#${id}-key)`} stroke={lit ? '#ffc190' : '#b3b4af'} strokeWidth="1.2"/>{lit && <circle cx={x-3} cy={y-3} r="3" fill="#ffd5ba" opacity=".65"/>}</g>
      })}
      <rect x="399" y="84" width="48" height="20" rx="9" fill="#e1e2dd" stroke="#b8b9b3"/>
      <text x="423" y="98" textAnchor="middle" fill="#5b5b56" fontSize="16">⏻</text>
      <rect x="392" y="119" width="63" height="79" rx="9" fill="#1b201e"/>
      <text x="423" y="156" textAnchor="middle" fill="#e5eee3" fontSize="25" fontFamily="monospace">A01</text>
      <text x="423" y="181" textAnchor="middle" fill="#a0aa9b" fontSize="12" fontFamily="monospace">Ⅰ Ⅱ Ⅲ</text>
      {['⊞','⇆','↩'].map((s,i)=><g key={s}><circle cx="423" cy={228+i*48} r="15" fill={`url(#${id}-key)`} stroke="#b3b4af"/><text x="423" y={234+i*48} textAnchor="middle" fontSize="20" fill="#85867e">{s}</text></g>)}
      <rect x="481" y="147" width="5" height="24" rx="2" fill="#64645e"/>
    </g>
    {!compact && <><path d="M478 69h52v35" stroke="#fe7733" strokeWidth="1.5"/><circle cx="478" cy="69" r="3" fill="#fe7733"/><text x="516" y="127" fill="#aaa" fontSize="11" fontFamily="monospace">TOUCH & PLAY</text><text x="35" y="435" fill="#a2a29a" fontSize="11" fontFamily="monospace">11 × 11 / 121 TOUCH POINTS</text></>}
  </svg>
}
