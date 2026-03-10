import React, { useState, useRef, useEffect } from 'react'
import { SESSION_HISTORY } from '../data/mockData.js'

// ── Intraday data generator ─────────────────────────────────────────────────
function generateDayData(dateStr, baseEnergy = 53, baseStress = 2.99) {
  const pts = []
  const seed = dateStr.split('-').reduce((a, v) => a + parseInt(v), 0)
  const rng = (i) => Math.sin(i * 1.7 + seed * 0.13) * 1 + Math.cos(i * 2.3 + seed * 0.07) * 0.6
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const t = h + m / 60
      const morning   = t > 6  && t < 10 ? Math.sin((t - 6)  / 4 * Math.PI) * 8  : 0
      const afternoon = t > 13 && t < 17 ? Math.sin((t - 13) / 4 * Math.PI) * 5  : 0
      const evening   = t > 19 && t < 22 ? Math.sin((t - 19) / 3 * Math.PI) * -4 : 0
      pts.push({
        time:     `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
        hour:     t,
        energy:   Math.max(20, Math.min(95, baseEnergy + morning + afternoon + evening + rng(t * 4) * 3)),
        stress:   Math.max(1,  Math.min(5,  baseStress + rng(t * 3) * 0.6)),
        vitality: Math.max(30, Math.min(98, baseEnergy * 0.9 + rng(t * 2.5) * 7 + morning * 0.8)),
        balance:  Math.max(50, Math.min(100, 87 + rng(t * 1.8) * 6)),
      })
    }
  }
  return pts
}

const FULL_DATASET = SESSION_HISTORY.map(s => ({
  ...s,
  intraday: generateDayData(s.date, s.score, 2.8 + (100 - s.score) / 100),
}))

// ── Zone / param config ─────────────────────────────────────────────────────
const PARAMS = {
  energy: {
    label: 'Energy', unit: 'J×10⁻²', color: '#22bbff',
    dataKey: 'score', dayKey: 'energy', min: 0, max: 100,
    zones: [
      { y: 0,  h: 40, c: 'rgba(200,60,80,0.13)',  l: 'Low' },
      { y: 40, h: 20, c: 'rgba(200,150,40,0.11)', l: 'Below Opt.' },
      { y: 60, h: 35, c: 'rgba(40,180,80,0.12)',  l: 'Optimal' },
      { y: 95, h: 5,  c: 'rgba(120,80,220,0.12)', l: 'High' },
    ],
  },
  stress: {
    label: 'Stress', unit: 'index', color: '#ff8833',
    dataKey: 'stress', dayKey: 'stress', min: 1, max: 5,
    zones: [
      { y: 0,  h: 25, c: 'rgba(40,180,80,0.12)',  l: 'Calm' },
      { y: 25, h: 35, c: 'rgba(200,150,40,0.11)', l: 'Normal' },
      { y: 60, h: 25, c: 'rgba(200,80,50,0.12)',  l: 'Elevated' },
      { y: 85, h: 15, c: 'rgba(200,40,60,0.16)',  l: 'High' },
    ],
  },
  vitality: {
    label: 'Vitality', unit: '%', color: '#00e0a0',
    dataKey: 'vitality', dayKey: 'vitality', min: 0, max: 100,
    zones: [
      { y: 0,  h: 50, c: 'rgba(200,60,80,0.13)',  l: 'Low' },
      { y: 50, h: 30, c: 'rgba(200,150,40,0.11)', l: 'Normal' },
      { y: 80, h: 20, c: 'rgba(40,180,80,0.12)',  l: 'Good' },
    ],
  },
  balance: {
    label: 'L/R Balance', unit: '%', color: '#cc88ff',
    dataKey: 'balance', dayKey: 'balance', min: 0, max: 100,
    zones: [
      { y: 0,  h: 60, c: 'rgba(200,60,80,0.13)',  l: 'Imbalanced' },
      { y: 60, h: 20, c: 'rgba(200,150,40,0.11)', l: 'Moderate' },
      { y: 80, h: 20, c: 'rgba(40,180,80,0.12)',  l: 'Balanced' },
    ],
  },
}

// ── Canvas chart ─────────────────────────────────────────────────────────────
function TrackerChart({ data, paramKey, mode }) {
  const canvasRef = useRef(null)
  const cfg = PARAMS[paramKey]
  const valueKey = mode === 'day' ? cfg.dayKey : cfg.dataKey

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || !data.length) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    const W = rect.width, H = rect.height
    const PAD = { top: 24, right: 24, bottom: 40, left: 58 }
    const cW = W - PAD.left - PAD.right
    const cH = H - PAD.top  - PAD.bottom

    ctx.clearRect(0, 0, W, H)

    // Zone bands
    cfg.zones.forEach(z => {
      const y1 = PAD.top + cH * (1 - (z.y + z.h) / 100)
      const y2 = PAD.top + cH * (1 - z.y / 100)
      ctx.fillStyle = z.c
      ctx.fillRect(PAD.left, y1, cW, y2 - y1)
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = '8px Space Mono, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(z.l, PAD.left - 6, y1 + (y2 - y1) / 2 + 3)
    })

    // Grid lines + Y labels
    const gridCount = 5
    for (let i = 0; i <= gridCount; i++) {
      const y = PAD.top + cH * (i / gridCount)
      ctx.strokeStyle = 'rgba(0,140,255,0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 4])
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke()
      ctx.setLineDash([])
      const val = cfg.max - (cfg.max - cfg.min) * (i / gridCount)
      ctx.fillStyle = 'rgba(122,175,212,0.55)'
      ctx.font = '9px Space Mono, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(val.toFixed(paramKey === 'stress' ? 1 : 0), PAD.left - 8, y + 3)
    }

    // X axis labels
    const xStep = mode === 'day' ? Math.floor(data.length / 8) : 1
    data.forEach((d, i) => {
      if (i % xStep !== 0 && i !== data.length - 1) return
      const x = PAD.left + cW * (i / (data.length - 1))
      ctx.strokeStyle = 'rgba(0,140,255,0.06)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + cH); ctx.stroke()
      ctx.fillStyle = 'rgba(122,175,212,0.5)'
      ctx.font = '9px Space Mono, monospace'
      ctx.textAlign = 'center'
      const lbl = mode === 'day' ? d.time : d.label
      ctx.fillText(lbl, x, PAD.top + cH + 20)
    })

    // Get normalised values (0–100 scale for plotting)
    const rawVals = data.map(d => Number(d[valueKey]) || 0)
    const toY = (raw) => {
      const pct = (raw - cfg.min) / (cfg.max - cfg.min)
      return PAD.top + cH * (1 - Math.max(0, Math.min(1, pct)))
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH)
    grad.addColorStop(0,   cfg.color + '55')
    grad.addColorStop(0.5, cfg.color + '18')
    grad.addColorStop(1,   cfg.color + '00')
    ctx.beginPath()
    rawVals.forEach((v, i) => {
      const x = PAD.left + cW * (i / (rawVals.length - 1))
      i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v))
    })
    ctx.lineTo(PAD.left + cW * ((rawVals.length - 1) / (rawVals.length - 1)), PAD.top + cH)
    ctx.lineTo(PAD.left, PAD.top + cH)
    ctx.closePath()
    ctx.fillStyle = grad; ctx.fill()

    // Line
    ctx.beginPath()
    rawVals.forEach((v, i) => {
      const x = PAD.left + cW * (i / (rawVals.length - 1))
      i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v))
    })
    ctx.strokeStyle = cfg.color
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 10; ctx.shadowColor = cfg.color; ctx.stroke(); ctx.shadowBlur = 0

    // Data point dots
    const dotEvery = mode === 'day' ? 4 : 1
    rawVals.forEach((v, i) => {
      if (i % dotEvery !== 0) return
      const x = PAD.left + cW * (i / (rawVals.length - 1))
      ctx.beginPath(); ctx.arc(x, toY(v), mode === 'day' ? 2.5 : 4, 0, Math.PI * 2)
      ctx.fillStyle = cfg.color
      ctx.shadowBlur = 8; ctx.shadowColor = cfg.color; ctx.fill(); ctx.shadowBlur = 0
    })
  }, [data, paramKey, mode])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

// ── Sparkline (mini preview in param buttons) ────────────────────────────────
function Sparkline({ data, dataKey, color }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (!rect.width) return
    canvas.width = rect.width * dpr; canvas.height = 22 * dpr
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr)
    const W = rect.width, H = 22
    const vals = data.map(d => Number(d[dataKey]) || 0)
    const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1
    ctx.beginPath()
    vals.forEach((v, i) => {
      const x = W * (i / (vals.length - 1))
      const y = H - (((v - mn) / rng) * (H - 4) + 2)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color; ctx.lineWidth = 1.5
    ctx.shadowBlur = 4; ctx.shadowColor = color; ctx.stroke(); ctx.shadowBlur = 0
  }, [data, dataKey, color])
  return <canvas ref={canvasRef} style={{ width: '100%', height: 22, display: 'block', marginTop: 4 }} />
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value, unit, color, sub }) {
  return (
    <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 10, padding: '10px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.5 }} />
      <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Session list item ────────────────────────────────────────────────────────
function SessionItem({ s, selected, onClick }) {
  const trend = s.score >= 65 ? '↑' : s.score >= 55 ? '→' : '↓'
  const tc = trend === '↑' ? 'var(--bw-green)' : trend === '→' ? 'var(--bw-gold)' : 'var(--bw-rose)'
  return (
    <div onClick={onClick} style={{
      padding: '9px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 2,
      background: selected ? 'rgba(0,180,255,0.07)' : 'transparent',
      border: selected ? '1px solid rgba(0,180,255,0.25)' : '1px solid transparent',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--bw-text-secondary)' }}>{s.date}</div>
        <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 1 }}>v {s.vitality} · s {s.stress}</div>
      </div>
      <span style={{ fontSize: 13, color: tc }}>{trend}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: selected ? 'var(--bw-cyan)' : 'var(--bw-text-primary)' }}>{s.score}</span>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TrackerPage() {
  const [mode, setMode]         = useState('trend')
  const [param, setParam]       = useState('energy')
  const [selectedIdx, setSelected] = useState(FULL_DATASET.length - 1)

  const session = FULL_DATASET[selectedIdx]
  const cfg     = PARAMS[param]
  const chartData = mode === 'day' ? session.intraday : FULL_DATASET

  const prev  = selectedIdx > 0 ? FULL_DATASET[selectedIdx - 1] : null
  const delta = prev ? session.score - prev.score : null

  const st = {
    avg:  param === 'stress' ? session.stress.toFixed(2) : param === 'vitality' ? session.vitality.toFixed(1) : session.score.toFixed(1),
    peak: param === 'stress' ? (session.stress + 0.6).toFixed(2) : param === 'vitality' ? (session.vitality + 6).toFixed(1) : (session.score + 8).toFixed(1),
    low:  param === 'stress' ? (session.stress - 0.4).toFixed(2) : param === 'vitality' ? (session.vitality - 7).toFixed(1) : (session.score - 9).toFixed(1),
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', fontFamily: 'var(--font-display)', animation: 'fade-in-up 0.5s ease both' }}>

      {/* ── LEFT sidebar ── */}
      <div style={{ width: 256, minWidth: 256, borderRight: '1px solid var(--bw-border)', background: 'var(--bw-void)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mode toggle */}
        <div style={{ padding: '14px 12px 12px', borderBottom: '1px solid var(--bw-border)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', marginBottom: 8 }}>ENERGY TRACKER</div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3 }}>
            {[['trend', '▤ Multi-Session'], ['day', '◷ Day View']].map(([m, lbl]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.03em',
                background: mode === m ? 'var(--bw-blue)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--bw-text-muted)',
                transition: 'all 0.2s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* Parameter grid */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--bw-border)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', marginBottom: 8 }}>PARAMETER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {Object.entries(PARAMS).map(([key, p]) => (
              <button key={key} onClick={() => setParam(key)} style={{
                padding: '8px 8px 6px', borderRadius: 8,
                border: `1px solid ${param === key ? p.color + '55' : 'var(--bw-border)'}`,
                background: param === key ? p.color + '15' : 'rgba(0,0,0,0.2)',
                color: param === key ? p.color : 'var(--bw-text-muted)',
                fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              }}>
                {p.label}
                <Sparkline data={FULL_DATASET} dataKey={p.dataKey} color={p.color} />
              </button>
            ))}
          </div>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', padding: '4px 10px 8px' }}>SESSIONS</div>
          {[...FULL_DATASET].reverse().map((s, ri) => {
            const realIdx = FULL_DATASET.length - 1 - ri
            return <SessionItem key={s.id} s={s} selected={selectedIdx === realIdx} onClick={() => setSelected(realIdx)} />
          })}
        </div>
      </div>

      {/* ── Main chart area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 20px' }}>

        {/* Stat pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatPill label="Session Date"    value={session.date}                unit=""         color="var(--bw-blue-hi)" />
          <StatPill label={`${cfg.label} Avg`} value={st.avg}                  unit={cfg.unit} color={cfg.color} sub={`Peak ${st.peak} · Low ${st.low}`} />
          <StatPill label="Overall Score"   value={session.score}               unit="/100"     color="var(--bw-cyan)" sub={delta !== null ? `${delta >= 0 ? '+' : ''}${delta} vs prev` : 'First session'} />
          <StatPill label="Stress Index"    value={session.stress.toFixed(2)}   unit="idx"      color={session.stress < 3.5 ? 'var(--bw-green)' : 'var(--bw-rose)'} sub={session.stress < 3.5 ? 'Optimal range' : 'Elevated'} />
        </div>

        {/* Chart header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cfg.color, letterSpacing: '0.15em' }}>{cfg.label.toUpperCase()}</span>
            <span style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginLeft: 10 }}>
              {mode === 'day' ? `24-Hour Profile · ${session.date}` : `${FULL_DATASET.length}-Session Trend`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {cfg.zones.map(z => (
              <span key={z.l} style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: z.c.replace(/[\d.]+\)$/, '0.55)'), display: 'inline-block' }} />
                {z.l}
              </span>
            ))}
          </div>
        </div>

        {/* Chart canvas */}
        <div style={{ flex: 1, background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, overflow: 'hidden' }}>
          <TrackerChart data={chartData} paramKey={param} mode={mode} />
        </div>

        {/* Insight strip */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {[
            { label: 'Peak Window',  value: mode === 'day' ? '08:45 – 09:30' : session.label,  color: cfg.color },
            { label: 'Low Window',   value: mode === 'day' ? '02:00 – 04:15' : FULL_DATASET[0].label, color: 'var(--bw-text-muted)' },
            { label: 'Variability',  value: `${Math.abs(parseFloat(st.peak) - parseFloat(st.low)).toFixed(1)} ${cfg.unit}`, color: 'var(--bw-gold)' },
            { label: 'Trend',        value: delta !== null ? (delta >= 0 ? `↑ +${delta} pts` : `↓ ${delta} pts`) : 'First session', color: delta !== null ? (delta >= 0 ? 'var(--bw-green)' : 'var(--bw-rose)') : 'var(--bw-text-muted)' },
          ].map(i => (
            <div key={i.label} style={{ flex: 1, background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{i.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: i.color, fontWeight: 600 }}>{i.value}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
