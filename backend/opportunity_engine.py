from dataclasses import dataclass
from statistics import mean
from typing import Literal, Sequence

OpportunityState = Literal[
    "Accumulating",
    "Breakout Preparation",
    "Fresh Breakout",
    "Healthy Pullback",
    "Distribution Warning",
    "Neutral",
]

TrendName = Literal["Uptrend", "Sideways", "Downtrend"]


@dataclass(frozen=True)
class PriceBar:
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float


@dataclass(frozen=True)
class OpportunityMetrics:
    relative_volume: float
    trend: TrendName
    higher_lows: bool
    support: float
    resistance: float
    distance_to_resistance_pct: float
    closing_strength: float
    breakout: bool
    healthy_pullback: bool


@dataclass(frozen=True)
class OpportunityResult:
    state: OpportunityState
    score: int
    why: list[str]
    trigger: str
    invalidation: str
    metrics: OpportunityMetrics


def _average(values: Sequence[float]) -> float:
    return mean(values) if values else 0.0


def analyze_opportunity(bars: Sequence[PriceBar]) -> OpportunityResult:
    """Analyze daily OHLCV bars using deterministic prototype rules.

    The engine deliberately avoids forecasting prices. It classifies the current
    setup from observable trend, volume, support/resistance and candle behavior.
    At least 21 daily bars are required so the latest bar can be compared with a
    20-session lookback.
    """
    if len(bars) < 21:
        raise ValueError("At least 21 daily OHLCV bars are required")

    latest = bars[-1]
    previous = bars[-2]
    prior_20 = bars[-21:-1]
    prior_10 = bars[-11:-1]

    average_volume = _average([bar.volume for bar in prior_20])
    relative_volume = latest.volume / average_volume if average_volume > 0 else 0.0

    resistance = max(bar.high for bar in prior_20)
    support = min(bar.low for bar in prior_10)
    distance_to_resistance_pct = (
        (resistance - latest.close) / resistance * 100 if resistance > 0 else 0.0
    )
    daily_change_pct = (
        ((latest.close - previous.close) / previous.close) * 100
        if previous.close > 0
        else 0.0
    )

    candle_range = max(latest.high - latest.low, 1e-9)
    closing_strength = max(
        0.0,
        min(1.0, (latest.close - latest.low) / candle_range),
    )

    sma_5 = _average([bar.close for bar in bars[-5:]])
    sma_20 = _average([bar.close for bar in bars[-20:]])

    if latest.close > sma_5 > sma_20:
        trend: TrendName = "Uptrend"
    elif latest.close < sma_5 < sma_20:
        trend = "Downtrend"
    else:
        trend = "Sideways"

    recent_lows = [bar.low for bar in bars[-6:]]
    higher_lows = _average(recent_lows[-3:]) > _average(recent_lows[:3])

    breakout_confirmation_price = resistance * 1.005
    breakout = latest.close > breakout_confirmation_price and relative_volume >= 1.30

    # A close slightly above resistance but below the confirmation buffer is
    # still treated as breakout preparation rather than a confirmed breakout.
    near_resistance = -0.5 <= distance_to_resistance_pct <= 3.0

    healthy_pullback = (
        trend == "Uptrend"
        and latest.close < max(bar.close for bar in bars[-6:-1])
        and latest.close >= sma_20
        and closing_strength >= 0.45
    )

    distribution = (
        relative_volume >= 1.40
        and latest.close < previous.close
        and closing_strength <= 0.40
    ) or (trend == "Downtrend" and relative_volume >= 1.20)

    accumulation = (
        relative_volume >= 1.20
        and higher_lows
        and closing_strength >= 0.55
        and trend != "Downtrend"
    )

    breakout_preparation = (
        near_resistance
        and trend == "Uptrend"
        and higher_lows
        and relative_volume >= 1.00
    )

    if distribution:
        state: OpportunityState = "Distribution Warning"
    elif breakout:
        state = "Fresh Breakout"
    elif healthy_pullback:
        state = "Healthy Pullback"
    elif breakout_preparation:
        state = "Breakout Preparation"
    elif accumulation:
        state = "Accumulating"
    else:
        state = "Neutral"

    # A breakout can still be technically strong while already being too
    # extended to deserve the scanner's highest ranking. Keep the state as
    # Fresh Breakout, but penalize large one-day jumps so CaptoX favors earlier
    # setups over stocks that may already be in chase territory.
    chase_risk = breakout and daily_change_pct >= 7.0
    chase_penalty = 0
    if chase_risk:
        chase_penalty = 30 if daily_change_pct >= 10.0 else 20

    score = 35.0
    if trend == "Uptrend":
        score += 20
    elif trend == "Downtrend":
        score -= 15

    if higher_lows:
        score += 12

    score += min(max((relative_volume - 1.0) * 15.0, 0.0), 18.0)

    if near_resistance:
        score += 10
    if breakout:
        score += 12
    if closing_strength >= 0.65:
        score += 8
    if distribution:
        score -= 20
    score -= chase_penalty

    final_score = max(0, min(100, round(score)))

    why: list[str] = []
    if trend == "Uptrend":
        why.append("Price is above both the 5-day and 20-day average")
    elif trend == "Downtrend":
        why.append("Price is below both the 5-day and 20-day average")
    else:
        why.append("Trend is currently mixed or sideways")

    if relative_volume >= 1.20:
        why.append(f"Volume is {relative_volume:.2f}× its 20-session average")
    if higher_lows:
        why.append("Recent lows are rising")
    if breakout:
        why.append("Close confirmed above recent resistance on elevated volume")
    elif near_resistance:
        why.append("Price is testing the recent resistance area")
    if healthy_pullback:
        why.append("Price pulled back while remaining above the 20-day average")
    if distribution:
        why.append("Selling pressure is elevated relative to recent volume")
    if chase_risk:
        why.append(
            f"Strong breakout, but the stock is already up {daily_change_pct:.2f}% today — elevated chase risk"
        )

    if distribution:
        trigger = (
            f"Distribution warning is active: volume is {relative_volume:.2f}× its "
            "20-session average with weak price action"
        )
        invalidation = (
            "Warning eases if selling pressure subsides and price recovers its short-term trend"
        )
    elif breakout and chase_risk:
        trigger = (
            f"Breakout confirmed, but chase risk is elevated after a {daily_change_pct:.2f}% daily move; "
            "watch for consolidation or a hold above prior resistance"
        )
        invalidation = f"Daily close below recent support near EGP {support:.2f}"
    elif breakout:
        trigger = "Breakout already confirmed; watch whether price holds above prior resistance"
        invalidation = f"Daily close below recent support near EGP {support:.2f}"
    else:
        trigger = (
            f"Daily close above EGP {breakout_confirmation_price:.2f} "
            "with relative volume of at least 1.30×"
        )
        invalidation = f"Daily close below recent support near EGP {support:.2f}"

    metrics = OpportunityMetrics(
        relative_volume=round(relative_volume, 2),
        trend=trend,
        higher_lows=higher_lows,
        support=round(support, 2),
        resistance=round(resistance, 2),
        distance_to_resistance_pct=round(distance_to_resistance_pct, 2),
        closing_strength=round(closing_strength, 2),
        breakout=breakout,
        healthy_pullback=healthy_pullback,
    )

    return OpportunityResult(
        state=state,
        score=final_score,
        why=why,
        trigger=trigger,
        invalidation=invalidation,
        metrics=metrics,
    )
