import React, { useEffect, useRef, useState } from 'react'
import { FINGER_DATA, SCAN_RESULTS } from '../data/mockData.js'

function GDVCanvas({ seed = 1, label, active, energy = 75 }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const baseR = 36

    function noise(x, s) {
      return Math.sin(x * 2.1 * s) * 0.5 + Math.sin(x * 3.7 * s + 1.4) * 0.3 + Math.sin(x * 5.3 * s + 2.8) * 0.2
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      if (!active) {
        ctx.fillStyle = 'rgba(0,40,80,0.4)'
        ctx.beginPath(); ctx.arc(cx, cy, baseR, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(0,80,140,0.3)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = 'rgba(100,160,220,0.35)'
        ctx.font = '9px var(--font-mono)'; ctx.textAlign = 'center'
        ctx.fillText('READY', cx, cy + 4)
        tRef.current++; frameRef.current = requestAnimationFrame(draw); return
      }

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 78)
      bg.addColorStop(0, `rgba(0,${60 + energy * 0.5},${180 + energy * 0.3},0.14)`)
      bg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      const layers = [
        { pts: 120, r: baseR + 2,  amp: 8  + energy * 0.10, freq: 7,  speed: 0.8, alpha: 0.9,  width: 1.5, hue: 210 },
        { pts: 90,  r: baseR + 13, amp: 12 + energy * 0.12, freq: 11, speed: 1.1, alpha: 0.55, width: 1.0, hue: 195 },
        { pts: 60,  r: baseR + 24, amp: 16 + energy * 0.14, freq: 15, speed: 1.4, alpha: 0.28, width: 0.7, hue: 180 },
        { pts: 40,  r: baseR + 34, amp: 20 + energy * 0.16, freq: 9,  speed: 0.6, alpha: 0.14, width: 0.5, hue: 200 },
      ]

      layers.forEach(l => {
        ctx.beginPath()
        for (let i = 0; i <= l.pts; i++) {
          const angle = (i / l.pts) * Math.PI * 2
          const n = noise(angle, seed) * l.amp
              + Math.sin(angle * l.freq + t * l.speed * 0.05) * (l.amp * 0.6)
              + Math.sin(angle * (l.freq * 1.5) - t * l.speed * 0.07) * (l.amp * 0.3)
          const r = l.r + n
          i === 0 ? ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
                  : ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
        }
        ctx.closePath()
        ctx.strokeStyle = `hsla(${l.hue}, 90%, 65%, ${l.alpha * (0.8 + Math.sin(t * 0.03) * 0.2)})`
        ctx.lineWidth = l.width
        ctx.shadowBlur = 12; ctx.shadowColor = `hsla(${l.hue}, 90%, 65%, 0.6)`
        ctx.stroke(); ctx.shadowBlur = 0
      })

      // Spikes
      const spikes = Math.floor(6 + (energy / 100) * 8)
      for (let i = 0; i < spikes; i++) {
        const angle = (i / spikes) * Math.PI * 2 + noise(i, seed) * 0.8 + t * 0.01
        const r1 = baseR + 10
        const r2 = baseR + 26 + noise(i + t * 0.05, seed) * 13 + (energy / 100) * 9
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1)
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2)
        ctx.strokeStyle = `rgba(0,220,255,${0.3 + Math.abs(noise(i + t * 0.1, seed)) * 0.4})`
        ctx.lineWidth = 0.7
        ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(0,220,255,0.8)'; ctx.stroke(); ctx.shadowBlur = 0
      }

      // Core pad
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR)
      core.addColorStop(0, 'rgba(20,80,180,0.7)')
      core.addColorStop(1, 'rgba(0,20,60,0.2)')
      ctx.fillStyle = core
      ctx.beginPath(); ctx.arc(cx, cy, baseR, 0, Math.PI * 2); ctx.fill()

      // Scan sweep
      const scanY = cy - baseR + ((t * 1.5) % (baseR * 2))
      if (scanY < cy + baseR) {
        ctx.fillStyle = 'rgba(0,200,255,0.06)'
        ctx.fillRect(cx - baseR, scanY, baseR * 2, 2)
      }

      // Label
      ctx.font = 'bold 10px var(--font-mono)'
      ctx.fillStyle = 'rgba(150,210,255,0.85)'
      ctx.textAlign = 'center'
      ctx.fillText(label, cx, H - 5)

      tRef.current++; frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [active, energy, seed, label])

  return <canvas ref={canvasRef} width={110} height={120} style={{ display: 'block' }} />
}

const LEFT  = FINGER_DATA.filter(f => f.hand === 'left')
const RIGHT = FINGER_DATA.filter(f => f.hand === 'right')

