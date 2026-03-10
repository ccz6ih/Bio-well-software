import React, { useEffect, useRef, useState } from 'react'
import { CURRENT_SCAN, ORGAN_DATA, DATA_FEED, DASHBOARD_STATS, SESSION_HISTORY, CHAKRA_DATA } from '../data/mockData.js'

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function Card({ children, style = {}, delay = 0 }) {
  return (
    <div style={{
      background: 'var(--bw-panel)',
      border: '1px solid var(--bw-border)',
      borderRadius: 14,
      padding: 18,
      position: 'relative',
      overflow: 'hidden',
      animation: `fade-in-up 0.5s ease ${delay}s both`,
      ...style,
    }}>
      {children}
    </div>
  )
}
function CardLabel({ children }) {
  return <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>
}

// ─── RING GAUGE ───────────────────────────────────────────────────────────────
function RingGauge({ value, max, color, label, sublabel, size = 100 }) {
  const r = (size / 2) - 9
  const circ = 2 * Math.PI * r
  const stroke = circ * (value / max)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" strokeDasharray={`${stroke} ${circ - stroke}`}
            style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 8, color: 'var(--bw-text-muted)', marginTop: 2 }}>/{max}</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--bw-text-primary)' }}>{label}</div>
        <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 1 }}>{sublabel}</div>
      </div>
    </div>
  )
}

