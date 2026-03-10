import React, { useState } from 'react'
import { DEVICE_INFO, CURRENT_PATIENT } from '../data/mockData.js'

const panel = { background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, padding: 20 }
const sectionHeader = { fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 16 }
const fieldLabel = { fontSize: 10, color: 'var(--bw-text-muted)', marginBottom: 3, letterSpacing: '0.05em' }
const fieldValue = { fontSize: 13, color: 'var(--bw-text-primary)', fontFamily: 'var(--font-mono)' }

function Field({ label, value, mono = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={fieldLabel}>{label}</div>
      <div style={{ ...fieldValue, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)' }}>{value}</div>
    </div>
  )
}

function BatteryBar({ pct }) {
  const color = pct > 60 ? 'var(--bw-green)' : pct > 30 ? 'var(--bw-gold)' : 'var(--bw-rose)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 36, height: 16, borderRadius: 3, border: `1px solid ${color}`, position: 'relative', padding: 2 }}>
        <div style={{ position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)', width: 4, height: 8, background: color, borderRadius: '0 2px 2px 0' }} />
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>{pct}%</span>
    </div>
  )
}

function GhostButton({ children, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '7px 18px', borderRadius: 7, border: `1px solid ${hover ? 'var(--bw-cyan)' : 'var(--bw-border-hi)'}`,
        background: hover ? 'rgba(0,229,255,0.06)' : 'transparent',
        color: hover ? 'var(--bw-text-primary)' : 'var(--bw-cyan)',
        fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer',
        transition: 'all 0.2s',
      }}>{children}</button>
  )
}

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true)
  const [calState, setCalState] = useState('idle') // idle | running | done
  const [calProgress, setCalProgress] = useState(0)
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [patientForm, setPatientForm] = useState({ name: '', dob: '', practitioner: '', notes: '' })
  const [patientSaved, setPatientSaved] = useState(false)

  const handleToggle = () => {
    const next = !darkMode
    setDarkMode(next)
    const r = document.documentElement.style
    if (!next) {
      r.setProperty('--bw-deep', '#f0f4f8'); r.setProperty('--bw-void', '#e8ecf0')
      r.setProperty('--bw-panel', '#ffffff'); r.setProperty('--bw-card', '#f8fafc')
      r.setProperty('--bw-border', 'rgba(0,80,160,0.15)')
      r.setProperty('--bw-text-primary', '#1a1a2e'); r.setProperty('--bw-text-secondary', '#4a6080')
      r.setProperty('--bw-text-muted', '#8a9ab0')
    } else {
      ['--bw-deep','--bw-void','--bw-panel','--bw-card','--bw-border','--bw-text-primary','--bw-text-secondary','--bw-text-muted'].forEach(v => r.setProperty(v, ''))
    }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 20, animation: 'fade-in-up 0.5s ease both' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── DEVICE ── */}
        <div style={panel}>
          <div style={sectionHeader}>Device</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Model"    value={DEVICE_INFO.model} />
            <Field label="Serial"   value={DEVICE_INFO.serial} />
            <Field label="Firmware" value={DEVICE_INFO.firmware} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={fieldLabel}>Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bw-green)', boxShadow: '0 0 6px var(--bw-green)', display: 'inline-block', animation: 'pulse-ring 2s ease-in-out infinite' }} />
                <span style={{ ...fieldValue, color: 'var(--bw-green)' }}>{DEVICE_INFO.status}</span>
              </div>
            </div>
            <Field label="Port"          value={DEVICE_INFO.port} />
            <Field label="Last Calibration" value={DEVICE_INFO.calibration} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, background: 'rgba(0,80,160,0.06)', border: '1px solid var(--bw-border)', marginBottom: 14 }}>
            <div>
              <div style={fieldLabel}>Battery</div>
              <BatteryBar pct={DEVICE_INFO.battery} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={fieldLabel}>Signal Quality</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--bw-green)' }}>Excellent</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <GhostButton onClick={() => {
              if (calState !== 'idle') return
              setCalState('running'); setCalProgress(0)
              let p = 0
              const iv = setInterval(() => {
                p += Math.random() * 12 + 3
                if (p >= 100) { p = 100; clearInterval(iv); setCalState('done'); setTimeout(() => setCalState('idle'), 3000) }
                setCalProgress(Math.min(100, Math.round(p)))
              }, 200)
            }}>
              {calState === 'running' ? '⟳ Calibrating...' : '⊙ Recalibrate'}
            </GhostButton>
            {calState === 'running' && (
              <div style={{ flex: '0 0 140px' }}>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${calProgress}%`, background: 'var(--bw-cyan)', transition: 'width 0.2s', boxShadow: '0 0 8px var(--bw-cyan)' }} />
                </div>
                <div style={{ fontSize: 9, color: 'var(--bw-cyan)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{calProgress}%</div>
              </div>
            )}
            {calState === 'done' && <span style={{ fontSize: 11, color: 'var(--bw-green)', animation: 'fade-in-up 0.3s ease both' }}>✓ Calibration complete</span>}
          </div>
        </div>

        {/* ── PATIENT ── */}
        <div style={panel}>
          <div style={sectionHeader}>Current Patient</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Name"         value={CURRENT_PATIENT.name} mono={false} />
            <Field label="Session ID"   value={`#${CURRENT_PATIENT.sessionId}`} />
            <Field label="Date of Birth" value={CURRENT_PATIENT.dob} />
            <Field label="Practitioner"  value={CURRENT_PATIENT.practitioner} mono={false} />
          </div>
          <div style={{ marginTop: 14 }}>
            <GhostButton onClick={() => { setShowNewPatient(!showNewPatient); setPatientSaved(false) }}>
              {showNewPatient ? '✕ Cancel' : '+ New Patient Session'}
            </GhostButton>
          </div>

          {showNewPatient && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: 'rgba(0,80,160,0.06)', border: '1px solid var(--bw-border)', animation: 'fade-in-up 0.3s ease both' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>New Patient Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  { key: 'name', label: 'Patient Name', placeholder: 'Full name', type: 'text' },
                  { key: 'dob', label: 'Date of Birth', placeholder: 'YYYY-MM-DD', type: 'date' },
                  { key: 'practitioner', label: 'Practitioner', placeholder: 'Dr. Name', type: 'text' },
                  { key: 'notes', label: 'Notes', placeholder: 'Optional notes...', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <div style={fieldLabel}>{f.label}</div>
                    <input
                      type={f.type}
                      value={patientForm[f.key]}
                      onChange={e => setPatientForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 6,
                        border: '1px solid var(--bw-border-hi)', background: 'rgba(0,20,50,0.6)',
                        color: 'var(--bw-text-primary)', fontFamily: 'var(--font-display)', fontSize: 12,
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => {
                  setPatientSaved(true)
                  setTimeout(() => { setShowNewPatient(false); setPatientForm({ name: '', dob: '', practitioner: '', notes: '' }) }, 1800)
                }} style={{
                  padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--bw-blue), var(--bw-blue-mid))',
                  color: 'white', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
                  boxShadow: '0 0 12px rgba(0,120,220,0.3)',
                }}>Start Session</button>
                {patientSaved && <span style={{ fontSize: 11, color: 'var(--bw-green)', animation: 'fade-in-up 0.3s ease both' }}>✓ Patient session created</span>}
              </div>
            </div>
          )}
        </div>

        {/* ── DISPLAY ── */}
        <div style={panel}>
          <div style={sectionHeader}>Display</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--bw-text-secondary)' }}>{darkMode ? 'Dark' : 'Light'} Mode</div>
              <div style={{ fontSize: 10, color: 'var(--bw-text-muted)', marginTop: 2 }}>Interface color theme</div>
            </div>
            <div onClick={handleToggle} style={{ width: 44, height: 24, borderRadius: 12, background: darkMode ? 'var(--bw-blue)' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', border: '1px solid var(--bw-border-hi)' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: darkMode ? 22 : 2, transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div style={panel}>
          <div style={sectionHeader}>About</div>
          <div style={{ fontSize: 14, color: 'var(--bw-text-primary)', marginBottom: 4 }}>Bio-Well Intelligence Platform</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--bw-text-muted)', marginBottom: 8 }}>Version 2.0.0 · Build 2026.03</div>
          <div style={{ fontSize: 11, color: 'var(--bw-text-muted)', lineHeight: 1.6 }}>Powered by GDV Bioelectrography · Qt 5.15 Hardware Layer · React UI</div>
        </div>

      </div>
    </div>
  )
}
