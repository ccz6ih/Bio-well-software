import React, { useRef, useState } from 'react'
import {
  CURRENT_PATIENT, ANALYSIS, LIFESTYLE, CHAKRA_DATA,
  DOSHAS, MERIDIANS, ORGAN_SYSTEMS, REPORT
} from '../data/mockData.js'

// ── helpers ────────────────────────────────────────────────────────────────
const energyColor = (v) =>
  v < 2 ? '#ff4466' : v < 4 ? '#ff8833' : v < 6 ? '#00e0a0' : v < 8 ? '#22bbff' : '#cc88ff'

const balColor = (b) =>
  b == null ? '#555' : b < 65 ? '#ff4466' : b < 80 ? '#ff8833' : '#00e0a0'

const energyLabel = (v) =>
  v < 2 ? 'Very Low' : v < 4 ? 'Low' : v < 6 ? 'Optimal' : v < 8 ? 'High' : 'Very High'

// ── subcomponents ──────────────────────────────────────────────────────────
function Section({ title, children, accent = '#0099ee' }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16, paddingBottom: 8,
        borderBottom: `1px solid rgba(0,140,255,0.15)`,
      }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <div style={{ fontSize: 10, letterSpacing: '0.22em', color: '#7aafd4', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{title}</div>
      </div>
      {children}
    </div>
  )
}

function LifestyleBar({ item }) {
  const getZone = (v, low, normal) => v < low ? 'Low' : v < normal ? 'Normal' : 'Ideal'
  const zone = getZone(item.value, item.low, item.normal)
  const zoneColor = zone === 'Low' ? 'var(--bw-rose)' : zone === 'Ideal' ? 'var(--bw-green)' : 'var(--bw-blue-hi)'
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--bw-text-secondary)' }}>{item.icon} {item.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: zoneColor }}>{item.value}%
          <span style={{ fontSize: 9, marginLeft: 6, background: `${zoneColor}22`, padding: '1px 7px', borderRadius: 4, letterSpacing: '0.1em' }}>{zone}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        {/* Low zone */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${item.low}%`, background: 'rgba(255,68,136,0.15)', borderRight: '1px solid rgba(255,68,136,0.3)' }} />
        {/* Normal zone */}
        <div style={{ position: 'absolute', left: `${item.low}%`, top: 0, bottom: 0, width: `${item.normal - item.low}%`, background: 'rgba(0,180,255,0.1)', borderRight: '1px solid rgba(0,180,255,0.25)' }} />
        {/* Value fill */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${item.value}%`, borderRadius: 3, background: `linear-gradient(90deg, ${zoneColor}aa, ${zoneColor})`, boxShadow: `0 0 8px ${zoneColor}55` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 8, color: 'rgba(255,68,136,0.6)' }}>Low &lt;{item.low}%</span>
        <span style={{ fontSize: 8, color: 'rgba(0,180,255,0.5)' }}>Normal {item.low}–{item.normal}%</span>
        <span style={{ fontSize: 8, color: 'rgba(0,224,160,0.6)' }}>Ideal &gt;{item.normal}%</span>
      </div>
    </div>
  )
}

function ChakraRow({ ch }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(0,140,255,0.07)' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, boxShadow: `0 0 8px ${ch.color}`, flexShrink: 0 }} />
      <div style={{ width: 72, fontSize: 11, color: 'var(--bw-text-secondary)', flexShrink: 0 }}>{ch.name}</div>
      <div style={{ flex: 1 }}>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 3 }}>
          <div style={{ height: '100%', width: `${ch.alignment}%`, background: ch.color, opacity: 0.7 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: energyColor(ch.energy) }}>E: {ch.energy} J</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: ch.color }}>{ch.alignment}% aligned</span>
        </div>
      </div>
    </div>
  )
}

