import React, { useState, useEffect } from 'react'
import { CURRENT_PATIENT, DEVICE_INFO } from '../data/mockData.js'

const PAGE_TITLES = {
  dashboard:  { title: 'Energy Dashboard',   sub: 'Real-time biofield overview' },
  scan:       { title: 'Live GDV Scan',       sub: 'Electrophotonic capture in progress' },
  chakra:     { title: 'Chakra Analysis',     sub: 'Energy center mapping' },
  aura:       { title: 'Aura Field',          sub: 'GDV sector energy distribution' },
  biorhythms: { title: 'Biorhythms',          sub: 'Physical · Emotional · Intellectual cycles' },
  organs:     { title: 'Organ Energy Map',    sub: 'Biofield organ correlation' },
  tracker:    { title: 'Wellness Tracker',    sub: 'Trend monitoring & goals' },
  history:    { title: 'Session History',     sub: 'Patient progress over time' },
  reports:    { title: 'Assessment Report',   sub: 'Generated report preview' },
  settings:   { title: 'Settings',            sub: 'Device & display configuration' },
}

export default function Topbar({ page }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const info = PAGE_TITLES[page] || PAGE_TITLES.dashboard

  return (
    <div style={{
      height: 'var(--topbar-h)',
      background: 'var(--bw-void)',
      borderBottom: '1px solid var(--bw-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--bw-text-primary)', letterSpacing: '0.01em' }}>{info.title}</div>
        <div style={{ fontSize: 10, color: 'var(--bw-text-muted)', letterSpacing: '0.08em', marginTop: 1 }}>{info.sub}</div>
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(0,224,160,0.08)', border: '1px solid rgba(0,224,160,0.2)' }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--bw-green)', boxShadow: '0 0 6px var(--bw-green)', animation: 'pulse-ring 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 10, color: 'var(--bw-green)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>LIVE</span>
      </div>

      {/* Battery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'var(--bw-panel)', border: '1px solid var(--bw-border)' }}>
        <div style={{ width: 22, height: 12, borderRadius: 2, border: `1px solid ${DEVICE_INFO.battery > 30 ? 'var(--bw-green)' : 'var(--bw-rose)'}`, position: 'relative', padding: 1.5, display: 'flex', alignItems: 'stretch' }}>
          <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 2.5, height: 5, background: DEVICE_INFO.battery > 30 ? 'var(--bw-green)' : 'var(--bw-rose)', borderRadius: '0 1px 1px 0' }} />
          <div style={{ flex: 1, borderRadius: 1, background: DEVICE_INFO.battery > 30 ? 'var(--bw-green)' : 'var(--bw-rose)', width: `${DEVICE_INFO.battery}%`, boxShadow: `0 0 4px ${DEVICE_INFO.battery > 30 ? 'var(--bw-green)' : 'var(--bw-rose)'}` }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: DEVICE_INFO.battery > 30 ? 'var(--bw-green)' : 'var(--bw-rose)' }}>{DEVICE_INFO.battery}%</span>
      </div>

      {/* Patient */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 8, background: 'var(--bw-panel)', border: '1px solid var(--bw-border)' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--bw-blue), var(--bw-blue-dim, #003388))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{CURRENT_PATIENT.initials}</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--bw-text-primary)' }}>{CURRENT_PATIENT.name}</div>
          <div style={{ fontSize: 9, color: 'var(--bw-text-muted)', letterSpacing: '0.05em' }}>Session #{CURRENT_PATIENT.sessionId}</div>
        </div>
      </div>

      {/* Clock */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--bw-text-muted)', letterSpacing: '0.08em' }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>
    </div>
  )
}