function HandRow({ fingers, scanIdx, phase, startOffset, label }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {fingers.map((f, i) => {
          const globalIdx = startOffset + i
          const isActive  = globalIdx <= scanIdx
          const isCurrent = globalIdx === scanIdx && phase === 'scanning'
          return (
            <div key={f.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '10px 6px', borderRadius: 10,
              background: isCurrent ? 'rgba(0,180,255,0.09)' : isActive ? 'rgba(0,100,200,0.04)' : 'transparent',
              border: isCurrent ? '1px solid rgba(0,180,255,0.3)' : '1px solid transparent',
              transition: 'all 0.3s',
            }}>
              <GDVCanvas seed={f.seed} label={f.label} active={isActive} energy={f.energy} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isActive ? 'var(--bw-blue-hi)' : 'var(--bw-text-muted)' }}>{f.name}</div>
                {isActive && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-cyan)', marginTop: 1 }}>{f.energy} u</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ScanPage({ onNav }) {
  const [phase, setPhase] = useState('ready')
  const [scanIdx, setScanIdx] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const intervalRef = useRef(null)

  const startScan = () => {
    setPhase('scanning'); setScanIdx(0); setProgress(0)
    let idx = 0, prog = 0
    intervalRef.current = setInterval(() => {
      prog++; setProgress(prog)
      if (prog % 10 === 0 && idx < 9) { idx++; setScanIdx(idx) }
      if (prog >= 100) {
        clearInterval(intervalRef.current)
        setPhase('complete'); setScanIdx(9)
        setShowToast(true); setTimeout(() => setShowToast(false), 2800)
      }
    }, 80)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 20, background: `radial-gradient(ellipse 70% 50% at 50% 30%, rgba(0,60,140,0.1) 0%, transparent 70%), var(--bw-deep)` }}>
      <div style={{ maxWidth: 1000, animation: 'fade-in-up 0.5s ease both' }}>

        {/* ── Controls bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--bw-text-muted)', letterSpacing: '0.2em', marginBottom: 6 }}>GDV ELECTROPHOTONIC CAPTURE</div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', width: 320 }}>
              <div style={{
                height: '100%', borderRadius: 3, width: `${progress}%`,
                background: phase === 'scanning'
                  ? 'linear-gradient(90deg, var(--bw-blue), var(--bw-cyan), var(--bw-blue))'
                  : 'linear-gradient(90deg, var(--bw-blue), var(--bw-cyan))',
                backgroundSize: '200% 100%',
                animation: phase === 'scanning' ? 'shimmer 1.5s linear infinite' : 'none',
                boxShadow: '0 0 10px rgba(0,229,255,0.5)',
                transition: 'width 0.1s linear',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 4 }}>
              {phase === 'ready' ? 'AWAITING SCAN' : phase === 'scanning' ? `CAPTURING · ${progress}% · FINGER ${scanIdx + 1}/10` : 'SCAN COMPLETE · 10/10 FINGERS'}
            </div>
          </div>

          {phase === 'ready' && (
            <button onClick={startScan} style={{ padding: '10px 26px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--bw-blue), var(--bw-blue-mid))', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(0,120,220,0.4)' }}>▶ Begin Scan</button>
          )}
          {phase === 'scanning' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bw-cyan)', animation: 'pulse-ring 1s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--bw-cyan)' }}>SCANNING</span>
            </div>
          )}
          {phase === 'complete' && (
            <button onClick={() => { setPhase('ready'); setScanIdx(-1); setProgress(0) }} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--bw-border-hi)', cursor: 'pointer', background: 'transparent', color: 'var(--bw-blue-hi)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13 }}>↺ New Scan</button>
          )}
        </div>

        {/* ── GDV grid — split by hand ── */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 20, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <HandRow fingers={LEFT}  scanIdx={scanIdx} phase={phase} startOffset={0} label="Left Hand" />
          <div style={{ height: 1, background: 'var(--bw-border)', margin: '0 -4px' }} />
          <HandRow fingers={RIGHT} scanIdx={scanIdx} phase={phase} startOffset={5} label="Right Hand" />
        </div>

        {/* ── Results ── */}
        {phase === 'complete' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14, animation: 'fade-in-up 0.5s ease both' }}>
            {Object.values(SCAN_RESULTS).map(s => (
              <div key={s.label} style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.4 }} />
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        )}

        {phase === 'complete' && (
          <button onClick={() => onNav && onNav('reports')} style={{ padding: '10px 26px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--bw-blue), var(--bw-blue-mid))', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', boxShadow: '0 0 20px rgba(0,120,220,0.3)', animation: 'fade-in-up 0.6s ease both' }}>
            View Full Report →
          </button>
        )}

        {/* Toast */}
        {showToast && (
          <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 100, padding: '12px 20px', borderRadius: 10, background: 'var(--bw-panel)', border: '1px solid rgba(0,224,160,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10, animation: 'toast-in 2.8s ease both' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,224,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--bw-green)' }}>✓</div>
            <span style={{ fontSize: 12, color: 'var(--bw-green)', fontWeight: 600 }}>Scan Complete — 10/10 fingers captured</span>
          </div>
        )}
      </div>
    </div>
  )
}
