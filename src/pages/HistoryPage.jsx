import React, { useState, useRef, useEffect, useCallback } from 'react'
import { SESSION_HISTORY } from '../data/mockData.js'

const STATUS_COLORS = { Optimal: 'var(--bw-green)', Good: 'var(--bw-cyan)', Review: 'var(--bw-gold)' }
const getStatus = (score) => score >= 78 ? 'Optimal' : score >= 68 ? 'Good' : 'Review'

function generateAxes(score) {
  const b = score / 100
  return {
    Energy:    Math.min(100, Math.round(b * 92 + Math.sin(score) * 8)),
    Vitality:  Math.min(100, Math.round(b * 88 + Math.cos(score * 0.7) * 10)),
    Stress:    Math.min(100, Math.round((1 - b) * 60 + Math.sin(score * 1.3) * 12 + 20)),
    Balance:   Math.min(100, Math.round(b * 85 + Math.cos(score * 0.5) * 12)),
    Coherence: Math.min(100, Math.round(b * 90 + Math.sin(score * 0.9) * 9)),
    Strength:  Math.min(100, Math.round(b * 87 + Math.cos(score * 1.1) * 11)),
  }
}

function drawRadar(ctx, w, h, dataA, dataB) {
  const cx = w / 2, cy = h / 2
  const radius = Math.min(cx, cy) - 52
  const labels = ['Energy', 'Vitality', 'Stress', 'Balance', 'Coherence', 'Strength']
  const count = labels.length
  const angleStep = (Math.PI * 2) / count
  const startAngle = -Math.PI / 2
  ctx.clearRect(0, 0, w, h)

  // Grid rings
  ;[20, 40, 60, 80, 100].forEach(level => {
    const r = (level / 100) * radius
    ctx.beginPath()
    for (let i = 0; i <= count; i++) {
      const angle = startAngle + i * angleStep
      i === 0
        ? ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
        : ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
    }
    ctx.closePath()
    ctx.strokeStyle = 'rgba(0,140,255,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
    if (level % 40 === 0) {
      ctx.fillStyle = 'rgba(58,96,128,0.7)'
      ctx.font = '9px Space Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(String(level), cx + 4, cy - r + 10)
    }
  })

  // Axis spokes + labels
  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep
    const ex = cx + Math.cos(angle) * radius
    const ey = cy + Math.sin(angle) * radius
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey)
    ctx.strokeStyle = 'rgba(0,140,255,0.12)'; ctx.lineWidth = 1; ctx.stroke()
    const lx = cx + Math.cos(angle) * (radius + 26)
    const ly = cy + Math.sin(angle) * (radius + 26)
    ctx.fillStyle = 'rgba(122,175,212,0.9)'
    ctx.font = '12px Outfit, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(labels[i], lx, ly)
  }

  function drawPoly(data, fillColor, strokeColor) {
    const inv = { ...data, Stress: 100 - data.Stress }
    const values = labels.map(l => inv[l])
    ctx.beginPath()
    values.forEach((val, i) => {
      const angle = startAngle + i * angleStep
      const r = (val / 100) * radius
      i === 0
        ? ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
        : ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
    })
    ctx.closePath()
    ctx.fillStyle = fillColor; ctx.fill()
    ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke()
    values.forEach((val, i) => {
      const angle = startAngle + i * angleStep
      const r = (val / 100) * radius
      const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = strokeColor
      ctx.shadowBlur = 6; ctx.shadowColor = strokeColor; ctx.fill(); ctx.shadowBlur = 0
    })
  }

  drawPoly(dataA, 'rgba(0,200,255,0.12)', '#22bbff')
  drawPoly(dataB, 'rgba(180,100,255,0.12)', '#8866ff')
}

