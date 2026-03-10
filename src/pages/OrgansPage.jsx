import React, { useEffect, useRef, useState } from 'react'
import { ORGAN_DATA } from '../data/mockData.js'

const COLOR_MAP = {
  'var(--bw-violet)': '#8866ff',
  'var(--bw-rose)': '#ff4488',
  'var(--bw-blue-hi)': '#22bbff',
  'var(--bw-gold)': '#f0c040',
  'var(--bw-green)': '#00e0a0',
  'var(--bw-orange)': '#ff8833',
  'var(--bw-cyan)': '#00e5ff',
}

function resolveColor(cssVar) {
  return COLOR_MAP[cssVar] || '#22bbff'
}

const ORGAN_POSITIONS = {
  'Nervous System':   (cx, H) => ({ x: cx,      y: 0.10 * H }),
  Thyroid:            (cx, H) => ({ x: cx,      y: 0.28 * H }),
  Lungs:              (cx, H) => ({ x: cx + 30, y: 0.38 * H }),
  Heart:              (cx, H) => ({ x: cx - 10, y: 0.42 * H }),
  Liver:              (cx, H) => ({ x: cx + 26, y: 0.52 * H }),
  Adrenals:           (cx, H) => ({ x: cx - 24, y: 0.56 * H }),
  Kidneys:            (cx, H) => ({ x: cx + 24, y: 0.62 * H }),
  Urogenital:         (cx, H) => ({ x: cx - 20, y: 0.68 * H }),
  Sacrum:             (cx, H) => ({ x: cx,      y: 0.76 * H }),
}

function OrganCanvas({ organs, activeIdx, onSelect }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const tRef = useRef(0)
  const activeRef = useRef(activeIdx)
  const imgRef = useRef(null)
  activeRef.current = activeIdx

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
    const cx = W / 2

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (W / rect.width)
      const my = (e.clientY - rect.top) * (H / rect.height)
      organs.forEach((organ, idx) => {
        const posFn = ORGAN_POSITIONS[organ.name]
        if (!posFn) return
        const pos = posFn(cx, H)
        const dx = mx - pos.x, dy = my - pos.y
        if (dx * dx + dy * dy < 18 * 18) onSelect(idx)
      })
    }
    canvas.addEventListener('click', handleClick)

    function drawBody() {
      const img = imgRef.current
      if (img) {
        ctx.save()
        const drawH = H * 0.92
        const drawW = drawH * (img.width / img.height)
        const dx = cx - drawW / 2
        const dy = (H - drawH) / 2
        ctx.globalAlpha = 0.35
        ctx.drawImage(img, dx, dy, drawW, drawH)
        ctx.globalAlpha = 1.0
        ctx.restore()
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const t = tRef.current

      // Background grid
      ctx.strokeStyle = 'rgba(0,80,160,0.06)'
      ctx.lineWidth = 1
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }

      drawBody(t)

      // Draw organ orbs
      organs.forEach((organ, idx) => {
        const posFn = ORGAN_POSITIONS[organ.name]
        if (!posFn) return
        const pos = posFn(cx, H)
        if (!isFinite(pos.x) || !isFinite(pos.y)) return
        const hex = resolveColor(organ.color)
        const isActive = activeRef.current === idx
        const pulse = 1 + Math.sin(t * 0.05 + (organ.hue || 0) * 0.02) * 0.12
        const r = (isActive ? 14 : 9) * pulse
        if (!isFinite(r) || r <= 0) return

        // Outer glow when selected
        if (isActive) {
          try {
            const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 32)
            glow.addColorStop(0, `${hex}55`)
            glow.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = glow
            ctx.beginPath(); ctx.arc(pos.x, pos.y, 32, 0, Math.PI * 2); ctx.fill()
          } catch (_) {}
        }

        // Spinning ring
        ctx.save()
        ctx.translate(pos.x, pos.y)
        ctx.rotate(t * 0.02 * ((organ.hue || 0) % 2 === 0 ? 1 : -1))
        ctx.strokeStyle = `${hex}${isActive ? 'cc' : '66'}`
        ctx.lineWidth = isActive ? 1.5 : 0.8
        ctx.setLineDash([3, 6])
        ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, Math.PI * 2); ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        // Core orb with radial gradient
        try {
          const orb = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r)
          orb.addColorStop(0, `${hex}ff`)
          orb.addColorStop(0.5, `${hex}99`)
          orb.addColorStop(1, `${hex}11`)
          ctx.fillStyle = orb
        } catch (_) {
          ctx.fillStyle = hex
        }
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.fill()

        // Bloom shadow
        ctx.shadowBlur = isActive ? 20 : 10
        ctx.shadowColor = hex
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.6, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0

        // Label
        ctx.font = '7px sans-serif'
        ctx.fillStyle = isActive ? `${hex}` : `${hex}aa`
        ctx.textAlign = 'center'
        ctx.fillText(organ.name, pos.x, pos.y + r + 10)
      })

      tRef.current++
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(frameRef.current)
      canvas.removeEventListener('click', handleClick)
    }
  }, [organs, onSelect])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={520}
      style={{ display: 'block', cursor: 'pointer' }}
    />
  )
}

