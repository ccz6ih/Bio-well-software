import React, { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (user === 'demo' && pass === '1234') {
        onLogin()
      } else {
        setError('Invalid credentials')
        setLoading(false)
      }
    }, 600)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid var(--bw-border-hi)',
    background: 'rgba(0,20,50,0.6)',
    color: 'var(--bw-text-primary)',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,60,140,0.15) 0%, transparent 70%), var(--bw-deep)',
    }}>
      <div style={{
        width: 360,
        padding: '40px 36px',
        borderRadius: 18,
        background: 'var(--bw-panel)',
        border: '1px solid var(--bw-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,100,200,0.08)',
        animation: 'fade-in-up 0.5s ease both',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/images/Bio-well-transparent-logo (1).avif"
            alt="Bio-Well"
            style={{ width: 180, marginBottom: 8 }}
          />
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.35em',
            color: 'var(--bw-text-muted)',
            textTransform: 'uppercase',
          }}>Energy Intelligence Platform</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block',
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'var(--bw-text-muted)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>Username</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              style={inputStyle}
              autoFocus
              autoComplete="username"
              placeholder="Enter username"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'var(--bw-text-muted)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              style={inputStyle}
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div style={{
              fontSize: 11,
              color: 'var(--bw-rose)',
              textAlign: 'center',
              marginBottom: 14,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'rgba(255,68,136,0.08)',
              border: '1px solid rgba(255,68,136,0.2)',
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              background: loading
                ? 'rgba(0,120,220,0.3)'
                : 'linear-gradient(135deg, var(--bw-blue), var(--bw-blue-mid))',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.05em',
              boxShadow: '0 0 20px rgba(0,120,220,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 10,
          color: 'var(--bw-text-muted)',
          lineHeight: 1.6,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>DEMO ACCESS</div>
          <div>Username: demo · Password: 1234</div>
        </div>
      </div>
    </div>
  )
}