// ─── SPARK BAR ────────────────────────────────────────────────────────────────
function SparkBar({ label, value, max, color, status }) {
  const pct = (value / max) * 100
  const statusColor = status === 'Optimal' ? 'var(--bw-green)' : status === 'Needs Attention' ? 'var(--bw-orange)' : 'var(--bw-blue-hi)'
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--bw-text-secondary)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status && <span style={{ fontSize: 8, color: statusColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{status}</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>{value}</span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}`, transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

// ─── ENERGY TREND CANVAS ─────────────────────────────────────────────────────
function TrendChart({ data }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const pad = { l: 10, r: 10, t: 10, b: 22 }
    const iW = W - pad.l - pad.r, iH = H - pad.t - pad.b

    ctx.clearRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = 'rgba(0,140,255,0.07)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (iH / 4) * i
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke()
    }

    const scores = data.map(d => d.score)
    const minV = Math.min(...scores) - 5
    const maxV = Math.max(...scores) + 5
    const toX = (i) => pad.l + (i / (data.length - 1)) * iW
    const toY = (v) => pad.t + iH - ((v - minV) / (maxV - minV)) * iH

    // Stress line (dashed, rose)
    ctx.beginPath()
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = 'rgba(255,68,136,0.45)'
    ctx.lineWidth = 1.5
    data.forEach((d, i) => {
      const x = toX(i), y = pad.t + iH - ((d.stress - (Math.min(...data.map(d=>d.stress)) - 5)) / ((Math.max(...data.map(d=>d.stress)) + 5) - (Math.min(...data.map(d=>d.stress)) - 5))) * iH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // Score area fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + iH)
    grad.addColorStop(0, 'rgba(0,180,255,0.28)')
    grad.addColorStop(1, 'rgba(0,180,255,0.02)')
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(scores[0]))
    data.forEach((d, i) => i > 0 && ctx.lineTo(toX(i), toY(d.score)))
    ctx.lineTo(toX(data.length - 1), pad.t + iH)
    ctx.lineTo(toX(0), pad.t + iH)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // Score line
    ctx.beginPath()
    ctx.strokeStyle = 'var(--bw-blue-hi)'
    ctx.lineWidth = 2
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(i), toY(d.score)) : ctx.lineTo(toX(i), toY(d.score)))
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,180,255,0.6)'; ctx.stroke(); ctx.shadowBlur = 0

    // Dots
    data.forEach((d, i) => {
      ctx.beginPath()
      ctx.arc(toX(i), toY(d.score), 3, 0, Math.PI * 2)
      ctx.fillStyle = '#22bbff'
      ctx.shadowBlur = 6; ctx.shadowColor = '#22bbff'; ctx.fill(); ctx.shadowBlur = 0
    })

    // Labels
    ctx.fillStyle = 'rgba(58,96,128,0.9)'
    ctx.font = `8px 'Space Mono', monospace`
    ctx.textAlign = 'center'
    data.forEach((d, i) => ctx.fillText(d.label, toX(i), H - 5))

    // Current score callout
    const last = data[data.length - 1]
    const lx = toX(data.length - 1), ly = toY(last.score)
    ctx.fillStyle = 'rgba(13,31,56,0.95)'
    ctx.strokeStyle = '#22bbff'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(lx - 14, ly - 20, 28, 14, 3)
    ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#22bbff'
    ctx.font = `bold 8px 'Space Mono', monospace`
    ctx.fillText(last.score, lx, ly - 10)
  }, [data])

  return <canvas ref={canvasRef} width={320} height={90} style={{ display: 'block', width: '100%' }} />
}

// ─── AURA CANVAS ─────────────────────────────────────────────────────────────
function AuraCanvas() {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const imgRef = useRef(null)

  // Load the human SVG once
  useEffect(() => {
    const img = new Image()
    img.src = '/images/human.svg'
    img.onload = () => { imgRef.current = img }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    let t = 0

    function drawSilhouette() {
      ctx.save()
      const img = imgRef.current
      if (img) {
        // SVG viewBox is 1500x1000 (landscape) — fit the human figure into the aura area
        const drawH = 160
        const drawW = drawH * (img.width / img.height)
        const dx = cx - drawW / 2
        const dy = cy - drawH / 2 + 4
        ctx.globalAlpha = 0.45
        ctx.drawImage(img, dx, dy, drawW, drawH)
        ctx.globalAlpha = 1.0
      } else {
        // Fallback: simple ellipse while SVG loads
        const bodyGrad = ctx.createLinearGradient(cx, cy - 72, cx, cy + 72)
        bodyGrad.addColorStop(0, 'rgba(0,100,200,0.45)')
        bodyGrad.addColorStop(0.5, 'rgba(0,70,150,0.35)')
        bodyGrad.addColorStop(1, 'rgba(0,50,120,0.25)')
        ctx.fillStyle = bodyGrad
        ctx.beginPath()
        ctx.ellipse(cx, cy, 18, 65, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)

      // Outer radial glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110)
      bg.addColorStop(0, 'rgba(0,140,255,0.14)')
      bg.addColorStop(0.55, 'rgba(0,80,160,0.06)')
      bg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bg
      ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill()

      // Aura corona layers
      for (let layer = 0; layer < 4; layer++) {
        const pts = 72 + layer * 20
        const baseR = 68 + layer * 20
        const amp = 7 + layer * 3.5
        const speed = 0.011 - layer * 0.002
        const freq = 5 + layer * 2
        const alpha = 0.5 - layer * 0.1
        const hue = 195 + layer * 12
        ctx.beginPath()
        for (let i = 0; i <= pts; i++) {
          const angle = (i / pts) * Math.PI * 2
          const noise = Math.sin(angle * freq + t * speed * 60) * amp
                      + Math.sin(angle * (freq + 1) + t * speed * 50 * 1.3) * (amp * 0.45)
          const r = baseR + noise
          const x = cx + Math.cos(angle) * r
          const y = cy + Math.sin(angle) * r
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.strokeStyle = `hsla(${hue}, 90%, 65%, ${alpha})`
        ctx.lineWidth = 1.8 - layer * 0.3
        ctx.shadowBlur = 10 + layer * 4
        ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.5)`
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      drawSilhouette()

      // Chakra dots on silhouette — spaced to match SVG human figure
      // Crown, Third Eye, Throat, Heart, Solar Plexus, Sacral, Root
      const chakraYPositions = [-68, -50, -30, -8, 16, 38, 58]
      const chakraColors = ['#cc88ff','#6688ff','#44ccff','#44ee88','#ffdd44','#ff8833','#ff4444']
      chakraYPositions.forEach((yOff, idx) => {
        const chy = cy + 4 + yOff
        const pulse = 1 + Math.sin(t * 0.06 + idx * 0.9) * 0.2
        const r = 4 * pulse
        if (!isFinite(r) || !isFinite(chy)) return
        try {
          const g = ctx.createRadialGradient(cx, chy, 0, cx, chy, r * 2.5)
          g.addColorStop(0, chakraColors[idx] + 'ff')
          g.addColorStop(1, chakraColors[idx] + '00')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(cx, chy, r * 2.5, 0, Math.PI * 2); ctx.fill()
        } catch (_) {}
        ctx.fillStyle = chakraColors[idx]
        ctx.shadowBlur = 10; ctx.shadowColor = chakraColors[idx]
        ctx.beginPath(); ctx.arc(cx, chy, r, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0
      })

      t++
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return <canvas ref={canvasRef} width={240} height={240} style={{ display: 'block' }} />
}

// ─── SCROLLING DATA FEED ──────────────────────────────────────────────────────
function DataFeed() {
  const doubled = [...DATA_FEED, ...DATA_FEED]
  return (
    <div style={{ overflow: 'hidden', height: 100, position: 'relative' }}>
      <div style={{ animation: 'data-scroll 10s linear infinite' }}>
        {doubled.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-muted)', width: 52 }}>{r[0]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-blue-mid)', width: 22 }}>{r[1]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-primary)', width: 30 }}>{r[2]}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: r[3].startsWith('+') ? 'var(--bw-green)' : 'var(--bw-rose)', flex: 1 }}>{r[3]}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 28, background: 'linear-gradient(transparent, var(--bw-panel))' }} />
    </div>
  )
}