function OrganDetail({ organ }) {
  if (!organ) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--bw-text-muted)', fontSize: 12, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>&#9763;</div>
        Select an organ to view details
      </div>
    </div>
  )

  const hex = resolveColor(organ.color)
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * (organ.val / 100)
  const statusLabel = organ.val > 80 ? 'Optimal' : organ.val > 65 ? 'Balanced' : 'Needs Attention'
  const statusColor = organ.val > 80 ? 'var(--bw-green)' : organ.val > 65 ? 'var(--bw-gold)' : 'var(--bw-rose)'

  return (
    <div style={{ animation: 'fade-in-up 0.3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <svg width={90} height={90} style={{ flexShrink: 0 }}>
          <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
          <circle cx={45} cy={45} r={r} fill="none" stroke={hex}
            strokeWidth={5} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform="rotate(-90 45 45)"
            style={{ filter: `drop-shadow(0 0 8px ${hex})` }}
          />
          <text x={45} y={51} textAnchor="middle" fill={hex} fontSize={18} fontWeight="bold" fontFamily="var(--font-mono)">{organ.val}</text>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300, color: organ.color, fontStyle: 'italic' }}>{organ.name}</div>
          <div style={{
            fontSize: 10, fontFamily: 'var(--font-mono)', color: statusColor, letterSpacing: '0.1em', marginTop: 4,
            padding: '2px 8px', borderRadius: 4,
            background: organ.val > 80 ? 'rgba(0,224,160,0.1)' : organ.val > 65 ? 'rgba(240,192,64,0.1)' : 'rgba(255,68,136,0.1)',
            display: 'inline-block',
          }}>{statusLabel}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{ background: `${hex}0d`, border: `1px solid ${hex}22`, borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase' }}>Energy Level</div>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: organ.color }}>{organ.val}%</div>
        </div>
        <div style={{ background: `${hex}0d`, border: `1px solid ${hex}22`, borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase' }}>Status</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: statusColor }}>{statusLabel}</div>
        </div>
        <div style={{ background: `${hex}0d`, border: `1px solid ${hex}22`, borderRadius: 8, padding: '8px 10px', gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase' }}>Finger Zones</div>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: organ.color }}>{organ.zones}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--bw-text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
        {organ.description}
      </div>
    </div>
  )
}

export default function OrgansPage() {
  const [activeIdx, setActiveIdx] = useState(null)
  const activeOrgan = activeIdx !== null ? ORGAN_DATA[activeIdx] : null

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: 20,
      background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(0,80,120,0.06) 0%, transparent 70%), var(--bw-deep)',
      animation: 'fade-in-up 0.5s ease both',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, maxWidth: 900 }}>

        {/* Left: Canvas body with organ orbs */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12, alignSelf: 'flex-start' }}>Organ Energy Map</div>
          <OrganCanvas organs={ORGAN_DATA} activeIdx={activeIdx} onSelect={setActiveIdx} />
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 8, textAlign: 'center' }}>Click an organ to inspect</div>
        </div>

        {/* Right: Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Detail card */}
          <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>Organ Detail</div>
            <OrganDetail organ={activeOrgan} />
          </div>

          {/* All organs list */}
          <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>All Organs</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ORGAN_DATA.map((organ, idx) => {
                const hex = resolveColor(organ.color)
                const isActive = activeIdx === idx
                return (
                  <div key={organ.name}
                    onClick={() => setActiveIdx(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                      background: isActive ? `${hex}10` : 'transparent',
                      border: `1px solid ${isActive ? hex + '30' : 'transparent'}`,
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: hex, boxShadow: `0 0 6px ${hex}`, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, color: isActive ? organ.color : 'var(--bw-text-secondary)', fontWeight: isActive ? 600 : 400 }}>{organ.name}</div>
                    <div style={{ width: 60, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${organ.val}%`, background: hex, transition: 'width 0.8s' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: organ.color, width: 28, textAlign: 'right' }}>{organ.val}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
