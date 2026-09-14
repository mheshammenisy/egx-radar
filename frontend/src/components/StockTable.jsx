function getStateClass(state) {
  if (state === 'Accumulating') return 'state-accumulating'
  if (state === 'Breakout Preparation') return 'state-breakout'
  if (state === 'Distribution') return 'state-distribution'
  return 'state-neutral'
}

function StockTable({ stocks, onSelect }) {
  if (stocks.length === 0) {
    return <div className="empty-state">No demo stocks in this index yet.</div>
  }

  return (
    <div className="table-scroll">
      <div className="table-header table-grid">
        <span>SYMBOL</span>
        <span>STATE</span>
        <span>OPPORTUNITY SCORE</span>
        <span>VOLUME RATIO</span>
        <span>PRICE</span>
        <span>CHANGE</span>
      </div>

      {stocks.map((stock) => (
        <button
          type="button"
          className="stock-row table-grid"
          key={stock.symbol}
          onClick={() => onSelect(stock.symbol)}
        >
          <span className="symbol-cell">
            <strong>{stock.symbol}</strong>
            <small>{stock.company}</small>
          </span>

          <span>
            <span className={`state-badge ${getStateClass(stock.state)}`}>
              ● {stock.state}
            </span>
          </span>

          <span className="score-cell">
            <span className="score-bar">
              <span
                className="score-fill"
                style={{ width: `${stock.score}%` }}
              />
            </span>
            <strong>{stock.score}</strong>
          </span>

          <strong>{stock.volumeRatio.toFixed(2)}×</strong>
          <span className="price">EGP {stock.price.toFixed(2)}</span>

          <span
            className={
              stock.change >= 0 ? 'change-positive' : 'change-negative'
            }
          >
            {stock.change >= 0 ? '+' : ''}
            {stock.change.toFixed(2)}%
          </span>
        </button>
      ))}
    </div>
  )
}

export default StockTable
