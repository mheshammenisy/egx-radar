import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'

function getStateClass(state) {
  if (state === 'Accumulating') return 'state-accumulating'
  if (state === 'Breakout Preparation') return 'state-breakout'
  if (state === 'Distribution') return 'state-distribution'
  return 'state-neutral'
}

function RadarPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://127.0.0.1:8000/stocks')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load stocks')
        }

        return response.json()
      })
      .then((data) => {
        setStocks(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <div className="label">MARKET INTELLIGENCE</div>
          <h1>EGX Accumulation Radar</h1>
        </div>

        <div className="filters">
          <button className="active">EGX30</button>
          <button>EGX70</button>
          <button>EGX100</button>
        </div>
      </div>

      <section className="signals-panel">
        <div className="panel-header">
          <h2>Accumulation signals</h2>
          <span>UPDATED 10:42 CAIRO</span>
        </div>

        <div className="table-header">
          <span>SYMBOL</span>
          <span>STATE</span>
          <span>ACCUMULATION SCORE</span>
          <span>VOLUME RATIO</span>
          <span>PRICE</span>
          <span>CHANGE</span>
        </div>

        {loading && <p>Loading stocks...</p>}
        {error && <p>{error}</p>}

        {!loading &&
          !error &&
          stocks.map((stock) => (
            <div
              className="stock-row"
              key={stock.symbol}
              onClick={() => navigate(`/stocks/${stock.symbol}`)}
            >
              <div className="symbol-cell">
                <strong>{stock.symbol}</strong>
                <small>{stock.company}</small>
              </div>

              <div>
                <span className={`state-badge ${getStateClass(stock.state)}`}>
                  ● {stock.state}
                </span>
              </div>

              <div className="score-cell">
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${stock.score}%` }}
                  />
                </div>
                <span>{stock.score}</span>
              </div>

              <div className="volume-ratio">
                {stock.volumeRatio.toFixed(2)}×
              </div>

              <div className="price">
                EGP {stock.price.toFixed(2)}
              </div>

              <div
                className={
                  stock.change >= 0
                    ? 'change-positive'
                    : 'change-negative'
                }
              >
                {stock.change >= 0 ? '+' : ''}
                {stock.change.toFixed(2)}%
              </div>
            </div>
          ))}
      </section>
    </div>
  )
}

function StockDetailPage() {
  const { symbol } = useParams()
  const navigate = useNavigate()

  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/stocks/${symbol}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Stock not found')
        }

        return response.json()
      })
      .then((data) => {
        setStock(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [symbol])

  if (loading) {
    return <div className="app">Loading stock...</div>
  }

  if (error) {
    return <div className="app">{error}</div>
  }

  return (
    <div className="app">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Radar
      </button>

      <div className="detail-header">
        <div>
          <div className="label">STOCK DETAIL</div>
          <h1>{stock.symbol}</h1>
          <p className="company-name">{stock.company}</p>
        </div>

        <div className="detail-price">
          <div>EGP {stock.price.toFixed(2)}</div>

          <span
            className={
              stock.change >= 0
                ? 'green-text'
                : 'red-text'
            }
          >
            {stock.change >= 0 ? '+' : ''}
            {stock.change.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>STATE</span>
          <strong>{stock.state}</strong>
        </div>

        <div className="metric-card">
          <span>ACCUMULATION SCORE</span>
          <strong className="green-text">{stock.score}</strong>
        </div>

        <div className="metric-card">
          <span>VOLUME RATIO</span>
          <strong>{stock.volumeRatio.toFixed(2)}×</strong>
        </div>

        <div className="metric-card">
          <span>DATA STATUS</span>
          <strong>Prototype</strong>
        </div>
      </div>

      <section className="detail-panel">
        <div className="panel-header">
          <h2>Price performance</h2>
          <span>NO REAL HISTORY YET</span>
        </div>

        <div className="chart-placeholder">
          Real price chart will appear here after market data is connected
        </div>
      </section>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RadarPage />} />
        <Route path="/stocks/:symbol" element={<StockDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App