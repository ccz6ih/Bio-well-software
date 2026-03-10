import React, { useEffect, useRef, useState } from 'react'
import { CHAKRA_DATA, ANALYSIS, CURRENT_SCAN } from '../data/mockData.js'

// ── SECTOR DATA — 10 GDV sectors mapped to fingers ───────────────────────────
const SECTORS = [
  { id: 0, finger: 'L1', organ: 'Nervous / Head',     angle: 0,   energy: 4.5, balance: 65, color: '#cc88ff', alert: true  },
  { id: 1, finger: 'L2', organ: 'Urogenital',         angle: 36,  energy: 6.7, balance: 72, color: '#88aaff', alert: true  },
  { id: 2, finger: 'L3', organ: 'Adrenal / Spine',    angle: 72,  energy: 6.1, balance: 82, color: '#44ccff', alert: false },
  { id: 3, finger: 'L4', organ: 'Liver / Digestive',  angle: 108, energy: 6.0, balance: 55, color: '#44ee88', alert: true  },
  { id: 4, finger: 'L5', organ: 'Sacrum / Pelvis',    angle: 144, energy: 9.1, balance: 86, color: '#ffdd44', alert: false },
  { id: 5, finger: 'R5', organ: 'Cardiovascular',     angle: 180, energy: 5.4, balance: 97, color: '#ff8833', alert: false },
  { id: 6, finger: 'R4', organ: 'Lung / Thorax',      angle: 216, energy: 6.5, balance: 94, color: '#ff4488', alert: false },
  { id: 7, finger: 'R3', organ: 'Endocrine / Thyroid',angle: 252, energy: 5.2, balance: 91, color: '#ff6655', alert: false },
  { id: 8, finger: 'R2', organ: 'Musculoskeletal',    angle: 288, energy: 5.9, balance: 88, color: '#ffaa44', alert: false },
  { id: 9, finger: 'R1', organ: 'Immune / Brain',     angle: 324, energy: 4.6, balance: 70, color: '#aaddff', alert: false },
]

function isOk(...v) { return v.every(n => typeof n === 'number' && isFinite(n) && !isNaN(n)) }

