import { useNavigate } from 'react-router-dom'
import LanguageToggle from '../components/LanguageToggle.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

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
  const { t, translateState } = useLanguage()

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <BrandMark />
        <div className="landing-nav-links">
          <a href="#how-it-works">{t('landing.howItWorksNav')}</a>
          <a href="#signals">{t('landing.signalsNav')}</a>
          <LanguageToggle />
          <button className="button button-secondary" onClick={() => navigate('/radar')}>
            {t('common.openRadar')}
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">{t('landing.eyebrow')}</div>
          <h1>
            {t('landing.heroLine1')}
            <span> {t('landing.heroLine2')}</span>
          </h1>
          <p className="hero-description">{t('landing.heroDescription')}</p>

          <div className="hero-actions">
            <button className="button button-primary" onClick={() => navigate('/radar')}>
              {t('common.openMarketRadar')} <span aria-hidden="true">→</span>
            </button>
            <a className="button button-ghost" href="#how-it-works">
              {t('landing.seeHow')}
            </a>
          </div>

          <div className="hero-trust-line">
            <span>{t('landing.trust1')}</span>
            <span>{t('landing.trust2')}</span>
            <span>{t('landing.trust3')}</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="CaptoX market radar preview">
          <div className="radar-preview">
            <div className="preview-header">
              <div>
                <span className="preview-kicker">{t('landing.radarPreview')}</span>
                <strong>{t('landing.opportunitySignals')}</strong>
              </div>
              <span className="preview-live-dot">{t('common.development')}</span>
            </div>

            <div className="preview-row preview-row-head">
              <span>{t('landing.symbol')}</span>
              <span>{t('landing.state')}</span>
              <span>{t('landing.score')}</span>
            </div>
            <div className="preview-row">
              <strong>ALPHA</strong>
              <span className="preview-state state-green">{translateState('Accumulating')}</span>
              <span className="preview-score">84</span>
            </div>
            <div className="preview-row">
              <strong>BETA</strong>
              <span className="preview-state state-amber">{translateState('Breakout Preparation')}</span>
              <span className="preview-score">79</span>
            </div>
            <div className="preview-row">
              <strong>GAMMA</strong>
              <span className="preview-state state-blue">{translateState('Healthy Pullback')}</span>
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
        <div><strong>{t('landing.strip1Title')}</strong><span>{t('landing.strip1Text')}</span></div>
        <div><strong>{t('landing.strip2Title')}</strong><span>{t('landing.strip2Text')}</span></div>
        <div><strong>{t('landing.strip3Title')}</strong><span>{t('landing.strip3Text')}</span></div>
      </section>

      <section className="landing-section" id="how-it-works">
        <div className="section-heading">
          <div className="eyebrow">{t('landing.howEyebrow')}</div>
          <h2>{t('landing.howTitle')}</h2>
          <p>{t('landing.howText')}</p>
        </div>

        <div className="feature-grid">
          <article className="feature-card"><span className="feature-number">01</span><h3>{t('landing.scanTitle')}</h3><p>{t('landing.scanText')}</p></article>
          <article className="feature-card"><span className="feature-number">02</span><h3>{t('landing.rankTitle')}</h3><p>{t('landing.rankText')}</p></article>
          <article className="feature-card"><span className="feature-number">03</span><h3>{t('landing.explainTitle')}</h3><p>{t('landing.explainText')}</p></article>
        </div>
      </section>

      <section className="landing-section signal-section" id="signals">
        <div className="section-heading compact-heading">
          <div className="eyebrow">{t('landing.statesEyebrow')}</div>
          <h2>{t('landing.statesTitle')}</h2>
          <p>{t('landing.statesText')}</p>
        </div>

        <div className="state-cloud">
          {states.map((state) => <span className="landing-state-pill" key={state}>{translateState(state)}</span>)}
        </div>

        <div className="signal-detail-grid">
          <article><span>{t('landing.early')}</span><h3>{t('landing.earlyTitle')}</h3><p>{t('landing.earlyText')}</p></article>
          <article><span>{t('landing.confirmation')}</span><h3>{t('landing.confirmationTitle')}</h3><p>{t('landing.confirmationText')}</p></article>
          <article><span>{t('landing.risk')}</span><h3>{t('landing.riskTitle')}</h3><p>{t('landing.riskText')}</p></article>
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <div className="eyebrow">{t('landing.beta')}</div>
          <h2>{t('landing.ctaTitle')}</h2>
          <p>{t('landing.ctaText')}</p>
        </div>
        <button className="button button-primary button-large" onClick={() => navigate('/radar')}>
          {t('common.launchMarketRadar')} <span aria-hidden="true">→</span>
        </button>
      </section>

      <footer className="landing-footer">
        <BrandMark />
        <div className="footer-copy">
          <strong>{t('landing.footerTitle')}</strong>
          <p>{t('landing.footerText')}</p>
        </div>
        <span className="footer-status">{t('landing.footerStatus')}</span>
      </footer>
    </main>
  )
}

export default LandingPage