function MeridianCard({ m }) {
  const lvlColor = m.level === 'High' ? 'var(--bw-blue-hi)' : m.level === 'Normal' ? 'var(--bw-green)' : 'var(--bw-rose)'
  const balAlert = m.balance != null && m.balance < 70
  return (
    <div style={{
      background: m.alert ? 'rgba(255,68,136,0.04)' : 'var(--bw-panel)',
      border: `1px solid ${m.alert ? 'rgba(255,68,136,0.25)' : 'var(--bw-border)'}`,
      borderRadius: 10, padding: '10px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--bw-text-secondary)', fontWeight: 500 }}>{m.name}</span>
        <span style={{ fontSize: 8, color: m.color, background: `${m.color}18`, padding: '1px 7px', borderRadius: 4, letterSpacing: '0.1em' }}>{m.element}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 8, color: 'var(--bw-text-muted)', marginBottom: 1 }}>Energy</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: energyColor(m.energy), lineHeight: 1 }}>{m.energy}</div>
          <div style={{ fontSize: 8, color: energyColor(m.energy), marginTop: 1 }}>{m.level}</div>
        </div>
        {m.balance != null && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, color: 'var(--bw-text-muted)', marginBottom: 3 }}>Balance</div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${m.balance}%`, background: balColor(m.balance), transition: 'width 1s ease' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, marginTop: 2, color: balColor(m.balance), display: 'flex', justifyContent: 'space-between' }}>
              <span>{m.balance}%</span>
              {balAlert && <span style={{ color: 'var(--bw-rose)' }}>⚠ Low</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DoshaGauge({ d }) {
  const pct = Math.min(100, Math.abs(d.value / 4) * 100 + 50)
  return (
    <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: d.color }}>{d.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--bw-text-muted)' }}>dev {d.deviation}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: d.color, lineHeight: 1 }}>{d.value.toFixed(2)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
          </div>
          <div style={{ fontSize: 8, color: 'var(--bw-text-muted)', marginTop: 2, textAlign: 'center' }}>Optimal</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: 'var(--bw-text-muted)' }}>{d.element} · {d.desc}</div>
    </div>
  )
}

const SYSTEM_COLORS = {
  Head: '#6688ff', Cardiovascular: '#ff4488', Respiratory: '#44ccff',
  Endocrine: '#ffdd44', Musculoskeletal: '#ff8833', Digestive: '#44ee88',
  Urogenital: '#00e5ff', Nervous: '#ff4466', Immune: '#cc88ff',
}

function OrgansTable() {
  const [expanded, setExpanded] = useState({})
  const systems = [...new Set(ORGAN_SYSTEMS.map(o => o.system))]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {systems.map(sys => {
        const rows = ORGAN_SYSTEMS.filter(o => o.system === sys)
        const sysRow = rows.find(r => r.organ == null)
        const subRows = rows.filter(r => r.organ != null)
        const open = expanded[sys]
        const sysColor = SYSTEM_COLORS[sys] || '#7aafd4'
        return (
          <div key={sys}>
            <div onClick={() => setExpanded(e => ({ ...e, [sys]: !e[sys] }))}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s',
                background: open ? 'rgba(0,100,200,0.08)' : 'transparent',
                border: '1px solid transparent',
                ':hover': { background: 'rgba(0,100,200,0.05)' }
              }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: sysColor, flexShrink: 0 }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: sysColor, flex: 1 }}>{sys}</div>
              {sysRow && <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: energyColor(sysRow.energy), width: 40, textAlign: 'right' }}>{sysRow.energy}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: balColor(sysRow.balance), width: 46, textAlign: 'right' }}>{sysRow.balance}%</div>
              </>}
              <span style={{ fontSize: 10, color: 'var(--bw-text-muted)', marginLeft: 4 }}>{open ? '▲' : '▼'}</span>
            </div>
            {open && subRows.map(r => (
              <div key={r.organ} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px 6px 28px',
                borderBottom: '1px solid rgba(0,140,255,0.06)',
                background: r.alert ? 'rgba(255,68,136,0.03)' : 'transparent',
              }}>
                {r.alert && <span style={{ fontSize: 8, color: 'var(--bw-rose)' }}>⚠</span>}
                <div style={{ flex: 1, fontSize: 11, color: r.alert ? 'var(--bw-rose)' : 'var(--bw-text-secondary)' }}>{r.organ}</div>
                <div style={{ width: 100, marginRight: 8 }}>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((r.energy - 2) / 8) * 100}%`, background: energyColor(r.energy) }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: energyColor(r.energy), width: 34, textAlign: 'right' }}>{r.energy}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: balColor(r.balance), width: 46, textAlign: 'right' }}>{r.balance != null ? `${r.balance}%` : '—'}</div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ReportPage ─────────────────────────────────────────────────────────
