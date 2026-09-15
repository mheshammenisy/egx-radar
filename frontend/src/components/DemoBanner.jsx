function DemoBanner({ isDemo = true }) {
  return (
    <div className="demo-banner" role="status">
      <strong>{isDemo ? 'Prototype mode' : 'Development data'}</strong>
      <span>
        {isDemo
          ? 'Current prices, scores, volume ratios, and index membership are demo data — not live market data.'
          : 'Market data is currently sourced from Yahoo Finance for development/testing and may be delayed or incomplete.'}
      </span>
    </div>
  )
}

export default DemoBanner
