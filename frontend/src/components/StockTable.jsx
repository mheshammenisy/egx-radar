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
          <span className="symbol-cell mobile-card-head">
            <strong>{stock.symbol}</strong>
            <small>{stock.company}</small>
          </span>

          <span className="mobile-field mobile-state-field">
            <small className="mobile-field-label">{t('radar.state')}</small>
            <span className={`state-badge ${getStateClass(stock.state)}`}>
              ● {translateState(stock.state)}
            </span>
          </span>

          <span className="score-cell mobile-field mobile-score-field">
            <small className="mobile-field-label">{t('radar.opportunityScore')}</small>
            <span className="score-bar">
              <span className="score-fill" style={{ width: `${stock.score}%` }} />
            </span>
            <strong>{stock.score}</strong>
          </span>

          <span className="mobile-field">
            <small className="mobile-field-label">{t('radar.volumeRatio')}</small>
            <strong>{stock.volumeRatio.toFixed(2)}×</strong>
          </span>

          <span className="mobile-field">
            <small className="mobile-field-label">{t('radar.price')}</small>
            <span className="price">{t('common.egp')} {stock.price.toFixed(2)}</span>
          </span>

          <span className="mobile-field mobile-change-field">
            <small className="mobile-field-label">{t('radar.change')}</small>
            <span className={stock.change >= 0 ? 'change-positive' : 'change-negative'}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default StockTable
