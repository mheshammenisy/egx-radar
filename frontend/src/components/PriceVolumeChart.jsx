function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T00:00:00`))
}

function PriceVolumeChart({ bars }) {
  if (!bars || bars.length < 2) {
    return <div className="chart-placeholder">Not enough historical data to draw the chart.</div>
  }

  const width = 920
  const height = 360
  const left = 58
  const right = 24
  const top = 22
  const priceBottom = 238
  const volumeTop = 270
  const volumeBottom = 334
  const plotWidth = width - left - right

  const closes = bars.map((bar) => bar.close)
  const priceMinRaw = Math.min(...bars.map((bar) => bar.low))
  const priceMaxRaw = Math.max(...bars.map((bar) => bar.high))
  const pricePadding = Math.max((priceMaxRaw - priceMinRaw) * 0.08, priceMaxRaw * 0.005)
  const priceMin = priceMinRaw - pricePadding
  const priceMax = priceMaxRaw + pricePadding
  const priceRange = Math.max(priceMax - priceMin, 0.0001)
  const maxVolume = Math.max(...bars.map((bar) => bar.volume), 1)

  const xFor = (index) => left + (index / (bars.length - 1)) * plotWidth
  const yForPrice = (price) =>
    top + ((priceMax - price) / priceRange) * (priceBottom - top)

  const linePoints = closes
    .map((close, index) => `${xFor(index).toFixed(2)},${yForPrice(close).toFixed(2)}`)
    .join(' ')

  const barSlot = plotWidth / bars.length
  const barWidth = Math.max(2, Math.min(10, barSlot * 0.62))

  const priceTicks = Array.from({ length: 5 }, (_, index) => {
    const fraction = index / 4
    return priceMax - fraction * priceRange
  })

  const dateIndexes = [0, Math.floor((bars.length - 1) / 2), bars.length - 1]
  const latest = bars[bars.length - 1]

  return (
    <div className="market-chart-wrap">
      <div className="chart-summary">
        <span>{bars.length} sessions</span>
        <strong>Latest close: EGP {latest.close.toFixed(2)}</strong>
      </div>

      <svg
        className="market-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Daily price and volume chart for ${bars.length} sessions`}
      >
        {priceTicks.map((price) => {
          const y = yForPrice(price)
          return (
            <g key={price}>
              <line className="chart-grid-line" x1={left} x2={width - right} y1={y} y2={y} />
              <text className="chart-axis-label" x={left - 10} y={y + 4} textAnchor="end">
                {price.toFixed(2)}
              </text>
            </g>
          )
        })}

        <polyline className="chart-price-line" points={linePoints} fill="none" />

        <circle
          className="chart-latest-dot"
          cx={xFor(bars.length - 1)}
          cy={yForPrice(latest.close)}
          r="4.5"
        />

        <line
          className="chart-separator"
          x1={left}
          x2={width - right}
          y1={volumeTop - 14}
          y2={volumeTop - 14}
        />

        {bars.map((bar, index) => {
          const volumeHeight = (bar.volume / maxVolume) * (volumeBottom - volumeTop)
          const x = xFor(index) - barWidth / 2
          const y = volumeBottom - volumeHeight
          const className = bar.close >= bar.open ? 'chart-volume-positive' : 'chart-volume-negative'

          return (
            <rect
              key={`${bar.date}-${index}`}
              className={className}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(volumeHeight, 1)}
              rx="1"
            >
              <title>
                {bar.date}: close EGP {bar.close.toFixed(2)}, volume {Math.round(bar.volume).toLocaleString()}
              </title>
            </rect>
          )
        })}

        {dateIndexes.map((index) => (
          <text
            key={bars[index].date}
            className="chart-axis-label"
            x={xFor(index)}
            y={354}
            textAnchor={index === 0 ? 'start' : index === bars.length - 1 ? 'end' : 'middle'}
          >
            {formatDate(bars[index].date)}
          </text>
        ))}

        <text className="chart-section-label" x={left} y={volumeTop - 20}>
          VOLUME
        </text>
      </svg>
    </div>
  )
}

export default PriceVolumeChart