// ── AURA FIELD CANVAS ─────────────────────────────────────────────────────────
function AuraFieldCanvas({ activeSector, onSectorClick }) {
  const canvasRef = useRef(null)
  const frameRef  = useRef(0)
  const tRef      = useRef(0)
  const activeRef = useRef(activeSector)
  activeRef.current = activeSector

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (W / rect.width)
      const my = (e.clientY - rect.top)  * (H / rect.height)
      const dx = mx - cx, dy = my - cy
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist > 32 && dist < 150) {
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
        if (angle < 0) angle += 360
        const idx = Math.round(angle / 36) % 10
        onSectorClick(SECTORS[idx].id)
      }
    }
    canvas.addEventListener('click', handleClick)

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Deep bg
      try {
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160)
        bg.addColorStop(0, 'rgba(0,100,220,0.09)')
        bg.addColorStop(0.6, 'rgba(0,40,100,0.04)')
        bg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = bg
        ctx.beginPath(); ctx.arc(cx, cy, 160, 0, Math.PI*2); ctx.fill()
      } catch(_) {}

      // Reference rings
      ;[38, 68, 98, 128, 155].forEach((r, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2)
        ctx.strokeStyle = `rgba(0,150,255,${0.07 - i*0.01})`
        ctx.lineWidth = 1; ctx.stroke()
        // ring label
        if (i < 3) {
          ctx.fillStyle = 'rgba(60,100,140,0.5)'
          ctx.font = "7px 'Space Mono', monospace"
          ctx.textAlign = 'left'
          ctx.fillText(['LOW','MED','HIGH'][i], cx + r + 3, cy - 2)
        }
      })

      // Spoke lines
      SECTORS.forEach(sec => {
        const rad = (sec.angle - 90) * Math.PI / 180
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(rad)*35, cy + Math.sin(rad)*35)
        ctx.lineTo(cx + Math.cos(rad)*158, cy + Math.sin(rad)*158)
        ctx.strokeStyle = 'rgba(0,180,255,0.06)'
        ctx.lineWidth = 1; ctx.stroke()
      })

      // Per-sector corona arcs
      SECTORS.forEach(sec => {
        const isActive = activeRef.current === sec.id
        const startAngle = (sec.angle - 17 - 90) * Math.PI / 180
        const endAngle   = (sec.angle + 17 - 90) * Math.PI / 180
        const pulse = 1 + Math.sin(t * 0.04 + sec.id * 0.7) * 0.06
        const baseR = 52 + (sec.energy / 11) * 62

        // Active sector fill wedge
        if (isActive) {
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.arc(cx, cy, baseR * pulse + 20, startAngle, endAngle)
          ctx.closePath()
          ctx.fillStyle = `${sec.color}0e`
          ctx.fill()
        }

        // Organic corona edge
        ctx.beginPath()
        const steps = 40
        for (let i = 0; i <= steps; i++) {
          const a = startAngle + (i / steps) * (endAngle - startAngle)
          const noise = Math.sin(a * 9 + t * 0.03) * 5 + Math.sin(a * 16 + t * 0.055) * 2.5
          const r = baseR * pulse + noise
          const x = cx + Math.cos(a) * r
          const y = cy + Math.sin(a) * r
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = isActive ? sec.color : `${sec.color}80`
        ctx.lineWidth = isActive ? 2.5 : 1.4
        ctx.shadowBlur = isActive ? 20 : 5
        ctx.shadowColor = sec.color
        ctx.stroke(); ctx.shadowBlur = 0

        // Alert flicker
        if (sec.alert) {
          const ap = 0.3 + Math.sin(t * 0.09) * 0.3
          ctx.beginPath()
          ctx.arc(cx, cy, baseR * pulse + 12, startAngle, endAngle)
          ctx.strokeStyle = `rgba(255,60,60,${ap})`
          ctx.lineWidth = 1.5; ctx.stroke()
        }
      })

      // Composite field outline — smooth perimeter
      ctx.beginPath()
      for (let i = 0; i <= 360; i++) {
        const angle = (i / 360) * Math.PI * 2
        const deg = (i + 90) % 360
        const sIdx = Math.floor(deg / 36) % 10
        const sec = SECTORS[sIdx]
        const r = 50 + (sec.energy / 11) * 60
        const noise = Math.sin(angle * 8 + t * 0.022) * 3.5
        const x = cx + Math.cos(angle - Math.PI/2) * (r + noise)
        const y = cy + Math.sin(angle - Math.PI/2) * (r + noise)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
      try {
        const fg = ctx.createLinearGradient(cx-130, cy, cx+130, cy)
        fg.addColorStop(0, 'rgba(150,100,255,0.4)')
        fg.addColorStop(0.5, 'rgba(0,210,255,0.5)')
        fg.addColorStop(1, 'rgba(255,80,150,0.4)')
        ctx.strokeStyle = fg
      } catch(_) { ctx.strokeStyle = 'rgba(0,200,255,0.4)' }
      ctx.lineWidth = 1.8
      ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,200,255,0.55)'; ctx.stroke(); ctx.shadowBlur = 0

      // Chakra ring (inner orbit)
      CHAKRA_DATA.forEach((ch, idx) => {
        const angle = (idx / 7) * Math.PI * 2 - Math.PI / 2
        const r = 26 + Math.sin(t * 0.04 + idx) * 2
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        if (!isOk(x, y)) return
        try {
          const g = ctx.createRadialGradient(x, y, 0, x, y, 6)
          g.addColorStop(0, ch.color + 'ff')
          g.addColorStop(1, ch.color + '00')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill()
        } catch(_) {}
        ctx.fillStyle = ch.color
        ctx.shadowBlur = 8; ctx.shadowColor = ch.color
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill()
        ctx.shadowBlur = 0
      })

      // Center glow
      try {
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24)
        core.addColorStop(0, 'rgba(220,240,255,0.95)')
        core.addColorStop(0.4, 'rgba(0,180,255,0.45)')
        core.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = core
        ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI*2); ctx.fill()
      } catch(_) {}

      // Finger labels on outer ring
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      SECTORS.forEach(sec => {
        const rad = (sec.angle - 90) * Math.PI / 180
        const lx = cx + Math.cos(rad) * 163
        const ly = cy + Math.sin(rad) * 163
        ctx.font = `bold 8px 'Space Mono', monospace`
        ctx.fillStyle = activeRef.current === sec.id ? sec.color : 'rgba(100,160,210,0.65)'
        ctx.fillText(sec.finger, lx, ly)
      })

      tRef.current++
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(frameRef.current); canvas.removeEventListener('click', handleClick) }
  }, [onSectorClick])

  return (
    <canvas ref={canvasRef} width={340} height={340}
      style={{ display: 'block', cursor: 'crosshair', width: '100%', maxWidth: 340 }} />
  )
}