// ─── CHAKRA STRIP ─────────────────────────────────────────────────────────────
function ChakraStrip({ onNav }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
      {CHAKRA_DATA.map(ch => (
        <div key={ch.id}
          onClick={() => onNav && onNav('chakra')}
          title={ch.name}
          style={{
            flex: 1, borderRadius: 8, padding: '10px 6px 8px',
            background: `${ch.color}10`,
            border: `1px solid ${ch.color}25`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${ch.color}22`}
          onMouseLeave={e => e.currentTarget.style.background = `${ch.color}10`}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, boxShadow: `0 0 8px ${ch.color}`, flexShrink: 0 }} />
          <div style={{ width: '100%', height: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ width: '60%', height: `${ch.val}%`, maxHeight: 36, background: `linear-gradient(to top, ${ch.color}, ${ch.color}44)`, borderRadius: 2, transition: 'height 1s' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: ch.color, fontWeight: 700 }}>{ch.val}</div>
          <div style={{ fontSize: 8, color: 'var(--bw-text-muted)', textAlign: 'center', lineHeight: 1.2 }}>{ch.name}</div>
        </div>
      ))}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ stat }) {
  return (
    <div style={{
      background: 'var(--bw-panel)',
      border: '1px solid var(--bw-border)',
      borderRadius: 12,
      padding: '14px 16px',
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 100% 0%, ${stat.color}08 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 22, opacity: 0.08, color: stat.color }}>{stat.icon}</div>
      <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: 2 }}>{stat.value}</div>
      <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>{stat.unit}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: stat.color, opacity: 0.35 }} />
    </div>
  )
}

// ─── ALERT ROW ────────────────────────────────────────────────────────────────
const ALERTS = [
  { type: 'warn',    icon: '⚠', color: 'var(--bw-orange)', msg: 'Stomach zone below optimal threshold — consider digestive support protocol' },
  { type: 'info',    icon: '◈', color: 'var(--bw-blue-hi)', msg: 'Heart & kidney meridians performing at optimal levels' },
  { type: 'success', icon: '✓', color: 'var(--bw-green)',   msg: 'Energy field coherence 91% — highest recorded in 8 sessions' },
]

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard({ onNav }) {
  const gauges = CURRENT_SCAN.gauges
  const organs = ORGAN_DATA.slice(0, 6)

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '16px 20px 20px',
      background: `radial-gradient(ellipse 80% 50% at 55% 10%, rgba(0,80,160,0.09) 0%, transparent 65%), var(--bw-deep)`,
    }}>
      {/* ── ROW 1: Stats strip ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, animation: 'fade-in-up 0.4s ease both' }}>
        {DASHBOARD_STATS.map(stat => <StatCard key={stat.label} stat={stat} />)}
      </div>

      {/* ── ROW 2: Main 3-col grid ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* COL 1: Aura + data feed */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} delay={0.05}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.025,
            backgroundImage: 'linear-gradient(var(--bw-blue-hi) 1px, transparent 1px), linear-gradient(90deg, var(--bw-blue-hi) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }} />
          <CardLabel>Biofield Aura</CardLabel>
          <AuraCanvas />
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--bw-text-muted)' }}>Overall Score</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--bw-cyan)' }}>{CURRENT_SCAN.overallScore} / 100</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${CURRENT_SCAN.overallScore}%`, borderRadius: 3, background: 'linear-gradient(90deg, var(--bw-blue), var(--bw-cyan))', boxShadow: '0 0 10px rgba(0,229,255,0.45)' }} />
            </div>
            <DataFeed />
          </div>
        </Card>

        {/* COL 2: Gauges + trend chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card delay={0.1}>
            <CardLabel>Biometric Gauges</CardLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {Object.values(gauges).map(g => (
                <RingGauge key={g.label} value={g.value} max={g.max} color={g.color} label={g.label} sublabel={g.sublabel} />
              ))}
            </div>
          </Card>
          <Card delay={0.15} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <CardLabel>Energy Trend — 8 Sessions</CardLabel>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 9, color: 'var(--bw-blue-hi)' }}>● Score</span>
                <span style={{ fontSize: 9, color: 'var(--bw-rose)' }}>- Stress</span>
              </div>
            </div>
            <TrendChart data={SESSION_HISTORY} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>Session Start</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--bw-text-secondary)' }}>{SESSION_HISTORY[0].score}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--bw-green)' }}>▲ +{SESSION_HISTORY[SESSION_HISTORY.length-1].score - SESSION_HISTORY[0].score} pts</div>
                <div style={{ fontSize: 8, color: 'var(--bw-text-muted)' }}>over 8 sessions</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>Current</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--bw-cyan)' }}>{SESSION_HISTORY[SESSION_HISTORY.length-1].score}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* COL 3: Organ energy */}
        <Card delay={0.2} style={{ display: 'flex', flexDirection: 'column' }}>
          <CardLabel>Organ Energy Map</CardLabel>
          {organs.map(o => (
            <SparkBar key={o.name} label={o.name.replace(' (Left)','·L').replace(' (Right)','·R')} value={o.val} max={100} color={o.color} status={o.status} />
          ))}
          <div
            onClick={() => onNav && onNav('organs')}
            style={{ marginTop: 'auto', paddingTop: 12, fontSize: 10, color: 'var(--bw-blue-hi)', cursor: 'pointer', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            View full organ map →
          </div>
        </Card>

      </div>

      {/* ── ROW 3: Chakra strip ────────────────────────────────── */}
      <Card delay={0.25} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <CardLabel>Chakra Energy Centers</CardLabel>
          <div onClick={() => onNav && onNav('chakra')} style={{ fontSize: 10, color: 'var(--bw-blue-hi)', cursor: 'pointer', marginBottom: 14 }}>Full analysis →</div>
        </div>
        <ChakraStrip onNav={onNav} />
      </Card>

      {/* ── ROW 4: Alerts & recommendations ──────────────────── */}
      <Card delay={0.3}>
        <CardLabel>Insights & Alerts</CardLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ALERTS.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              background: `${a.color}08`,
              border: `1px solid ${a.color}20`,
            }}>
              <span style={{ fontSize: 14, color: a.color, lineHeight: 1.3, flexShrink: 0 }}>{a.icon}</span>
              <span style={{ fontSize: 11, color: 'var(--bw-text-secondary)', lineHeight: 1.5 }}>{a.msg}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