function MetricCard({ label, valA, valB, dateA, dateB, higherBetter = true, unit = '' }) {
  const delta = valB - valA
  const improved = higherBetter ? delta >= 0 : delta <= 0
  const deltaColor = improved ? 'var(--bw-green)' : 'var(--bw-rose)'
  const deltaSign = delta >= 0 ? '+' : ''
  return (
    <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginBottom: 4 }}>{dateA}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: 'var(--bw-cyan)', lineHeight: 1 }}>{valA}<span style={{ fontSize: 12, marginLeft: 2 }}>{unit}</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 4 }}>
          <div style={{ fontSize: 18, color: deltaColor }}>{improved ? '▲' : '▼'}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: deltaColor, background: `${deltaColor === 'var(--bw-green)' ? 'rgba(0,224,160,0.1)' : 'rgba(255,68,136,0.1)'}`, padding: '2px 8px', borderRadius: 6 }}>{deltaSign}{delta}{unit}</div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginBottom: 4 }}>{dateB}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: 'var(--bw-violet)', lineHeight: 1 }}>{valB}<span style={{ fontSize: 12, marginLeft: 2 }}>{unit}</span></div>
        </div>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const sessions = SESSION_HISTORY.slice().reverse() // newest first
  const [selectedIds, setSelectedIds] = useState([sessions[0]?.id, sessions[1]?.id].filter(Boolean))
  const canvasRef = useRef(null)

  const handleSelect = useCallback(id => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev
      return prev.length < 2 ? [...prev, id] : [prev[1], id]
    })
  }, [])

  const sessionA = SESSION_HISTORY.find(s => s.id === selectedIds[0]) || null
  const sessionB = SESSION_HISTORY.find(s => s.id === selectedIds[1]) || null
  const axesA = sessionA ? generateAxes(sessionA.score) : null
  const axesB = sessionB ? generateAxes(sessionB.score) : null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !axesA || !axesB) return
    const render = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      drawRadar(ctx, rect.width, rect.height, axesA, axesB)
    }
    render()
    window.addEventListener('resize', render)
    return () => window.removeEventListener('resize', render)
  }, [axesA, axesB])

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', fontFamily: 'var(--font-display)', animation: 'fade-in-up 0.5s ease both' }}>

      {/* ── Timeline sidebar ── */}
      <div style={{ width: 280, minWidth: 280, borderRight: '1px solid var(--bw-border)', overflowY: 'auto', background: 'var(--bw-void)', padding: '16px 10px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', padding: '0 6px', marginBottom: 12 }}>Scan History</div>
        <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', padding: '0 6px', marginBottom: 14 }}>Select 2 sessions to compare</div>
        {sessions.map((s, idx) => {
          const status = getStatus(s.score)
          const prev = sessions[idx + 1]
          const trend = prev ? (s.score >= prev.score ? '↑' : '↓') : null
          const trendColor = trend === '↑' ? 'var(--bw-green)' : 'var(--bw-rose)'
          const isA = selectedIds[0] === s.id
          const isB = selectedIds[1] === s.id
          const isSelected = isA || isB
          return (
            <div key={s.id} onClick={() => handleSelect(s.id)} style={{
              padding: '12px 14px', marginBottom: 6, borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
              background: isSelected ? 'rgba(0,180,255,0.06)' : 'transparent',
              border: isA ? '1.5px solid var(--bw-cyan)' : isB ? '1.5px solid var(--bw-violet)' : '1.5px solid transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--bw-text-secondary)' }}>{s.date}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isA && <span style={{ fontSize: 8, color: 'var(--bw-cyan)', background: 'rgba(0,229,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>A</span>}
                  {isB && <span style={{ fontSize: 8, color: 'var(--bw-violet)', background: 'rgba(136,102,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>B</span>}
                  <span style={{ fontSize: 10, color: STATUS_COLORS[status], background: `${STATUS_COLORS[status]}18`, padding: '1px 8px', borderRadius: 10, fontFamily: 'var(--font-mono)' }}>{status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: isA ? 'var(--bw-cyan)' : isB ? 'var(--bw-violet)' : 'var(--bw-text-primary)' }}>{s.score}</span>
                {trend && <span style={{ fontSize: 16, color: trendColor }}>{trend}</span>}
                <span style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginLeft: 'auto' }}>stress {s.stress}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Comparison panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {sessionA && sessionB ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--bw-cyan)', background: 'rgba(0,229,255,0.08)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(0,229,255,0.2)' }}>A · {sessionA.date}</span>
              <span style={{ color: 'var(--bw-text-muted)', fontSize: 12 }}>vs</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--bw-violet)', background: 'rgba(136,102,255,0.08)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(136,102,255,0.2)' }}>B · {sessionB.date}</span>
            </div>

            {/* Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              <MetricCard label="Overall Score" valA={sessionA.score}    valB={sessionB.score}    dateA={sessionA.date} dateB={sessionB.date} higherBetter={true} />
              <MetricCard label="Stress Index"  valA={sessionA.stress}   valB={sessionB.stress}   dateA={sessionA.date} dateB={sessionB.date} higherBetter={false} />
              <MetricCard label="Vitality"      valA={sessionA.vitality} valB={sessionB.vitality} dateA={sessionA.date} dateB={sessionB.date} higherBetter={true} />
            </div>

            {/* Radar chart */}
            <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase' }}>Comparative Analysis</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 11, color: 'var(--bw-cyan)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bw-cyan)', display: 'inline-block' }} /> {sessionA.date}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--bw-violet)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bw-violet)', display: 'inline-block' }} /> {sessionB.date}
                  </span>
                </div>
              </div>
              <canvas ref={canvasRef} style={{ width: '100%', height: 360, display: 'block' }} />
            </div>

            <p style={{ marginTop: 16, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--bw-text-muted)', textAlign: 'center' }}>
              Comparative analysis based on Bio-Well GDV scan parameters
            </p>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--bw-text-muted)', fontSize: 14 }}>
            Select two sessions from the list to compare
          </div>
        )}
      </div>
    </div>
  )
}