export default function ReportPage() {
  const printRef = useRef(null)

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=1000')
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Bio-Well Report — ${CURRENT_PATIENT.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Space+Mono:wght@400;700&family=Crimson+Pro:ital@0;1&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04080f; color: #e8f4ff; font-family: Outfit, sans-serif; padding: 24px; }
        @media print { @page { margin: 10mm; } body { background: #04080f; } }
      </style>
      </head><body>
      ${printRef.current?.innerHTML || ''}
      <script>window.onload = () => { window.print(); }<\/script>
      </body></html>`)
    win.document.close()
  }

  const chakraAvgAlign = Math.round(CHAKRA_DATA.reduce((s, c) => s + c.alignment, 0) / CHAKRA_DATA.length)
  const alerts = ORGAN_SYSTEMS.filter(o => o.alert && o.organ != null)

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 20, background: 'var(--bw-deep)', animation: 'fade-in-up 0.5s ease both' }}>
      {/* ── Action bar ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
        {[['↓ Download PDF', handlePrint, true], ['Share with Patient', null, false], ['Compare to Previous', null, false]].map(([label, fn, primary]) => (
          <button key={label} onClick={fn} style={{
            padding: '9px 22px', borderRadius: 8, cursor: 'pointer',
            border: primary ? 'none' : '1px solid var(--bw-border-hi)',
            background: primary ? 'linear-gradient(135deg, var(--bw-blue), var(--bw-blue-mid))' : 'transparent',
            color: primary ? '#fff' : 'var(--bw-text-secondary)',
            fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: primary ? 600 : 400,
            boxShadow: primary ? '0 0 16px rgba(0,120,220,0.35)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Report body ── */}
      <div ref={printRef} style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--bw-text-muted)', marginBottom: 6 }}>GAS DISCHARGE VISUALIZATION · ANALYSIS REPORT</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--bw-blue-hi)', lineHeight: 1 }}>Bio-Well</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--bw-text-secondary)', marginTop: 2 }}>Energy Field Assessment</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--bw-text-primary)' }}>{CURRENT_PATIENT.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--bw-text-muted)', marginTop: 4 }}>{CURRENT_PATIENT.scanDate} · {CURRENT_PATIENT.scanTime}</div>
            <div style={{ fontSize: 11, color: 'var(--bw-text-muted)', marginTop: 2 }}>{CURRENT_PATIENT.practitioner}</div>
          </div>
        </div>

        {/* ── Score row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Total Energy', value: `${ANALYSIS.totalEnergyJoules} J`, sub: 'Optimal range 40–60', color: 'var(--bw-blue-hi)' },
            { label: 'Stress Index', value: '2.99', sub: 'Optimal [2.0–3.0]', color: 'var(--bw-green)' },
            { label: 'Chakra Align.', value: `${chakraAvgAlign}%`, sub: 'Average alignment', color: 'var(--bw-violet)' },
            { label: 'Disbalance', value: '7.02%', sub: '8L / 2R organs', color: 'var(--bw-gold)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.5 }} />
              <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Alert row ── */}
        <div style={{ background: 'rgba(255,68,136,0.04)', border: '1px solid rgba(255,68,136,0.18)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-rose)' }}>⚠ FLAGGED ZONES</span>
          {alerts.map(a => (
            <span key={a.organ} style={{ fontSize: 10, background: 'rgba(255,68,136,0.1)', color: 'var(--bw-rose)', padding: '2px 10px', borderRadius: 6 }}>
              {a.organ} ({a.energy}J · {a.balance}%)
            </span>
          ))}
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* LEFT: Lifestyle + Chakras */}
          <div>
            <Section title="Lifestyle Analysis">
              {LIFESTYLE.map(l => <LifestyleBar key={l.id} item={l} />)}
            </Section>
            <Section title="Nervous Centers — Chakras" accent="var(--bw-violet)">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-muted)', marginBottom: 10 }}>Overall Alignment: 92%</div>
              {[...CHAKRA_DATA].reverse().map(ch => <ChakraRow key={ch.id} ch={ch} />)}
            </Section>
          </div>

          {/* RIGHT: Doshas + Meridians */}
          <div>
            <Section title="Ayurvedic Doshas" accent="var(--bw-gold)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DOSHAS.map(d => <DoshaGauge key={d.id} d={d} />)}
              </div>
            </Section>
            <Section title="Yin–Yang Meridians" accent="var(--bw-cyan)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {MERIDIANS.map(m => <MeridianCard key={m.id} m={m} />)}
              </div>
            </Section>
          </div>
        </div>

        {/* ── Organ Systems Table ── */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Functional / Energetic Condition of Organs & Systems</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['Energy', '#00e0a0'], ['Balance', '#22bbff']].map(([l, c]) => (
                <span key={l} style={{ fontSize: 9, color: c, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
              <span style={{ fontSize: 8, color: 'var(--bw-text-muted)' }}>▲ Click system to expand</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 46px', gap: 0, marginBottom: 6, padding: '0 12px 0 28px' }}>
            <span style={{ fontSize: 8, color: 'var(--bw-text-muted)', letterSpacing: '0.1em' }}>ORGAN</span>
            <span style={{ fontSize: 8, color: 'var(--bw-text-muted)', textAlign: 'right', letterSpacing: '0.1em' }}>E J</span>
            <span style={{ fontSize: 8, color: 'var(--bw-text-muted)', textAlign: 'right', letterSpacing: '0.1em' }}>BAL%</span>
          </div>
          <OrgansTable />
        </div>

        {/* ── Practitioner Recommendations ── */}
        <div style={{ background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>Summary & Recommendations</div>
          <p style={{ fontSize: 12, color: 'var(--bw-text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>{REPORT.summary}</p>
          {REPORT.recommendations.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 7 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--bw-blue-hi)', flexShrink: 0, paddingTop: 1 }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontSize: 12, color: 'var(--bw-text-secondary)', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 11, color: 'var(--bw-text-muted)' }}>
            By Dr. Ludmila Vassilieva, MD PhD · Holistic Healing Medical Centre, Dubai UAE
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '12px 0', borderTop: '1px solid var(--bw-border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.15em' }}>
            BIO-WELL INTELLIGENCE PLATFORM · SESSION #{CURRENT_PATIENT.sessionId} · {CURRENT_PATIENT.scanDate}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(122,175,212,0.4)', marginTop: 4, fontStyle: 'italic' }}>
            Bio-Well is not a medical instrument. Not designed for medical diagnostics. Measures energy and stress only. Consult your doctor for health concerns.
          </div>
        </div>
      </div>
    </div>
  )
}
