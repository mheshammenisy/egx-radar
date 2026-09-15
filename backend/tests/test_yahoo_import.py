import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

from database import (
    count_prices,
    get_price_bars,
    get_stock_record,
    initialize_database,
    upsert_price_bars,
    upsert_stock,
)
from opportunity_engine import PriceBar
from yahoo_import import import_symbol_from_yahoo, yahoo_symbol


class FakeTimestamp:
    def __init__(self, value: date):
        self.value = value

    def date(self):
        return self.value


class FakeHistory:
    def __init__(self, rows):
        self.rows = rows
        self.empty = not rows

    def iterrows(self):
        return iter(self.rows)


class YahooImportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmp.name) / "test.db"
        initialize_database(self.db_path)

    def tearDown(self):
        self.tmp.cleanup()

    def _history(self, n=30):
        start = date(2026, 1, 1)
        rows = []
        for i in range(n):
            price = 100 + i
            rows.append(
                (
                    FakeTimestamp(start + timedelta(days=i)),
                    {
                        "Open": price,
                        "High": price + 2,
                        "Low": price - 1,
                        "Close": price + 1,
                        "Volume": 1000 + i,
                    },
                )
            )
        return FakeHistory(rows)

    def test_yahoo_symbol_uses_cairo_suffix(self):
        self.assertEqual(yahoo_symbol("comi"), "COMI.CA")

    def test_successful_import_replaces_demo_history_and_marks_stock_real(self):
        upsert_stock("COMI", "Commercial Intl Bank", "EGX30", is_demo=True, db_path=self.db_path)
        upsert_price_bars(
            "COMI",
            [PriceBar("2025-12-01", 10, 11, 9, 10.5, 500)],
            db_path=self.db_path,
        )

        calls = []

        def downloader(ticker, period):
            calls.append((ticker, period))
            return self._history(30)

        result = import_symbol_from_yahoo(
            "COMI",
            "Commercial Intl Bank",
            "EGX30",
            period="1y",
            db_path=self.db_path,
            downloader=downloader,
        )

        self.assertEqual(calls, [("COMI.CA", "1y")])
        self.assertEqual(result["status"], "imported")
        self.assertEqual(count_prices("COMI", self.db_path), 30)
        self.assertFalse(bool(get_stock_record("COMI", self.db_path)["is_demo"]))
        self.assertNotEqual(get_price_bars("COMI", self.db_path)[0].date, "2025-12-01")

    def test_too_few_rows_keeps_existing_demo_data(self):
        upsert_stock("COMI", "Commercial Intl Bank", "EGX30", is_demo=True, db_path=self.db_path)
        upsert_price_bars(
            "COMI",
            [PriceBar("2025-12-01", 10, 11, 9, 10.5, 500)],
            db_path=self.db_path,
        )

        result = import_symbol_from_yahoo(
            "COMI",
            "Commercial Intl Bank",
            "EGX30",
            db_path=self.db_path,
            downloader=lambda ticker, period: self._history(10),
        )

        self.assertEqual(result["status"], "skipped")
        self.assertTrue(bool(get_stock_record("COMI", self.db_path)["is_demo"]))
        self.assertEqual(count_prices("COMI", self.db_path), 1)


if __name__ == "__main__":
    unittest.main()
