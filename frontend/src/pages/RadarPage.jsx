import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DemoBanner from '../components/DemoBanner.jsx'
import MarketFilters from '../components/MarketFilters.jsx'
import StockTable from '../components/StockTable.jsx'
import { getStocks } from '../services/api.js'

function RadarPage() {
  const [stocks, setStocks] = useState([])
  const [activeIndex, setActiveIndex] = useState('EGX100')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    getStocks(activeIndex)
      .then((data) => {
        if (!cancelled) setStocks(data)
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
  }, [activeIndex])

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="label">MARKET INTELLIGENCE</div>
          <h1>EGX Opportunity Radar</h1>
          <p className="page-subtitle">
            A focused view of stocks that may deserve attention.
          </p>
        </div>

        <MarketFilters
          activeIndex={activeIndex}
          onChange={setActiveIndex}
        />
      </header>

      <DemoBanner />

      <section className="signals-panel">
        <div className="panel-header">
          <div>
            <h2>Opportunity signals</h2>
            <p>{activeIndex} prototype universe</p>
          </div>
          <span>DEMO DATA · NOT LIVE</span>
        </div>

        {loading && <div className="status-message">Loading stocks…</div>}
        {error && <div className="status-message error-message">{error}</div>}

        {!loading && !error && (
          <StockTable
            stocks={stocks}
            onSelect={(symbol) => navigate(`/stocks/${symbol}`)}
          />
        )}
      </section>
    </main>
  )
}

export default RadarPage
