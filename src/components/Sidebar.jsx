import React, { useState } from 'react'

const NAV = [
  { id: 'dashboard',  icon: '⬡', label: 'Dashboard' },
  { id: 'scan',       icon: '◎', label: 'Live Scan' },
  { id: 'chakra',     icon: '❋', label: 'Chakras' },
  { id: 'aura',       icon: '◉', label: 'Aura Field' },
  { id: 'biorhythms', icon: '〜', label: 'Biorhythms' },
  { id: 'organs',     icon: '⬢', label: 'Organs' },
  { id: 'tracker',    icon: '◈', label: 'Tracker' },
]

const BOTTOM = [
  { id: 'history',  icon: '▤',  label: 'History' },
  { id: 'reports',  icon: '⬜', label: 'Reports' },
  { id: 'settings', icon: '⊙', label: 'Settings' },
]

const s = {
  sidebar: {
    width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', height: '100vh',
    background: 'var(--bw-void)', borderRight: '1px solid var(--bw-border)',
    display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10,
  },
  logo: {
    padding: '18px 12px 16px', borderBottom: '1px solid var(--bw-border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  logoMark: {
    width: '100%', objectFit: 'contain',
    filter: 'drop-shadow(0 0 10px rgba(0,180,255,0.5))',
    animation: 'breathe 3s ease-in-out infinite',
  },
  logoSub: { fontSize: 9, letterSpacing: '0.18em', color: 'var(--bw-text-muted)', textTransform: 'uppercase', marginTop: 1 },
  nav: { flex: 1, padding: '12px 10px 0', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' },
  section: { fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', padding: '14px 10px 6px', textTransform: 'uppercase' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'rgba(0,153,238,0.12)' : 'transparent',
    border: active ? '1px solid rgba(0,153,238,0.25)' : '1px solid transparent',
    color: active ? 'var(--bw-blue-hi)' : 'var(--bw-text-secondary)',
    fontSize: 13, fontWeight: active ? 600 : 400, letterSpacing: '0.02em',
    position: 'relative', overflow: 'hidden',
  }),
  navIcon: { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
  activeDot: {
    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
    width: 3, height: 18, borderRadius: '0 2px 2px 0',
    background: 'var(--bw-blue-hi)', boxShadow: '0 0 8px var(--bw-blue-hi)',
  },
  bottom: { padding: '10px 10px 0', borderTop: '1px solid var(--bw-border)', display: 'flex', flexDirection: 'column', gap: 2 },
  deviceStatus: {
    margin: '10px 10px 14px', padding: '10px 12px', borderRadius: 8,
    background: 'rgba(0,224,160,0.06)', border: '1px solid rgba(0,224,160,0.15)',
  },
  deviceDot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--bw-green)',
    boxShadow: '0 0 6px var(--bw-green)', display: 'inline-block', marginRight: 6,
    animation: 'pulse-ring 2s ease-in-out infinite',
  },
  deviceLabel: { fontSize: 10, color: 'var(--bw-green)', letterSpacing: '0.1em' },
  deviceSub: { fontSize: 9, color: 'var(--bw-text-muted)', marginTop: 2 },
}

function NavItem({ item, active, onNav }) {
  const [hover, setHover] = useState(false)
  const isActive = active === item.id
  return (
    <div
      title={item.label}
      style={{
        ...s.navItem(isActive),
        ...(hover && !isActive ? {
          background: 'rgba(0,153,238,0.06)',
          color: 'var(--bw-blue-hi)',
        } : {}),
      }}
      onClick={() => onNav(item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {isActive && <div style={s.activeDot} />}
      <span style={s.navIcon}>{item.icon}</span>
      <span className="nav-label">{item.label}</span>
    </div>
  )
}

export default function Sidebar({ active, onNav }) {
  return (
    <div style={s.sidebar}>
      <div style={s.logo}>
        <img src="/images/Bio-well-transparent-logo (1).avif" alt="Bio-Well" style={s.logoMark} />
        <div style={s.logoSub}>Energy Intelligence</div>
      </div>

      <div style={s.nav}>
        <div style={s.section}>Analysis</div>
        {NAV.map(item => (
          <NavItem key={item.id} item={item} active={active} onNav={onNav} />
        ))}
      </div>

      <div style={s.bottom}>
        <div style={s.section}>Management</div>
        {BOTTOM.map(item => (
          <NavItem key={item.id} item={item} active={active} onNav={onNav} />
        ))}
      </div>

      <div style={s.deviceStatus}>
        <div><span style={s.deviceDot} /><span style={s.deviceLabel}>BIO-WELL 3.0</span></div>
        <div style={s.deviceSub}>USB Connected · Ready</div>
      </div>
    </div>
  )
}
