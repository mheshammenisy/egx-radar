import { useNavigate } from 'react-router-dom'

const states = [
  'Accumulating',
  'Breakout Preparation',
  'Fresh Breakout',
  'Healthy Pullback',
  'Distribution Warning',
]

function BrandMark() {
  return (
    <div className="brand-wordmark" aria-label="CaptoX">
      <span>C</span>
      <span className="brand-a">A</span>
      <span>pto</span>
      <span className="brand-x">X</span>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <BrandMark />
        <div className="landing-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#signals">Signals</a>
          <button className="button button-secondary" onClick={() => navigate('/radar')}>
            Open Radar
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">EGX MARKET INTELLIGENCE</div>
          <h1>
            Catch the market
            <span> before the crowd.</span>
          </h1>
          <p className="hero-description">
            CaptoX scans Egyptian equities, ranks developing setups, and explains why a stock deserves attention — so you can focus on the few names that matter instead of checking the whole market manually.
          </p>

          <div className="hero-actions">
            <button className="button button-primary" onClick={() => navigate('/radar')}>
              Open Market Radar <span aria-hidden="true">→</span>
            </button>
            <a className="button button-ghost" href="#how-it-works">
              See how it works
            </a>
          </div>

          <div className="hero-trust-line">
            <span>Rule-based analysis</span>
            <span>Explainable signals</span>
            <span>Built for EGX</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="CaptoX market radar preview">
          <div className="radar-preview">
            <div className="preview-header">
              <div>
                <span className="preview-kicker">MARKET RADAR</span>
                <strong>Opportunity signals</strong>
              </div>
              <span className="preview-live-dot">DEVELOPMENT</span>
            </div>

            <div className="preview-row preview-row-head">
              <span>SYMBOL</span>
              <span>STATE</span>
              <span>SCORE</span>
            </div>
            <div className="preview-row">
              <strong>ALPHA</strong>
              <span className="preview-state state-green">Accumulating</span>
              <span className="preview-score">84</span>
            </div>
            <div className="preview-row">
              <strong>BETA</strong>
              <span className="preview-state state-amber">Breakout Prep</span>
              <span className="preview-score">79</span>
            </div>
            <div className="preview-row">
              <strong>GAMMA</strong>
              <span className="preview-state state-blue">Healthy Pullback</span>
              <span className="preview-score">72</span>
            </div>

            <div className="preview-chart" aria-hidden="true">
              <svg viewBox="0 0 520 150" preserveAspectRatio="none">
                <polyline points="0,122 45,117 90,121 135,100 180,103 225,88 270,92 315,62 360,72 405,48 450,54 520,22" />
              </svg>
              <div className="preview-glow" />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip">
        <div>
          <strong>Scan the market.</strong>
          <span>Filter the noise.</span>
        </div>
        <div>
          <strong>Understand the setup.</strong>
          <span>Know why it matters now.</span>
        </div>
        <div>
          <strong>See the risk.</strong>
          <span>Triggers, invalidation and chase risk.</span>
        </div>
      </section>

      <section className="landing-section" id="how-it-works">
        <div className="section-heading">
          <div className="eyebrow">HOW CAPTOX WORKS</div>
          <h2>From market noise to a focused watchlist.</h2>
          <p>
            CaptoX uses daily price and volume behavior to classify each stock into an understandable market state and rank the setups that deserve a closer look.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-number">01</span>
            <h3>Scan</h3>
            <p>Review the market automatically using trend, relative volume, support, resistance, closing strength and breakout behavior.</p>
          </article>
          <article className="feature-card">
            <span className="feature-number">02</span>
            <h3>Rank</h3>
            <p>Surface the strongest setups first with a transparent Opportunity Score instead of an alphabetic list of stocks.</p>
          </article>
          <article className="feature-card">
            <span className="feature-number">03</span>
            <h3>Explain</h3>
            <p>See why the state was assigned, the relevant technical levels, volume context, trigger conditions and invalidation.</p>
          </article>
        </div>
      </section>

      <section className="landing-section signal-section" id="signals">
        <div className="section-heading compact-heading">
          <div className="eyebrow">OPPORTUNITY STATES</div>
          <h2>Know what stage a stock is in.</h2>
          <p>CaptoX is designed to distinguish developing opportunities from moves that may already be extended.</p>
        </div>

        <div className="state-cloud">
          {states.map((state) => (
            <span className="landing-state-pill" key={state}>{state}</span>
          ))}
        </div>

        <div className="signal-detail-grid">
          <article>
            <span>EARLY</span>
            <h3>Accumulation & preparation</h3>
            <p>Look for improving structure, rising participation and proximity to important levels before a move becomes obvious.</p>
          </article>
          <article>
            <span>CONFIRMATION</span>
            <h3>Breakout & pullback</h3>
            <p>Track confirmed breakouts and constructive pullbacks while keeping large one-day moves in context through chase-risk logic.</p>
          </article>
          <article>
            <span>RISK</span>
            <h3>Distribution warning</h3>
            <p>Flag elevated selling pressure so a high-volume move is not automatically mistaken for a bullish opportunity.</p>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <div className="eyebrow">CAPTOX BETA</div>
          <h2>Stop checking dozens of stocks one by one.</h2>
          <p>Open the radar and start with the setups that deserve attention first.</p>
        </div>
        <button className="button button-primary button-large" onClick={() => navigate('/radar')}>
          Launch Market Radar <span aria-hidden="true">→</span>
        </button>
      </section>

      <footer className="landing-footer">
        <BrandMark />
        <div className="footer-copy">
          <strong>Market intelligence for Egyptian equities.</strong>
          <p>
            CaptoX is an analytical research tool. Signals and scores are rule-based observations, not investment recommendations, guarantees or price forecasts.
          </p>
        </div>
        <span className="footer-status">BETA · DEVELOPMENT DATA</span>
      </footer>
    </main>
  )
}

export default LandingPage
