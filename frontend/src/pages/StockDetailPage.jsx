import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import { getStock } from '../services/api.js'

function StockDetailPage() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    getStock(symbol)
      .then((data) => {
        if (!cancelled) setStock(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [symbol])

  if (loading) {
    return <main className="app status-page">Loading stock…</main>
  }

  if (error || !stock) {
    return (
      <main className="app status-page">
        <p>{error || 'Stock not found'}</p>
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Radar
        </button>
      </main>
    )
  }

  return (
    <main className="app">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Radar
      </button>

      <DemoBanner />

      <header className="detail-header">
        <div>
          <div className="label">OPPORTUNITY DETAIL</div>
          <h1>{stock.symbol}</h1>
          <p className="company-name">{stock.company}</p>
        </div>

        <div className="detail-price">
          <div>EGP {stock.price.toFixed(2)}</div>
          <span className={stock.change >= 0 ? 'green-text' : 'red-text'}>
            {stock.change >= 0 ? '+' : ''}
            {stock.change.toFixed(2)}%
          </span>
        </div>
      </header>

      <section className="metric-grid" aria-label="Opportunity metrics">
        <div className="metric-card">
          <span>STATE</span>
          <strong>{stock.state}</strong>
        </div>
        <div className="metric-card">
          <span>OPPORTUNITY SCORE</span>
          <strong className="green-text">{stock.score}</strong>
        </div>
        <div className="metric-card">
          <span>RELATIVE VOLUME</span>
          <strong>{stock.volumeRatio.toFixed(2)}×</strong>
        </div>
        <div className="metric-card">
          <span>TREND</span>
          <strong>{stock.metrics.trend}</strong>
        </div>
      </section>

      <section className="detail-panel">
        <div className="panel-header">
          <div>
            <h2>Why this state?</h2>
            <p>Calculated by deterministic prototype rules from demo daily OHLCV.</p>
          </div>
          <span>DEMO ENGINE · NOT LIVE</span>
        </div>
        <ul>
          {stock.why.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </section>

      <section className="metric-grid" aria-label="Technical levels">
        <div className="metric-card">
          <span>RECENT SUPPORT</span>
          <strong>EGP {stock.metrics.support.toFixed(2)}</strong>
        </div>
        <div className="metric-card">
          <span>RECENT RESISTANCE</span>
          <strong>EGP {stock.metrics.resistance.toFixed(2)}</strong>
        </div>
        <div className="metric-card">
          <span>DISTANCE TO RESISTANCE</span>
          <strong>{stock.metrics.distanceToResistancePct.toFixed(2)}%</strong>
        </div>
        <div className="metric-card">
          <span>CLOSING STRENGTH</span>
          <strong>{Math.round(stock.metrics.closingStrength * 100)}%</strong>
        </div>
      </section>

      <section className="detail-panel">
        <div className="panel-header">
          <div>
            <h2>Trigger & invalidation</h2>
            <p>Rule-based conditions, not a recommendation or price forecast.</p>
          </div>
        </div>
        <p><strong>Trigger:</strong> {stock.trigger}</p>
        <p><strong>Invalidation:</strong> {stock.invalidation}</p>
      </section>

      <section className="detail-panel">
        <div className="panel-header">
          <div>
            <h2>Price performance</h2>
            <p>Historical charting will be connected when real market data is added.</p>
          </div>
          <span>NO REAL HISTORY YET</span>
        </div>
        <div className="chart-placeholder">
          Real price and volume history will appear here once a reliable market-data source is connected.
        </div>
      </section>
    </main>
  )
}

export default StockDetailPage
