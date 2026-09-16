import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import MarketFilters from '../components/MarketFilters.jsx'
import StockTable from '../components/StockTable.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { getStocks } from '../services/api.js'

function RadarPage() {
  const [stocks, setStocks] = useState([])
  const [activeIndex, setActiveIndex] = useState('EGX100')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getStocks(activeIndex)
      .then((data) => { if (!cancelled) setStocks(data) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [activeIndex])

  const allDemo = stocks.length > 0 && stocks.every((stock) => stock.isDemo)
  const statusLabel = allDemo ? t('radar.demoStatus') : t('radar.yahooStatus')

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="label">{t('radar.eyebrow')}</div>
          <h1>CaptoX</h1>
          <p className="page-subtitle">{t('radar.subtitle')}</p>
        </div>
        <div className="radar-actions">
          <LanguageToggle />
          <MarketFilters activeIndex={activeIndex} onChange={setActiveIndex} />
        </div>
      </header>

      <DemoBanner isDemo={allDemo} />

      <section className="signals-panel">
        <div className="panel-header">
          <div>
            <h2>{t('radar.opportunitySignals')}</h2>
            <p>{activeIndex} {t('radar.prototypeUniverse')}</p>
          </div>
          <span>{statusLabel}</span>
        </div>

        {loading && <div className="status-message">{t('common.loadingStocks')}</div>}
        {error && <div className="status-message error-message">{error}</div>}

        {!loading && !error && (
          <StockTable stocks={stocks} onSelect={(symbol) => navigate(`/stocks/${symbol}`)} />
        )}
      </section>
    </main>
  )
}

export default RadarPage