// ── L/R SPLIT BAR ─────────────────────────────────────────────────────────────
function SplitBar({ label, left, right, color }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color }}>
          L:{left.toFixed(1)} · R:{right.toFixed(1)}
        </span>
      </div>
      <div style={{ display: 'flex', height: 5, gap: 2, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ flex: left, background: color, opacity: 0.7, borderRadius: '3px 0 0 3px', transition: 'flex 1s' }} />
        <div style={{ flex: right, background: color, opacity: 0.4, borderRadius: '0 3px 3px 0', transition: 'flex 1s' }} />
      </div>
    </div>
  )
}

// ── SECTOR DETAIL PANEL ───────────────────────────────────────────────────────
function SectorDetail({ sector }) {
  if (!sector) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180,
      color: 'var(--bw-text-muted)', fontSize: 12, textAlign: 'center', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 28, opacity: 0.2 }}>◎</div>
      <div>Click a sector on the field to inspect</div>
    </div>
  )
  const r = 38, circ = 2 * Math.PI * r, dash = circ * (sector.balance / 100)
  const statusColor = sector.balance > 85 ? 'var(--bw-green)' : sector.balance > 70 ? 'var(--bw-gold)' : 'var(--bw-rose)'
  const statusLabel = sector.balance > 85 ? 'Balanced' : sector.balance > 70 ? 'Moderate' : 'Needs Attention'

  return (
    <div style={{ animation: 'fade-in-up 0.25s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <svg width={96} height={96} style={{ flexShrink: 0 }}>
          <circle cx={48} cy={48} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
          <circle cx={48} cy={48} r={r} fill="none" stroke={sector.color}
            strokeWidth={6} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ-dash}`}
            transform="rotate(-90 48 48)"
            style={{ filter: `drop-shadow(0 0 8px ${sector.color})` }} />
          <text x={48} y={45} textAnchor="middle" fill={sector.color}
            fontSize={18} fontWeight="bold" fontFamily="var(--font-mono)">{sector.balance}</text>
          <text x={48} y={60} textAnchor="middle" fill="var(--bw-text-muted)" fontSize={8} fontFamily="var(--font-mono)">BAL%</text>
        </svg>
        <div>
          <div style={{ fontSize: 11, color: 'var(--bw-text-muted)', letterSpacing: '0.12em', marginBottom: 2 }}>
            FINGER {sector.finger}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 300,
            color: sector.color, fontStyle: 'italic', marginBottom: 4 }}>{sector.organ}</div>
          <div style={{ fontSize: 10, color: statusColor, letterSpacing: '0.08em' }}>
            ● {statusLabel}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Energy',   val: `${sector.energy.toFixed(2)} J` },
          { label: 'Balance',  val: `${sector.balance}%` },
          { label: 'Sector',   val: `#${sector.id + 1} / 10` },
          { label: 'Priority', val: sector.alert ? '⚠ Review' : '✓ Normal' },
        ].map(item => (
          <div key={item.label} style={{ background: `${sector.color}0c`,
            border: `1px solid ${sector.color}22`, borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: sector.color }}>{item.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── COHERENCE METER ───────────────────────────────────────────────────────────
function CoherenceMeter({ value = 78 }) {
  const r = 52, circ = 2 * Math.PI * r
  const half = circ / 2
  const fill = half * (value / 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={130} height={72} style={{ overflow: 'visible' }}>
        <path d={`M 10 65 A ${r} ${r} 0 0 1 120 65`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} strokeLinecap="round" />
        <path d={`M 10 65 A ${r} ${r} 0 0 1 120 65`}
          fill="none" stroke="url(#cgrad)" strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${fill} ${half - fill}`}
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.7))' }} />
        <defs>
          <linearGradient id="cgrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8866ff" />
            <stop offset="50%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#00e0a0" />
          </linearGradient>
        </defs>
        <text x={65} y={62} textAnchor="middle" fill="#22bbff"
          fontSize={22} fontWeight="bold" fontFamily="var(--font-mono)">{value}%</text>
      </svg>
      <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.12em' }}>FIELD COHERENCE</div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AuraPage() {
  const [activeSector, setActiveSector] = useState(null)
  const [viewMode, setViewMode] = useState('field') // 'field' | 'sectors'
  const sector = SECTORS.find(s => s.id === activeSector)
  const alertCount = SECTORS.filter(s => s.alert).length

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: 20,
      background: `radial-gradient(ellipse 70% 90% at 50% 50%, rgba(0,60,140,0.08) 0%, transparent 70%), var(--bw-deep)`,
    }}>
      <div style={{ maxWidth: 960, animation: 'fade-in-up 0.5s ease both' }}>

        {/* ── TOP ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>

          {/* Left — overview stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Header */}
            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                Field Overview
              </div>
              <CoherenceMeter value={78} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                {[
                  { label: 'Total Energy', val: '53 J', color: 'var(--bw-blue-hi)' },
                  { label: 'L/R Balance',  val: '92.9%', color: 'var(--bw-green)' },
                  { label: 'Stress Index', val: '2.99', color: 'var(--bw-gold)' },
                  { label: 'Alerts',       val: `${alertCount} zones`, color: 'var(--bw-rose)' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)',
                    borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: item.color }}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* L/R split bars */}
            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                Hemispheric Split — Left vs Right
              </div>
              {[
                { label: 'Energy',  left: 6.02, right: 5.38, color: 'var(--bw-blue-hi)' },
                { label: 'Balance', left: 1.80, right: 1.28, color: 'var(--bw-green)' },
              ].map(b => <SplitBar key={b.label} {...b} />)}
              <div style={{ marginTop: 10, fontSize: 10, color: 'var(--bw-text-muted)', lineHeight: 1.6 }}>
                Left-side dominant · 8L / 2R organs flagged · 7.02% overall disbalance
              </div>
            </div>
          </div>

          {/* Center — main aura canvas */}
          <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)',
            borderRadius: 14, padding: '18px 18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
              GDV Energy Field
            </div>
            <div style={{ position: 'relative' }}>
              <AuraFieldCanvas activeSector={activeSector} onSectorClick={setActiveSector} />
              {/* LIVE badge */}
              <div style={{ position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,224,160,0.12)', border: '1px solid rgba(0,224,160,0.3)',
                borderRadius: 20, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--bw-green)',
                  boxShadow: '0 0 6px var(--bw-green)', animation: 'pulse-ring 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 8, color: 'var(--bw-green)', letterSpacing: '0.12em' }}>LIVE</span>
              </div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', textAlign: 'center' }}>
              Click any sector to inspect · Outer ring = finger identifiers
            </div>
          </div>

          {/* Right — sector detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                Sector Detail
              </div>
              <SectorDetail sector={sector} />
            </div>

            {/* Alert sectors */}
            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                Attention Zones
              </div>
              {SECTORS.filter(s => s.alert).map(sec => (
                <div key={sec.id} onClick={() => setActiveSector(sec.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                    background: activeSector === sec.id ? `${sec.color}10` : 'rgba(255,60,60,0.04)',
                    border: `1px solid ${activeSector === sec.id ? sec.color + '30' : 'rgba(255,80,80,0.15)'}`,
                    transition: 'all 0.2s' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: sec.color,
                    boxShadow: `0 0 6px ${sec.color}`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--bw-text-secondary)', fontWeight: 500 }}>{sec.organ}</div>
                    <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>{sec.finger} · {sec.balance}% balance</div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--bw-rose)' }}>⚠</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── BOTTOM ROW — all 10 sectors strip ── */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '14px 18px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            All 10 Sectors · Energy Distribution
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8 }}>
            {SECTORS.map(sec => {
              const isActive = activeSector === sec.id
              const h = Math.round((sec.energy / 10) * 48)
              return (
                <div key={sec.id} onClick={() => setActiveSector(sec.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    padding: '8px 4px 6px', borderRadius: 8, cursor: 'pointer',
                    background: isActive ? `${sec.color}12` : 'transparent',
                    border: `1px solid ${isActive ? sec.color + '30' : 'transparent'}`,
                    transition: 'all 0.2s' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: sec.color, fontWeight: 700 }}>
                    {sec.finger}
                  </div>
                  <div style={{ width: '70%', height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ width: '100%', height: h, borderRadius: 3, transition: 'height 1s',
                      background: `linear-gradient(to top, ${sec.color}, ${sec.color}55)`,
                      boxShadow: isActive ? `0 0 10px ${sec.color}` : 'none' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isActive ? sec.color : 'var(--bw-text-muted)' }}>
                    {sec.energy.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 7, color: 'var(--bw-text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                    {sec.organ.split('/')[0].trim()}
                  </div>
                  {sec.alert && <span style={{ fontSize: 9, color: 'var(--bw-rose)' }}>⚠</span>}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
