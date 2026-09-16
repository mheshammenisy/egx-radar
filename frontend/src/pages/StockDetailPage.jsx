import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import PriceVolumeChart from '../components/PriceVolumeChart.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { getStock, getStockHistory } from '../services/api.js'

function StockDetailPage() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [historyError, setHistoryError] = useState(null)
  const { t, translateState, translateTrend, translateReason, translateTrigger, translateInvalidation } = useLanguage()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setHistoryError(null)

    Promise.all([
      getStock(symbol),
      getStockHistory(symbol, 60).catch((err) => {
        if (!cancelled) setHistoryError(err.message)
        return []
      }),
    ])
      .then(([stockData, historyData]) => {
        if (!cancelled) {
          setStock(stockData)
          setHistory(historyData)
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [symbol])

  if (loading) return <main className="app status-page">{t('common.loadingStock')}</main>

  if (error || !stock) {
    return (
      <main className="app status-page">
        <p>{error || t('common.stockNotFound')}</p>
        <button className="back-button" onClick={() => navigate('/radar')}>{t('common.backToRadar')}</button>
      </main>
    )
  }

  const dataLabel = stock.isDemo ? t('detail.demoEngine') : t('detail.yahooData')
  const sourceDescription = stock.isDemo ? t('detail.sourceDemo') : t('detail.sourceYahoo')

  return (
    <main className="app">
      <div className="detail-toolbar">
        <button className="back-button" onClick={() => navigate('/radar')}>{t('common.backToRadar')}</button>
        <LanguageToggle />
      </div>

      <DemoBanner isDemo={stock.isDemo} />

      <header className="detail-header">
        <div>
          <div className="label">{t('detail.opportunityDetail')}</div>
          <h1>{stock.symbol}</h1>
          <p className="company-name">{stock.company}</p>
        </div>

        <div className="detail-price">
          <div>{t('common.egp')} {stock.price.toFixed(2)}</div>
          <span className={stock.change >= 0 ? 'green-text' : 'red-text'}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
          </span>
        </div>
      </header>

      <section className="metric-grid">
        <div className="metric-card"><span>{t('detail.state')}</span><strong>{translateState(stock.state)}</strong></div>
        <div className="metric-card"><span>{t('detail.opportunityScore')}</span><strong className="green-text">{stock.score}</strong></div>
        <div className="metric-card"><span>{t('detail.relativeVolume')}</span><strong>{stock.volumeRatio.toFixed(2)}×</strong></div>
        <div className="metric-card"><span>{t('detail.trend')}</span><strong>{translateTrend(stock.metrics.trend)}</strong></div>
      </section>

      <section className="detail-panel">
        <div className="panel-header">
          <div><h2>{t('detail.whyState')}</h2><p>{sourceDescription}</p></div>
          <span>{dataLabel}</span>
        </div>
        <ul>{stock.why.map((reason) => <li key={reason}>{translateReason(reason)}</li>)}</ul>
      </section>

      <section className="metric-grid">
        <div className="metric-card"><span>{t('detail.recentSupport')}</span><strong>{t('common.egp')} {stock.metrics.support.toFixed(2)}</strong></div>
        <div className="metric-card"><span>{t('detail.recentResistance')}</span><strong>{t('common.egp')} {stock.metrics.resistance.toFixed(2)}</strong></div>
        <div className="metric-card"><span>{t('detail.distanceResistance')}</span><strong>{stock.metrics.distanceToResistancePct.toFixed(2)}%</strong></div>
        <div className="metric-card"><span>{t('detail.closingStrength')}</span><strong>{Math.round(stock.metrics.closingStrength * 100)}%</strong></div>
      </section>

      <section className="detail-panel">
        <div className="panel-header"><div><h2>{t('detail.triggerInvalidation')}</h2><p>{t('detail.ruleDisclaimer')}</p></div></div>
        <p><strong>{t('detail.trigger')}</strong> {translateTrigger(stock.trigger)}</p>
        <p><strong>{t('detail.invalidation')}</strong> {translateInvalidation(stock.invalidation)}</p>
      </section>

      <section className="detail-panel">
        <div className="panel-header">
          <div><h2>{t('detail.pricePerformance')}</h2><p>{stock.isDemo ? t('detail.chartDemoText') : t('detail.chartRealText')}</p></div>
          <span>{stock.isDemo ? t('detail.noRealHistory') : t('detail.realHistory')}</span>
        </div>
        {historyError && <div className="status-message error-message">{historyError}</div>}
        {!historyError && stock.isDemo && <div className="chart-placeholder">{t('detail.chartPlaceholder')}</div>}
        {!historyError && !stock.isDemo && <PriceVolumeChart bars={history} />}
      </section>
    </main>
  )
}

export default StockDetailPage
