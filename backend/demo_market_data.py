from datetime import date, timedelta

from opportunity_engine import PriceBar


def _series(
    start_price: float,
    drift: float,
    base_volume: float,
    final_close_offset: float = 0.0,
    final_volume_mult: float = 1.0,
    final_low_offset: float = -0.20,
    final_high_offset: float = 0.25,
) -> list[PriceBar]:
    bars: list[PriceBar] = []
    current = start_price
    start_date = date(2026, 7, 1)

    for i in range(30):
        open_price = current
        close_price = current + drift + (0.08 if i % 3 == 0 else -0.03)
        high = max(open_price, close_price) + 0.25
        low = min(open_price, close_price) - 0.20
        volume = base_volume * (0.90 + 0.05 * (i % 5))

        bars.append(
            PriceBar(
                date=(start_date + timedelta(days=i)).isoformat(),
                open=round(open_price, 2),
                high=round(high, 2),
                low=round(low, 2),
                close=round(close_price, 2),
                volume=round(volume, 0),
            )
        )
        current = close_price

    last = bars[-1]
    adjusted_close = round(last.close + final_close_offset, 2)
    adjusted_high = round(max(last.open, adjusted_close) + final_high_offset, 2)
    adjusted_low = round(min(last.open, adjusted_close) + final_low_offset, 2)
    bars[-1] = PriceBar(
        date=last.date,
        open=last.open,
        high=adjusted_high,
        low=adjusted_low,
        close=adjusted_close,
        volume=round(last.volume * final_volume_mult, 0),
    )
    return bars


DEMO_SECURITIES = [
    {
        "symbol": "COMI",
        "company": "Commercial Intl Bank",
        "demoIndex": "EGX30",
        "bars": _series(68.0, 0.28, 1_500_000, final_close_offset=0.35, final_volume_mult=1.55),
    },
    {
        "symbol": "SWDY",
        "company": "Elsewedy Electric",
        "demoIndex": "EGX30",
        "bars": _series(56.0, 0.22, 1_100_000, final_close_offset=0.15, final_volume_mult=1.35),
    },
    {
        "symbol": "TMGH",
        "company": "Talaat Moustafa Group",
        "demoIndex": "EGX30",
        "bars": _series(50.0, 0.20, 900_000, final_volume_mult=1.05),
    },
    {
        "symbol": "FWRY",
        "company": "Fawry",
        "demoIndex": "EGX70",
        "bars": _series(5.30, 0.035, 2_100_000, final_close_offset=-0.05, final_volume_mult=1.10),
    },
    {
        "symbol": "EAST",
        "company": "Eastern Company",
        "demoIndex": "EGX70",
        "bars": _series(24.0, 0.01, 750_000, final_close_offset=-0.08, final_volume_mult=0.90),
    },
    {
        "symbol": "ORAS",
        "company": "Orascom Construction",
        "demoIndex": "EGX70",
        "bars": _series(326.0, -0.42, 420_000, final_close_offset=-1.20, final_volume_mult=1.80, final_low_offset=-0.15, final_high_offset=0.70),
    },
]
