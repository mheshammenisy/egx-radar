import unittest
from datetime import date, timedelta

from opportunity_engine import PriceBar, analyze_opportunity


def make_series(start: float, drift: float, volume: float = 1000.0) -> list[PriceBar]:
    bars = []
    current = start
    start_date = date(2026, 1, 1)

    for i in range(30):
        open_price = current
        close_price = current + drift
        bars.append(
            PriceBar(
                date=(start_date + timedelta(days=i)).isoformat(),
                open=open_price,
                high=max(open_price, close_price) + 0.25,
                low=min(open_price, close_price) - 0.20,
                close=close_price,
                volume=volume,
            )
        )
        current = close_price

    return bars


class OpportunityEngineTests(unittest.TestCase):
    def test_requires_21_bars(self):
        with self.assertRaises(ValueError):
            analyze_opportunity(make_series(10, 0.1)[:20])

    def test_fresh_breakout_detected(self):
        bars = make_series(10, 0.10)
        prior_resistance = max(bar.high for bar in bars[-21:-1])
        last = bars[-1]
        bars[-1] = PriceBar(
            date=last.date,
            open=last.open,
            high=prior_resistance + 1.0,
            low=last.open - 0.1,
            close=prior_resistance + 0.7,
            volume=1600.0,
        )

        result = analyze_opportunity(bars)

        self.assertEqual(result.state, "Fresh Breakout")
        self.assertTrue(result.metrics.breakout)
        self.assertGreaterEqual(result.score, 70)

    def test_extended_breakout_keeps_state_but_gets_chase_penalty(self):
        bars = make_series(10, 0.10)
        prior_resistance = max(bar.high for bar in bars[-21:-1])
        last = bars[-1]
        previous = bars[-2]

        moderate_bars = list(bars)
        moderate_close = prior_resistance + 0.7
        moderate_bars[-1] = PriceBar(
            date=last.date,
            open=previous.close,
            high=moderate_close + 0.4,
            low=previous.close - 0.1,
            close=moderate_close,
            volume=1800.0,
        )

        extended_bars = list(bars)
        extended_close = previous.close * 1.11
        extended_bars[-1] = PriceBar(
            date=last.date,
            open=previous.close,
            high=extended_close + 0.4,
            low=previous.close - 0.1,
            close=extended_close,
            volume=1800.0,
        )

        moderate = analyze_opportunity(moderate_bars)
        extended = analyze_opportunity(extended_bars)

        self.assertEqual(moderate.state, "Fresh Breakout")
        self.assertEqual(extended.state, "Fresh Breakout")
        self.assertLess(extended.score, moderate.score)
        self.assertTrue(any("elevated chase risk" in reason for reason in extended.why))
        self.assertIn("chase risk is elevated", extended.trigger)

    def test_distribution_warning_detected(self):
        bars = make_series(30, -0.12)
        last = bars[-1]
        previous = bars[-2]
        bars[-1] = PriceBar(
            date=last.date,
            open=previous.close,
            high=previous.close + 0.2,
            low=previous.close - 1.2,
            close=previous.close - 0.9,
            volume=1800.0,
        )

        result = analyze_opportunity(bars)

        self.assertEqual(result.state, "Distribution Warning")
        self.assertLess(result.score, 50)
        self.assertIn("Distribution warning is active", result.trigger)
        self.assertIn("Warning eases", result.invalidation)
        self.assertNotIn("Daily close below recent support", result.invalidation)

    def test_score_changes_when_volume_changes(self):
        normal_bars = make_series(20, 0.10)
        high_volume_bars = list(normal_bars)
        last = high_volume_bars[-1]
        high_volume_bars[-1] = PriceBar(
            date=last.date,
            open=last.open,
            high=last.high,
            low=last.low,
            close=last.close,
            volume=1800.0,
        )

        normal = analyze_opportunity(normal_bars)
        high_volume = analyze_opportunity(high_volume_bars)

        self.assertGreater(high_volume.score, normal.score)
        self.assertGreater(high_volume.metrics.relative_volume, normal.metrics.relative_volume)


if __name__ == "__main__":
    unittest.main()
