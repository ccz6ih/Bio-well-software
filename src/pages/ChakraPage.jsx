import React, { useEffect, useRef, useState } from 'react'
import { CHAKRA_DATA } from '../data/mockData.js'

const CHAKRAS = CHAKRA_DATA

function ChakraCanvas({ activeId, onSelect }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const tRef = useRef(0)
  const activeRef = useRef(activeId)
  const imgRef = useRef(null)
  activeRef.current = activeId

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

    // Click handler
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (W / rect.width)
      const my = (e.clientY - rect.top) * (H / rect.height)
      CHAKRAS.forEach(ch => {
        const cy2 = ch.y * H
        const dx = mx - cx, dy = my - cy2
        if (dx * dx + dy * dy < 20 * 20) onSelect(ch.id)
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

      // Vertical energy channel
      const chanGrad = ctx.createLinearGradient(cx, 0, cx, H)
      chanGrad.addColorStop(0, 'rgba(150,100,255,0.3)')
      chanGrad.addColorStop(0.5, 'rgba(0,200,255,0.15)')
      chanGrad.addColorStop(1, 'rgba(255,60,60,0.3)')
      ctx.strokeStyle = chanGrad
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()

      drawBody()

      // Draw chakras
      CHAKRAS.forEach(ch => {
        const cy2 = ch.y * H
        const isActive = activeRef.current === ch.id
        const pulse = 1 + Math.sin(t * 0.05 + ch.hue * 0.02) * 0.12
        const r = (isActive ? 16 : 11) * pulse

        // Outer glow
        if (isActive) {
          const glow = ctx.createRadialGradient(cx, cy2, 0, cx, cy2, 36)
          glow.addColorStop(0, `${ch.color}55`)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glow
          ctx.beginPath(); ctx.arc(cx, cy2, 36, 0, Math.PI * 2); ctx.fill()
        }

        // Spinning rings
        ctx.save()
        ctx.translate(cx, cy2)
        ctx.rotate(t * 0.02 * (ch.hue % 2 === 0 ? 1 : -1))
        ctx.strokeStyle = `${ch.color}${isActive ? 'cc' : '66'}`
        ctx.lineWidth = isActive ? 1.5 : 0.8
        ctx.setLineDash([3, 6])
        ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, Math.PI * 2); ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()

        // Core orb
        const orb = ctx.createRadialGradient(cx, cy2, 0, cx, cy2, r)
        orb.addColorStop(0, `${ch.color}ff`)
        orb.addColorStop(0.5, `${ch.color}99`)
        orb.addColorStop(1, `${ch.color}11`)
        ctx.fillStyle = orb
        ctx.beginPath(); ctx.arc(cx, cy2, r, 0, Math.PI * 2); ctx.fill()

        // Bloom shadow
        ctx.shadowBlur = isActive ? 20 : 10
        ctx.shadowColor = ch.color
        ctx.beginPath(); ctx.arc(cx, cy2, r * 0.6, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0

        // Value bar to the side
        const barX = cx + 22
        const barH = 28 * (ch.val / 100)
        ctx.fillStyle = `${ch.color}33`
        ctx.fillRect(barX, cy2 - 14, 4, 28)
        ctx.fillStyle = ch.color
        ctx.fillRect(barX, cy2 + 14 - barH, 4, barH)
      })

      tRef.current++
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(frameRef.current)
      canvas.removeEventListener('click', handleClick)
    }
  }, [onSelect])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={520}
      style={{ display: 'block', cursor: 'pointer' }}
    />
  )
}

function ChakraDetail({ chakra }) {
  if (!chakra) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--bw-text-muted)', fontSize: 12, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>❋</div>
        Select a chakra to view details
      </div>
    </div>
  )

  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * (chakra.val / 100)

  return (
    <div style={{ animation: 'fade-in-up 0.3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <svg width={90} height={90} style={{ flexShrink: 0 }}>
          <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
          <circle cx={45} cy={45} r={r} fill="none" stroke={chakra.color}
            strokeWidth={5} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform="rotate(-90 45 45)"
            style={{ filter: `drop-shadow(0 0 8px ${chakra.color})` }}
          />
          <text x={45} y={51} textAnchor="middle" fill={chakra.color} fontSize={18} fontWeight="bold" fontFamily="var(--font-mono)">{chakra.val}</text>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 300, color: chakra.color, fontStyle: 'italic' }}>{chakra.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.15em', marginTop: 2 }}>{chakra.sanskrit.toUpperCase()}</div>
          <div style={{ fontSize: 11, color: 'var(--bw-text-secondary)', marginTop: 4 }}>{chakra.desc}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Energy Level', val: `${chakra.val}%` },
          { label: 'Element',      val: chakra.element },
          { label: 'Status',       val: chakra.val > 80 ? 'Optimal' : chakra.val > 60 ? 'Balanced' : 'Needs Attention' },
          { label: 'Frequency',    val: `${320 + CHAKRAS.indexOf(chakra) * 60} Hz` },
        ].map(item => (
          <div key={item.label} style={{ background: `${chakra.color}0d`, border: `1px solid ${chakra.color}22`, borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.1em', marginBottom: 3, textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: chakra.color }}>{item.val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ChakraPage() {
  const [activeId, setActiveId] = useState('heart')
  const activeChakra = CHAKRAS.find(c => c.id === activeId)

  return (
    <div style={{
      height: '100%', overflowY: 'auto', padding: 20,
      background: `radial-gradient(ellipse 60% 80% at 30% 50%, rgba(80,40,160,0.06) 0%, transparent 70%), var(--bw-deep)`,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, maxWidth: 900, animation: 'fade-in-up 0.5s ease both' }}>

        {/* Canvas */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12, alignSelf: 'flex-start' }}>Energy Body Map</div>
          <ChakraCanvas activeId={activeId} onSelect={setActiveId} />
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 8, textAlign: 'center' }}>Click a chakra to inspect</div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Detail card */}
          <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>Chakra Detail</div>
            <ChakraDetail chakra={activeChakra} />
          </div>

          {/* All chakras mini list */}
          <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>All Centers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHAKRAS.map(ch => (
                <div key={ch.id}
                  onClick={() => setActiveId(ch.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    background: activeId === ch.id ? `${ch.color}10` : 'transparent',
                    border: `1px solid ${activeId === ch.id ? ch.color + '30' : 'transparent'}`,
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, boxShadow: `0 0 6px ${ch.color}`, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, color: activeId === ch.id ? ch.color : 'var(--bw-text-secondary)', fontWeight: activeId === ch.id ? 600 : 400 }}>{ch.name}</div>
                  <div style={{ width: 60, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ch.val}%`, background: ch.color, transition: 'width 0.8s' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: ch.color, width: 28, textAlign: 'right' }}>{ch.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
