// ── Main TrackerPage ───────────────────────────────────────────────────────
export default function TrackerPage() {
  const [mode, setMode]           = useState('trend')   // 'day' | 'trend'
  const [param, setParam]         = useState('energy')
  const [selectedIdx, setSelected] = useState(FULL_DATASET.length - 1)
  const [overlays, setOverlays]   = useState({ vitality: false, stress: false, balance: false })

  const session = FULL_DATASET[selectedIdx]
  const cfg     = PARAMS[param]

  // Data fed to chart
  const chartData = mode === 'day'
    ? session.intraday
    : FULL_DATASET

  // Stats for selected session
  const stats = {
    energy:   { avg: session.score.toFixed(1),     peak: (session.score + 8).toFixed(1),   low: (session.score - 9).toFixed(1) },
    stress:   { avg: session.stress.toFixed(2),    peak: (session.stress + 0.6).toFixed(2), low: (session.stress - 0.4).toFixed(2) },
    vitality: { avg: session.vitality.toFixed(1),  peak: (session.vitality + 6).toFixed(1), low: (session.vitality - 7).toFixed(1) },
    balance:  { avg: '87.4',                        peak: '94.2',                             low: '81.1' },
  }
  const st = stats[param]

  // Trend delta vs previous
  const prev = selectedIdx > 0 ? FULL_DATASET[selectedIdx - 1] : null
  const delta = prev ? session.score - prev.score : null

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden', fontFamily: 'var(--font-display)', animation: 'fade-in-up 0.5s ease both' }}>

      {/* ── LEFT sidebar ── */}
      <div style={{ width: 260, minWidth: 260, borderRight: '1px solid var(--bw-border)', background: 'var(--bw-void)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--bw-border)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--bw-text-muted)', marginBottom: 8 }}>ENERGY TRACKER</div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3 }}>
            {[['trend', '▤ Multi-Session'], ['day', '◷ Day View']].map(([m, lbl]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '5px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.04em',
                background: mode === m ? 'var(--bw-blue)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--bw-text-muted)',
                transition: 'all 0.2s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* Parameter selector */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--bw-border)' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', marginBottom: 8 }}>PARAMETER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {Object.entries(PARAMS).map(([key, p]) => (
              <button key={key} onClick={() => setParam(key)} style={{
                padding: '7px 8px', borderRadius: 7, border: `1px solid ${param === key ? p.color + '66' : 'var(--bw-border)'}`,
                background: param === key ? p.color + '18' : 'transparent',
                color: param === key ? p.color : 'var(--bw-text-muted)',
                fontFamily: 'var(--font-display)', fontSize: 10, cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'left',
              }}>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <Sparkline data={FULL_DATASET} param={key === 'stress' ? 'stress' : key === 'vitality' ? 'vitality' : key === 'balance' ? 'balance' : 'score'} color={p.color} height={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', padding: '4px 10px 6px' }}>SESSIONS</div>
          {[...FULL_DATASET].reverse().map((s, ri) => {
            const realIdx = FULL_DATASET.length - 1 - ri
            return (
              <SessionItem key={s.id} s={s} selected={selectedIdx === realIdx}
                onClick={() => setSelected(realIdx)} />
            )
          })}
        </div>
      </div>

      {/* ── MAIN chart area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 20px' }}>

        {/* Top stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
          <StatPill label="Session Date"  value={session.date}            unit=""     color="var(--bw-blue-hi)" />
          <StatPill label={`${cfg.label} Avg`} value={st.avg}           unit={cfg.unit} color={cfg.color}       sub={`Peak ${st.peak} · Low ${st.low}`} />
          <StatPill label="Session Score" value={session.score}           unit="/100" color="var(--bw-cyan)"    sub={delta !== null ? `${delta >= 0 ? '+' : ''}${delta} vs prev` : 'First session'} />
          <StatPill label="Stress Index"  value={session.stress.toFixed(2)} unit="opt" color={session.stress < 3.5 ? 'var(--bw-green)' : 'var(--bw-rose)'} sub={session.stress < 3.5 ? 'Optimal range' : 'Elevated'} />
        </div>

        {/* Chart title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cfg.color, letterSpacing: '0.15em' }}>{cfg.label.toUpperCase()}</span>
            <span style={{ fontSize: 9, color: 'var(--bw-text-muted)', marginLeft: 8 }}>
              {mode === 'day' ? `24-Hour Profile · ${session.date}` : `${FULL_DATASET.length}-Session Trend`}
            </span>
          </div>
          {/* Zone legend */}
          <div style={{ display: 'flex', gap: 10 }}>
            {cfg.zones.map(z => (
              <span key={z.l} style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: z.c.replace('0.1', '0.5'), display: 'inline-block' }} />
                {z.l}
              </span>
            ))}
          </div>
        </div>

        {/* Main chart */}
        <div style={{ flex: 1, background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
          <TrackerChart data={chartData} param={param === 'stress' ? 'stress' : param === 'vitality' ? 'vitality' : param === 'balance' ? 'balance' : mode === 'day' ? 'energy' : 'score'} mode={mode} />
        </div>

        {/* Bottom insight strip */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {[
            { label: 'Peak Window',   value: mode === 'day' ? '08:45 – 09:30' : session.label, color: cfg.color },
            { label: 'Low Window',    value: mode === 'day' ? '02:00 – 04:30' : 'Jan 12',      color: 'var(--bw-text-muted)' },
            { label: 'Variability',   value: `${(Math.abs(parseFloat(st.peak) - parseFloat(st.low))).toFixed(1)} ${cfg.unit}`, color: 'var(--bw-gold)' },
            { label: 'Trend',         value: delta !== null ? (delta >= 0 ? `↑ Improving (+${delta})` : `↓ Declining (${delta})`) : '—', color: delta !== null ? (delta >= 0 ? 'var(--bw-green)' : 'var(--bw-rose)') : 'var(--bw-text-muted)' },
          ].map(i => (
            <div key={i.label} style={{ flex: 1, background: 'var(--bw-panel)', border: '1px solid var(--bw-border)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 8, letterSpacing: '0.15em', color: 'var(--bw-text-muted)', marginBottom: 3 }}>{i.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: i.color, fontWeight: 600 }}>{i.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
