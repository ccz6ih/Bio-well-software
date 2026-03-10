import React, { useEffect, useRef, useState } from 'react'
import { CURRENT_PATIENT } from '../data/mockData.js'

// ── BIORHYTHM MATH ────────────────────────────────────────────────────────────
// Standard Fliess cycles: Physical 23d, Emotional 28d, Intellectual 33d
// Bio-Well also adds Intuitive 38d, Spiritual 53d as premium
const CYCLES = [
  { id: 'physical',     label: 'Physical',     period: 23, color: '#ff4488', icon: '⚡', desc: 'Strength, stamina, coordination, immune response' },
  { id: 'emotional',    label: 'Emotional',    period: 28, color: '#44ccff', icon: '◎', desc: 'Sensitivity, creativity, mood regulation, perception' },
  { id: 'intellectual', label: 'Intellectual', period: 33, color: '#ffdd44', icon: '◈', desc: 'Logic, reasoning, memory, analytical capacity' },
  { id: 'intuitive',    label: 'Intuitive',    period: 38, color: '#cc88ff', icon: '❋', desc: 'Unconscious perception, gut instinct, spiritual awareness' },
  { id: 'spiritual',    label: 'Spiritual',    period: 53, color: '#44ee88', icon: '◇', desc: 'Life force coherence, energetic field alignment' },
]

// Scan date = day 0. Calculate value at offset days from scan.
function getBioValue(period, dayOffset) {
  return Math.sin((2 * Math.PI / period) * dayOffset)
}

// Days since birth — using scan date 2025-06-18 as today
// Using a plausible birthdate so cycles are meaningful
const DAYS_FROM_BIRTH = 14410  // ~39.5 years
const SCAN_DAY = DAYS_FROM_BIRTH

function valueAtDay(period, day) {
  return Math.sin((2 * Math.PI / period) * day)
}

function pct(v) { return Math.round((v + 1) / 2 * 100) }
function label(v) {
  if (v > 0.7) return { text: 'Peak', color: 'var(--bw-green)' }
  if (v > 0.2) return { text: 'High', color: 'var(--bw-blue-hi)' }
  if (v > -0.2) return { text: 'Transition', color: 'var(--bw-gold)' }
  if (v > -0.7) return { text: 'Low', color: 'var(--bw-orange)' }
  return { text: 'Critical', color: 'var(--bw-rose)' }
}

// ── MAIN CHART CANVAS ─────────────────────────────────────────────────────────
function BioChart({ visibleCycles, dayRange, centerDay }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const pad = { l: 36, r: 20, t: 16, b: 32 }
    const iW = W - pad.l - pad.r
    const iH = H - pad.t - pad.b
    const midY = pad.t + iH / 2

    ctx.clearRect(0, 0, W, H)

    // Background grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (iH / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y)
      ctx.strokeStyle = `rgba(0,140,255,${i === 2 ? 0.12 : 0.05})`
      ctx.lineWidth = i === 2 ? 1.5 : 1; ctx.stroke()
    }

    // Y labels
    ctx.fillStyle = 'rgba(60,100,140,0.7)'
    ctx.font = "8px 'Space Mono', monospace"
    ctx.textAlign = 'right'
    ;[['100', pad.t + 4], ['50', midY - iH/4], ['0', midY], ['-50', midY + iH/4], ['-100', pad.t + iH]].forEach(([t, y]) => {
      ctx.fillText(t, pad.l - 4, y + 3)
    })

    // Day tick marks + labels
    const startDay = centerDay - Math.floor(dayRange / 2)
    for (let d = 0; d <= dayRange; d++) {
      const x = pad.l + (d / dayRange) * iW
      const day = startDay + d
      ctx.beginPath(); ctx.moveTo(x, pad.t + iH); ctx.lineTo(x, pad.t + iH + 4)
      ctx.strokeStyle = 'rgba(0,140,255,0.15)'; ctx.lineWidth = 1; ctx.stroke()
      if (d % 7 === 0) {
        ctx.fillStyle = 'rgba(60,100,140,0.6)'
        ctx.font = "7px 'Space Mono', monospace"
        ctx.textAlign = 'center'
        ctx.fillText(`${day > SCAN_DAY ? '+' : ''}${day - SCAN_DAY}d`, x, H - 6)
      }
    }

    // Today vertical line
    const todayX = pad.l + ((SCAN_DAY - startDay) / dayRange) * iW
    ctx.beginPath(); ctx.moveTo(todayX, pad.t); ctx.lineTo(todayX, pad.t + iH)
    ctx.strokeStyle = 'rgba(0,229,255,0.35)'; ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = 'rgba(0,229,255,0.7)'
    ctx.font = "7px 'Space Mono', monospace"; ctx.textAlign = 'center'
    ctx.fillText('TODAY', todayX, pad.t + 8)

    // Zero crossings — critical days marker
    visibleCycles.forEach(cyc => {
      for (let d = 0; d <= dayRange; d++) {
        const day = startDay + d
        const v = valueAtDay(cyc.period, day)
        const vPrev = d > 0 ? valueAtDay(cyc.period, day - 1) : v
        if ((v >= 0 && vPrev < 0) || (v < 0 && vPrev >= 0)) {
          const x = pad.l + (d / dayRange) * iW
          ctx.beginPath(); ctx.moveTo(x, midY - 8); ctx.lineTo(x, midY + 8)
          ctx.strokeStyle = `${cyc.color}40`; ctx.lineWidth = 1; ctx.stroke()
        }
      }
    })

    // Draw each cycle
    visibleCycles.forEach(cyc => {
      ctx.beginPath()
      for (let d = 0; d <= dayRange; d++) {
        const x = pad.l + (d / dayRange) * iW
        const v = valueAtDay(cyc.period, startDay + d)
        const y = midY - (v * (iH / 2 - 6))
        d === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = cyc.color
      ctx.lineWidth = 2
      ctx.shadowBlur = 8; ctx.shadowColor = cyc.color + '80'
      ctx.stroke(); ctx.shadowBlur = 0

      // Current day dot
      const cv = valueAtDay(cyc.period, SCAN_DAY)
      const cy = midY - (cv * (iH / 2 - 6))
      ctx.beginPath(); ctx.arc(todayX, cy, 4.5, 0, Math.PI*2)
      ctx.fillStyle = cyc.color
      ctx.shadowBlur = 12; ctx.shadowColor = cyc.color; ctx.fill(); ctx.shadowBlur = 0
    })

  }, [visibleCycles, dayRange, centerDay])

  return <canvas ref={canvasRef} width={680} height={200} style={{ display: 'block', width: '100%' }} />
}

