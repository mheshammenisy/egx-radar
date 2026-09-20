import { useLanguage } from '../i18n/LanguageContext.jsx'

function getStateClass(state) {
  if (state === 'Accumulating') return 'state-accumulating'
  if (state === 'Breakout Preparation') return 'state-breakout'
  if (state === 'Fresh Breakout') return 'state-fresh-breakout'
  if (state === 'Healthy Pullback') return 'state-pullback'
  if (state === 'Distribution Warning') return 'state-distribution'
  return 'state-neutral'
}

function StockTable({ stocks, onSelect }) {
  const { t, translateState } = useLanguage()

  if (stocks.length === 0) {
    return <div className="empty-state">{t('common.noStocks')}</div>
  }

  return (
    <div className="table-scroll">
      <div className="table-header table-grid">
        <span>{t('radar.symbol')}</span>
        <span>{t('radar.state')}</span>
        <span>{t('radar.opportunityScore')}</span>
        <span>{t('radar.volumeRatio')}</span>
        <span>{t('radar.price')}</span>
        <span>{t('radar.change')}</span>
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
              ● {translateState(stock.state)}
            </span>
          </span>

          <span className="score-cell">
            <span className="score-bar">
              <span className="score-fill" style={{ width: `${stock.score}%` }} />
            </span>
            <strong>{stock.score}</strong>
          </span>

          <strong>{stock.volumeRatio.toFixed(2)}×</strong>
          <span className="price">{t('common.egp')} {stock.price.toFixed(2)}</span>

          <span className={stock.change >= 0 ? 'change-positive' : 'change-negative'}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
          </span>
        </button>
      ))}
    </div>
  )
}

export default StockTable
