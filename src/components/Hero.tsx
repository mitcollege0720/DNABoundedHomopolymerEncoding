import type { Tab } from '../App'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'codec', label: 'Codec Lab', icon: 'M4 7h16M4 12h16M4 17h10' },
  { id: 'rates', label: 'Rate Explorer', icon: 'M3 3v18h18M7 14l4-4 4 4 5-5' },
  { id: 'benchmark', label: 'Benchmark', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'how', label: 'How It Works', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4M12 16h.01' },
]

export default function Hero({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <header className="hero">
      <div className="hero-bg-strand left" />
      <div className="hero-bg-strand right" />
      <nav className="nav">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path d="M20 8 Q32 20 20 32 Q8 44 20 56" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round"/>
            <path d="M44 8 Q32 20 44 32 Q56 44 44 56" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round"/>
            <line x1="22" y1="14" x2="42" y2="14" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="26" y1="22" x2="38" y2="22" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="26" y1="42" x2="38" y2="42" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
            <line x1="22" y1="50" x2="42" y2="50" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>DNA Encoder</span>
        </div>
        <div className="nav-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>
        <a className="nav-github" href="https://github.com/microsoft/DNABoundedHomopolymerEncoding" target="_blank" rel="noopener noreferrer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </nav>
      <div className="hero-content">
        <div className="hero-badge">Microsoft Research · DNA Storage</div>
        <h1>Bounded Homopolymer Encoding</h1>
        <p>
          Convert binary data into DNA sequences with guaranteed limits on repeating bases.
          Encode, decode, explore rates, and benchmark — all in your browser.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">k = 1–5</span>
            <span className="hero-stat-label">Run length bounds</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">~2 bits/base</span>
            <span className="hero-stat-label">Near-optimal rate</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">50+ Mbps</span>
            <span className="hero-stat-label">Encoding throughput</span>
          </div>
        </div>
      </div>
    </header>
  )
}
