const FILTERS = ['EGX30', 'EGX70', 'EGX100']

function MarketFilters({ activeIndex, onChange }) {
  return (
    <div className="filters" aria-label="Market universe">
      {FILTERS.map((index) => (
        <button
          key={index}
          type="button"
          className={activeIndex === index ? 'active' : ''}
          aria-pressed={activeIndex === index}
          onClick={() => onChange(index)}
        >
          {index}
        </button>
      ))}
    </div>
  )
}

export default MarketFilters