// ── MINI FORECAST ─────────────────────────────────────────────────────────────
function ForecastBar({ cycle }) {
  const vals = []
  for (let d = 0; d < 14; d++) {
    vals.push(valueAtDay(cycle.period, SCAN_DAY + d))
  }
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: cycle.color, fontWeight: 600, letterSpacing: '0.05em' }}>{cycle.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-muted)' }}>14d forecast</span>
      </div>
      <div style={{ display: 'flex', gap: 2, height: 24, alignItems: 'center' }}>
        {vals.map((v, i) => {
          const barH = Math.abs(v) * 20
          const isPos = v >= 0
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 24, justifyContent: 'center' }}>
              {isPos && <div style={{ width: '80%', height: barH, borderRadius: 2, background: cycle.color, opacity: 0.7 + Math.abs(v)*0.3, transition: 'height 0.5s', alignSelf: 'flex-end' }} />}
              {!isPos && <div style={{ width: '80%', height: barH, borderRadius: 2, background: cycle.color, opacity: 0.3, alignSelf: 'flex-start' }} />}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 7, color: 'var(--bw-text-muted)' }}>Today</span>
        <span style={{ fontSize: 7, color: 'var(--bw-text-muted)' }}>+14d</span>
      </div>
    </div>
  )
}

// ── COMPOSITE SCORE ───────────────────────────────────────────────────────────
function CompositeGauge({ cycles }) {
  const avg = cycles.reduce((s, c) => s + valueAtDay(c.period, SCAN_DAY), 0) / cycles.length
  const score = Math.round((avg + 1) / 2 * 100)
  const r = 44, circ = 2 * Math.PI * r, dash = circ * (score / 100)
  const lbl = label(avg)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={110} height={110}>
        <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        <circle cx={55} cy={55} r={r} fill="none" stroke="url(#compgrad)"
          strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform="rotate(-90 55 55)"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.6))' }} />
        <defs>
          <linearGradient id="compgrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8866ff" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
        <text x={55} y={52} textAnchor="middle" fill="#22bbff" fontSize={22} fontWeight="bold" fontFamily="var(--font-mono)">{score}</text>
        <text x={55} y={66} textAnchor="middle" fill="rgba(100,160,210,0.6)" fontSize={8} fontFamily="var(--font-mono)">COMPOSITE</text>
      </svg>
      <div style={{ fontSize: 11, color: lbl.color, fontWeight: 600, letterSpacing: '0.05em' }}>{lbl.text}</div>
    </div>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function BiorhythmsPage() {
  const [visible, setVisible] = useState(new Set(['physical', 'emotional', 'intellectual']))
  const [range, setRange] = useState(60)
  const visibleCycles = CYCLES.filter(c => visible.has(c.id))

  const toggle = (id) => {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(id) && next.size > 1) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: 20,
      background: `radial-gradient(ellipse 80% 60% at 40% 30%, rgba(100,60,200,0.05) 0%, transparent 65%), var(--bw-deep)`,
    }}>
      <div style={{ maxWidth: 960, animation: 'fade-in-up 0.5s ease both' }}>

        {/* ── TOP: Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
          {CYCLES.map(cyc => {
            const v = valueAtDay(cyc.period, SCAN_DAY)
            const lbl = label(v)
            const isOn = visible.has(cyc.id)
            return (
              <div key={cyc.id} onClick={() => toggle(cyc.id)}
                style={{ background: 'var(--bw-panel)', border: `1px solid ${isOn ? cyc.color + '40' : 'var(--bw-border)'}`,
                  borderRadius: 12, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.2s',
                  opacity: isOn ? 1 : 0.45,
                  background: isOn ? `${cyc.color}08` : 'var(--bw-panel)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 16, filter: isOn ? 'none' : 'grayscale(1)' }}>{cyc.icon}</span>
                  <span style={{ fontSize: 8, color: lbl.color, fontWeight: 600, letterSpacing: '0.08em' }}>{lbl.text}</span>
                </div>
                <div style={{ fontSize: 11, color: isOn ? cyc.color : 'var(--bw-text-muted)', fontWeight: 600, marginBottom: 3 }}>{cyc.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: isOn ? cyc.color : 'var(--bw-text-muted)' }}>
                  {pct(v)}%
                </div>
                <div style={{ fontSize: 8, color: 'var(--bw-text-muted)', marginTop: 3 }}>{cyc.period}-day cycle</div>
              </div>
            )
          })}
        </div>

        {/* ── MAIN: Chart + right panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 14, marginBottom: 14 }}>

          {/* Chart */}
          <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase' }}>
                Biorhythm Waveform
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[30, 60, 90].map(r => (
                  <div key={r} onClick={() => setRange(r)}
                    style={{ padding: '3px 10px', borderRadius: 6, fontSize: 9, cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
                      background: range === r ? 'rgba(0,153,238,0.2)' : 'transparent',
                      border: `1px solid ${range === r ? 'rgba(0,153,238,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: range === r ? 'var(--bw-blue-hi)' : 'var(--bw-text-muted)' }}>
                    {r}d
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
              {CYCLES.map(c => (
                <div key={c.id} onClick={() => toggle(c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', opacity: visible.has(c.id) ? 1 : 0.35 }}>
                  <div style={{ width: 20, height: 2, borderRadius: 1, background: c.color }} />
                  <span style={{ fontSize: 9, color: c.color }}>{c.label}</span>
                </div>
              ))}
            </div>

            <BioChart visibleCycles={visibleCycles} dayRange={range} centerDay={SCAN_DAY} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>
                ● Solid dot = today's value · Dashed vertical = critical crossing day
              </div>
              <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>
                Scan: 2025-06-18
              </div>
            </div>
          </div>

          {/* Composite + quick values */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                Composite Score
              </div>
              <CompositeGauge cycles={CYCLES} />
              <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                All 5 cycles weighted average at scan date
              </div>
            </div>

            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '14px' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                Today's Values
              </div>
              {CYCLES.map(c => {
                const v = valueAtDay(c.period, SCAN_DAY)
                const lbl = label(v)
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: `0 0 5px ${c.color}`, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 10, color: 'var(--bw-text-secondary)' }}>{c.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: lbl.color, fontWeight: 600 }}>
                      {v > 0 ? '+' : ''}{v.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── 14-DAY FORECAST ── */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase' }}>
              14-Day Forecast
            </div>
            <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>
              Bars above center = positive phase · below = low phase
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }}>
            {CYCLES.map(c => <ForecastBar key={c.id} cycle={c} />)}
          </div>
        </div>

        {/* ── INTERPRETATION ── */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '16px 18px', marginTop: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Practitioner Notes
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { icon: '⚡', color: 'var(--bw-rose)',   title: 'Physical is Low (38%)',    body: 'Avoid high-intensity training. Focus on restorative movement, sleep, and hydration. Physical transition day expected in 4 days.' },
              { icon: '◎', color: 'var(--bw-blue-hi)', title: 'Emotional is Peak (84%)',   body: 'High creative and empathetic capacity. Excellent window for therapeutic conversations, creative work, or social engagement.' },
              { icon: '◈', color: 'var(--bw-gold)',    title: 'Intellectual at 71%',       body: 'Strong cognitive window. Recommend scheduling analytical tasks, learning, and planning sessions in the next 3–5 days.' },
            ].map(n => (
              <div key={n.title} style={{ background: `${n.color}08`, border: `1px solid ${n.color}18`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, color: n.color }}>{n.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: n.color }}>{n.title}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--bw-text-secondary)', lineHeight: 1.6 }}>{n.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
